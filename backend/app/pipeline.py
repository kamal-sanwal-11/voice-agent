from __future__ import annotations
import time
from typing import Any
from loguru import logger
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.frames.frames import (
    Frame,
    LLMFullResponseStartFrame,
    TranscriptionFrame,
    TTSAudioRawFrame,
)
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.worker import PipelineWorker
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor
from pipecat.transports.base_transport import TransportParams
from pipecat.transports.smallwebrtc.connection import SmallWebRTCConnection
from pipecat.transports.smallwebrtc.transport import SmallWebRTCTransport
from app.adapters.llm.gemma import GemmaAdapter
from app.adapters.stt.deepgram import DeepgramAdapter
from app.adapters.tts.cartesia import CartesiaAdapter
from app.config import settings
from app.features import get_features
from app.persona import get_persona


class LatencyLogger(FrameProcessor):
    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self._stt_final_at: float | None = None
        self._tts_first_byte_at: float | None = None

    async def process_frame(self, frame: Frame, direction: FrameDirection) -> None:
        now = time.monotonic()
        if isinstance(frame, TranscriptionFrame):
            self._stt_final_at = now
            self._tts_first_byte_at = None
            logger.info("[LATENCY] STT final transcript: {!r}", frame.text)
        elif isinstance(frame, LLMFullResponseStartFrame):
            if self._stt_final_at:
                ms = (now - self._stt_final_at) * 1000
                logger.info(f"[LATENCY] LLM TTFT: {ms:.0f} ms after STT final")
        elif isinstance(frame, TTSAudioRawFrame) and self._tts_first_byte_at is None:
            if self._stt_final_at:
                self._tts_first_byte_at = now
                ms = (now - self._stt_final_at) * 1000
                logger.info(f"[LATENCY] TTS first byte: {ms:.0f} ms after STT final (target ≤900 ms)")
        await self.push_frame(frame, direction)


async def build_pipeline(connection: SmallWebRTCConnection) -> None:
    persona = get_persona()
    features = get_features()

    stt_service = DeepgramAdapter(api_key=settings.deepgram_api_key).build(
        multilingual=features.ald_enabled,
        word_boost=features.word_boost,
    )
    tts_service = CartesiaAdapter(api_key=settings.cartesia_api_key).build(
        voice_id=persona.voice_id,
        language=persona.default_language,
    )
    llm_service = GemmaAdapter(
        api_key=settings.gemini_api_key,
        model=settings.llm_model,
    ).build(system_prompt=persona.system_prompt)

    context = LLMContext()
    aggregators = LLMContextAggregatorPair(context)

    vad = SileroVADAnalyzer(
        params=VADParams(stop_secs=features.vad_stop_secs)
    )
    transport = SmallWebRTCTransport(
        webrtc_connection=connection,
        params=TransportParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            audio_in_filter=vad,
        ),
    )

    pipeline = Pipeline(
        [
            transport.input(),
            stt_service,
            LatencyLogger(),
            aggregators.user(),
            llm_service,
            tts_service,
            aggregators.assistant(),
            transport.output(),
        ]
    )
    worker = PipelineWorker(pipeline)
    runner = PipelineRunner()
    await runner.run(worker)
