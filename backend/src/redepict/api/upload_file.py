from datetime import datetime, timezone
from pathlib import Path
from src.redepict.db.crud import create_analysis, create_drawing
from src.redepict.services.gemini_service import analyze_user_drawing
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from sqlalchemy.orm import Session
from src.redepict.db.base import get_db
from src.redepict.api.schemas import AnalysisResponse, DrawingResponse, SubmissionResponse
from src.redepict.api.dependencies import get_current_user
from src.redepict.models.models import Drawing, User
from src.redepict.api.file_path import save_upload_file

router = APIRouter(prefix="/upload-drawing", tags=["Upload-drawing"])

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

MAX_FILE_SIZE = 5 * 1024 * 1024

@router.post("/upload-drawing", response_model=SubmissionResponse)
async def upload_drawing(
    file: UploadFile = File(...),
    technique: str | None = None,
    level: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # валидация типа ДО сохранения (константа у вас объявлена, но не используется)
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Allow only jpeg / png / webp",
        )

    if file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File is too big. Max size: 5 Mb."
        )

    saved_file_path = await save_upload_file(file)

    new_drawing = create_drawing(
            db=db,
            user_id=current_user.id,
            object_key=saved_file_path,
            original_name=file.filename or "unnamed",
            mime_type=file.content_type,
            size_bytes=file.size or 0,  # size бывает None — страховка
            technique=technique,
            level=level,
            image_url=f"/{saved_file_path}",
        )

    db_responce = SubmissionResponse(
        id=new_drawing.id,
        user_id=new_drawing.user_id,
        filename=new_drawing.original_name,
        file_path=new_drawing.object_key,
        created_at=datetime.now(timezone.utc)
    )

    return db_responce

@router.post("/drawings/{drawing_id}/analyze", response_model=AnalysisResponse)
async def analyze_existing_drawing(
    drawing_id: int, db: Session = Depends(get_db)
):

    drawing = db.query(Drawing).filter(Drawing.id == drawing_id).first()
    if not drawing:
        raise HTTPException(status_code=404, detail="Image not found")

    if drawing.analysis:
        return drawing.analysis

    image_path = Path(drawing.object_key)
    if not image_path.exists():
        raise HTTPException(
            status_code=404, detail="Image file not found on the server"
        )

    try:
        ai_result, model_name = await analyze_user_drawing(image_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    analysis_record = create_analysis(
        db=db,
        drawing_id=drawing.id,
        model_name=model_name,
        score=ai_result.score,
        summary=ai_result.summary,
    )

    return analysis_record
