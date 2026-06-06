import { useState, useRef, useCallback, useEffect } from 'react'
import { Phone, PhoneOff, Mic, MicOff, RotateCcw } from 'lucide-react'
import { VoiceSession, RTCStatus } from '../../lib/rtc'

interface TranscriptLine {
  id: string
  speaker: 'user' | 'agent'
  text: string
  isFinal: boolean
}

const STATUS_LABELS: Record<RTCStatus, string> = {
  idle: 'Ready to connect',
  connecting: 'Connecting…',
  active: 'Live',
  ended: 'Call ended',
  error: 'Connection error',
}

const STATUS_DOT: Record<RTCStatus, string> = {
  idle: 'bg-muted-foreground',
  connecting: 'bg-yellow-400 animate-pulse',
  active: 'bg-green-500 animate-pulse',
  ended: 'bg-muted-foreground',
  error: 'bg-destructive',
}

function WaveformBar({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-0.5 h-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={['w-1 rounded-full bg-primary transition-all duration-150', active ? 'animate-bounce' : 'h-1'].join(' ')}
          style={active ? { animationDelay: `${i * 80}ms`, height: `${12 + (i % 3) * 8}px` } : {}}
        />
      ))}
    </div>
  )
}

export default function ExperienceBot() {
  const [status, setStatus] = useState<RTCStatus>('idle')
  const [muted, setMuted] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptLine[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [interruptionSensitivity, setInterruptionSensitivity] = useState(50)
  const sessionRef = useRef<VoiceSession | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  const appendTranscript = useCallback((text: string, isFinal: boolean) => {
    setTranscript((prev) => {
      const last = prev[prev.length - 1]
      if (last && !last.isFinal && last.speaker === 'user') {
        return [...prev.slice(0, -1), { ...last, text, isFinal }]
      }
      return [...prev, { id: `${Date.now()}`, speaker: 'user', text, isFinal }]
    })
  }, [])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  const startCall = useCallback(async () => {
    setErrorMsg(null)
    setTranscript([])
    const session = new VoiceSession({
      onStatusChange: setStatus,
      onTranscript: appendTranscript,
      onError: (msg) => setErrorMsg(msg),
    })
    sessionRef.current = session
    await session.start()
  }, [appendTranscript])

  const endCall = useCallback(() => {
    sessionRef.current?.stop()
    sessionRef.current = null
  }, [])

  const toggleMute = useCallback(() => {
    sessionRef.current?.mute(!muted)
    setMuted((m) => !m)
  }, [muted])

  const reset = useCallback(() => {
    endCall()
    setStatus('idle')
    setTranscript([])
    setErrorMsg(null)
    setMuted(false)
  }, [endCall])

  const isActive = status === 'active'
  const isConnecting = status === 'connecting'
  const isIdle = status === 'idle' || status === 'ended' || status === 'error'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border shrink-0">
        <h1 className="text-lg font-semibold text-foreground">Experience the Bot</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Real-time voice conversation — Deepgram STT · Gemma LLM · Cartesia TTS</p>
      </div>

      <div className="flex-1 overflow-hidden flex gap-0 min-h-0">
        <div className="flex-1 flex flex-col min-h-0 p-6 gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[status]}`} />
            <span className="text-sm font-medium text-foreground">{STATUS_LABELS[status]}</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-0">
            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <WaveformBar active={isActive && !muted} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {isActive ? (muted ? 'Microphone muted' : 'Listening…') : STATUS_LABELS[status]}
              </p>
              {errorMsg && <p className="text-xs text-destructive mt-1 max-w-xs">{errorMsg}</p>}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 shrink-0">
            {isActive && (
              <button
                onClick={toggleMute}
                className={['w-12 h-12 rounded-full flex items-center justify-center transition-colors border', muted ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-muted text-foreground border-border hover:bg-accent'].join(' ')}
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
            {isIdle ? (
              <button onClick={startCall} className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity" aria-label="Start call">
                <Phone className="w-6 h-6" />
              </button>
            ) : isConnecting ? (
              <button disabled className="w-14 h-14 rounded-full bg-primary/50 text-primary-foreground flex items-center justify-center cursor-not-allowed">
                <Phone className="w-6 h-6" />
              </button>
            ) : (
              <button onClick={endCall} className="w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity" aria-label="End call">
                <PhoneOff className="w-6 h-6" />
              </button>
            )}
            {(status === 'ended' || status === 'error') && (
              <button onClick={reset} className="w-12 h-12 rounded-full flex items-center justify-center border border-border bg-muted text-foreground hover:bg-accent transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="w-px bg-border shrink-0" />

        <div className="w-80 flex flex-col min-h-0 shrink-0">
          <div className="p-4 border-b border-border shrink-0 space-y-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Session Config</h2>
            <div>
              <label className="text-xs font-medium text-foreground">Persona</label>
              <div className="mt-1 px-3 py-1.5 rounded-md bg-muted text-sm text-foreground">Default Assistant</div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Language</label>
              <div className="mt-1 px-3 py-1.5 rounded-md bg-muted text-sm text-foreground">Auto-detect (multilingual)</div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-foreground">Barge-in Sensitivity</label>
                <span className="text-xs text-muted-foreground">{interruptionSensitivity}%</span>
              </div>
              <input type="range" min={0} max={100} value={interruptionSensitivity} onChange={(e) => setInterruptionSensitivity(Number(e.target.value))} className="w-full accent-primary" disabled={isActive || isConnecting} />
              <p className="text-[10px] text-muted-foreground mt-0.5">{isActive ? 'Cannot change during active call' : 'Applied at call start'}</p>
            </div>
            <div className="space-y-1.5">
              {['Sentiment Detection', 'Emotion Detection', 'RAG / Knowledge Base'].map((label) => (
                <div key={label} className="flex items-center justify-between px-2 py-1.5 rounded-md bg-muted/40 opacity-50 cursor-not-allowed" title="Coming in a future phase">
                  <span className="text-xs text-foreground">{label}</span>
                  <span className="text-[9px] font-medium text-muted-foreground border border-border rounded px-1 py-0.5">Soon</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-2 border-b border-border shrink-0">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Transcript</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {transcript.length === 0 && (
                <p className="text-xs text-muted-foreground text-center mt-4">Transcript will appear here during the call.</p>
              )}
              {transcript.map((line) => (
                <div key={line.id} className={['flex', line.speaker === 'user' ? 'justify-end' : 'justify-start'].join(' ')}>
                  <div className={['max-w-[85%] px-3 py-2 rounded-xl text-sm', line.speaker === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground', !line.isFinal ? 'opacity-60' : ''].join(' ')}>
                    {line.text}
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
