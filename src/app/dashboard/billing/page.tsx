'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BillingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const router = useRouter()

  async function handleSubscribe() {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Erreur lors de la création du paiement')
        setLoading(false)
      }
    } catch {
      setError('Erreur réseau')
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Abonnement</h1>
      <p className="text-gray-400 text-sm mb-10">Gérez votre abonnement VocoDesk.</p>

      <div className="bg-gray-900 border border-indigo-500/20 rounded-2xl p-8">
        <div className="flex items-end gap-2 mb-1">
          <span className="text-4xl font-extrabold text-white">39€</span>
          <span className="text-gray-400 mb-1">/mois</span>
        </div>
        <p className="text-indigo-400 text-sm mb-6">✨ 14 jours d'essai gratuit — aucune CB débitée avant la fin de l'essai</p>

        <ul className="space-y-2.5 text-sm text-gray-300 mb-8">
          {[
            '1 numéro professionnel dédié',
            'Appels illimités 24h/24',
            'SMS résumé après chaque appel',
            'Assistante formée à votre métier',
            'Tableau de bord & historique complet',
          ].map(item => (
            <li key={item} className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Redirection vers le paiement…
            </span>
          ) : 'Démarrer l\'essai gratuit →'}
        </button>

        <p className="text-center text-gray-600 text-xs mt-4">
          Sans engagement · Résiliation en un clic · Paiement sécurisé par Stripe
        </p>
      </div>

      <button onClick={() => router.back()} className="mt-6 text-gray-500 hover:text-gray-300 text-sm transition">
        ← Retour
      </button>
    </div>
  )
}
