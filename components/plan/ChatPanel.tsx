'use client'

import { useState, useRef, useEffect } from 'react'
import type { TripPlanData } from '@/types/database'

interface ChatPanelProps {
  planId: string
  currentPlan: TripPlanData
  onPlanUpdated: (newPlan: TripPlanData) => void
  isOpen: boolean
  onClose: () => void
}

interface Message {
  role: 'user' | 'ai'
  text: string
  streaming?: boolean
}

const SUGGESTIONS = [
  { label: 'Acıktım 🍽️', value: 'Acıktım, bir yemek durağı ekle veya öne al' },
  { label: 'Yoruldum 😓', value: 'Yoruldum, durak sayısını azalt ve planı daha hafif yap' },
  { label: 'Bütçemi aştım 💸', value: 'Bütçem yetersiz, daha uygun fiyatlı alternatifler öner' },
  { label: 'Zaman kaldı ⏱️', value: 'Elimde zaman var, ilginç bir durak daha ekle' },
]

export default function ChatPanel({
  planId,
  currentPlan,
  onPlanUpdated,
  isOpen,
  onClose,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
  }, [isOpen])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: 'user', text: text.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const aiMsgIndex = messages.length + 1
    setMessages((prev) => [...prev, { role: 'ai', text: '', streaming: true }])

    try {
      const response = await fetch('/api/edit-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, message: text.trim(), currentPlan }),
      })

      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let aiText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)

          if (data.startsWith('[PLAN_UPDATED]')) {
            const jsonStr = data.slice('[PLAN_UPDATED]'.length)
            try {
              const newPlan = JSON.parse(jsonStr) as TripPlanData
              onPlanUpdated(newPlan)
              setToast(true)
              setTimeout(() => setToast(false), 3000)
            } catch {
              // parse error — ignore
            }
          } else {
            aiText += data
            setMessages((prev) => {
              const updated = [...prev]
              updated[aiMsgIndex] = { role: 'ai', text: aiText, streaming: true }
              return updated
            })
          }
        }
      }

      setMessages((prev) => {
        const updated = [...prev]
        updated[aiMsgIndex] = { role: 'ai', text: aiText || 'Plan güncellendi.', streaming: false }
        return updated
      })
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[aiMsgIndex] = {
          role: 'ai',
          text: 'Bir hata oluştu, lütfen tekrar deneyin.',
          streaming: false,
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 40,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s',
        }}
      />

      <div
        style={{
          position: 'fixed',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          background: '#0f172a',
          border: '1px solid rgba(255,255,255,0.08)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',

          right: 0,
          top: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 420,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          borderRadius: '16px 0 0 16px',
        }}
        className="chat-panel-desktop"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 6v6l4 2" />
                <circle cx="19" cy="5" r="3" fill="#F59E0B" stroke="none" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>Plan Asistanı</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '5px 8px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 16px',
                color: '#475569',
                fontSize: 14,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>🗺️</div>
              <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                Planını isteğine göre düzenle
              </div>
              <div style={{ fontSize: 13 }}>
                Aşağıdaki önerilerden birini seç veya kendi isteğini yaz.
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background:
                    msg.role === 'user'
                      ? 'rgba(245,158,11,0.15)'
                      : 'rgba(255,255,255,0.05)',
                  border:
                    msg.role === 'user'
                      ? '1px solid rgba(245,158,11,0.3)'
                      : '1px solid rgba(255,255,255,0.08)',
                  color: msg.role === 'user' ? '#FCD34D' : '#cbd5e1',
                  fontSize: 14,
                  lineHeight: 1.6,
                  wordBreak: 'break-word',
                }}
              >
                {msg.streaming && msg.text === '' ? (
                  <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                    <DotPulse />
                  </span>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div
          style={{
            padding: '12px 16px 6px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
              marginBottom: 10,
            }}
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => sendMessage(s.value)}
                disabled={loading}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 20,
                  padding: '5px 12px',
                  color: '#94a3b8',
                  fontSize: 12,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Planı nasıl değiştireyim?"
              rows={2}
              disabled={loading}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '10px 14px',
                color: '#e2e8f0',
                fontSize: 14,
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.5,
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                background:
                  loading || !input.trim()
                    ? 'rgba(245,158,11,0.15)'
                    : 'rgba(245,158,11,0.9)',
                border: 'none',
                borderRadius: 12,
                padding: '10px 14px',
                color: loading || !input.trim() ? '#92400e' : '#fff',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
            >
              {loading ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ animation: 'spin 1s linear infinite' }}
                >
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
          <div style={{ height: 8 }} />
        </div>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(16,185,129,0.9)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Plan güncellendi
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,80%,100% { opacity: 0.2; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
        @media (max-width: 767px) {
          .chat-panel-desktop {
            right: 0 !important;
            left: 0 !important;
            top: auto !important;
            bottom: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 20px 20px 0 0 !important;
            transform: ${isOpen ? 'translateY(0)' : 'translateY(100%)'} !important;
            max-height: 85vh !important;
          }
        }
      `}</style>
    </>
  )
}

function DotPulse() {
  return (
    <>
      {[0, 0.16, 0.32].map((delay, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#94a3b8',
            animation: `pulse 1.4s ease-in-out ${delay}s infinite`,
          }}
        />
      ))}
    </>
  )
}
