from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List
from app.config import settings


@dataclass
class Features:
    interruption_enabled: bool = True
    vad_stop_secs: float = field(init=False)
    ald_enabled: bool = True
    code_mix_enabled: bool = True
    word_boost: List[str] = field(default_factory=list)
    phonetics_map: Dict[str, str] = field(default_factory=dict)

    def __post_init__(self) -> None:
        s = settings.interruption_sensitivity
        self.vad_stop_secs = round(1.2 - s * 1.0, 2)


def get_features() -> Features:
    return Features(
        word_boost=settings.stt_word_boost,
    )
