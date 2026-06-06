# Phase 1 — Real-time Voice Loop: Task Plan
## 0. Repo bootstrap
- [x] Create branch `feat/phase-1-voice-loop`
- [x] Write `tasks/todo.md` (this file) and commit
- [x] Create `tasks/lessons.md`
- [x] Add `.gitignore` (covers `**/.env`, `node_modules`, `__pycache__`, `dist`, etc.)
## 1. Backend scaffold
- [x] `backend/pyproject.toml` — declare deps
- [x] `backend/requirements.txt` — pinned versions
- [x] `backend/.env.example` — empty placeholders with comments
- [x] `backend/app/config.py` — pydantic-settings; fails loudly if keys missing
- [x] `backend/app/main.py` — FastAPI + CORS; `/health`, `/api/offer` (WebRTC signalling), PATCH (ICE)
- [x] `backend/Dockerfile`
## 2. Adapter interfaces
- [x] `backend/app/adapters/stt/base.py` — abstract `STTAdapter`
- [x] `backend/app/adapters/tts/base.py` — abstract `TTSAdapter`
- [x] `backend/app/adapters/llm/base.py` — abstract `LLMAdapter`
## 3. Provider adapters
- [x] `backend/app/adapters/stt/deepgram.py` — Nova-3, multilingual, word-boost
- [x] `backend/app/adapters/tts/cartesia.py` — Sonic, streaming WebSocket
- [x] `backend/app/adapters/llm/gemma.py` — Gemma 4 via GoogleLLMService, thinking=off
## 4. Pipeline assembly
- [x] `backend/app/persona.py` — Persona dataclass from config
- [x] `backend/app/features.py` — Feature toggles: VAD sensitivity, ALD, word-boost, phonetics
- [x] `backend/app/pipeline.py` — Pipecat pipeline: SmallWebRTC → VAD → STT → LLM → TTS; LatencyLogger
## 5. Frontend scaffold
- [x] `frontend/package.json` — minimal deps (vite, react, ts, tailwind, lucide-react)
- [x] `frontend/vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- [x] `frontend/index.html` — title uses BRAND_NAME
## 6. Branding & themes
- [x] `frontend/src/config/brand.ts` — `BRAND_NAME = "KS"` single source of truth
- [x] `frontend/src/themes/` — Airtel/Xtelify/Neutral token maps, light+dark, CSS vars
- [x] Theme + dark mode switching via React context; applied to `:root`
## 7. Frontend components
- [x] `frontend/src/lib/rtc.ts` — WebRTC client: getUserMedia, offer/answer, ICE, audio playback
- [x] `frontend/src/app/Sidebar.tsx` — responsive sidebar, brand logo, theme switcher
- [x] `frontend/src/app/App.tsx` — shell layout
- [x] `frontend/src/sections/ExperienceBot/` — idle/connecting/active/ended state machine; transcript; controls; config panel with inert Phase-2 stubs
## 8. Stub sections
- [x] Capabilities, Architecture, Workflows, Pricing, Roadmap — StubSection component, labelled out-of-scope
## 9. Secrets & security audit
- [x] No provider key in any `VITE_` var or frontend code
- [x] Bundle audit: `grep dist/ DEEPGRAM CARTESIA GEMINI` → 0 results ✅
- [x] Backend startup: missing key → `sys.exit(1)` with clear error message
## 10. Deploy config
- [x] `backend/Dockerfile`
- [x] `docker-compose.yml`
- [x] `frontend/.env.example`
- [x] README
## 11. Verification
- [x] `pip install -r requirements.txt` + imports compile cleanly ✅
- [x] `npm run build` → 0 TS errors ✅
- [x] Bundle secret audit → CLEAN ✅
- [x] Provider swap (LLM_MODEL env var) — structurally verified ✅
## 12. PR
- [x] Push branch `feat/phase-1-voice-loop`
- [x] Open PR
