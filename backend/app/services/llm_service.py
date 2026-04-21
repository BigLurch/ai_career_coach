from openai import OpenAI
from app.core.config import get_settings

settings = get_settings()

client = OpenAI(
    api_key=settings.openrouter_api_key,
    base_url="https://openrouter.ai/api/v1",
)