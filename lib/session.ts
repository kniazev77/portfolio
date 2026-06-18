import { createHash } from 'node:crypto'
import { EncryptJWT, jwtDecrypt } from 'jose'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'portfolio_admin_session'
const MAX_AGE = 60 * 60 * 8

type Session = {
  login: string
  accessToken: string
}

const getKey = () => {
  const secret = process.env.GITHUB_SESSION_SECRET
  if (!secret || secret.length < 32) throw new Error('GITHUB_SESSION_SECRET must contain at least 32 characters.')
  return createHash('sha256').update(secret).digest()
}

export async function createSessionCookie(session: Session) {
  const token = await new EncryptJWT(session)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .encrypt(getKey())

  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE
  })
}

export async function readSession(): Promise<Session | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtDecrypt(token, getKey())
    if (typeof payload.login !== 'string' || typeof payload.accessToken !== 'string') return null
    return { login: payload.login, accessToken: payload.accessToken }
  } catch {
    return null
  }
}

export async function clearSession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
