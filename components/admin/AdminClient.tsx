'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { JsonForm } from './JsonForm'

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
type ContentState = Record<string, JsonValue>
type PendingAsset = { path: string; content: string }

const STORAGE_KEY = 'portfolio-cms-draft-v2'

async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const max = 1800
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is not available.')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Image compression failed.')), 'image/jpeg', .82)
  )
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

export default function AdminClient() {
  const [session, setSession] = useState<{ authenticated: boolean; login: string | null } | null>(null)
  const [content, setContent] = useState<ContentState>({})
  const [selected, setSelected] = useState('profile.json')
  const [assets, setAssets] = useState<PendingAsset[]>([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/session').then((response) => response.json()),
      fetch('/api/cms/content').then((response) => response.ok ? response.json() : null)
    ]).then(([sessionResult, contentResult]) => {
      setSession(sessionResult)
      if (contentResult) {
        const local = localStorage.getItem(STORAGE_KEY)
        setContent(local ? JSON.parse(local) : contentResult)
      }
    })
  }, [])

  useEffect(() => {
    if (Object.keys(content).length) localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
  }, [content])

  const preview = useMemo(() => content[selected], [content, selected])

  const publish = async () => {
    setBusy(true)
    setMessage('')
    try {
      const files = [
        ...Object.entries(content).map(([name, value]) => ({
          path: `content/data/${name}`,
          content: `${JSON.stringify(value, null, 2)}\n`,
          encoding: 'utf-8'
        })),
        ...assets.map((asset) => ({ ...asset, encoding: 'base64' }))
      ]
      const response = await fetch('/api/cms/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files, message: 'chore(content): update portfolio from CMS' })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      localStorage.removeItem(STORAGE_KEY)
      setAssets([])
      setMessage(`Pull request #${result.number} created: ${result.pullRequestUrl}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to publish.')
    } finally {
      setBusy(false)
    }
  }

  if (!session) return <main className="admin-page"><div className="container admin-main">Loading…</div></main>
  if (!session.authenticated) {
    return (
      <main className="admin-page">
        <div className="container admin-main">
          <section className="admin-panel" style={{ maxWidth: 620, margin: '10vh auto' }}>
            <p className="section-kicker">Private CMS</p>
            <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: '3rem', margin: 0 }}>Edit without touching code.</h1>
            <p>Sign in with the authorized GitHub account. Credentials remain server-side in an encrypted HttpOnly cookie.</p>
            <Link className="button button-primary" href="/api/auth/github/start">Continue with GitHub</Link>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div className="container footer-inner">
          <strong>Portfolio CMS · {session.login}</strong>
          <Link href="/en">View portfolio ↗</Link>
        </div>
      </header>
      <div className="container admin-main">
        <div className="admin-intro">
          <div>
            <p className="section-kicker">Git-backed editorial workflow</p>
            <h1>Review, preview, publish.</h1>
            <p>Changes stay as a browser draft until you create a pull request.</p>
          </div>
          <button className="button button-primary" onClick={publish} disabled={busy}>
            {busy ? 'Creating pull request…' : 'Send for review'}
          </button>
        </div>
        <div className="admin-grid">
          <section className="admin-panel">
            <div className="admin-tabs" aria-label="Content files">
              {Object.keys(content).map((name) => (
                <button
                  className="admin-tab"
                  aria-pressed={selected === name}
                  key={name}
                  onClick={() => setSelected(name)}
                >
                  {name.replace('.json', '')}
                </button>
              ))}
            </div>
            <div className="editor-fields">
              {preview !== undefined && (
                <JsonForm
                  value={preview}
                  onChange={(next) => setContent((current) => ({ ...current, [selected]: next }))}
                />
              )}
              <div className="editor-field">
                <label htmlFor="asset-upload">Project image</label>
                <input
                  id="asset-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    if (file.size > 12 * 1024 * 1024) {
                      setMessage('Images must be under 12 MB before compression.')
                      return
                    }
                    const content = await compressImage(file)
                    const safeName = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    setAssets((current) => [...current, {
                      path: `public/images/projects/${safeName}.jpg`,
                      content
                    }])
                  }}
                />
                <span className="editor-help">{assets.length} compressed asset(s) queued. Add the resulting `/images/projects/name.jpg` path to a project.</span>
              </div>
            </div>
            <div className="admin-actions">
              <button className="button button-secondary" onClick={() => {
                localStorage.removeItem(STORAGE_KEY)
                window.location.reload()
              }}>Discard browser draft</button>
              <button className="button button-secondary" onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' })
                window.location.reload()
              }}>Sign out</button>
            </div>
            {message && <div className="admin-message">{message}</div>}
          </section>
          <aside className="admin-panel admin-preview">
            <p className="section-kicker">Local preview</p>
            <div className="preview-card">
              <h2>{selected.replace('.json', '')}</h2>
              <p>Structured preview of the exact content that will be committed.</p>
              <pre className="preview-json">{JSON.stringify(preview, null, 2)}</pre>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
