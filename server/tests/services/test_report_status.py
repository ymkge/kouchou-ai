import json
from copy import deepcopy
from pathlib import Path
from unittest.mock import mock_open, patch

import pytest

from src.schemas.report import Report, ReportStatus, ReportVisibility
from src.services.report_status import add_analysis_data, convert_old_format_status


# FIXME: report_status.jsonのフォーマット変更に対応するための関数のテストコード。広聴AIをver3.0にした段階で削除する。
# https://github.com/digitaldemocracy2030/kouchou-ai/issues/507
class TestReportStatus:
    """レポートステータス関連のテスト"""

    @pytest.fixture
    def old_format_public_data(self):
        """is_public: trueを持つ旧形式のデータ"""
        return {
            "test-slug": {
                "slug": "test-slug",
                "status": "ready",
                "title": "テストタイトル",
                "description": "テスト説明",
                "is_pubcom": True,
                "created_at": "2025-05-13T07:56:58.405239+00:00",
                "is_public": True,
            }
        }

    @pytest.fixture
    def old_format_private_data(self):
        """is_public: falseを持つ旧形式のデータ"""
        return {
            "test-slug": {
                "slug": "test-slug",
                "status": "ready",
                "title": "テストタイトル",
                "description": "テスト説明",
                "is_pubcom": True,
                "created_at": "2025-05-13T07:56:58.405239+00:00",
                "is_public": False,
            }
        }

    @pytest.fixture
    def new_format_data(self):
        """visibilityを持つ新形式のデータ"""
        return {
            "test-slug": {
                "slug": "test-slug",
                "status": "ready",
                "title": "テストタイトル",
                "description": "テスト説明",
                "is_pubcom": True,
                "visibility": "unlisted",
                "created_at": "2025-05-13T07:56:58.405239+00:00",
            }
        }

    @pytest.fixture
    def mixed_format_data(self):
        """旧形式と新形式が混在したデータ"""
        return {
            "old-slug": {
                "slug": "old-slug",
                "status": "ready",
                "title": "旧形式タイトル",
                "description": "旧形式説明",
                "is_pubcom": True,
                "created_at": "2025-05-13T07:56:58.405239+00:00",
                "is_public": True,
            },
            "new-slug": {
                "slug": "new-slug",
                "status": "ready",
                "title": "新形式タイトル",
                "description": "新形式説明",
                "is_pubcom": True,
                "visibility": "unlisted",
                "created_at": "2025-05-13T07:56:58.405239+00:00",
            },
        }

    def test_convert_is_public_true_to_visibility_public(self, old_format_public_data):
        """is_public: trueをvisibility: publicに変換するテスト"""
        # 入力データのコピーを作成して元のデータが変更されないようにする
        input_data = deepcopy(old_format_public_data)

        # 関数を実行
        result = convert_old_format_status(input_data)

        # 結果を検証
        assert "test-slug" in result
        assert "visibility" in result["test-slug"]
        assert result["test-slug"]["visibility"] == ReportVisibility.PUBLIC.value
        assert "is_public" not in result["test-slug"]

    def test_convert_is_public_false_to_visibility_private(self, old_format_private_data):
        """is_public: falseをvisibility: privateに変換するテスト"""
        # 入力データのコピーを作成して元のデータが変更されないようにする
        input_data = deepcopy(old_format_private_data)

        # 関数を実行
        result = convert_old_format_status(input_data)

        # 結果を検証
        assert "test-slug" in result
        assert "visibility" in result["test-slug"]
        assert result["test-slug"]["visibility"] == ReportVisibility.PRIVATE.value
        assert "is_public" not in result["test-slug"]

    def test_new_format_data_unchanged(self, new_format_data):
        """既に新形式になっているデータは変更されないことを確認するテスト"""
        # 入力データのコピーを作成して元のデータが変更されないようにする
        input_data = deepcopy(new_format_data)
        original_visibility = input_data["test-slug"]["visibility"]

        # 関数を実行
        result = convert_old_format_status(input_data)

        # 結果を検証
        assert "test-slug" in result
        assert "visibility" in result["test-slug"]
        assert result["test-slug"]["visibility"] == original_visibility
        assert "is_public" not in result["test-slug"]

    def test_empty_dict(self):
        """空の辞書を渡した場合のテスト"""
        # 空の辞書を渡す
        input_data = {}

        # 関数を実行
        result = convert_old_format_status(input_data)

        # 結果を検証
        assert result == {}

    def test_mixed_format_data(self, mixed_format_data):
        """旧形式と新形式が混在したデータのテスト"""
        # 入力データのコピーを作成して元のデータが変更されないようにする
        input_data = deepcopy(mixed_format_data)
        original_new_visibility = input_data["new-slug"]["visibility"]

        # 関数を実行
        result = convert_old_format_status(input_data)

        # 結果を検証
        # 旧形式のデータが変換されていることを確認
        assert "old-slug" in result
        assert "visibility" in result["old-slug"]
        assert result["old-slug"]["visibility"] == ReportVisibility.PUBLIC.value
        assert "is_public" not in result["old-slug"]

        # 新形式のデータが変更されていないことを確認
        assert "new-slug" in result
        assert "visibility" in result["new-slug"]
        assert result["new-slug"]["visibility"] == original_new_visibility
        assert "is_public" not in result["new-slug"]


