import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) return NextResponse.json({ error: 'GitHub OAuth is not configured.' }, { status: 503 })
  const state = randomBytes(24).toString('hex')
  const store = await cookies()
  store.set('portfolio_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600
  })
  const callback = new URL('/api/auth/github/callback', request.url).toString()
  const authorize = new URL('https://github.com/login/oauth/authorize')
  authorize.searchParams.set('client_id', clientId)
  authorize.searchParams.set('redirect_uri', callback)
  authorize.searchParams.set('scope', 'repo')
  authorize.searchParams.set('state', state)
  return NextResponse.redirect(authorize)
}
