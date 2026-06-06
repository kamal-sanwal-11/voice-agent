from __future__ import annotations
import uuid
from fastapi import BackgroundTasks, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from pipecat.transports.smallwebrtc.connection import SmallWebRTCConnection
from pipecat.transports.smallwebrtc.request_handler import (
    SmallWebRTCPatchRequest,
    SmallWebRTCRequest,
    SmallWebRTCRequestHandler,
)
from app.config import settings
from app.pipeline import build_pipeline

app = FastAPI(title="KS Voice Agent", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_webrtc_handler = SmallWebRTCRequestHandler()


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "version": "0.1.0"}


@app.post("/api/offer")
async def offer(request: SmallWebRTCRequest, background_tasks: BackgroundTasks) -> dict:
    session_id = str(uuid.uuid4())
    logger.info(f"[{session_id}] WebRTC offer received")

    async def _on_connection(connection: SmallWebRTCConnection) -> None:
        logger.info(f"[{session_id}] WebRTC connection established — starting pipeline")
        try:
            await build_pipeline(connection)
        except Exception:
            logger.exception(f"[{session_id}] Pipeline error")

    answer = await _webrtc_handler.handle_web_request(
        request=request,
        webrtc_connection_callback=_on_connection,
    )
    return answer


@app.patch("/api/offer")
async def ice_candidate(request: SmallWebRTCPatchRequest) -> None:
    await _webrtc_handler.handle_patch_request(request)
