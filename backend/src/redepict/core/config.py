from sqlalchemy.engine import URL
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    DB_USER: str
    DATABASE_PASS: str
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str

    model_config = SettingsConfigDict(env_file=ENV_FILE)

    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        return str(URL.create(
            drivername="postgresql+psycopg",
            username=self.DB_USER,
            password=self.DATABASE_PASS,
            host=self.DB_HOST,
            port=self.DB_PORT,
            database=self.DB_NAME,
        ))

settings = Settings()