from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SubmissionResponse(BaseModel):
    id: int
    filename: str
    file_path: str
    ai_feedback: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True