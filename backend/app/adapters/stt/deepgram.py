from __future__ import annotations
from typing import List
from pipecat.services.deepgram.stt import DeepgramSTTService, LiveOptions
from app.adapters.stt.base import STTAdapter


class DeepgramAdapter(STTAdapter):
    def __init__(self, api_key: str) -> None:
        self._api_key = api_key

    def build(
        self,
        *,
        language: str = "en",
        multilingual: bool = True,
        word_boost: List[str] | None = None,
    ) -> DeepgramSTTService:
        effective_language = "multi" if multilingual else language
        live_opts = LiveOptions(
            model="nova-3",
            language=effective_language,
            punctuate=True,
            interim_results=True,
            smart_format=True,
            keyterm=word_boost or [],
        )
        return DeepgramSTTService(
            api_key=self._api_key,
            live_options=live_opts,
        )
