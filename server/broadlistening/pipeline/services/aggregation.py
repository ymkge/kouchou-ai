from src.config import settings
from broadlistening.pipeline.steps.hierarchical_aggregation import hierarchical_aggregation
from broadlistening.pipeline.hierarchical_utils import initialization, run_step


def execute_aggregation(slug: str):
    config_path = settings.CONFIG_DIR / f"{slug}.json"
    print(str(config_path))
    config = initialization([str(config_path), str(config_path), "-skip-interaction", "--without-html", "-f"])
    is_updated = hierarchical_aggregation(config)
    return is_updated


if __name__ == "__main__":
    slug = "d2e1e328-cd40-44a5-be8c-26090aed29a3"
    is_updated = execute_aggregation(slug)
    print("is_updated")
    print(is_updated)
