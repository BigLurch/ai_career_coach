export type CvRecord = {
    id: string;
    user_id: string;
    file_name: string;
    file_path: string;
    file_size: number | null;
    mime_type: string | null;
    uploaded_at: string;
    extracted_text?: string | null;
    extraction_status?: string | null;
};