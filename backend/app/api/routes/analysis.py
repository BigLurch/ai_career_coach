from fastapi import APIRouter, HTTPException

from app.db.client import get_supabase
from app.schemas.job import JobMatchRequest
from app.services.analysis_service import analyze_cv_text, analyze_job_match

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.post("/cv/{cv_id}")
def analyze_cv(cv_id: str):
    supabase = get_supabase()

    result = (
        supabase
        .table("cvs")
        .select("id, extracted_text, extraction_status")
        .eq("id", cv_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="CV not found")

    cv = result.data
    extracted_text = cv.get("extracted_text")
    extraction_status = cv.get("extraction_status")

    if extraction_status != "completed":
        raise HTTPException(
            status_code=400,
            detail="CV text extraction is not completed"
        )

    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail="No extracted CV text found"
        )

    try:
        analysis = analyze_cv_text(extracted_text)

        return {
            "status": "success",
            "cv_id": cv_id,
            "analysis": analysis.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/job-match/{cv_id}")
def analyze_job_match_route(cv_id: str, payload: JobMatchRequest):
    supabase = get_supabase()

    result = (
        supabase
        .table("cvs")
        .select("id, extracted_text, extraction_status")
        .eq("id", cv_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="CV not found")

    cv = result.data
    extracted_text = cv.get("extracted_text")
    extraction_status = cv.get("extraction_status")

    if extraction_status != "completed":
        raise HTTPException(
            status_code=400,
            detail="CV text extraction is not completed"
        )

    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail="No extracted CV text found"
        )

    try:
        analysis = analyze_job_match(extracted_text, payload.job_description)

        return {
            "status": "success",
            "cv_id": cv_id,
            "analysis": analysis.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))