import colorsys
import json
import sys
from pathlib import Path

from jinja2 import Environment, FileSystemLoader
from thresholds import EMBED_THRESHOLDS, UMAP_THRESHOLDS, scale_score


def load_json(path: Path):
    if not path.exists():
        print(f"⚠️ Missing: {path}")
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def mean(values):
    valid = [v for v in values if isinstance(v, (int, float))]
    return round(sum(valid) / len(valid), 3) if valid else None


def safe_int(v):
    try:
        return int(v)
    except:
        return None


def generate_html(slug: str, input_dir: Path, output_dir: Path, template_dir: Path):
    base_input = input_dir / slug
    base_output = output_dir / slug
    base_output.mkdir(parents=True, exist_ok=True)

    result_data = load_json(base_input / "hierarchical_result.json")

    # LLMスコア
    llm_scores_l1 = load_json(base_output / "evaluation_consistency_llm_level1.json")
    llm_scores_l2 = load_json(base_output / "evaluation_consistency_llm_level2.json")
    llm_scores = {**llm_scores_l1, **llm_scores_l2}

    # クラスタ用シルエットスコア（両レベル）
    silhouette_embed = load_json(base_output / "silhouette_embedding_level1_clusters.json").get("clusters", {})
    silhouette_umap = load_json(base_output / "silhouette_umap_level1_clusters.json").get("clusters", {})
    silhouette_embed_lv2 = load_json(base_output / "silhouette_embedding_level2_clusters.json").get("clusters", {})
    silhouette_umap_lv2 = load_json(base_output / "silhouette_umap_level2_clusters.json").get("clusters", {})

    # 意見単位シルエットスコア（レベル2優先）
    embed_points = load_json(base_output / "silhouette_embedding_level2_points.json")
    if not embed_points:
        embed_points = load_json(base_output / "silhouette_embedding_level1_points.json")

    umap_points = load_json(base_output / "silhouette_umap_level2_points.json")
    if not umap_points:
        umap_points = load_json(base_output / "silhouette_umap_level1_points.json")

    # 意見ごとにスコアを付加
    for arg in result_data.get("arguments", []):
        arg_id = arg.get("arg-id") or arg.get("arg_id")
        emb = embed_points.get(arg_id)
        ump = umap_points.get(arg_id)
        arg["silhouette"] = {
            "embedding": {"raw": emb, "scaled": scale_score(emb, EMBED_THRESHOLDS)},
            "umap": {"raw": ump, "scaled": scale_score(ump, UMAP_THRESHOLDS)},
        }

    cluster_by_id = {c["id"]: c for c in result_data["clusters"]}
    cluster_children = {}
    for c in result_data["clusters"]:
        parent = c.get("parent")
        if parent:
            cluster_children.setdefault(parent, []).append(c)

    def build_cluster_tree(cluster):
        cid = cluster["id"]
        level = cluster.get("level")

        llm_entry = llm_scores.get(cid)
        if isinstance(llm_entry, dict) and cid in llm_entry:
            llm = llm_entry[cid]
        elif isinstance(llm_entry, dict):
            llm = llm_entry
        else:
            llm = {}
        llm.pop("label", None)
        cluster["llm"] = llm

        if level == 1:
            emb = silhouette_embed.get(cid)
            umap = silhouette_umap.get(cid)
        elif level == 2:
            emb = silhouette_embed_lv2.get(cid)
            umap = silhouette_umap_lv2.get(cid)
        else:
            emb = umap = None

        cluster["scores"] = {
            "clarity": {"raw": llm.get("clarity"), "scaled": safe_int(llm.get("clarity"))},
            "coherence": {"raw": llm.get("coherence"), "scaled": safe_int(llm.get("coherence"))},
            "consistency": {"raw": llm.get("consistency"), "scaled": safe_int(llm.get("consistency"))},
            "distinctiveness": {"raw": llm.get("distinctiveness"), "scaled": safe_int(llm.get("distinctiveness"))},
            "embedding": {"raw": emb, "scaled": scale_score(emb, EMBED_THRESHOLDS)},
            "umap": {"raw": umap, "scaled": scale_score(umap, UMAP_THRESHOLDS)},
        }

        cluster["silhouette_embedding"] = silhouette_embed.get(cid)
        cluster["silhouette_umap"] = silhouette_umap.get(cid)
        cluster["children"] = [build_cluster_tree(child) for child in cluster_children.get(cid, [])]
        return cluster

    level1_clusters = [c for c in result_data["clusters"] if c.get("level") == 1]
    cluster_tree = [build_cluster_tree(c) for c in level1_clusters]

    result_data["silhouette_embedding_avg"] = mean(silhouette_embed.values())
    result_data["silhouette_umap_avg"] = mean(silhouette_umap.values())
    result_data["llm_avg"] = {
        "clarity": mean([safe_int(c["llm"].get("clarity")) for c in cluster_tree]),
        "coherence": mean([safe_int(c["llm"].get("coherence")) for c in cluster_tree]),
        "consistency": mean([safe_int(c["llm"].get("consistency")) for c in cluster_tree]),
        "distinctiveness": mean([safe_int(c["llm"].get("distinctiveness")) for c in cluster_tree]),
    }
    result_data["llm_avg_scaled"] = {
        "clarity": safe_int(result_data["llm_avg"]["clarity"]),
        "coherence": safe_int(result_data["llm_avg"]["coherence"]),
        "consistency": safe_int(result_data["llm_avg"]["consistency"]),
        "distinctiveness": safe_int(result_data["llm_avg"]["distinctiveness"]),
        "embedding": scale_score(result_data["silhouette_embedding_avg"], EMBED_THRESHOLDS),
        "umap": scale_score(result_data["silhouette_umap_avg"], UMAP_THRESHOLDS),
    }

    color_map = {}
    for i, c in enumerate(level1_clusters):
        hue = (i * 0.14) % 1.0
        rgb = colorsys.hsv_to_rgb(hue, 0.6, 0.7)
        hex_color = '#{:02x}{:02x}{:02x}'.format(int(rgb[0]*255), int(rgb[1]*255), int(rgb[2]*255))
        color_map[c["id"]] = hex_color

    env = Environment(loader=FileSystemLoader(str(template_dir)))
    env.tests['search'] = lambda value, sub: sub in value
    template = env.get_template("report_template.html")
    html = template.render(
        result=result_data,
        cluster_tree=cluster_tree,
        color_map=color_map,
        embed_thresholds=EMBED_THRESHOLDS,
        umap_thresholds=UMAP_THRESHOLDS,
    )

    out_path = base_output / "report.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)



def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_html.py [slug]")
        sys.exit(1)

    slug = sys.argv[1]
    generate_html(
        slug=slug,
        input_dir=Path("input"),
        output_dir=Path("output"),
        template_dir=Path("templates")
    )


if __name__ == "__main__":
    main()
