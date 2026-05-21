'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Call = {
  id: string
  caller_number: string
  started_at: string
  duration: number | null
  status: string
  summary: string | null
}

type Client = {
  business_name: string
  assistant_name: string
  phone_number: string | null
  sip_username: string | null
  status: string
}

function formatDuration(seconds: number | null) {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function formatPhone(raw: string) {
  if (!raw) return '—'
  const digits = raw.replace(/\D/g, '').replace(/^0033/, '0').replace(/^33/, '0')
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'à l\'instant'
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  if (diff < 86400 * 2) return 'hier'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'completed')
    return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Terminé</span>
  if (status === 'active')
    return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />En cours</span>
  if (status === 'missed')
    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Manqué</span>
  return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{status}</span>
}

function CallCard({ call }: { call: Call }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition">
      <div className="flex">
        <button
          onClick={() => call.summary && setOpen(o => !o)}
          className="flex-1 text-left p-4"
        >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm shrink-0">
              📞
            </div>
            <div>
              <div className="text-white font-medium text-sm">
                {formatPhone(call.caller_number)}
              </div>
              <div className="text-gray-500 text-xs flex items-center gap-2 mt-0.5">
                <span>{timeAgo(call.started_at)}</span>
                {call.duration != null && (
                  <>
                    <span className="text-gray-700">·</span>
                    <span>{formatDuration(call.duration)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={call.status} />
            {call.summary && (
              <span className="text-gray-600 text-xs">{open ? '▲' : '▼'}</span>
            )}
          </div>
        </div>
      </button>
        <Link href={`/dashboard/calls/${call.id}`} className="flex items-center px-3 text-gray-600 hover:text-indigo-400 transition border-l border-white/5 text-sm" title="Voir la transcription">
          📄
        </Link>
      </div>

      {open && call.summary && (
        <div className="px-4 pb-4">
          <div className="ml-12 bg-gray-800/60 border border-white/5 rounded-lg px-3 py-2.5 text-sm text-gray-300 leading-relaxed">
            {call.summary}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [client, setClient] = useState<Client | null>(null)
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'missed'>('all')
  const [notification, setNotification] = useState<string | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const checkoutSuccess = searchParams.get('checkout') === 'success'

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: clientData } = await supabase
        .from('clients')
        .select('business_name, assistant_name, phone_number, sip_username, status')
        .eq('user_id', user.id)
        .single()
      setClient(clientData)

      if (clientData) {
        const { data: idData } = await supabase
          .from('clients')
          .select('id')
          .eq('user_id', user.id)
          .single()

        const { data: callsData } = await supabase
          .from('calls')
          .select('id, caller_number, started_at, duration, status, summary')
          .eq('client_id', idData?.id)
          .order('started_at', { ascending: false })
          .limit(50)
        setCalls(callsData || [])
        setClientId(idData?.id || null)
      }
      setLoading(false)
    }
    load()
  }, [])

  // ── Notifications temps réel ────────────────────────────────────────────────
  useEffect(() => {
    if (!clientId) return
    const supabase = createClient()
    const channel = supabase
      .channel('new-calls')
      .on('postgres_changes', {
        event : 'INSERT',
        schema: 'public',
        table : 'calls',
        filter: `client_id=eq.${clientId}`,
      }, (payload) => {
        const newCall = payload.new as Call
        setCalls(prev => [newCall, ...prev])
        setNotification(`📞 Appel entrant — ${formatPhone(newCall.caller_number)}`)
        setTimeout(() => setNotification(null), 5000)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [clientId])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Chargement…</span>
      </div>
    </div>
  )

  const displayNumber = client?.phone_number || client?.sip_username || null
  const now = Date.now()
  const thisWeek = calls.filter(c => new Date(c.started_at).getTime() > now - 7 * 86400_000)
  const today = calls.filter(c => new Date(c.started_at).getTime() > now - 86400_000)
  const avgDuration = Math.round(
    calls.filter(c => c.duration).reduce((s, c) => s + (c.duration || 0), 0) /
    (calls.filter(c => c.duration).length || 1)
  )

  const filtered = filter === 'all' ? calls : calls.filter(c => c.status === filter)

  const stats = [
    { label: "Aujourd'hui", value: today.length, icon: '📅', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Cette semaine', value: thisWeek.length, icon: '📈', color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Total appels', value: calls.length, icon: '📞', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Durée moyenne', value: formatDuration(avgDuration), icon: '⏱️', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto">

      {/* Toast notification temps réel */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 border border-indigo-500/30 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          {notification}
        </div>
      )}

      {/* Banner succès paiement */}
      {checkoutSuccess && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl px-5 py-4 flex items-center gap-3">
          <span className="text-xl">🎉</span>
          <div>
            <div className="font-semibold text-sm">Essai gratuit activé !</div>
            <div className="text-xs text-emerald-400/70 mt-0.5">Votre assistante sera active sous 24h le temps qu'un numéro vous soit attribué.</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {client?.business_name || 'Mon espace'}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Assistante <span className="text-gray-300">{client?.assistant_name || '—'}</span>
            </p>
          </div>

          {/* Statut pill */}
          {client?.status === 'active' ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              En ligne
            </div>
          ) : client?.status === 'pending' ? (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              Activation en cours
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-gray-800 border border-white/5 text-gray-400 text-xs font-medium px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
              Inactif
            </div>
          )}
        </div>

        {/* Numéro */}
        {displayNumber && (
          <div className="mt-4 inline-flex items-center gap-3 bg-gray-900 border border-white/5 rounded-xl px-4 py-3">
            <span className="text-gray-500 text-xs">Votre numéro</span>
            <span className="text-white font-bold text-lg tracking-widest">{formatPhone(displayNumber)}</span>
            <span className="text-gray-600 text-xs">Communiquez-le à vos clients</span>
          </div>
        )}
        {!displayNumber && (
          <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500/5 border border-yellow-500/20 text-yellow-400 text-sm px-4 py-3 rounded-xl">
            ⏳ Numéro en cours d&apos;attribution — vous serez notifié sous 24h
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-gray-900 border border-white/5 rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center text-sm mb-3`}>
              {s.icon}
            </div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Appels */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Appels récents
          </h2>
          {/* Filtres */}
          <div className="flex gap-1 bg-gray-900 border border-white/5 rounded-lg p-1">
            {([['all', 'Tous'], ['completed', 'Terminés'], ['missed', 'Manqués']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`text-xs px-3 py-1 rounded-md transition ${
                  filter === val ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-gray-900 border border-white/5 rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-gray-400 text-sm font-medium mb-1">
              {filter === 'all' ? 'Aucun appel pour le moment' : `Aucun appel "${filter === 'completed' ? 'terminé' : 'manqué'}"`}
            </div>
            <div className="text-gray-600 text-xs">
              {filter === 'all' ? 'Dès qu\'un client appellera, il apparaîtra ici.' : 'Essayez le filtre "Tous".'}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(call => (
              <CallCard key={call.id} call={call} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
