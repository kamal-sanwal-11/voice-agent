from __future__ import annotations
from typing import Dict
from pipecat.services.cartesia.tts import CartesiaTTSService
from app.adapters.tts.base import TTSAdapter


class CartesiaAdapter(TTSAdapter):
    def __init__(self, api_key: str) -> None:
        self._api_key = api_key

    def build(
        self,
        *,
        voice_id: str,
        language: str = "en",
        phonetics_map: Dict[str, str] | None = None,
    ) -> CartesiaTTSService:
        params = CartesiaTTSService.InputParams(
            language=language,
            # pronunciation_dict_id not wired in Phase 1 — phonetics_map is a future hook
        )
        return CartesiaTTSService(
            api_key=self._api_key,
            voice_id=voice_id,
            params=params,
        )
