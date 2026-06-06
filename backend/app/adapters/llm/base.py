from __future__ import annotations
from abc import ABC, abstractmethod
from pipecat.services.llm_service import LLMService


class LLMAdapter(ABC):
    @abstractmethod
    def build(self, *, system_prompt: str) -> LLMService: ...
