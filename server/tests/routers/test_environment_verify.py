import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import patch

from src.routers.admin_report import router, verify_admin_api_key


@pytest.fixture
def app():
    app = FastAPI()
    app.include_router(router)

    async def override_verify_admin_api_key():
        return "test-api-key"

    app.dependency_overrides[verify_admin_api_key] = override_verify_admin_api_key
    return app


@pytest.fixture
def client(app):
    return TestClient(app)


class TestVerifyApiKey:
    def test_verify_api_key_openai(self, client):
        with patch("broadlistening.pipeline.services.llm.request_to_chat_ai") as mock_request:
            mock_request.return_value = ("ok", 0, 0, 0)

            response = client.get("/admin/environment/verify?provider=openai", headers={"x-api-key": "test-api-key"})
            assert response.status_code == 200
            assert response.json()["success"] is True

            mock_request.assert_called_once()
            _, kwargs = mock_request.call_args
            assert kwargs["provider"] == "openai"
            assert kwargs["model"] == "gpt-4o-mini"

    def test_verify_api_key_gemini(self, client):
        with patch("broadlistening.pipeline.services.llm.request_to_chat_ai") as mock_request:
            mock_request.return_value = ("ok", 0, 0, 0)

            response = client.get("/admin/environment/verify?provider=gemini", headers={"x-api-key": "test-api-key"})
            assert response.status_code == 200
            assert response.json()["success"] is True

            mock_request.assert_called_once()
            _, kwargs = mock_request.call_args
            assert kwargs["provider"] == "gemini"
            assert kwargs["model"] == "gemini-pro"
