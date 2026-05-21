'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Message = { id: string; role: 'user' | 'assistant'; content: string; timestamp: string }
type Call = {
  id: string; caller_number: string; started_at: string
  duration: number | null; status: string; summary: string | null
}

function formatPhone(raw: string) {
  if (!raw) return '—'
  const d = raw.replace(/\D/g, '').replace(/^0033/, '0').replace(/^33/, '0')
  return d.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
}
function formatDuration(s: number | null) {
  if (!s) return '—'
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`
}
function formatDate(d: string) {
  return new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function CallDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [call, setCall]       = useState<Call | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Récupérer le client_id de l'utilisateur
      const { data: client } = await supabase.from('clients').select('id').eq('user_id', user.id).single()
      if (!client) return

      const { data: callData } = await supabase.from('calls')
        .select('*').eq('id', id).eq('client_id', client.id).single()
      setCall(callData)

      if (callData) {
        const { data: msgs } = await supabase.from('messages')
          .select('id, role, content, timestamp')
          .eq('call_id', id)
          .order('timestamp', { ascending: true })
        setMessages((msgs || []).filter(m => m.role && m.content))
      }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!call) return (
    <div className="p-8 text-gray-400">Appel introuvable.</div>
  )

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-6 transition">
        ← Retour aux appels
      </button>

      {/* Header appel */}
      <div className="bg-gray-900 border border-white/5 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">📞</div>
            <div>
              <div className="text-white font-semibold">{formatPhone(call.caller_number)}</div>
              <div className="text-gray-500 text-xs">{formatDate(call.started_at)}</div>
            </div>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="text-center">
              <div className="text-white font-semibold">{formatDuration(call.duration)}</div>
              <div className="text-gray-500 text-xs">Durée</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${call.status === 'completed' ? 'text-emerald-400' : 'text-gray-400'}`}>
                {call.status === 'completed' ? 'Terminé' : call.status}
              </div>
              <div className="text-gray-500 text-xs">Statut</div>
            </div>
          </div>
        </div>

        {call.summary && (
          <div className="bg-gray-800/60 border border-white/5 rounded-lg px-4 py-3 text-sm text-gray-300 leading-relaxed">
            <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Résumé</div>
            {call.summary}
          </div>
        )}
      </div>

      {/* Transcription */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Transcription ({messages.length} messages)
        </h2>

        {messages.length === 0 ? (
          <div className="bg-gray-900 border border-white/5 rounded-xl p-8 text-center text-gray-500 text-sm">
            Aucune transcription disponible pour cet appel.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'bg-gray-800 text-gray-200 rounded-tl-sm'
                    : 'bg-indigo-600/80 text-white rounded-tr-sm'
                }`}>
                  <div className={`text-xs mb-1 font-medium ${msg.role === 'assistant' ? 'text-gray-500' : 'text-indigo-300'}`}>
                    {msg.role === 'assistant' ? '🤖 Assistante' : '👤 Client'}
                  </div>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
