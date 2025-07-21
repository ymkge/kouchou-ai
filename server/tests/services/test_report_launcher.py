from broadlistening.pipeline.services import report_launcher


def test_launch_report_generation_env(monkeypatch):
    # user_api_keyが指定された場合、環境変数USER_API_KEYにセットされることを確認
    called = {}

    def dummy_subprocess_run(*args, **kwargs):
        called["env"] = kwargs.get("env", {})
        return None

    monkeypatch.setattr(report_launcher, "subprocess_run", dummy_subprocess_run)
    report_input = object()  # ダミー
    report_launcher.launch_report_generation(report_input, user_api_key="test-key")
    assert called["env"]["USER_API_KEY"] == "test-key"


def test_launch_report_generation_env_default(monkeypatch):
    # user_api_keyが指定されない場合、USER_API_KEYがセットされないことを確認
    called = {}

    def dummy_subprocess_run(*args, **kwargs):
        called["env"] = kwargs.get("env", {})
        return None

    monkeypatch.setattr(report_launcher, "subprocess_run", dummy_subprocess_run)
    report_input = object()  # ダミー
    report_launcher.launch_report_generation(report_input)
    assert "USER_API_KEY" not in called["env"]


def test_execute_aggregation_env(monkeypatch):
    # user_api_keyが指定された場合、環境変数USER_API_KEYにセットされることを確認
    called = {}

    def dummy_subprocess_run(*args, **kwargs):
        called["env"] = kwargs.get("env", {})
        return True

    monkeypatch.setattr(report_launcher, "subprocess_run", dummy_subprocess_run)
    result = report_launcher.execute_aggregation("slug", user_api_key="test-key")
    assert called["env"]["USER_API_KEY"] == "test-key"
    assert result is True


def test_execute_aggregation_env_default(monkeypatch):
    # user_api_keyが指定されない場合、USER_API_KEYがセットされないことを確認
    called = {}

    def dummy_subprocess_run(*args, **kwargs):
        called["env"] = kwargs.get("env", {})
        return True

    monkeypatch.setattr(report_launcher, "subprocess_run", dummy_subprocess_run)
    result = report_launcher.execute_aggregation("slug")
    assert "USER_API_KEY" not in called["env"]
    assert result is True
