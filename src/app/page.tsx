import Link from 'next/link'

const features = [
  {
    icon: '📞',
    color: 'bg-indigo-500/10 text-indigo-400',
    title: 'Répond à votre place',
    desc: 'VocoDesk décroche en moins de 2 secondes, 24h/24, 7j/7. Vos clients ne tombent plus sur la messagerie.',
  },
  {
    icon: '🧠',
    color: 'bg-violet-500/10 text-violet-400',
    title: 'IA formée à votre métier',
    desc: 'Plombier, électricien, peintre… l\'assistante connaît votre activité, vos horaires et vos tarifs.',
  },
  {
    icon: '📱',
    color: 'bg-emerald-500/10 text-emerald-400',
    title: 'SMS après chaque appel',
    desc: 'Vous recevez un résumé instantané : nom du client, sa demande, son numéro de rappel.',
  },
  {
    icon: '📊',
    color: 'bg-blue-500/10 text-blue-400',
    title: 'Historique complet',
    desc: 'Retrouvez chaque appel, sa transcription et le résumé depuis votre tableau de bord.',
  },
  {
    icon: '⚡',
    color: 'bg-yellow-500/10 text-yellow-400',
    title: 'Prêt en 5 minutes',
    desc: 'Créez votre compte, renseignez votre activité. Votre assistante est opérationnelle immédiatement.',
  },
  {
    icon: '🔒',
    color: 'bg-rose-500/10 text-rose-400',
    title: 'Données en France',
    desc: 'Vos conversations sont hébergées en France. Aucune donnée partagée avec des tiers.',
  },
]

const steps = [
  { n: '1', title: 'Créez votre compte', desc: 'Décrivez votre activité, vos horaires et le prénom de votre assistante.' },
  { n: '2', title: 'Recevez votre numéro', desc: 'Un numéro professionnel vous est attribué sous 24h. Communiquez-le à vos clients.' },
  { n: '3', title: 'VocoDesk prend les appels', desc: 'L\'IA décroche, répond et vous envoie un résumé par SMS à chaque appel.' },
]

const testimonials = [
  {
    quote: "Je rate plus aucun chantier à cause d'un appel raté. VocoDesk répond pendant que je suis sous l'évier.",
    name: 'Karim B.',
    job: 'Plombier — Lyon',
  },
  {
    quote: "Mes clients sont surpris d'avoir quelqu'un au bout du fil à 20h. Ça m'a déjà fait signer deux devis.",
    name: 'Sophie M.',
    job: 'Électricienne — Paris',
  },
  {
    quote: "Simple, rapide, efficace. Je reçois le résumé par SMS et je rappelle dans la journée.",
    name: 'Franck D.',
    job: 'Peintre — Bordeaux',
  },
]

const faqs = [
  { q: 'Mes clients savent-ils que c\'est une IA ?', a: 'L\'assistante se présente avec le prénom que vous choisissez et le nom de votre entreprise. Elle ne mentionne pas spontanément qu\'elle est une IA, mais répondra honnêtement si on lui demande.' },
  { q: 'Que se passe-t-il si l\'appel est complexe ?', a: 'L\'assistante prend le nom, le numéro et l\'objet de l\'appel, puis vous envoie un résumé par SMS pour que vous puissiez rappeler.' },
  { q: 'Puis-je changer l\'abonnement à tout moment ?', a: 'Oui, sans engagement. Vous pouvez résilier depuis votre compte en un clic.' },
  { q: 'Puis-je utiliser mon numéro existant ?', a: 'Pas encore, mais vous pouvez rediriger votre ligne existante vers le numéro VocoDesk via votre opérateur (renvoi d\'appel).' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-gray-950/80 backdrop-blur-md">
        <span className="text-lg font-bold tracking-tight flex items-center gap-2">
          <span className="text-indigo-400">🎙️</span> VocoDesk
        </span>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-gray-400 hover:text-white transition text-sm px-3 py-1.5">
            Connexion
          </Link>
          <Link href="/auth/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition font-medium">
            Essai gratuit →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-28 overflow-hidden">
        {/* Glow background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-indigo-950/60 text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8 border border-indigo-800/50 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Réceptionniste IA pour artisans français
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.1] max-w-3xl mb-6 tracking-tight">
            Ne ratez plus jamais
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              un appel client
            </span>
          </h1>

          <p className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed">
            VocoDesk décroche à votre place 24h/24, répond aux questions, prend les messages
            et vous envoie un résumé par SMS. Opérationnel en 5 minutes.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <Link href="/auth/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3.5 rounded-xl transition text-base shadow-lg shadow-indigo-900/40">
              Commencer gratuitement →
            </Link>
            <a href="#comment" className="text-gray-300 hover:text-white px-7 py-3.5 rounded-xl border border-gray-700 hover:border-gray-500 transition text-base bg-gray-900/50">
              Comment ça marche
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex -space-x-2">
              {['🧑‍🔧','👩‍🔧','👨‍🎨','👩‍💼','🧑‍🏭'].map((e, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs">{e}</div>
              ))}
            </div>
            <span>Déjà utilisé par <strong className="text-gray-300">+120 artisans</strong></span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="comment" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Comment ça marche</h2>
            <p className="text-gray-400">Trois étapes, zéro technique.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="relative bg-gray-900/50 border border-white/5 rounded-2xl p-6">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm mb-4">
                  {s.n}
                </div>
                <h3 className="font-semibold text-base mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 -right-3 text-gray-700 text-lg">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-900/30 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-400">Une solution complète, sans prise de tête.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="bg-gray-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Ce qu'en disent les artisans</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-900 border border-white/5 rounded-2xl p-5">
                <div className="text-yellow-400 text-sm mb-3">★★★★★</div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">"{t.quote}"</p>
                <div>
                  <div className="text-white text-sm font-medium">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.job}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-gray-900/30 border-t border-white/5">
        <div className="max-w-sm mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Un tarif simple</h2>
          <p className="text-gray-400 mb-10">Sans engagement. Résiliez en un clic.</p>

          <div className="bg-gray-900 border border-indigo-500/20 rounded-2xl p-8 text-left shadow-xl shadow-indigo-950/40">
            <div className="flex items-end gap-2 mb-1">
              <span className="text-5xl font-extrabold">39€</span>
              <span className="text-gray-400 mb-1">/mois</span>
            </div>
            <p className="text-indigo-400 text-sm mb-6">✨ 14 jours d'essai gratuit — aucune CB requise</p>

            <ul className="space-y-3 text-sm text-gray-300 mb-8">
              {[
                '1 numéro professionnel dédié',
                'Appels illimités 24h/24',
                'SMS résumé après chaque appel',
                'Assistante formée à votre métier',
                'Tableau de bord & historique',
                'Support par email inclus',
              ].map(item => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/auth/signup" className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-indigo-900/40">
              Commencer l&apos;essai gratuit →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-900 border border-white/5 rounded-xl p-5">
                <div className="font-medium text-white mb-2 text-sm">{faq.q}</div>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à ne plus rater un appel ?</h2>
          <p className="text-gray-400 mb-8">Rejoignez les artisans qui ont déjà adopté VocoDesk.</p>
          <Link href="/auth/signup" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition text-base shadow-lg shadow-indigo-900/40">
            Démarrer gratuitement →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-600 text-sm">
        <span>© 2026 VocoDesk — Fait avec ❤️ en France</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gray-400 transition">Mentions légales</a>
          <a href="#" className="hover:text-gray-400 transition">Confidentialité</a>
          <a href="mailto:contact@vocodeck.fr" className="hover:text-gray-400 transition">Contact</a>
        </div>
      </footer>
    </main>
  )
}
