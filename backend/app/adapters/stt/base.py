from __future__ import annotations
from abc import ABC, abstractmethod
from typing import List
from pipecat.services.stt_service import STTService


class STTAdapter(ABC):
    @abstractmethod
    def build(
        self,
        *,
        language: str = "en",
        multilingual: bool = True,
        word_boost: List[str] | None = None,
    ) -> STTService: ...
