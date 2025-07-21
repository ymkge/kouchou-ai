from unittest.mock import Mock

import pandas as pd
import pytest
from broadlistening.pipeline.services import category_classification


def dummy_request_to_openai(messages, model, is_json, user_api_key=None, **kwargs):
    # user_api_keyが正しく渡っているかを返す
    # user_api_keyが"test-key"または"env-key"なら正常、Noneや他の値なら例外
    if user_api_key == "test-key" or user_api_key == "env-key":
        return '{"arg-id-1": {"カテゴリ1": "A"}}'
    raise RuntimeError("APIキーが渡っていません")


@pytest.fixture(autouse=True)
def patch_request_to_openai(monkeypatch):
    monkeypatch.setattr(category_classification, "request_to_openai", dummy_request_to_openai)


def test_env_api_key_used_when_user_api_key_not_set(monkeypatch):
    # 環境変数OPENAI_API_KEYが設定されていて、user_api_keyが未設定の場合に、request_to_openaiのuser_api_key引数がNoneで呼ばれることを確認
    mock = Mock(return_value='{"arg-id-1": {"カテゴリ1": "A"}}')
    monkeypatch.setattr(category_classification, "request_to_openai", mock)
    monkeypatch.setenv("OPENAI_API_KEY", "env-key")
    config = {
        "extraction": {"category_batch_size": 1, "categories": {"カテゴリ1": {"A": "説明A"}}, "model": "dummy-model"}
    }
    args = pd.DataFrame([{"arg-id": "arg-id-1", "argument": "テスト意見"}])
    result = category_classification.classify_args(args, config, workers=1)
    assert result["カテゴリ1"].iloc[0] == "A"
    # request_to_openaiのuser_api_key引数はNoneで呼ばれることを確認
    assert mock.call_args.kwargs["user_api_key"] is None


def test_user_api_key_propagation(monkeypatch):
    # user_api_keyがフォームから指定された場合、その値がrequest_to_openaiに渡ることを確認
    config = {
        "extraction": {"category_batch_size": 1, "categories": {"カテゴリ1": {"A": "説明A"}}, "model": "dummy-model"},
        "user_api_key": "test-key",
    }
    args = pd.DataFrame([{"arg-id": "arg-id-1", "argument": "テスト意見"}])
    result = category_classification.classify_args(args, config, workers=1)
    assert result["カテゴリ1"].iloc[0] == "A"


def test_error_when_no_api_key(monkeypatch):
    # user_api_keyも環境変数OPENAI_API_KEYも未設定の場合はエラーになることを確認
    config = {
        "extraction": {"category_batch_size": 1, "categories": {"カテゴリ1": {"A": "説明A"}}, "model": "dummy-model"}
    }
    args = pd.DataFrame([{"arg-id": "arg-id-1", "argument": "テスト意見"}])
    # user_api_keyがNone、かつ環境変数も未設定の場合はRuntimeErrorを返すダミー
    with pytest.raises(RuntimeError):
        category_classification.classify_args(args, config, workers=1)
