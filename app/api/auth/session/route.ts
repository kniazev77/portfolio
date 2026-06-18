import { NextResponse } from 'next/server'
import { readSession } from '@/lib/session'

export async function GET() {
  const session = await readSession()
  return NextResponse.json({ authenticated: Boolean(session), login: session?.login ?? null })
}
