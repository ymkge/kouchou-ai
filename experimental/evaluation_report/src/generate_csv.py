import json
import math
import sys
from pathlib import Path

import pandas as pd
# 先頭で追加
from thresholds import EMBED_THRESHOLDS, UMAP_THRESHOLDS, scale_score

# -----------------------------
# 引数でディレクトリ指定（例: python generate_csv.py 2）
# -----------------------------
if len(sys.argv) < 2:
    print("❌ データディレクトリ番号を指定してください（例: python generate_csv.py 2）")
    sys.exit(1)

data_id = sys.argv[1]
data_dir = Path("input") / data_id
output_dir = Path("output") / data_id

# 入力ファイルパス
LABEL_CSV = data_dir / "hierarchical_merge_labels.csv"
RESULT_JSON = data_dir / "hierarchical_result.json"
EVAL_LLM_JSON_L1 = output_dir / "evaluation_consistency_llm_level1.json"
EVAL_LLM_JSON_L2 = output_dir / "evaluation_consistency_llm_level2.json"
SIL_UMAP_CLUSTER_JSON_L1 = output_dir / "silhouette_umap_level1_clusters.json"
SIL_EMBED_CLUSTER_JSON_L1 = output_dir / "silhouette_embedding_level1_clusters.json"
SIL_UMAP_CLUSTER_JSON_L2 = output_dir / "silhouette_umap_level2_clusters.json"
SIL_EMBED_CLUSTER_JSON_L2 = output_dir / "silhouette_embedding_level2_clusters.json"
SIL_POINTS_JSON = output_dir / "silhouette_umap_level1_points.json"

# 出力ファイルパス
OUT_CLUSTER_CSV = output_dir / "cluster_evaluation.csv"
OUT_COMMENT_CSV = output_dir / "comment_evaluation.csv"

# スコアを1〜5に変換する関数
def scale_score(value, thresholds):
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return None
    for i, t in enumerate(thresholds):
        if value < t:
            return i + 1
    return len(thresholds) + 1

# -----------------------------
# クラスタ単位の出力
# -----------------------------
def generate_cluster_csv():
    df = pd.read_csv(LABEL_CSV)

    if "cluster_id" not in df.columns:
        if "id" in df.columns:
            df = df.rename(columns={"id": "cluster_id"})
        else:
            raise KeyError("クラスタID列が見つかりません（'cluster_id' または 'id' が必要です）")

    with open(EVAL_LLM_JSON_L1, encoding='utf-8') as f:
        llm_scores_l1 = json.load(f)
    with open(EVAL_LLM_JSON_L2, encoding='utf-8') as f:
        llm_scores_l2 = json.load(f)
    with open(SIL_UMAP_CLUSTER_JSON_L1, encoding='utf-8') as f:
        umap_scores_l1 = json.load(f)["clusters"]
    with open(SIL_EMBED_CLUSTER_JSON_L1, encoding='utf-8') as f:
        embed_scores_l1 = json.load(f)["clusters"]
    with open(SIL_UMAP_CLUSTER_JSON_L2, encoding='utf-8') as f:
        umap_scores_l2 = json.load(f)["clusters"]
    with open(SIL_EMBED_CLUSTER_JSON_L2, encoding='utf-8') as f:
        embed_scores_l2 = json.load(f)["clusters"]

    # 統合
    llm_scores = {**llm_scores_l1, **llm_scores_l2}
    umap_scores = {**umap_scores_l1, **umap_scores_l2}
    embed_scores = {**embed_scores_l1, **embed_scores_l2}

    def get_llm_value(cid, key):
        return llm_scores.get(cid, {}).get(key)

    df["clarity"] = df["cluster_id"].map(lambda x: get_llm_value(x, "clarity"))
    df["coherence"] = df["cluster_id"].map(lambda x: get_llm_value(x, "coherence"))
    df["consistency"] = df["cluster_id"].map(lambda x: get_llm_value(x, "consistency"))
    df["distinctiveness"] = df["cluster_id"].map(lambda x: get_llm_value(x, "distinctiveness"))
    df["llm_comment"] = df["cluster_id"].map(lambda x: get_llm_value(x, "comment"))
    df["silhouette_umap"] = df["cluster_id"].map(umap_scores)
    df["silhouette_embed"] = df["cluster_id"].map(embed_scores)
    df["umap_score_1to5"] = df["silhouette_umap"].map(lambda v: scale_score(v, [-0.25, 0.00, 0.25, 0.50]))
    df["embed_score_1to5"] = df["silhouette_embed"].map(lambda v: scale_score(v, [-0.05, 0.00, 0.05, 0.10]))

    desired_order = [
        "level", "cluster_id", "label", "description", "value", "parent", "density",
        "density_rank", "density_rank_percentile",
        "clarity", "coherence", "consistency", "distinctiveness", "llm_comment",
        "embed_score_1to5", "silhouette_embed", "umap_score_1to5", "silhouette_umap"
    ]
    df_out = df[[col for col in desired_order if col in df.columns]]
    df_out.to_csv(OUT_CLUSTER_CSV, index=False)

# -----------------------------
# 意見単位の出力
# -----------------------------
def generate_comment_csv():
    with open(RESULT_JSON, encoding='utf-8') as f:
        result_data = json.load(f)
    with open(SIL_POINTS_JSON, encoding='utf-8') as f:
        point_scores = json.load(f)
    with open(SIL_UMAP_CLUSTER_JSON_L1, encoding='utf-8') as f:
        umap_scores_l1 = json.load(f)["clusters"]
    with open(SIL_EMBED_CLUSTER_JSON_L1, encoding='utf-8') as f:
        embed_scores_l1 = json.load(f)["clusters"]
    with open(SIL_UMAP_CLUSTER_JSON_L2, encoding='utf-8') as f:
        umap_scores_l2 = json.load(f)["clusters"]
    with open(SIL_EMBED_CLUSTER_JSON_L2, encoding='utf-8') as f:
        embed_scores_l2 = json.load(f)["clusters"]

    umap_scores = {**umap_scores_l1, **umap_scores_l2}
    embed_scores = {**embed_scores_l1, **embed_scores_l2}

    arguments = result_data.get("arguments", [])

    rows = []
    for arg in arguments:
        comment_id = arg["arg_id"]
        argument_text = arg["argument"]
        cluster_ids = arg.get("cluster_ids", [])
        for cluster_id in cluster_ids[1:]:  # 最初のID（全体クラスタ）はスキップ
            row = {
                "comment_id": comment_id,
                "text": argument_text,
                "cluster_id": cluster_id,
                "umap_silhouette": point_scores.get(comment_id),
                "silhouette_umap": umap_scores.get(cluster_id),
                "umap_score_1to5": scale_score(umap_scores.get(cluster_id), [-0.25, 0.00, 0.25, 0.50]),
                "silhouette_embed": embed_scores.get(cluster_id),
                "embed_score_1to5": scale_score(embed_scores.get(cluster_id), [-0.05, 0.00, 0.05, 0.10])
            }
            rows.append(row)

    df = pd.DataFrame(rows)
    df.to_csv(OUT_COMMENT_CSV, index=False)

# -----------------------------
if __name__ == "__main__":
    generate_cluster_csv()
    generate_comment_csv()
