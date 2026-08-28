from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.ocr_service import ocr_service
from app.services.ai_service import ai_service

router = APIRouter(prefix="/ocr", tags=["OCR Engine"])

@router.post("/process")
async def process_ocr_document(file: UploadFile = File(...)):
    """Processes document OCR and extracts structured medical entities."""
    # Perform mock/pytesseract OCR extraction
    raw_ocr_text, engine_used = await ocr_service.extract_text_from_file(file.filename)
    entities = await ai_service.parse_document_text(raw_ocr_text, file.filename)
    
    return {
        "file_name": file.filename,
        "ocr_engine": engine_used,
        "raw_ocr_text": raw_ocr_text,
        "extracted_entities": entities
    }
