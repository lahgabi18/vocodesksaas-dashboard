import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, ...clientData } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    // 1. Créer l'utilisateur avec l'admin SDK (email auto-confirmé)
    const { data: userData, error: userError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,  // confirmer immédiatement — pas besoin de vérif email
    })

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    const userId = userData.user.id

    // 2. Créer le profil client
    const { error: clientError } = await admin.from('clients').insert({
      user_id: userId,
      ...clientData,
      status: 'pending',
    })

    if (clientError) {
      // Rollback : supprimer l'utilisateur créé
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: clientError.message }, { status: 500 })
    }

    return NextResponse.json({ user_id: userId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
