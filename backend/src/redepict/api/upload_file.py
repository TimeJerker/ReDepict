import datetime
from zipfile import Path

from backend.src.redepict.db.crud import create_analysis
from backend.src.redepict.services.gemini_service import analyze_user_drawing
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from sqlalchemy.orm import Session
from src.redepict.db.base import get_db
from src.redepict.api.schemas import AnalysisResponse, SubmissionResponse
from .file_path import save_upload_file
from src.redepict.api.dependencies import get_current_user
from src.redepict.models.models import Drawing, User

router = APIRouter(prefix="/upload-drawing", tags=["Upload-drawing"])

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

MAX_FILE_SIZE = 5 * 1024 * 1024 

@router.post("/", response_model=SubmissionResponse)
async def upload_drawing(file: UploadFile = File(...), 
                         db: Session = Depends(get_db), 
                         current_user: User = Depends(get_current_user)):

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file format. Only the following are allowed: JPG, PNG and WEBP."
        )

    if file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File is too large. Maximum size: 5 MB."
        )
    
    file_path = save_upload_file(file)

    db_responce = SubmissionResponse(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        created_at=datetime.utcnow()
    )

    return db_responce

@router.post("/drawings/{drawing_id}/analyze", response_model=AnalysisResponse)
async def analyze_existing_drawing(
    drawing_id: int, db: Session = Depends(get_db)
):

    drawing = db.query(Drawing).filter(Drawing.id == drawing_id).first()
    if not drawing:
        raise HTTPException(status_code=404, detail="Рисунок не найден")

    if drawing.analysis:
        return drawing.analysis

    image_path = Path(drawing.image_url)
    if not image_path.exists():
        raise HTTPException(
            status_code=404, detail="Файл рисунка не найден на сервере"
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