class TestAddAnalysisData:
    """add_analysis_data関数のテスト"""

    @pytest.fixture
    def ready_report(self):
        """READYステータスのレポート"""
        return Report(
            slug="test-report",
            status=ReportStatus.READY,
            title="テストレポート",
            description="テスト説明",
            is_pubcom=True,
            visibility=ReportVisibility.PUBLIC,
            created_at="2025-01-01T00:00:00+00:00",
            token_usage=1000,
            token_usage_input=500,
            token_usage_output=500,
            estimated_cost=0.01,
            provider="openai",
            model="gpt-4",
        )

    @pytest.fixture
    def processing_report(self):
        """PROCESSINGステータスのレポート"""
        return Report(
            slug="processing-report",
            status=ReportStatus.PROCESSING,
            title="処理中レポート",
            description="処理中説明",
            is_pubcom=True,
            visibility=ReportVisibility.PRIVATE,
            created_at="2025-01-01T00:00:00+00:00",
            token_usage=0,
            token_usage_input=0,
            token_usage_output=0,
            estimated_cost=0.0,
            provider=None,
            model=None,
        )

    @pytest.fixture
    def mock_hierarchical_result(self):
        """モックのhierarchical_result.json"""
        return {
            "comment_num": 150,
            "arguments": [
                {"id": 1, "text": "引数1"},
                {"id": 2, "text": "引数2"},
                {"id": 3, "text": "引数3"},
            ],
            "clusters": [
                {"id": 1, "level": 1, "name": "クラスター1"},
                {"id": 2, "level": 2, "name": "クラスター2"},
                {"id": 3, "level": 2, "name": "クラスター3"},
                {"id": 4, "level": 2, "name": "クラスター4"},
            ],
        }

    @patch("src.services.report_status.settings")
    def test_add_analysis_data_ready_report(self, mock_settings, ready_report, mock_hierarchical_result):
        """READYステータスのレポートに分析データを追加するテスト"""
        # モックの設定
        mock_settings.REPORT_DIR = Path("/test/reports")

        with patch("builtins.open", mock_open(read_data=json.dumps(mock_hierarchical_result))):
            result = add_analysis_data(ready_report)

        # 結果の検証
        assert isinstance(result, dict)
        assert result["slug"] == "test-report"
        assert result["status"] == ReportStatus.READY
        assert "analysis" in result

        # 分析データの内容を検証
        analysis = result["analysis"]
        assert analysis["comment_num"] == 150
        assert analysis["arguments_num"] == 3
        assert analysis["cluster_num"] == 3  # level 2のクラスター数

    def test_add_analysis_data_processing_report(self, processing_report):
        """PROCESSINGステータスのレポートはそのまま返すテスト"""
        result = add_analysis_data(processing_report)

        # 結果の検証
        assert result == processing_report
        assert result.analysis is None

    @patch("src.services.report_status.settings")
    def test_add_analysis_data_file_not_found(self, mock_settings, ready_report):
        """hierarchical_result.jsonが存在しない場合のテスト"""
        mock_settings.REPORT_DIR = Path("/test/reports")

        with patch("builtins.open", side_effect=FileNotFoundError("File not found")):
            with pytest.raises(FileNotFoundError):
                add_analysis_data(ready_report)

    @patch("src.services.report_status.settings")
    def test_add_analysis_data_invalid_json(self, mock_settings, ready_report):
        """hierarchical_result.jsonが無効なJSONの場合のテスト"""
        mock_settings.REPORT_DIR = Path("/test/reports")

        with patch("builtins.open", mock_open(read_data="invalid json")):
            with pytest.raises(json.JSONDecodeError):
                add_analysis_data(ready_report)

    @patch("src.services.report_status.settings")
    def test_add_analysis_data_empty_clusters(self, mock_settings, ready_report):
        """クラスターが空の場合のテスト"""
        mock_settings.REPORT_DIR = Path("/test/reports")
        empty_result = {"comment_num": 100, "arguments": [], "clusters": []}

        with patch("builtins.open", mock_open(read_data=json.dumps(empty_result))):
            with patch("src.services.report_status.get_cluster_num", return_value=0):
                result = add_analysis_data(ready_report)

        # 結果の検証
        analysis = result["analysis"]
        assert analysis["comment_num"] == 100
        assert analysis["arguments_num"] == 0
        assert analysis["cluster_num"] == 0
