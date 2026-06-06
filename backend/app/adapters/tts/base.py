from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Dict
from pipecat.services.tts_service import TTSService


class TTSAdapter(ABC):
    @abstractmethod
    def build(
        self,
        *,
        voice_id: str,
        language: str = "en",
        phonetics_map: Dict[str, str] | None = None,
    ) -> TTSService: ...
