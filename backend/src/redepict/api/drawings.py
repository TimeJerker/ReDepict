from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from src.redepict.api.dependencies import get_current_user
from src.redepict.api.schemas import DrawingResponse
from src.redepict.db.base import get_db
from src.redepict.models.models import User
from src.redepict.storage import minio_client

import src.redepict.db.crud as crud

router = APIRouter(prefix="/drawings", tags=["Drawings"])

def _with_url(drawing) -> DrawingResponse:
    """Берём запись из базы и строим свежую presigned-ссылку."""
    resp = DrawingResponse.model_validate(drawing, from_attributes=True)

    resp.image_url = minio_client.get_presigned_url(
        drawing.minio_bucket, drawing.minio_object_key)

    return resp

@router.get("/my", response_model=list[DrawingResponse])
def my_drawings(db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user),):
    """Все рисунки текущего пользователя: из базы по user_id,
     ссылка на каждую картинку строится по её бакету и ключу."""
    drawings = crud.get_user_drawings(db, user_id=current_user.id)
    return [_with_url(d) for d in drawings]


@router.get("/{drawing_id}/file")
def download_drawing(db: Session = Depends(get_db),
                     drawing_id: int,
                     current_user: User = Depends(get_current_user), ):
    """Скачивание файла: бакет и ключ берём из базы, чужие
     рисунки не отдаём (не найдутся через get_user_drawing)."""
    drawing = crud.get_user_drawing(db, current_user.id, drawing_id)
    if drawing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Рисунок не найден",
        )
    data = minio_client.download_bytes(
        drawing.minio_bucket, drawing.minio_object_key)
    return StreamingResponse(
        BytesIO(data),
        media_type=drawing.mime_type,
        headers={"Распоряжение содержимым":
                     f' файл="{drawing.original_name}"'},)

