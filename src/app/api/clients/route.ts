import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Client admin côté serveur — contourne RLS pour l'inscription
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, ...clientData } = body

    if (!user_id) {
      return NextResponse.json({ error: 'user_id manquant' }, { status: 400 })
    }

    // Vérifier que le user_id correspond à un vrai utilisateur Supabase Auth
    const { data: authUser, error: authError } = await admin.auth.admin.getUserById(user_id)
    if (authError || !authUser?.user) {
      return NextResponse.json({ error: 'Utilisateur invalide' }, { status: 401 })
    }

    // Insérer le client avec service_role (bypass RLS)
    const { data, error } = await admin.from('clients').insert({
      user_id,
      ...clientData,
      status: 'pending',
    }).select().single()

    if (error) {
      console.error('❌ API clients insert:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ client: data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
