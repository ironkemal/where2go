'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { TripStop } from '@/types/database'

interface AudioGuidePlayerProps {
  stop: TripStop
  city: string
  onClose: () => void
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

const SPEEDS = [0.75, 1, 1.25, 1.5] as const

export default function AudioGuidePlayer({ stop, city, onClose }: AudioGuidePlayerProps) {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [text, setText] = useState<string>('')
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState<number>(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const rafRef = useRef<number | null>(null)

  const tickTime = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
    rafRef.current = requestAnimationFrame(tickTime)
  }, [])

  useEffect(() => {
    async function fetchGuide() {
      setLoadState('loading')
      try {
        const res = await fetch('/api/audio-guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stopName: stop.name,
            stopDescription: stop.description,
            city,
            lang: 'tr',
          }),
        })
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        setText(data.text ?? '')
        setAudioUrl(data.audioUrl ?? '')
        setLoadState('ready')
      } catch {
        setLoadState('error')
      }
    }
    fetchGuide()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [stop.name, stop.description, city])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return

    function onLoaded() { setDuration(audio!.duration) }
    function onEnded() { setPlaying(false); if (rafRef.current) cancelAnimationFrame(rafRef.current) }

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
    }
  }, [audioUrl])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setPlaying(false)
    } else {
      audio.play()
      rafRef.current = requestAnimationFrame(tickTime)
      setPlaying(true)
    }
  }

  function seek(delta: number) {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + delta))
    setCurrentTime(audio.currentTime)
  }

  function seekToPosition(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * duration
    setCurrentTime(audio.currentTime)
  }

  function changeSpeed(s: number) {
    setSpeed(s)
    if (audioRef.current) audioRef.current.playbackRate = s
  }

  function fmt(s: number) {
    if (!isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'flex-end',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      fontFamily: '"DM Sans", system-ui, sans-serif',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>

      <style>{`
        @keyframes sheet-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes eq-bar {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        .aud-btn {
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; border-radius: 50%;
          font-family: inherit;
        }
        .aud-btn:active { transform: scale(0.9); }
        .speed-chip {
          background: none; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px; padding: 4px 9px;
          font-size: 11px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; font-family: inherit;
          color: #64748b;
        }
        .speed-chip.active {
          background: rgba(245,158,11,0.15);
          border-color: rgba(245,158,11,0.35);
          color: #fbbf24;
        }
      `}</style>

      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="auto" style={{ display: 'none' }} />
      )}

      <div style={{
        width: '100%',
        maxHeight: '80vh',
        background: '#0f1623',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px 20px 0 0',
        padding: '20px 20px 32px',
        animation: 'sheet-up 0.35s cubic-bezier(0.32,0.72,0,1)',
        display: 'flex', flexDirection: 'column', gap: 0,
        overflow: 'hidden',
      }}>

        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.12)',
          margin: '-8px auto 16px',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 3px' }}>
              Sesli Rehber
            </p>
            <h3 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {stop.name}
            </h3>
            <p style={{ color: '#475569', fontSize: 13, margin: '2px 0 0' }}>
              {city}
            </p>
          </div>
          <button
            className="aud-btn"
            onClick={onClose}
            style={{ color: '#475569', padding: 6, marginLeft: 8, flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Loading state */}
        {loadState === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '3px solid rgba(245,158,11,0.15)',
              borderTop: '3px solid #f59e0b',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Rehber hazırlanıyor...</p>
            <p style={{ color: '#334155', fontSize: 11, margin: 0, textAlign: 'center', maxWidth: 240 }}>
              Wikipedia araştırılıyor ve ses oluşturuluyor
            </p>
          </div>
        )}

        {/* Error state */}
        {loadState === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p style={{ color: '#fca5a5', fontSize: 13, margin: 0 }}>Rehber yüklenemedi</p>
          </div>
        )}

        {/* Ready state */}
        {loadState === 'ready' && (
          <>
            {audioUrl ? (
              <>
                {/* Equalizer animation when playing */}
                {playing && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3, height: 24, marginBottom: 12 }}>
                    {[0, 0.15, 0.3, 0.45, 0.6, 0.45, 0.3, 0.15, 0].map((delay, i) => (
                      <div key={i} style={{
                        width: 3, height: '100%',
                        background: '#f59e0b',
                        borderRadius: 2,
                        transformOrigin: 'bottom',
                        animation: `eq-bar ${0.6 + i * 0.05}s ease-in-out infinite`,
                        animationDelay: `${delay}s`,
                        opacity: 0.7 + (i % 3) * 0.1,
                      }} />
                    ))}
                  </div>
                )}

                {/* Progress bar */}
                <div
                  onClick={seekToPosition}
                  style={{
                    height: 4, background: 'rgba(255,255,255,0.06)',
                    borderRadius: 2, cursor: 'pointer',
                    marginBottom: 6, position: 'relative',
                  }}
                >
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${progress}%`, background: '#f59e0b',
                    borderRadius: 2, transition: 'width 0.1s linear',
                  }} />
                  <div style={{
                    position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                    left: `${progress}%`, width: 12, height: 12,
                    borderRadius: '50%', background: '#f59e0b',
                    boxShadow: '0 0 6px rgba(245,158,11,0.5)',
                    transition: 'left 0.1s linear',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span style={{ color: '#475569', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>{fmt(currentTime)}</span>
                  <span style={{ color: '#475569', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>{fmt(duration)}</span>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
                  <button className="aud-btn" onClick={() => seek(-15)} style={{ color: '#64748b', padding: 8 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
                      <text x="9" y="15" fontSize="6" fill="currentColor" stroke="none" fontFamily="system-ui" fontWeight="700">15</text>
                    </svg>
                  </button>

                  <button
                    className="aud-btn"
                    onClick={togglePlay}
                    style={{
                      width: 56, height: 56,
                      background: 'rgba(245,158,11,0.12)',
                      border: '1px solid rgba(245,158,11,0.3)',
                      color: '#f59e0b',
                    }}
                  >
                    {playing ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}>
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    )}
                  </button>

                  <button className="aud-btn" onClick={() => seek(15)} style={{ color: '#64748b', padding: 8 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-.49-4.5" />
                      <text x="9" y="15" fontSize="6" fill="currentColor" stroke="none" fontFamily="system-ui" fontWeight="700">15</text>
                    </svg>
                  </button>
                </div>

                {/* Speed controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      className={`speed-chip${speed === s ? ' active' : ''}`}
                      onClick={() => changeSpeed(s)}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* Text-only fallback */
              <div style={{
                overflowY: 'auto', maxHeight: 'calc(80vh - 180px)',
                paddingRight: 4,
              }}>
                <div style={{
                  background: 'rgba(245,158,11,0.05)',
                  border: '1px solid rgba(245,158,11,0.1)',
                  borderRadius: 10, padding: '10px 12px', marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p style={{ color: '#92400e', fontSize: 11, margin: 0 }}>Ses oluşturulamadı — metin olarak gösteriliyor</p>
                </div>
                <p style={{
                  color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: 0,
                  whiteSpace: 'pre-wrap',
                }}>
                  {text}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
