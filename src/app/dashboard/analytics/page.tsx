'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type DayStat = { date: string; count: number }

function formatDuration(s: number) {
  if (!s) return '—'
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`
}

export default function AnalyticsPage() {
  const [dailyStats, setDailyStats] = useState<DayStat[]>([])
  const [hourStats, setHourStats]   = useState<number[]>(new Array(24).fill(0))
  const [totalCalls, setTotalCalls] = useState(0)
  const [completedCalls, setCompletedCalls] = useState(0)
  const [avgDuration, setAvgDuration] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: client } = await supabase.from('clients').select('id').eq('user_id', user.id).single()
      if (!client) return

      const since = new Date(Date.now() - 30 * 86400_000).toISOString()
      const { data: calls } = await supabase.from('calls')
        .select('id, started_at, duration, status')
        .eq('client_id', client.id)
        .gte('started_at', since)
        .order('started_at', { ascending: true })

      if (!calls) { setLoading(false); return }

      // Stats globales
      setTotalCalls(calls.length)
      setCompletedCalls(calls.filter(c => c.status === 'completed').length)
      const withDur = calls.filter(c => c.duration)
      setAvgDuration(withDur.length ? Math.round(withDur.reduce((s, c) => s + c.duration, 0) / withDur.length) : 0)

      // Stats par jour (30 derniers jours)
      const dayMap: Record<string, number> = {}
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400_000)
        dayMap[d.toISOString().slice(0, 10)] = 0
      }
      calls.forEach(c => {
        const day = c.started_at.slice(0, 10)
        if (day in dayMap) dayMap[day]++
      })
      setDailyStats(Object.entries(dayMap).map(([date, count]) => ({ date, count })))

      // Stats par heure
      const hours = new Array(24).fill(0)
      calls.forEach(c => {
        const h = new Date(c.started_at).getHours()
        hours[h]++
      })
      setHourStats(hours)

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const maxDay  = Math.max(...dailyStats.map(d => d.count), 1)
  const maxHour = Math.max(...hourStats, 1)
  const peakHour = hourStats.indexOf(Math.max(...hourStats))
  const completionRate = totalCalls ? Math.round((completedCalls / totalCalls) * 100) : 0

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Statistiques</h1>
      <p className="text-gray-500 text-sm mb-8">30 derniers jours</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total appels', value: totalCalls, icon: '📞', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Terminés', value: `${completionRate}%`, icon: '✅', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Durée moyenne', value: formatDuration(avgDuration), icon: '⏱️', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Heure de pointe', value: `${peakHour}h`, icon: '🔥', color: 'text-orange-400', bg: 'bg-orange-500/10' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-white/5 rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center text-sm mb-3`}>{s.icon}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Appels par jour */}
      <div className="bg-gray-900 border border-white/5 rounded-xl p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Appels par jour</h2>
        {totalCalls === 0 ? (
          <div className="text-center text-gray-600 text-sm py-8">Pas encore de données</div>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {dailyStats.map((d, i) => {
              const h = Math.round((d.count / maxDay) * 100)
              const isToday = d.date === new Date().toISOString().slice(0, 10)
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                    {d.count} appel{d.count > 1 ? 's' : ''}
                  </div>
                  <div
                    className={`w-full rounded-t transition-all ${isToday ? 'bg-indigo-500' : 'bg-indigo-500/30 group-hover:bg-indigo-500/50'}`}
                    style={{ height: `${Math.max(h, d.count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              )
            })}
          </div>
        )}
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>{dailyStats[0]?.date && new Date(dailyStats[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
          <span>Aujourd&apos;hui</span>
        </div>
      </div>

      {/* Distribution par heure */}
      <div className="bg-gray-900 border border-white/5 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Distribution par heure</h2>
        {totalCalls === 0 ? (
          <div className="text-center text-gray-600 text-sm py-8">Pas encore de données</div>
        ) : (
          <>
            <div className="flex items-end gap-0.5 h-20">
              {hourStats.map((count, h) => {
                const pct = Math.round((count / maxHour) * 100)
                const isPeak = h === peakHour && count > 0
                return (
                  <div key={h} className="flex-1 flex flex-col items-center group relative">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                      {h}h — {count}
                    </div>
                    <div
                      className={`w-full rounded-t ${isPeak ? 'bg-orange-400' : 'bg-indigo-500/30 group-hover:bg-indigo-500/50'}`}
                      style={{ height: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
