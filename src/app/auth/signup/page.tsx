'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const STEPS = ['Compte', 'Entreprise', 'Assistant']

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Étape 1 — Compte
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Étape 2 — Entreprise
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('plombier')
  const [businessCity, setBusinessCity] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')

  // Étape 3 — Assistant
  const [assistantName, setAssistantName] = useState('Jade')
  const [workingHours, setWorkingHours] = useState('8h-18h du lundi au vendredi')
  const [specialties, setSpecialties] = useState('')
  const [interventionRadius, setInterventionRadius] = useState('30')
  const [handlesEmergencies, setHandlesEmergencies] = useState(true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step < 2) { setStep(s => s + 1); return }

    setLoading(true)
    setError('')
    const supabase = createClient()

    // 1 + 2. Créer le compte Auth + profil client via API route (admin SDK, bypass confirmation)
    const signupRes = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        business_name      : businessName,
        business_type      : businessType,
        business_city      : businessCity,
        owner_name         : ownerName,
        owner_phone        : ownerPhone,
        assistant_name     : assistantName,
        working_hours      : workingHours,
        specialties        : specialties,
        intervention_radius: parseInt(interventionRadius) || 30,
        handles_emergencies: handlesEmergencies,
      }),
    })

    const signupData = await signupRes.json()
    if (!signupRes.ok) { setError(signupData.error || 'Erreur création compte'); setLoading(false); return }

    // 3. Se connecter pour obtenir la session (l'admin SDK ne crée pas de session)
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) { setError(loginError.message); setLoading(false); return }

    // 4. Rediriger vers Stripe Checkout pour démarrer l'essai gratuit
    const res  = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8 text-white text-xl font-bold">
          🎙️ VocoDesk
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i <= step ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${i === step ? 'text-white' : 'text-gray-500'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-indigo-600' : 'bg-gray-800'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Étape 0 — Compte */}
            {step === 0 && <>
              <h2 className="text-xl font-bold text-white mb-4">Créer votre compte</h2>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="vous@exemple.fr" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Mot de passe</label>
                <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Minimum 6 caractères" />
              </div>
            </>}

            {/* Étape 1 — Entreprise */}
            {step === 1 && <>
              <h2 className="text-xl font-bold text-white mb-4">Votre entreprise</h2>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nom de l&apos;entreprise</label>
                <input required value={businessName} onChange={e => setBusinessName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Plomberie Dupont" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type de métier</label>
                <select value={businessType} onChange={e => setBusinessType(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500">
                  {['plombier', 'électricien', 'menuisier', 'maçon', 'peintre', 'chauffagiste', 'serrurier', 'couvreur', 'autre artisan'].map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Ville</label>
                <input required value={businessCity} onChange={e => setBusinessCity(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Paris" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Votre prénom</label>
                <input required value={ownerName} onChange={e => setOwnerName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Jean" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Votre portable (pour recevoir les SMS résumés)</label>
                <input type="tel" required value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="+33 6 12 34 56 78" />
              </div>
            </>}

            {/* Étape 2 — Assistant */}
            {step === 2 && <>
              <h2 className="text-xl font-bold text-white mb-4">Votre assistante IA</h2>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Prénom de l&apos;assistante</label>
                <input required value={assistantName} onChange={e => setAssistantName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Jade" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Horaires de travail</label>
                <input value={workingHours} onChange={e => setWorkingHours(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="8h-18h du lundi au vendredi" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Spécialités (ex: dépannage, rénovation...)</label>
                <input value={specialties} onChange={e => setSpecialties(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="dépannage, installation, rénovation" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rayon d&apos;intervention (km)</label>
                <input type="number" value={interventionRadius} onChange={e => setInterventionRadius(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="30" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="emergencies" checked={handlesEmergencies} onChange={e => setHandlesEmergencies(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600" />
                <label htmlFor="emergencies" className="text-sm text-gray-300">Nous intervenons en urgence</label>
              </div>
            </>}

            {error && (
              <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg transition text-sm">
                  Retour
                </button>
              )}
              <button type="submit" disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition text-sm">
                {loading ? 'Création...' : step < 2 ? 'Suivant →' : 'Créer mon compte'}
              </button>
            </div>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300">Se connecter</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
