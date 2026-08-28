from typing import Dict, Any

class TTSService:
    """Text-to-Speech audio configuration & prompt generator service."""

    VOICE_CONFIGS = {
        "ta": {"lang_code": "ta-IN", "name": "Tamil Voice Assistant", "rate": 0.9},
        "en": {"lang_code": "en-IN", "name": "English Voice Assistant", "rate": 1.0},
        "hi": {"lang_code": "hi-IN", "name": "Hindi Voice Assistant", "rate": 0.95}
    }

    def prepare_speech_payload(self, text: str, language: str = "en") -> Dict[str, Any]:
        """Formats text for client-side or server-side Web Speech TTS playback."""
        config = self.VOICE_CONFIGS.get(language, self.VOICE_CONFIGS["en"])
        return {
            "text": text,
            "language": language,
            "voice_code": config["lang_code"],
            "speech_rate": config["rate"],
            "title": config["name"]
        }

tts_service = TTSService()
