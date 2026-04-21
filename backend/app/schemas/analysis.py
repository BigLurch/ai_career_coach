from pydantic import BaseModel, Field


class CVAnalysisResult(BaseModel):
    score: int = Field(..., ge=1, le=100)
    summary: str
    strengths: list[str]
    improvements: list[str]
    next_steps: list[str]