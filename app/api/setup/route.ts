import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const sb = getServiceSupabase()

    // Test basic connectivity
    const { error: connError } = await sb.from('locations').select('count')
    if (connError && connError.message.includes('net') || connError?.message.includes('fetch')) {
      return NextResponse.json({ error: 'Cannot reach Supabase — DNS/network issue on server' }, { status: 503 })
    }

    return NextResponse.json({ ok: true, message: 'Connected to Supabase successfully' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
