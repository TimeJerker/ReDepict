from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from src.redepict.api import upload_file
from src.redepict.db.base import Base, engine
from src.redepict.models import models

app = FastAPI(
    title="ReDepict Connect API",
    version="1.0",
    description="REST API для управления приложением",
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

#Cоздать таблицы
Base.metadata.create_all(bind=engine)

#Подключить роутеры
app.include_router(upload_file.router)


@app.get("/")
def root():
    return {"message": "ReDepict Connect API"}