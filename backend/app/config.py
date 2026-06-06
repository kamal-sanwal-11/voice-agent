from __future__ import annotations
import sys
from typing import List
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    deepgram_api_key: str = ""
    cartesia_api_key: str = ""
    gemini_api_key: str = ""

    stt_provider: str = "deepgram"
    tts_provider: str = "cartesia"
    llm_provider: str = "gemma"
    llm_model: str = "gemma-4-26b-a4b-it"

    default_language: str = "en"
    cartesia_voice_id: str = "a0e99841-438c-4a64-b679-ae501e7d6091"
    persona_system_prompt: str = (
        "You are a helpful, friendly voice assistant. "
        "Keep responses concise and conversational — one to three sentences. "
        "Match the language of the user's message when it differs from English."
    )

    interruption_sensitivity: float = 0.5
    stt_word_boost_raw: str = ""

    @property
    def stt_word_boost(self) -> List[str]:
        return [w.strip() for w in self.stt_word_boost_raw.split(",") if w.strip()]

    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:4173"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @model_validator(mode="after")
    def _require_provider_keys(self) -> "Settings":
        missing = []
        if not self.deepgram_api_key:
            missing.append("DEEPGRAM_API_KEY")
        if not self.cartesia_api_key:
            missing.append("CARTESIA_API_KEY")
        if not self.gemini_api_key:
            missing.append("GEMINI_API_KEY")
        if missing:
            print(
                f"\n[FATAL] Missing required environment variables: {', '.join(missing)}\n"
                "Copy backend/.env.example to backend/.env and fill in the values.\n",
                file=sys.stderr,
            )
            sys.exit(1)
        return self

    @field_validator("interruption_sensitivity")
    @classmethod
    def _clamp_sensitivity(cls, v: float) -> float:
        return max(0.0, min(1.0, v))


settings = Settings()
