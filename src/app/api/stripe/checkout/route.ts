import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripe, PRICE_ID } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setAll: (toSet: any[]) => toSet.forEach(({ name, value, options }: any) =>
            cookieStore.set(name, value, options)
          ),
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

    // Récupérer le client en base
    const { data: client } = await supabase
      .from('clients')
      .select('id, stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Créer ou réutiliser le customer Stripe
    let customerId = client.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id, client_id: client.id },
      })
      customerId = customer.id

      // Sauvegarder le customer_id
      const { createClient: createAdminClient } = await import('@supabase/supabase-js')
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await admin.from('clients').update({ stripe_customer_id: customerId }).eq('id', client.id)
    }

    // Créer la session Checkout Stripe
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { client_id: client.id, user_id: user.id },
      },
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/dashboard/billing`,
      metadata: { client_id: client.id, user_id: user.id },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('❌ Stripe checkout error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
