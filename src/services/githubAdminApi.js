const GITHUB_API = 'https://api.github.com'
const GITHUB_OAUTH = 'https://github.com/login/oauth'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const encodePath = (path) =>
  String(path)
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

const toBase64 = (value) => {
  const bytes = new TextEncoder().encode(value)
  let binary = ''

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary)
}

const buildHeaders = (token) => ({
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
})

const encodeBody = (data) =>
  new URLSearchParams(
    Object.entries(data).map(([key, value]) => [key, String(value)]),
  )

const parseOAuthResponse = async (response) => {
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload.error_description ?? payload.error ?? 'No se pudo completar OAuth con GitHub.')
  }

  return payload
}

export const requestDeviceCode = async ({ clientId }) => {
  const response = await fetch(`${GITHUB_OAUTH}/device/code`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: encodeBody({
      client_id: clientId,
      scope: 'repo',
    }),
  })

  return parseOAuthResponse(response)
}

export const pollAccessToken = async ({ clientId, deviceCode, interval, expiresIn }) => {
  const expirationTime = Date.now() + expiresIn * 1000
  let currentInterval = Number(interval) || 5

  while (Date.now() < expirationTime) {
    await wait(currentInterval * 1000)

    const response = await fetch(`${GITHUB_OAUTH}/access_token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: encodeBody({
        client_id: clientId,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    })

    const payload = await response.json()

    if (payload.access_token) {
      return payload.access_token
    }

    if (payload.error === 'authorization_pending') {
      continue
    }

    if (payload.error === 'slow_down') {
      currentInterval += 5
      continue
    }

    if (payload.error === 'expired_token') {
      throw new Error('La autorizacion expiro. Inicia sesion nuevamente.')
    }

    throw new Error(payload.error_description ?? payload.error ?? 'No se pudo obtener el token OAuth.')
  }

  throw new Error('La autorizacion expiro. Inicia sesion nuevamente.')
}

export const getAuthenticatedUser = async ({ token }) => {
  const response = await fetch(`${GITHUB_API}/user`, {
    headers: buildHeaders(token),
  })

  if (!response.ok) {
    throw new Error('No fue posible leer el usuario autenticado de GitHub.')
  }

  return response.json()
}

export const getRepoPermissions = async ({ token, owner, repo }) => {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: buildHeaders(token),
  })

  if (!response.ok) {
    throw new Error('No fue posible validar permisos del repositorio.')
  }

  return response.json()
}

const getExistingFileSha = async ({ token, owner, repo, path, branch }) => {
  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`,
    {
      headers: buildHeaders(token),
    },
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error('No fue posible verificar si el proyecto ya existe en el repositorio.')
  }

  const payload = await response.json()
  return payload.sha ?? null
}

export const upsertProjectFile = async ({
  token,
  owner,
  repo,
  path,
  branch,
  commitMessage,
  payload,
  allowOverwrite,
}) => {
  const existingSha = await getExistingFileSha({ token, owner, repo, path, branch })

  if (existingSha && !allowOverwrite) {
    throw new Error('Ya existe un archivo para este slug. Activa "Sobrescribir" si deseas actualizarlo.')
  }

  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${encodePath(path)}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify({
      message: commitMessage,
      content: toBase64(`${JSON.stringify(payload, null, 2)}\n`),
      branch,
      ...(existingSha ? { sha: existingSha } : {}),
    }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message ?? 'No fue posible guardar el archivo en GitHub.')
  }

  return result
}
