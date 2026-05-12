import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()
    
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    
    const sb = getServiceSupabase()
    
    // Create auth user
    const { data: authData, error: authError } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, email },
      app_metadata: { role: 'user' },
    })
    
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }
    
    return NextResponse.json({ user: authData.user }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
