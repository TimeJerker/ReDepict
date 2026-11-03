"""Работа с файловым хранилищем MinIO."""
import uuid
from datetime import timedelta
from io import BytesIO
from minio import Minio
from src.redepict.core.config import settings


client = Minio(
    endpoint=settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_SECURE,
)

# Максимальный срок жизни presigned-ссылки — 7 дней.
PRESIGN_EXPIRES = timedelta(days=7)


def ensure_bucket_exists() -> None:
    """Создаёт бакет, если его ещё нет"""
    if not client.bucket_exists(settings.MINIO_BUCKET):
        client.make_bucket(settings.MINIO_BUCKET)


def build_object_key(user_id: int, original_name: str) -> str:
    """Уникальный путь: drawings/<пользователь>/<uuid>.<расширение>"""
    ext = "png"
    if "." in original_name:
        ext = original_name.rsplit(".", 1)[-1].lower()
    if ext not in ("png", "jpg", "jpeg", "webp"):
        ext = "png"
    return f"drawings/{user_id}/{uuid.uuid4().hex}.{ext}"


def upload_bytes(object_key: str, data: bytes,
    content_type: str) -> None:
    """Кладёт байты файла в бакет"""
    ensure_bucket_exists()
    client.put_object(
        bucket_name=settings.MINIO_BUCKET,
        object_name=object_key,
        data=BytesIO(data),
        length=len(data),
        content_type=content_type,
    )


def get_presigned_url(bucket: str, object_key: str) -> str:
    """Временная ссылка на файл по бакету и ключу."""
    return client.presigned_get_object(
        bucket_name=bucket,
        object_name=object_key,
        expires=PRESIGN_EXPIRES,
    )


def download_bytes(bucket: str, object_key: str) -> bytes:
    """Скачивает файл из MinIO по паре бакет + ключ."""
    response = client.get_object(bucket, object_key)
    try:
        return response.read()
    finally:
        response.close()
        response.release_conn()

