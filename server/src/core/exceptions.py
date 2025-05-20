class ClusterRepoError(Exception):
    """ClusterRepository の基底例外"""


class ClusterFileNotFound(ClusterRepoError):
    """クラスタのCSVファイルが存在しないケース"""


class ClusterCSVParseError(ClusterRepoError):
    """クラスタのCSVファイルのパースに失敗したケース"""
