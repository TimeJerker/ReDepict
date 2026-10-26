import datetime

from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from sqlalchemy.orm import Session
from src.redepict.db.base import get_db
from src.redepict.api.schemas import SubmissionResponse
from .file_path import save_upload_file
# from src.redepict.api.dependencies import get_current_user  <-- закомментировали импорт
# from src.redepict.models.models import User            <-- закомментировали импорт

router = APIRouter(prefix="/upload-drawing", tags=["Upload-drawing"])

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_FILE_SIZE = 5 * 1024 * 1024 

@router.post("/", response_model=SubmissionResponse)
async def upload_drawing(file: UploadFile = File(...), 
                         db: Session = Depends(get_db)):
                         # current_user: User = Depends(get_current_user)): <-- убрали зависимость

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
    
    # Добавили await, так как функция в file_path.py асинхронная
    file_path = await save_upload_file(file)

    # Вместо current_user.id ставим временную заглушку (1)
    db_responce = SubmissionResponse(
        user_id=1,  # <-- ЗАГЛУШКА, раз нет current_user
        filename=file.filename,
        file_path=file_path,
        created_at=datetime.datetime.utcnow()
    )

    return db_responce