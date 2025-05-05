# thresholds.py

import math

# スコア用の共通閾値
UMAP_THRESHOLDS = [-0.25, 0.00, 0.25, 0.50]
EMBED_THRESHOLDS = [-0.05, 0.00, 0.05, 0.10]

def scale_score(value, thresholds):
    """スコアを1〜5に変換（NoneやNaNならNone）"""
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return None
    for i, t in enumerate(thresholds):
        if value < t:
            return i + 1
    return len(thresholds) + 1