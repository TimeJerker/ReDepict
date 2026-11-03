# backend/src/redepict/services/gemini_service.py
from pathlib import Path
from google import genai
from google.genai import types
from PIL import Image
from redepict.api.schemas import GeminiAnalysisResult
from redepict.core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

GEMINI_MODEL_NAME = "gemini-1.5-flash"

SYSTEM_ROLE = """
Ты — профессиональный художественный критик и в меру строгий преподаватель рисования.
Твоя задача — внимательно проанализировать рисунок пользователя.
1. Поставь объективную, но мотивирующую оценку (score) от 1 до 10 (целое число).
2. В поле summary напиши полный, красивый и развернутый разбор рисунка (с использованием Markdown):
   - Опиши, что изображено на рисунке, какой стиль.
   - Похвали сильные стороны работы (композиция, цвета, идея или линии).
   - Дай 1-2 конкретных совета, как сделать рисунок еще лучше.
"""


async def analyze_user_drawing(
    image_path: str | Path,
) -> tuple[GeminiAnalysisResult, str]:
    try:
        image = Image.open(image_path)
        user_prompt = "Проанализируй этот рисунок и оцени его от 1 до 10."

        response = await client.aio.models.generate_content(
            model=GEMINI_MODEL_NAME,
            contents=[image, user_prompt],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_ROLE,
                temperature=0.5,
                response_mime_type="application/json",
                response_schema=GeminiAnalysisResult,
            ),
        )

        result: GeminiAnalysisResult = response.parsed

        result.score = max(1, min(10, result.score))

        return result, GEMINI_MODEL_NAME

    except Exception as e:
        raise RuntimeError(f"Ошибка при анализе изображения в Gemini: {str(e)}")