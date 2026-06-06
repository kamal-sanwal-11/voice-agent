const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000'

export type RTCStatus = 'idle' | 'connecting' | 'active' | 'ended' | 'error'

export interface RTCCallbacks {
  onStatusChange: (s: RTCStatus) => void
  onTranscript: (text: string, isFinal: boolean) => void
  onError: (msg: string) => void
}

export class VoiceSession {
  private pc: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private audioEl: HTMLAudioElement | null = null
  private callbacks: RTCCallbacks
  private dataChannel: RTCDataChannel | null = null

  constructor(callbacks: RTCCallbacks) {
    this.callbacks = callbacks
  }

  async start(): Promise<void> {
    this.callbacks.onStatusChange('connecting')
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      this.pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      })

      for (const track of this.localStream.getAudioTracks()) {
        this.pc.addTrack(track, this.localStream)
      }

      this.pc.ontrack = (evt) => {
        if (!this.audioEl) {
          this.audioEl = new Audio()
          this.audioEl.autoplay = true
        }
        this.audioEl.srcObject = evt.streams[0]
      }

      this.dataChannel = this.pc.createDataChannel('transcript')
      this.dataChannel.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data as string) as { text: string; is_final: boolean }
          this.callbacks.onTranscript(msg.text, msg.is_final)
        } catch {
          // non-JSON messages ignored
        }
      }

      const iceCandidates: RTCIceCandidate[] = []
      let peerConnectionId: string | null = null

      this.pc.onicecandidate = async (evt) => {
        if (!peerConnectionId) {
          if (evt.candidate) iceCandidates.push(evt.candidate)
          return
        }
        if (evt.candidate) {
          await this._sendIceCandidate(peerConnectionId, evt.candidate)
        }
      }

      this.pc.onconnectionstatechange = () => {
        switch (this.pc?.connectionState) {
          case 'connected':
            this.callbacks.onStatusChange('active')
            break
          case 'disconnected':
          case 'failed':
          case 'closed':
            this.callbacks.onStatusChange('ended')
            break
        }
      }

      const offer = await this.pc.createOffer()
      await this.pc.setLocalDescription(offer)

      const response = await fetch(`${BACKEND_URL}/api/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdp: offer.sdp, type: offer.type }),
      })
      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`)
      }
      const answer = (await response.json()) as {
        sdp: string
        type: RTCSdpType
        pc_id?: string
        id?: string
      }
      peerConnectionId = answer.pc_id ?? answer.id ?? null
      await this.pc.setRemoteDescription(new RTCSessionDescription(answer))

      for (const candidate of iceCandidates) {
        if (candidate && peerConnectionId) {
          await this._sendIceCandidate(peerConnectionId, candidate)
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      this.callbacks.onError(msg)
      this.callbacks.onStatusChange('error')
    }
  }

  private async _sendIceCandidate(pcId: string, candidate: RTCIceCandidate): Promise<void> {
    await fetch(`${BACKEND_URL}/api/offer`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pc_id: pcId, candidate: candidate.toJSON() }),
    }).catch(() => {})
  }

  mute(muted: boolean): void {
    if (this.localStream) {
      for (const track of this.localStream.getAudioTracks()) {
        track.enabled = !muted
      }
    }
  }

  stop(): void {
    this.localStream?.getTracks().forEach((t) => t.stop())
    this.pc?.close()
    this.pc = null
    this.localStream = null
    if (this.audioEl) {
      this.audioEl.srcObject = null
      this.audioEl = null
    }
    this.callbacks.onStatusChange('ended')
  }
}
