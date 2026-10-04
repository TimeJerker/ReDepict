from sqlalchemy.engine import URL
from pydantic import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    DATABASE_URL = URL.create(
        drivername="postgresql+psycopg2",
        username="postgres",
        password=os.getenv("DATABASE_PASSWORD"),
        host="localhost",
        port=os.getenv("PORT"),
        database="skill_matrix",
    )

settings = Settings()