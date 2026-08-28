import os
import shutil
import tempfile
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from app.schemas.schemas import DynamicQuestionRequest, AIQuestionResponse, AudioTranscribeResponse
from app.services.ai_service import ai_service
from app.services.voice_service import voice_service

router = APIRouter(prefix="/ai", tags=["AI & Voice Services"])

@router.post("/question", response_model=AIQuestionResponse)
async def generate_next_clinical_question(req: DynamicQuestionRequest):
    """Dynamically generates the next adaptive clinical intake question via Ollama Qwen3 / Fallback."""
    result = await ai_service.generate_adaptive_question(
        chief_complaint=req.chief_complaint,
        previous_answers=req.previous_answers,
        language=req.language
    )
    return result

@router.post("/transcribe", response_model=AudioTranscribeResponse)
async def transcribe_audio(
    language: str = Form("en"),
    file: UploadFile = File(...)
):
    """Transcribe spoken audio from microphone using Whisper or Web Speech API backend handler."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
        shutil.copyfileobj(file.file, temp_audio)
        temp_path = temp_audio.name

    try:
        res = await voice_service.transcribe_audio_file(temp_path, language=language)
        return res
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
