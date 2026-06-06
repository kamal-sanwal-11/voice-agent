from __future__ import annotations
from pipecat.services.google.llm import GoogleLLMService, GoogleLLMSettings
from app.adapters.llm.base import LLMAdapter


class GemmaAdapter(LLMAdapter):
    def __init__(self, api_key: str, model: str = "gemma-4-26b-a4b-it") -> None:
        self._api_key = api_key
        self._model = model

    def build(self, *, system_prompt: str) -> GoogleLLMService:
        settings = GoogleLLMSettings(
            thinking=GoogleLLMService.ThinkingConfig(
                include_thoughts=False,
                thinking_budget=0,
            ),
        )
        return GoogleLLMService(
            api_key=self._api_key,
            model=self._model,
            system_instruction=system_prompt,
            settings=settings,
        )
