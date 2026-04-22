import json

from app.core.config import get_settings
from app.schemas.analysis import CVAnalysisResult, JobMatchResult
from app.services.llm_service import client

settings = get_settings()


def _extract_json(text: str) -> dict:
    text = text.strip()

    # Försök först direkt
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Fallback: plocka ut första JSON-objektet
    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1 or end <= start:
        raise ValueError("Model did not return valid JSON")

    json_candidate = text[start:end + 1]
    return json.loads(json_candidate)


def analyze_cv_text(cv_text: str) -> CVAnalysisResult:
    prompt = f"""
You are an expert career coach and senior recruiter.

Analyze the following CV text and return a JSON object with exactly this structure:
{{
  "score": 1,
  "summary": "short professional summary",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "next_steps": ["step 1", "step 2", "step 3"]
}}

Rules:
- score must be an integer between 1 and 100
- strengths must contain exactly 3 items
- improvements must contain exactly 3 items
- next_steps must contain exactly 3 items
- be constructive and specific
- keep summary concise
- return valid JSON only
- do not include markdown
- do not include any text before or after the JSON

CV:
\"\"\"
{cv_text[:12000]}
\"\"\"
"""

    response = client.chat.completions.create(
        model=settings.openrouter_model,
        messages=[
            {
                "role": "system",
                "content": "You are a precise career coach that returns strict JSON only."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError("LLM returned empty content")

    parsed = _extract_json(content)
    return CVAnalysisResult(**parsed)

def analyze_job_match(cv_text: str, job_description: str) -> JobMatchResult:
    prompt = f"""
You are an expert recruiter and career coach.

Compare the CV against the job description and return a JSON object with exactly this structure:
{{
  "match_score": 1,
  "summary": "short explanation of overall fit",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "missing_skills": ["missing skill 1", "missing skill 2", "missing skill 3"],
  "keywords_to_add": ["keyword 1", "keyword 2", "keyword 3"],
  "next_steps": ["step 1", "step 2", "step 3"]
}}

Rules:
- match_score must be an integer between 1 and 100
- strengths must contain exactly 3 items
- missing_skills must contain exactly 3 items
- keywords_to_add must contain exactly 3 items
- next_steps must contain exactly 3 items
- be specific and practical
- return valid JSON only
- do not include markdown
- do not include any text before or after the JSON

CV:
\"\"\"
{cv_text[:12000]}
\"\"\"

JOB DESCRIPTION:
\"\"\"
{job_description[:12000]}
\"\"\"
"""

    response = client.chat.completions.create(
        model=settings.openrouter_model,
        messages=[
            {
                "role": "system",
                "content": "You are a precise recruiter that returns strict JSON only."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError("LLM returned empty content")

    parsed = _extract_json(content)
    return JobMatchResult(**parsed)