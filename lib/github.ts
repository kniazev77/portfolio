const api = 'https://api.github.com'

const headers = (token: string) => ({
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json'
})

async function request<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: { ...headers(token), ...(init?.headers ?? {}) },
    cache: 'no-store'
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message ?? `GitHub request failed (${response.status}).`)
  return payload as T
}

export async function getGithubUser(token: string) {
  return request<{ login: string }>(token, '/user')
}

export async function createContentPullRequest({
  token,
  files,
  message
}: {
  token: string
  files: Array<{ path: string; content: string; encoding: 'utf-8' | 'base64' }>
  message: string
}) {
  const owner = process.env.GITHUB_OWNER ?? 'kniazev77'
  const repo = process.env.GITHUB_REPO ?? 'portfolio'
  const base = process.env.GITHUB_BASE_BRANCH ?? 'main'
  const date = new Date().toISOString().slice(0, 10)
  const branch = `content/update-${date}`

  const baseRef = await request<{ object: { sha: string } }>(token, `/repos/${owner}/${repo}/git/ref/heads/${base}`)
  const baseCommit = await request<{ tree: { sha: string } }>(token, `/repos/${owner}/${repo}/git/commits/${baseRef.object.sha}`)

  const tree = []
  for (const file of files) {
    const blob = await request<{ sha: string }>(token, `/repos/${owner}/${repo}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({
        content: file.content,
        encoding: file.encoding === 'base64' ? 'base64' : 'utf-8'
      })
    })
    tree.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha })
  }

  const nextTree = await request<{ sha: string }>(token, `/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree })
  })
  const commit = await request<{ sha: string }>(token, `/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: nextTree.sha, parents: [baseRef.object.sha] })
  })

  const existingRef = await fetch(`${api}/repos/${owner}/${repo}/git/ref/heads/${branch}`, {
    headers: headers(token),
    cache: 'no-store'
  })
  if (existingRef.ok) {
    await request(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha, force: true })
    })
  } else {
    await request(token, `/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha })
    })
  }

  const pulls = await request<Array<{ html_url: string; number: number }>>(
    token,
    `/repos/${owner}/${repo}/pulls?state=open&head=${encodeURIComponent(`${owner}:${branch}`)}`
  )
  if (pulls[0]) return pulls[0]

  return request<{ html_url: string; number: number }>(token, `/repos/${owner}/${repo}/pulls`, {
    method: 'POST',
    body: JSON.stringify({
      title: `Content update · ${date}`,
      head: branch,
      base,
      body: 'Editorial update created from the private portfolio CMS. Vercel will attach a preview deployment to this pull request.'
    })
  })
}
