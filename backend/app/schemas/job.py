from pydantic import BaseModel, Field


class JobMatchRequest(BaseModel):
    job_description: str = Field(..., min_length=20)