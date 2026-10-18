from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from src.redepict.db.base import get_db
from src.redepict.api.schemas import SubmissionResponse
from .file_path import save_upload_file

router = APIRouter(prefix="/upload-drawing", tags=["Upload-drawing"])

@router.post("/", response_model=SubmissionResponse)
async def upload_drawing(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_path = await save_upload_file(file)

    #feedback = await generate_feedback(file_path)

    #сделать crud для сохранения информации о файле в базе данных