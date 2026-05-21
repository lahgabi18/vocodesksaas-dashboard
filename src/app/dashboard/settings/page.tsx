'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Absence = { id: string; start_date: string; end_date: string; message: string }

type Config = {
  id: string
  business_name: string
  business_type: string
  business_city: string
  owner_name: string
  owner_phone: string
  assistant_name: string
  working_hours: string
  specialties: string
  intervention_radius: number
  handles_emergencies: boolean
}

export default function SettingsPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [absences, setAbsences]           = useState<Absence[]>([])
  const [newAbsStart, setNewAbsStart]     = useState('')
  const [newAbsEnd, setNewAbsEnd]         = useState('')
  const [newAbsMsg, setNewAbsMsg]         = useState('Je suis absent, laissez-moi vos coordonnées.')
  const [addingAbsence, setAddingAbsence] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('clients').select('*').eq('user_id', user.id).single()
      setConfig(data)

      if (data) {
        const { data: abs } = await supabase.from('absences')
          .select('*').eq('client_id', data.id).order('start_date', { ascending: true })
        setAbsences(abs || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  async function addAbsence() {
    if (!config || !newAbsStart || !newAbsEnd) return
    setAddingAbsence(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('absences').insert({
      client_id : config.id,
      start_date: newAbsStart,
      end_date  : newAbsEnd,
      message   : newAbsMsg,
    }).select().single()
    if (!error && data) {
      setAbsences(prev => [...prev, data])
      setNewAbsStart(''); setNewAbsEnd('')
      setNewAbsMsg('Je suis absent, laissez-moi vos coordonnées.')
    }
    setAddingAbsence(false)
  }

  async function deleteAbsence(id: string) {
    const supabase = createClient()
    await supabase.from('absences').delete().eq('id', id)
    setAbsences(prev => prev.filter(a => a.id !== id))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!config) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('clients').update({
      business_name      : config.business_name,
      business_type      : config.business_type,
      business_city      : config.business_city,
      owner_name         : config.owner_name,
      owner_phone        : config.owner_phone,
      assistant_name     : config.assistant_name,
      working_hours      : config.working_hours,
      specialties        : config.specialties,
      intervention_radius: config.intervention_radius,
      handles_emergencies: config.handles_emergencies,
    }).eq('id', config.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function update(field: keyof Config, value: string | number | boolean) {
    setConfig(prev => prev ? { ...prev, [field]: value } : prev)
  }

  if (loading) return <div className="p-8 text-gray-500 text-sm">Chargement...</div>
  if (!config) return <div className="p-8 text-gray-500 text-sm">Aucune config trouvée.</div>

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-1">Paramètres</h1>
      <p className="text-gray-400 text-sm mb-8">Personnalisez votre assistante IA</p>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Entreprise */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Entreprise</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom de l&apos;entreprise</label>
              <input value={config.business_name} onChange={e => update('business_name', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ville</label>
              <input value={config.business_city} onChange={e => update('business_city', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Votre prénom</label>
              <input value={config.owner_name} onChange={e => update('owner_name', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Portable (SMS résumés)</label>
              <input value={config.owner_phone} onChange={e => update('owner_phone', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                placeholder="+33 6 12 34 56 78" />
            </div>
          </div>
        </div>

        {/* Assistante */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Assistante IA</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Prénom de l&apos;assistante</label>
              <input value={config.assistant_name} onChange={e => update('assistant_name', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Rayon d&apos;intervention (km)</label>
              <input type="number" value={config.intervention_radius} onChange={e => update('intervention_radius', parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Horaires</label>
            <input value={config.working_hours} onChange={e => update('working_hours', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Spécialités</label>
            <input value={config.specialties} onChange={e => update('specialties', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="dépannage, rénovation, installation..." />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="emergencies" checked={config.handles_emergencies}
              onChange={e => update('handles_emergencies', e.target.checked)}
              className="w-4 h-4 accent-indigo-600" />
            <label htmlFor="emergencies" className="text-sm text-gray-300">
              Nous intervenons en urgence
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          {saved && <span className="text-green-400 text-sm">✓ Modifications sauvegardées</span>}
        </div>
      </form>

      {/* Absences */}
      <div className="mt-8 bg-gray-900 border border-white/5 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Périodes d&apos;absence</h2>
        <p className="text-gray-500 text-xs mb-5">L&apos;assistante mentionnera votre absence et demandera les coordonnées du client.</p>

        {/* Absences existantes */}
        {absences.length > 0 && (
          <div className="space-y-2 mb-5">
            {absences.map(a => {
              const now = new Date().toISOString().slice(0, 10)
              const active = a.start_date <= now && a.end_date >= now
              return (
                <div key={a.id} className="flex items-center justify-between bg-gray-800/50 border border-white/5 rounded-lg px-4 py-3">
                  <div>
                    <div className="text-white text-sm flex items-center gap-2">
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />}
                      {new Date(a.start_date).toLocaleDateString('fr-FR')} → {new Date(a.end_date).toLocaleDateString('fr-FR')}
                      {active && <span className="text-yellow-400 text-xs">(en cours)</span>}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">{a.message}</div>
                  </div>
                  <button onClick={() => deleteAbsence(a.id)} className="text-gray-600 hover:text-red-400 transition text-sm ml-4">✕</button>
                </div>
              )
            })}
          </div>
        )}

        {/* Ajouter une absence */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date de début</label>
              <input type="date" value={newAbsStart} onChange={e => setNewAbsStart(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date de fin</label>
              <input type="date" value={newAbsEnd} onChange={e => setNewAbsEnd(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Message à dire aux appelants</label>
            <input value={newAbsMsg} onChange={e => setNewAbsMsg(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <button onClick={addAbsence} disabled={addingAbsence || !newAbsStart || !newAbsEnd}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg transition">
            {addingAbsence ? 'Ajout...' : '+ Ajouter une période'}
          </button>
        </div>
      </div>
    </div>
  )
}
