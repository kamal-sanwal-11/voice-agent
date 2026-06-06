from __future__ import annotations
from dataclasses import dataclass
from app.config import settings


@dataclass(frozen=True)
class Persona:
    system_prompt: str
    voice_id: str
    default_language: str


def get_persona() -> Persona:
    return Persona(
        system_prompt=settings.persona_system_prompt,
        voice_id=settings.cartesia_voice_id,
        default_language=settings.default_language,
    )
