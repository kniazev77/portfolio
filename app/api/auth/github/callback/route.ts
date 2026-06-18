import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createSessionCookie } from '@/lib/session'
import { getGithubUser } from '@/lib/github'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const store = await cookies()
  const expectedState = store.get('portfolio_oauth_state')?.value
  store.delete('portfolio_oauth_state')
  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(new URL('/admin?error=invalid_oauth_state', request.url))
  }
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/admin?error=oauth_not_configured', request.url))
  }
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, state })
  })
  const tokenPayload = await tokenResponse.json()
  if (!tokenPayload.access_token) {
    return NextResponse.redirect(new URL('/admin?error=oauth_exchange_failed', request.url))
  }
  const user = await getGithubUser(tokenPayload.access_token)
  const allowed = process.env.GITHUB_ALLOWED_USER ?? 'kniazev77'
  if (user.login !== allowed) {
    return NextResponse.redirect(new URL('/admin?error=unauthorized_user', request.url))
  }
  await createSessionCookie({ login: user.login, accessToken: tokenPayload.access_token })
  return NextResponse.redirect(new URL('/admin', request.url))
}
