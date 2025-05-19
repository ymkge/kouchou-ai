import csv
from enum import Enum

from src.config import settings
from src.schemas.cluster import ClusterResponse, ClusterUpdate
from src.utils.logger import setup_logger

slogger = setup_logger()

class ClusterError(Enum):
    FILE_NOT_FOUND = 1
    CSV_READ_ERROR = 2
    CSV_WRITE_ERROR = 3


class ClusterRepository:
    FIELDS = ["level", "id", "label", "description", "value", "parent", "density", "density_rank", "density_rank_percentile"]

    def __init__(self, slug: str):
        self.slug = slug
        self.labels_path = settings.REPORT_DIR / slug / "hierarchical_merge_labels.csv"

    def read_from_csv(self) -> list[ClusterResponse]:
        """中間ファイル（CSVファイル）からクラスタのラベル・説明を読み込む"""

        clusters = []
        try:
            if not self.labels_path.exists():
                return []

            with open(self.labels_path, encoding="utf-8") as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    try:
                        cluster = ClusterResponse(
                            level=int(row["level"]),
                            id=row["id"],
                            label=row["label"],
                            description=row["description"],
                            value=row["value"],
                            parent=row["parent"],
                            density=float(row["density"]) if row["density"] else None,
                            density_rank=int(float(row["density_rank"])) if row["density_rank"] else None,
                            density_rank_percentile=float(row["density_rank_percentile"])
                            if row["density_rank_percentile"]
                            else None,
                        )
                        clusters.append(cluster)
                    except KeyError as e:
                        slogger.warning(f"KeyError: {e} in row: {row}")
                        continue

            return clusters
        except FileNotFoundError:
            slogger.warning(f"File not found: {self.labels_path}")
            return []
        except Exception as e:
            slogger.error(f"Error reading CSV file: {e}")
            return []

    def update_csv(self, updated_cluster: ClusterUpdate) -> bool:
        """中間ファイル（CSVファイル）を更新する"""
        try:
            # 現在のクラスタ情報を読み込む
            current_cluster_models = self.read_from_csv()
            current_clusters = [cluster.model_dump() for cluster in current_cluster_models]

            # IDをキーとして、更新されたクラスタ情報を差し替える
            merged_clusters = []
            for cluster in current_clusters:
                if cluster["id"] == updated_cluster.id:
                    cluster["label"] = updated_cluster.label
                    cluster["description"] = updated_cluster.description
                merged_clusters.append(cluster)

            with open(self.labels_path, mode="w", encoding="utf-8", newline="") as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=self.FIELDS)

                writer.writeheader()
                for cluster in merged_clusters:
                    writer.writerow(
                        {
                            field: cluster[field] for field in self.FIELDS
                        }
                    )
            return True
        except Exception as e:
            slogger.error(f"Error writing CSV file: {e}")
            return False
