# Lessons Learned
_Patterns recorded mid-build to prevent recurrence._
| # | Context | Mistake / Risk | Pattern / Fix |
|---|---------|---------------|---------------|
| 1 | Pipecat 1.3 import paths | `pipecat.services.deepgram.DeepgramSTTService` doesn't exist | Correct path: `pipecat.services.deepgram.stt.DeepgramSTTService`; same pattern for cartesia (`.tts`) and transports (`pipecat.transports.smallwebrtc.*` not `.network.*`) |
| 2 | Pipecat 1.3 LLM context aggregators | `PipelineTask`, `LLMAssistantAggregator` from `llm_response` are deprecated/removed in 1.3 | Use `PipelineWorker` + `LLMContextAggregatorPair` from `pipecat.processors.aggregators.llm_response_universal` |
| 3 | GoogleLLMService + Gemma | Pipecat 1.3's `GoogleLLMService` supports Gemma model IDs directly via `google-genai`; no custom wrapper needed | Pass `model="gemma-4-26b-a4b-it"` to `GoogleLLMService` and set `thinking=ThinkingConfig(include_thoughts=False, thinking_budget=0)` to disable thinking for latency |
| 4 | SmallWebRTC ICE PATCH handler | Method is `handle_patch_request`, not `handle_ice_candidate` | Always check `dir(handler)` when the pipecat version changes |
| 5 | Vite + TypeScript | `import.meta.env` requires `/// <reference types="vite/client" />` in a `.d.ts` file | Always include `src/vite-env.d.ts` in new Vite+TS projects |
| 6 | pip system packages conflict | System `cryptography` package installed by debian lacks RECORD file; pip can't uninstall it | Use `--ignore-installed cryptography` on fresh installs in containers that have system-managed python packages |
