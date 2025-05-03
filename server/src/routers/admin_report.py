import json
import os

import openai
from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.responses import FileResponse, ORJSONResponse
from fastapi.security.api_key import APIKeyHeader

from src.config import settings
from src.schemas.admin_report import ReportInput, ReportMetadataUpdate
from src.schemas.report import Report, ReportStatus
from src.services.report_launcher import launch_report_generation
from src.services.report_status import (
    load_status_as_reports,
    set_status,
    toggle_report_public_state,
    update_report_metadata,
)
from src.utils.logger import setup_logger

slogger = setup_logger()
router = APIRouter()

api_key_header = APIKeyHeader(name="x-api-key", auto_error=False)


async def verify_admin_api_key(api_key: str = Security(api_key_header)):
    if not api_key or api_key != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return api_key


@router.get("/admin/reports")
async def get_reports(api_key: str = Depends(verify_admin_api_key)) -> list[Report]:
    return load_status_as_reports()


@router.post("/admin/reports", status_code=202)
async def create_report(report: ReportInput, api_key: str = Depends(verify_admin_api_key)) -> ORJSONResponse:
    try:
        launch_report_generation(report)
        return ORJSONResponse(
            content=None,
            headers={
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        )
    except ValueError as e:
        slogger.error(f"ValueError: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        slogger.error(f"Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.get("/admin/comments/{slug}/csv")
async def download_comments_csv(slug: str, api_key: str = Depends(verify_admin_api_key)) -> FileResponse:
    csv_path = settings.REPORT_DIR / slug / "final_result_with_comments.csv"
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="CSV file not found")
    return FileResponse(path=str(csv_path), media_type="text/csv", filename=f"kouchou_{slug}.csv")


@router.get("/admin/reports/{slug}/status/step-json", dependencies=[Depends(verify_admin_api_key)])
async def get_current_step(slug: str) -> dict:
    status_file = settings.REPORT_DIR / slug / "hierarchical_status.json"
    try:
        # ステータスファイルが存在しない場合は "loading" を返す
        if not status_file.exists():
            return {"current_step": "loading"}

        with open(status_file) as f:
            status = json.load(f)

        # error キーが存在する場合はエラーとみなす
        if "error" in status:
            return {"current_step": "error"}

        # 全体のステータスが "completed" なら、current_step も "completed" とする
        if status.get("status") == "completed":
            return {"current_step": "completed"}

        # current_job キーが存在しない場合も "loading" とみなす
        if "current_job" not in status:
            return {"current_step": "loading"}

        # current_job が空文字列の場合も "loading" とする
        if not status.get("current_job"):
            return {"current_step": "loading"}

        # 有効な current_job を返す
        return {"current_step": status.get("current_job", "unknown")}
    except Exception:
        return {"current_step": "error"}


@router.delete("/admin/reports/{slug}")
async def delete_report(slug: str, api_key: str = Depends(verify_admin_api_key)) -> ORJSONResponse:
    try:
        set_status(slug, ReportStatus.DELETED.value)
        return ORJSONResponse(
            content={"message": f"Report {slug} marked as deleted"},
            headers={
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        )
    except ValueError as e:
        slogger.error(f"ValueError: {e}", exc_info=True)
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        slogger.error(f"Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.patch("/admin/reports/{slug}/visibility")
async def update_report_visibility(slug: str, api_key: str = Depends(verify_admin_api_key)) -> dict:
    try:
        is_public = toggle_report_public_state(slug)

        return {"success": True, "isPublic": is_public}
    except ValueError as e:
        slogger.error(f"ValueError: {e}", exc_info=True)
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        slogger.error(f"Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.patch("/admin/reports/{slug}/metadata")
async def update_report_metadata_endpoint(
    slug: str, metadata: ReportMetadataUpdate, api_key: str = Depends(verify_admin_api_key)
) -> dict:
    """レポートのメタデータ（タイトル、説明）を更新するエンドポイント

    Args:
        slug: レポートのスラッグ
        metadata: 更新するメタデータ
        api_key: 管理者APIキー

    Returns:
        更新後のレポート情報
    """
    try:
        updated_report = update_report_metadata(
            slug=slug,
            title=metadata.title,
            description=metadata.description,
        )
        return {
            "success": True,
            "report": updated_report,
        }
    except ValueError as e:
        slogger.error(f"ValueError: {e}", exc_info=True)
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        slogger.error(f"Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.get("/admin/environment/verify-chatgpt")
async def verify_chatgpt_api_key(api_key: str = Depends(verify_admin_api_key)) -> dict:
    """Verify the ChatGPT API key configuration by retrieving available models.

    Checks both OpenAI and Azure OpenAI configurations based on the USE_AZURE setting.
    Uses the models.list() API to verify the API key and retrieve available models.
    For OpenAI (not Azure), also checks account balance using the billing API.

    Returns:
        dict: Status of the verification, available models, balance info, and any error messages
    """
    try:
        use_azure = os.getenv("USE_AZURE", "false").lower() == "true"
        available_models = []
        balance_info = None

        if use_azure:
            azure_endpoint = os.getenv("AZURE_CHATCOMPLETION_ENDPOINT")
            api_key = os.getenv("AZURE_CHATCOMPLETION_API_KEY")
            api_version = os.getenv("AZURE_CHATCOMPLETION_VERSION")

            from openai import AzureOpenAI

            client = AzureOpenAI(
                api_version=api_version,
                azure_endpoint=azure_endpoint,
                api_key=api_key,
            )
            models = client.models.list()
            available_models = [model.id for model in models]

            try:
                client.chat.completions.create(
                    model=os.getenv("AZURE_CHATCOMPLETION_DEPLOYMENT_NAME", "gpt-35-turbo"),
                    messages=[{"role": "user", "content": "Hi"}],
                    max_tokens=1,
                )
            except openai.RateLimitError as e:
                error_str = str(e).lower()
                if "insufficient_quota" in error_str or "quota exceeded" in error_str:
                    return {
                        "success": False,
                        "message": f"Error: {str(e)}",
                        "error_type": "insufficient_quota",
                        "use_azure": use_azure,
                        "available_models": available_models,
                    }
                raise  # Re-raise to be caught by the outer exception handler
        else:
            import requests
            from openai import OpenAI

            client = OpenAI()
            models = client.models.list()
            available_models = [model.id for model in models]

            try:
                openai_api_key = os.getenv("OPENAI_API_KEY")
                headers = {"Authorization": f"Bearer {openai_api_key}", "Content-Type": "application/json"}
                response = requests.get("https://api.openai.com/v1/dashboard/billing/credit_grants", headers=headers)
                if response.status_code == 200:
                    balance_data = response.json()
                    total_available = balance_data.get("total_available", 0)
                    grants = balance_data.get("grants", [])
                    balance_info = {"total_available": total_available, "grants": grants}
                    if total_available <= 0.01:  # Consider balances below 1 cent as insufficient
                        return {
                            "succｗｗess": False,
                            "message": "Insufficient account balance",
                            "error_type": "insufficient_quota",
                            "use_azure": use_azure,
                            "available_models": available_models,
                            "balance_info": balance_info,
                        }
                elif response.status_code == 401:
                    return {
                        "success": False,
                        "message": "Authentication failed when checking account balance",
                        "use_azure": use_azure,
                        "available_models": available_models,
                    }
            except Exception as e:
                slogger.error(f"Error checking account balance: {str(e)}", exc_info=True)

        return {
            "success": True,
            "message": "ChatGPT API key is valid",
            "use_azure": use_azure,
            "available_models": available_models,
            "balance_info": balance_info,
        }

    except openai.AuthenticationError as e:
        return {
            "success": False,
            "message": f"Authentication failed: {str(e)}",
            "use_azure": use_azure,
            "available_models": [],
        }
    except openai.RateLimitError as e:
        error_str = str(e).lower()
        if "insufficient_quota" in error_str or "quota exceeded" in error_str:
            return {
                "success": False,
                "message": f"Error: {str(e)}",
                "error_type": "insufficient_quota",
                "use_azure": use_azure,
                "available_models": [],
            }
        return {
            "success": False,
            "message": f"Rate limit exceeded: {str(e)}",
            "use_azure": use_azure,
            "available_models": [],
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error: {str(e)}",
            "use_azure": use_azure,
            "available_models": [],
        }
