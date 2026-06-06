# KS Voice Agent — Phase 1

Real-time, humanised voice agent: browser mic → WebRTC → Deepgram STT → Gemma LLM → Cartesia TTS → browser speaker.

---

## Architecture

```
Browser
↕ WebRTC (SmallWebRTC / aiortc)
FastAPI backend
→ Deepgram Nova-3 (STT, multilingual ALD, word-boost)
→ Gemma 4 via Gemini API (LLM, streaming, thinking=off)
→ Cartesia Sonic (TTS, streaming WebSocket)
```

Each provider sits behind a clean adapter interface (`backend/app/adapters/`).
Swapping a provider is a config-value change — no pipeline rewrite needed.

---

## Quick start (local)

### 1. Clone & set secrets

```bash
cp backend/.env.example backend/.env
# Fill in DEEPGRAM_API_KEY, CARTESIA_API_KEY, GEMINI_API_KEY
cp frontend/.env.example frontend/.env
# VITE_BACKEND_URL=http://localhost:8000  (default)
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Docker Compose

```bash
docker compose up --build
```

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| DEEPGRAM_API_KEY | ✅ | Deepgram API key |
| CARTESIA_API_KEY | ✅ | Cartesia API key |
| GEMINI_API_KEY | ✅ | Google Gemini API key (for Gemma) |
| LLM_MODEL | — | `gemma-4-26b-a4b-it` (default) or `gemma-4-31b-it` |
| CARTESIA_VOICE_ID | — | Cartesia voice ID |
| DEFAULT_LANGUAGE | — | `en` (default) |
| INTERRUPTION_SENSITIVITY | — | `0.5` (0=hard, 1=very sensitive) |
| STT_WORD_BOOST | — | Comma-separated keyterms |
| PERSONA_SYSTEM_PROMPT | — | Override default system prompt |
| CORS_ORIGINS | — | Comma-separated allowed origins |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| VITE_BACKEND_URL | — | Backend URL (default: `http://localhost:8000`) |

**Security:** Provider API keys live ONLY in the backend. Never `VITE_`-prefixed, never in the browser bundle.

---

## Swapping a provider

```bash
# backend/.env — switch LLM model, no code change needed
LLM_MODEL=gemma-4-31b-it
```

Restart the backend. The `GemmaAdapter` reads `settings.llm_model`.

---

## Deploy

### Render (backend)

- Root Directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add env vars in Render's Environment tab.

### Fly.io (backend)

```bash
cd backend
fly launch --name ks-voice-agent-backend
fly secrets set DEEPGRAM_API_KEY=... CARTESIA_API_KEY=... GEMINI_API_KEY=...
fly deploy
```

### Vercel (frontend)

Root Directory: `frontend`, Framework: Vite
Env var: `VITE_BACKEND_URL=https://your-backend.onrender.com`

---

## Branding

`frontend/src/config/brand.ts` — change `BRAND_NAME = "KS"` to rebrand everything.

Three runtime themes: **Airtel** `#E40000` · **Xtelify** `#111111` · **Neutral** `#2563EB` — each with light/dark.

---

## Out of scope (Phase 1)

RAG, persona management UI, agentic orchestration, decision-tree, Capabilities/Workflows/Architecture/Pricing/Roadmap sections, auth, multi-tenancy, analytics, diarization, acoustic emotion/sentiment.

---

## Known limitations

1. TTS phonetics: hook present, not wired (needs Cartesia dict pre-creation)
2. Transcript data channel: audio works; transcript panel hookup is a follow-up
3. Code-mix/Hinglish: Deepgram Nova-3 multi mode, best-effort
4. Single session per process in Phase 1
