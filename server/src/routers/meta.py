import json
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import FileResponse, Response
from fastapi import HTTPException

from src.schemas.metadata import Metadata

router = APIRouter()
CUSTOM_META_DIR = Path(__file__).parent.parent.parent / "public" / "meta" / "custom"
DEFAULT_META_DIR = Path(__file__).parent.parent.parent / "public" / "meta" / "default"


def load_metadata_file_path(filename: str) -> Path:
    """メタデータファイルのパスを返す。customファイルが存在する場合はcustomファイルを読み、存在しない場合はdefaultファイルを読む"""
    custom_metadata_path = CUSTOM_META_DIR / filename
    metadata_path = custom_metadata_path if custom_metadata_path.exists() else DEFAULT_META_DIR / filename
    return metadata_path


@router.get("/meta")
async def get_metadata() -> Metadata:
    try:
        metadata_path = load_metadata_file_path("metadata.json")
        with open(metadata_path) as f:
            metadata = json.load(f)

        return Metadata(
            reporter=metadata.get("reporter"),
            message=metadata.get("message"),
            webLink=metadata.get("webLink"),
            privacyLink=metadata.get("privacyLink"),
            termsLink=metadata.get("termsLink"),
            brandColor=metadata.get("brandColor"),
        )
    except FileNotFoundError:
        # メタデータファイルが存在しない場合は空のメタデータを返す
        return Metadata()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/meta/reporter.png")
async def get_reporter_image():
    """defaultの場合や、customでもreporter.pngが存在しない場合は何も返さない"""
    custom_metadata_path = CUSTOM_META_DIR / "reporter.png"
    if custom_metadata_path.exists():
        return FileResponse(custom_metadata_path)
    return Response(status_code=204)


@router.get("/meta/icon.png")
async def get_icon():
    return FileResponse(load_metadata_file_path("icon.png"))


@router.get("/meta/ogp.png")
async def get_ogp():
    return FileResponse(load_metadata_file_path("ogp.png"))


@router.get("/meta/metadata.json")
async def get_metadata_json():
    return FileResponse(load_metadata_file_path("metadata.json"))
