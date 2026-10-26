# backend/run_local.py
import uvicorn
from sqlalchemy import create_engine
from src.redepict.db import base

# Принудительно подменяем движок БД на правильный (обходим баг Windows)
local_engine = create_engine("postgresql+psycopg://postgres:postgres@127.0.0.1:5432/redepict_db", echo=False)
base.engine = local_engine

if __name__ == "__main__":
    uvicorn.run("src.redepict.main:app", host="127.0.0.1", port=8000, reload=True)