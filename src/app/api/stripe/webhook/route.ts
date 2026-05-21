import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

// Next.js App Router : ne pas parser le body (Stripe vérifie la signature sur le raw body)
export const dynamic = 'force-dynamic'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig  = request.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Signature invalide'
    console.error('❌ Webhook signature error:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  console.log(`🔔 Stripe webhook : ${event.type}`)

  try {
    switch (event.type) {

      // ── Paiement réussi (ou essai démarré) ──────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.CheckoutSession
        const clientId = session.metadata?.client_id
        if (!clientId) break

        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id

        await admin.from('clients').update({
          status                 : 'active',
          stripe_customer_id     : session.customer as string,
          stripe_subscription_id : subscriptionId || null,
        }).eq('id', clientId)

        console.log(`✅ Client ${clientId} activé via Stripe checkout`)
        break
      }

      // ── Abonnement résilié ────────────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id

        await admin.from('clients').update({ status: 'inactive' })
          .eq('stripe_customer_id', customerId)

        console.log(`⏹️  Abonnement résilié — customer ${customerId}`)
        break
      }

      // ── Paiement échoué (après essai ou renouvellement) ──────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
        if (!customerId) break

        // Optionnel : passer en 'past_due' pour afficher un avertissement dans le dashboard
        await admin.from('clients').update({ status: 'past_due' })
          .eq('stripe_customer_id', customerId)

        console.log(`⚠️  Paiement échoué — customer ${customerId}`)
        break
      }

      // ── Essai terminé → rappel (informatif) ──────────────────────────────
      case 'customer.subscription.trial_will_end': {
        const sub = event.data.object as Stripe.Subscription
        console.log(`⏰ Essai se termine dans 3 jours — sub ${sub.id}`)
        // TODO: envoyer un email de rappel
        break
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne'
    console.error('❌ Webhook handler error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
