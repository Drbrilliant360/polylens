import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react'
import { cn } from '../../lib/cn'
import { api } from '../../lib/api'
import { Button } from '../ui/Button'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function AIChatWidget({ assessmentContext }: { assessmentContext?: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I\'m PolicyLens AI. Ask me anything about the assessment — scores, gaps, recommendations, or next steps.' },
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || streaming) return

    const text = input.trim()
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setStreaming(true)

    const history = messagesRef.current.slice(1).map(m => ({ role: m.role, content: m.content }))

    try {
      const result = await api.ai.chat([...history, { role: 'user', content: text }], assessmentContext)
      setMessages(prev => [...prev, { role: 'assistant', content: result.content || 'No response' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setStreaming(false)
    }
  }

  return (
    <>
      {!open && (
        <Button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open AI chat"
          className={cn(
            'fixed z-40 rounded-full shadow-lg shadow-policy-600/30',
            'bottom-4 right-4 sm:bottom-6 sm:right-6',
            'w-14 h-14 p-0 hover:scale-105'
          )}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {open && (
        <div
          className={cn(
            'fixed z-40 bg-white flex flex-col overflow-hidden shadow-2xl border border-slate-200',
            'inset-x-3 bottom-3 top-auto h-[min(560px,calc(100vh-5rem))] rounded-2xl',
            'sm:inset-x-auto sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px] sm:max-w-[calc(100vw-2rem)]'
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-policy-600 to-policy-700 text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="text-sm font-semibold">PolicyLens AI</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="p-2 rounded-lg hover:bg-white/15 transition-colors active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-policy-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-policy-600" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[85%] sm:max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-policy-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-policy-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {streaming && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-policy-100 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-policy-600" />
                </div>
                <div className="bg-slate-100 text-slate-500 px-3 py-2 rounded-xl rounded-tl-sm text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3 flex gap-2 flex-shrink-0 bg-white">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about the assessment..."
              disabled={streaming}
              className="flex-1 min-w-0 px-3 py-2.5 text-sm border border-slate-200 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-policy-300 disabled:opacity-50"
            />
            <Button type="submit" disabled={!input.trim() || streaming} size="icon" aria-label="Send message">
              {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      )}
    </>
  )
}
