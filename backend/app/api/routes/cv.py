from fastapi import APIRouter, HTTPException
from app.db.client import get_supabase
from app.services.pdf_parser import extract_text_from_pdf

router = APIRouter(prefix="/cv", tags=["CV"])


@router.post("/extract/{cv_id}")
def extract_cv_text(cv_id: str):
    supabase = get_supabase()

    # Hämta CV-record
    result = (
        supabase
        .table("cvs")
        .select("*")
        .eq("id", cv_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="CV not found")

    cv = result.data

    file_path = cv["file_path"]

    # sätt processing
    supabase.table("cvs").update({
        "extraction_status": "processing"
    }).eq("id", cv_id).execute()

    try:
        # ladda ner fil
        file_bytes = (
            supabase
            .storage
            .from_("cv-files")
            .download(file_path)
        )

        # extrahera text
        extracted_text = extract_text_from_pdf(file_bytes)

        # spara
        supabase.table("cvs").update({
            "extracted_text": extracted_text,
            "extraction_status": "completed"
        }).eq("id", cv_id).execute()

        return {
            "status": "success",
            "cv_id": cv_id,
            "characters": len(extracted_text)
        }

    except Exception as e:
        supabase.table("cvs").update({
            "extraction_status": "failed"
        }).eq("id", cv_id).execute()

        raise HTTPException(status_code=500, detail=str(e))