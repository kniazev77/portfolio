import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { projects } from '../data/projects'
import {
  getAuthenticatedUser,
  getRepoPermissions,
  pollAccessToken,
  requestDeviceCode,
  upsertProjectFile,
} from '../services/githubAdminApi'
import {
  buildProjectPayload,
  createInitialChallenge,
  createInitialDraft,
  findDuplicateProject,
  validateDraft,
} from '../utils/projectDraft'

const AUTH_STORAGE_KEY = 'portfolio-admin-session'

const getConfig = () => {
  const owner = String(import.meta.env.VITE_GITHUB_OWNER ?? '').trim()
  const repo = String(import.meta.env.VITE_GITHUB_REPO ?? '').trim()

  return {
    owner,
    repo,
    branch: String(import.meta.env.VITE_GITHUB_BRANCH ?? 'main').trim() || 'main',
    allowedUser: String(import.meta.env.VITE_GITHUB_ALLOWED_USER ?? owner).trim() || owner,
    clientId: String(import.meta.env.VITE_GITHUB_OAUTH_CLIENT_ID ?? '').trim(),
    projectsPath: String(import.meta.env.VITE_GITHUB_PROJECTS_PATH ?? 'content/projects').trim() || 'content/projects',
  }
}

const getNextOrder = () => {
  const maxOrder = projects.reduce((acc, project) => Math.max(acc, Number(project.order) || 0), 0)
  return maxOrder + 1
}

const getSavedSession = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = sessionStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    if (!parsed?.token || !parsed?.userLogin) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function AdminProjectPage() {
  const config = useMemo(() => getConfig(), [])
  const missingConfig = useMemo(() => {
    const missing = []

    if (!config.clientId) {
      missing.push('VITE_GITHUB_OAUTH_CLIENT_ID')
    }
    if (!config.owner) {
      missing.push('VITE_GITHUB_OWNER')
    }
    if (!config.repo) {
      missing.push('VITE_GITHUB_REPO')
    }

    return missing
  }, [config])

  const savedSession = getSavedSession()

  const [draft, setDraft] = useState(() => createInitialDraft(getNextOrder()))
  const [challenges, setChallenges] = useState([createInitialChallenge()])
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [deviceLogin, setDeviceLogin] = useState(null)
  const [auth, setAuth] = useState(() => ({
    token: savedSession?.token ?? '',
    userLogin: savedSession?.userLogin ?? '',
    authorized: Boolean(savedSession?.token),
  }))
  const isConfigReady = missingConfig.length === 0

  const setField = (key, value) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const authorizeWithToken = async (token) => {
    const user = await getAuthenticatedUser({ token })
    const repo = await getRepoPermissions({
      token,
      owner: config.owner,
      repo: config.repo,
    })

    if (config.allowedUser && user.login !== config.allowedUser) {
      throw new Error(`El usuario autenticado (${user.login}) no coincide con el usuario permitido (${config.allowedUser}).`)
    }

    const canWrite = Boolean(repo.permissions?.push || repo.permissions?.maintain || repo.permissions?.admin)
    if (!canWrite) {
      throw new Error('Tu cuenta autenticada no tiene permisos de escritura en este repositorio.')
    }

    sessionStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token,
        userLogin: user.login,
      }),
    )

    setAuth({
      token,
      userLogin: user.login,
      authorized: true,
    })

    return user
  }

  const setChallengeField = (index, key, value) => {
    setChallenges((current) =>
      current.map((challenge, challengeIndex) =>
        challengeIndex === index
          ? {
              ...challenge,
              [key]: value,
            }
          : challenge,
      ),
    )
  }

  const addChallenge = () => {
    setChallenges((current) => [...current, createInitialChallenge()])
  }

  const removeChallenge = (index) => {
    setChallenges((current) => {
      if (current.length === 1) {
        return current
      }

      return current.filter((_, challengeIndex) => challengeIndex !== index)
    })
  }

  const loginWithGitHub = async () => {
    if (missingConfig.length > 0) {
      setMessage('Falta configurar variables de entorno para habilitar el login.')
      return
    }

    setBusy(true)
    setMessage('Iniciando GitHub Device Flow...')
    setDeviceLogin(null)

    try {
      const deviceCode = await requestDeviceCode({ clientId: config.clientId })
      setDeviceLogin(deviceCode)

      window.open(deviceCode.verification_uri, '_blank', 'noopener,noreferrer')

      const token = await pollAccessToken({
        clientId: config.clientId,
        deviceCode: deviceCode.device_code,
        interval: deviceCode.interval,
        expiresIn: deviceCode.expires_in,
      })

      const user = await authorizeWithToken(token)
      setMessage(`Sesion iniciada como ${user.login}. Ya puedes publicar proyectos.`)
    } catch (error) {
      setAuth({ token: '', userLogin: '', authorized: false })
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
      setMessage(error.message ?? 'No se pudo completar la autenticacion con GitHub.')
    } finally {
      setBusy(false)
    }
  }

  const logout = () => {
    setAuth({ token: '', userLogin: '', authorized: false })
    setDeviceLogin(null)
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    setMessage('Sesion cerrada.')
  }

  const resetForm = () => {
    setDraft(createInitialDraft(getNextOrder()))
    setChallenges([createInitialChallenge()])
    setErrors({})
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (!auth.authorized || !auth.token) {
      setMessage('Debes iniciar sesion con GitHub para publicar.')
      return
    }

    const validationErrors = validateDraft(draft, challenges)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      setMessage('Corrige los errores del formulario antes de publicar.')
      return
    }

    setBusy(true)

    try {
      const payload = buildProjectPayload(draft, challenges)
      const duplicated = findDuplicateProject(projects, payload.id, payload.slug)

      if (duplicated && !draft.overwriteExisting) {
        throw new Error('Ya existe un proyecto con ese id o slug. Activa "Sobrescribir proyecto existente" para actualizarlo.')
      }

      const path = `${config.projectsPath}/${payload.slug}.json`
      const commitMessage = draft.overwriteExisting
        ? `chore(content): update project ${payload.slug}`
        : `chore(content): add project ${payload.slug}`

      const result = await upsertProjectFile({
        token: auth.token,
        owner: config.owner,
        repo: config.repo,
        path,
        branch: config.branch,
        commitMessage,
        payload,
        allowOverwrite: draft.overwriteExisting,
      })

      const commitUrl = result.commit?.html_url
      setMessage(
        commitUrl
          ? `Proyecto guardado en el repositorio. Commit: ${commitUrl}`
          : 'Proyecto guardado correctamente en el repositorio.',
      )
      resetForm()
    } catch (error) {
      setMessage(error.message ?? 'No se pudo guardar el proyecto.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="admin-shell">
      <header className="topbar">
        <Link className="back-link" to="/">
          Volver al portfolio
        </Link>
      </header>

      <section className="admin-header-card">
        <p className="eyebrow">Admin privado</p>
        <h1>Alta de proyectos</h1>
        <p>
          Este panel crea o actualiza archivos JSON en tu repositorio dentro de {config.projectsPath}. El deploy de GitHub
          Pages se dispara automaticamente cuando se crea el commit.
        </p>
      </section>

      {missingConfig.length > 0 && (
        <section className="admin-warning-card">
          <h2>Configuracion incompleta</h2>
          <p>Debes definir estas variables en tu .env.local para habilitar el panel:</p>
          <ul>
            {missingConfig.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="admin-auth-card">
        <h2>Autenticacion GitHub</h2>
        <p>
          Usuario permitido: <strong>{config.allowedUser || '(sin definir)'}</strong>
        </p>
        <p>
          Repositorio objetivo: <strong>{config.owner}/{config.repo}</strong>
        </p>
        {auth.authorized ? (
          <div className="admin-auth-actions">
            <span>Sesion activa: {auth.userLogin}</span>
            <button type="button" className="admin-secondary-button" onClick={logout} disabled={busy}>
              Cerrar sesion
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="admin-primary-button"
            onClick={loginWithGitHub}
            disabled={busy || !isConfigReady}
          >
            {busy ? 'Conectando...' : 'Iniciar sesion con GitHub'}
          </button>
        )}

        {deviceLogin && !auth.authorized && (
          <div className="device-flow-card">
            <p>
              1. Abre <a href={deviceLogin.verification_uri} target="_blank" rel="noreferrer">{deviceLogin.verification_uri}</a>
            </p>
            <p>
              2. Ingresa este codigo: <strong>{deviceLogin.user_code}</strong>
            </p>
            <p>3. Autoriza la aplicacion y vuelve a esta pestaña.</p>
          </div>
        )}
      </section>

      {!auth.authorized && (
        <section className="admin-warning-card">
          <h2>Acceso restringido</h2>
          <p>Debes completar el login con GitHub para habilitar el formulario de alta.</p>
        </section>
      )}

      {auth.authorized && isConfigReady && (
        <form className="admin-form" onSubmit={handleSubmit}>
        <section className="admin-section">
          <h2>Identidad</h2>
          <div className="admin-grid two-cols">
            <label>
              ID
              <input value={draft.id} onChange={(event) => setField('id', event.target.value)} placeholder="ip43-nba" />
              {errors.id && <span className="field-error">{errors.id}</span>}
            </label>
            <label>
              Slug
              <input value={draft.slug} onChange={(event) => setField('slug', event.target.value)} placeholder="ip43-nba" />
              {errors.slug && <span className="field-error">{errors.slug}</span>}
            </label>
            <label>
              Nombre (ES)
              <input value={draft.nombreEs} onChange={(event) => setField('nombreEs', event.target.value)} />
              {errors.nombreEs && <span className="field-error">{errors.nombreEs}</span>}
            </label>
            <label>
              Nombre (EN)
              <input value={draft.nombreEn} onChange={(event) => setField('nombreEn', event.target.value)} />
              {errors.nombreEn && <span className="field-error">{errors.nombreEn}</span>}
            </label>
            <label>
              Titulo corto (ES)
              <input value={draft.tituloCortoEs} onChange={(event) => setField('tituloCortoEs', event.target.value)} />
              {errors.tituloCortoEs && <span className="field-error">{errors.tituloCortoEs}</span>}
            </label>
            <label>
              Titulo corto (EN)
              <input value={draft.tituloCortoEn} onChange={(event) => setField('tituloCortoEn', event.target.value)} />
              {errors.tituloCortoEn && <span className="field-error">{errors.tituloCortoEn}</span>}
            </label>
            <label>
              Estado (ES)
              <input value={draft.estadoEs} onChange={(event) => setField('estadoEs', event.target.value)} />
              {errors.estadoEs && <span className="field-error">{errors.estadoEs}</span>}
            </label>
            <label>
              Estado (EN)
              <input value={draft.estadoEn} onChange={(event) => setField('estadoEn', event.target.value)} />
              {errors.estadoEn && <span className="field-error">{errors.estadoEn}</span>}
            </label>
            <label>
              Tipo (ES)
              <input value={draft.tipoEs} onChange={(event) => setField('tipoEs', event.target.value)} />
            </label>
            <label>
              Tipo (EN)
              <input value={draft.tipoEn} onChange={(event) => setField('tipoEn', event.target.value)} />
            </label>
          </div>
        </section>

        <section className="admin-section">
          <h2>Narrativa</h2>
          <div className="admin-grid two-cols">
            <label>
              Resumen (ES)
              <textarea value={draft.resumenEs} onChange={(event) => setField('resumenEs', event.target.value)} rows={4} />
              {errors.resumenEs && <span className="field-error">{errors.resumenEs}</span>}
            </label>
            <label>
              Resumen (EN)
              <textarea value={draft.resumenEn} onChange={(event) => setField('resumenEn', event.target.value)} rows={4} />
              {errors.resumenEn && <span className="field-error">{errors.resumenEn}</span>}
            </label>
            <label>
              Caso de negocio (ES)
              <textarea value={draft.casoNegocioEs} onChange={(event) => setField('casoNegocioEs', event.target.value)} rows={4} />
            </label>
            <label>
              Caso de negocio (EN)
              <textarea value={draft.casoNegocioEn} onChange={(event) => setField('casoNegocioEn', event.target.value)} rows={4} />
            </label>
            <label>
              Problema y contexto (ES)
              <textarea
                value={draft.problemaContextoEs}
                onChange={(event) => setField('problemaContextoEs', event.target.value)}
                rows={4}
              />
            </label>
            <label>
              Problema y contexto (EN)
              <textarea
                value={draft.problemaContextoEn}
                onChange={(event) => setField('problemaContextoEn', event.target.value)}
                rows={4}
              />
            </label>
            <label>
              Propuesta de solucion (ES)
              <textarea
                value={draft.propuestaSolucionEs}
                onChange={(event) => setField('propuestaSolucionEs', event.target.value)}
                rows={4}
              />
            </label>
            <label>
              Propuesta de solucion (EN)
              <textarea
                value={draft.propuestaSolucionEn}
                onChange={(event) => setField('propuestaSolucionEn', event.target.value)}
                rows={4}
              />
            </label>
            <label>
              Usuarios objetivo (ES) - una linea por item
              <textarea
                value={draft.usuariosObjetivoEs}
                onChange={(event) => setField('usuariosObjetivoEs', event.target.value)}
                rows={5}
              />
            </label>
            <label>
              Usuarios objetivo (EN) - una linea por item
              <textarea
                value={draft.usuariosObjetivoEn}
                onChange={(event) => setField('usuariosObjetivoEn', event.target.value)}
                rows={5}
              />
            </label>
          </div>
        </section>

        <section className="admin-section">
          <h2>Rol y solucion</h2>
          <div className="admin-grid two-cols">
            <label>
              Rol principal (ES)
              <input value={draft.rolPrincipalEs} onChange={(event) => setField('rolPrincipalEs', event.target.value)} />
            </label>
            <label>
              Rol principal (EN)
              <input value={draft.rolPrincipalEn} onChange={(event) => setField('rolPrincipalEn', event.target.value)} />
            </label>
            <label>
              Responsabilidades (ES) - una linea por item
              <textarea
                value={draft.responsabilidadesEs}
                onChange={(event) => setField('responsabilidadesEs', event.target.value)}
                rows={5}
              />
            </label>
            <label>
              Responsabilidades (EN) - una linea por item
              <textarea
                value={draft.responsabilidadesEn}
                onChange={(event) => setField('responsabilidadesEn', event.target.value)}
                rows={5}
              />
            </label>
            <label>
              Tipo de solucion entregada (ES)
              <input value={draft.solucionTipoEs} onChange={(event) => setField('solucionTipoEs', event.target.value)} />
            </label>
            <label>
              Tipo de solucion entregada (EN)
              <input value={draft.solucionTipoEn} onChange={(event) => setField('solucionTipoEn', event.target.value)} />
            </label>
            <label>
              Modulos principales (ES) - una linea por item
              <textarea
                value={draft.modulosPrincipalesEs}
                onChange={(event) => setField('modulosPrincipalesEs', event.target.value)}
                rows={5}
              />
            </label>
            <label>
              Modulos principales (EN) - una linea por item
              <textarea
                value={draft.modulosPrincipalesEn}
                onChange={(event) => setField('modulosPrincipalesEn', event.target.value)}
                rows={5}
              />
            </label>
          </div>
        </section>

        <section className="admin-section">
          <h2>Tecnologias</h2>
          <div className="admin-grid two-cols">
            <label>
              Frontend - una linea por item
              <textarea
                value={draft.tecnologiasFrontend}
                onChange={(event) => setField('tecnologiasFrontend', event.target.value)}
                rows={4}
              />
            </label>
            <label>
              Backend - una linea por item
              <textarea
                value={draft.tecnologiasBackend}
                onChange={(event) => setField('tecnologiasBackend', event.target.value)}
                rows={4}
              />
            </label>
            <label>
              Base de datos - una linea por item
              <textarea
                value={draft.tecnologiasBaseDatos}
                onChange={(event) => setField('tecnologiasBaseDatos', event.target.value)}
                rows={4}
              />
            </label>
            <label>
              Autenticacion - una linea por item
              <textarea
                value={draft.tecnologiasAutenticacion}
                onChange={(event) => setField('tecnologiasAutenticacion', event.target.value)}
                rows={4}
              />
            </label>
            <label>
              Infraestructura deploy - una linea por item
              <textarea
                value={draft.tecnologiasInfraestructura}
                onChange={(event) => setField('tecnologiasInfraestructura', event.target.value)}
                rows={4}
              />
            </label>
            <label>
              APIs externas - una linea por item
              <textarea
                value={draft.tecnologiasApisExternas}
                onChange={(event) => setField('tecnologiasApisExternas', event.target.value)}
                rows={4}
              />
            </label>
          </div>
        </section>

        <section className="admin-section">
          <h2>Desafios</h2>
          <div className="admin-challenges">
            {challenges.map((challenge, index) => (
              <article key={`challenge-${index}`} className="challenge-editor">
                <header>
                  <h3>Desafio {index + 1}</h3>
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() => removeChallenge(index)}
                    disabled={challenges.length === 1}
                  >
                    Quitar
                  </button>
                </header>

                <div className="admin-grid two-cols">
                  <label>
                    Titulo (ES)
                    <input
                      value={challenge.tituloEs}
                      onChange={(event) => setChallengeField(index, 'tituloEs', event.target.value)}
                    />
                    {errors[`challenge_${index}_tituloEs`] && (
                      <span className="field-error">{errors[`challenge_${index}_tituloEs`]}</span>
                    )}
                  </label>
                  <label>
                    Titulo (EN)
                    <input
                      value={challenge.tituloEn}
                      onChange={(event) => setChallengeField(index, 'tituloEn', event.target.value)}
                    />
                    {errors[`challenge_${index}_tituloEn`] && (
                      <span className="field-error">{errors[`challenge_${index}_tituloEn`]}</span>
                    )}
                  </label>
                  <label>
                    Descripcion (ES)
                    <textarea
                      value={challenge.descripcionEs}
                      rows={4}
                      onChange={(event) => setChallengeField(index, 'descripcionEs', event.target.value)}
                    />
                    {errors[`challenge_${index}_descripcionEs`] && (
                      <span className="field-error">{errors[`challenge_${index}_descripcionEs`]}</span>
                    )}
                  </label>
                  <label>
                    Descripcion (EN)
                    <textarea
                      value={challenge.descripcionEn}
                      rows={4}
                      onChange={(event) => setChallengeField(index, 'descripcionEn', event.target.value)}
                    />
                    {errors[`challenge_${index}_descripcionEn`] && (
                      <span className="field-error">{errors[`challenge_${index}_descripcionEn`]}</span>
                    )}
                  </label>
                  <label>
                    Como lo resolvi (ES)
                    <textarea
                      value={challenge.resolucionEs}
                      rows={4}
                      onChange={(event) => setChallengeField(index, 'resolucionEs', event.target.value)}
                    />
                    {errors[`challenge_${index}_resolucionEs`] && (
                      <span className="field-error">{errors[`challenge_${index}_resolucionEs`]}</span>
                    )}
                  </label>
                  <label>
                    How I solved it (EN)
                    <textarea
                      value={challenge.resolucionEn}
                      rows={4}
                      onChange={(event) => setChallengeField(index, 'resolucionEn', event.target.value)}
                    />
                    {errors[`challenge_${index}_resolucionEn`] && (
                      <span className="field-error">{errors[`challenge_${index}_resolucionEn`]}</span>
                    )}
                  </label>
                </div>
              </article>
            ))}
          </div>

          <button type="button" className="admin-secondary-button" onClick={addChallenge}>
            Agregar desafio
          </button>
        </section>

        <section className="admin-section">
          <h2>Impacto y decisiones</h2>
          <div className="admin-grid two-cols">
            <label>
              Decisiones tecnicas (ES) - una linea por item
              <textarea
                value={draft.decisionesTecnicasEs}
                onChange={(event) => setField('decisionesTecnicasEs', event.target.value)}
                rows={5}
              />
            </label>
            <label>
              Decisiones tecnicas (EN) - una linea por item
              <textarea
                value={draft.decisionesTecnicasEn}
                onChange={(event) => setField('decisionesTecnicasEn', event.target.value)}
                rows={5}
              />
            </label>
            <label>
              Resultado general (ES)
              <textarea
                value={draft.resultadoGeneralEs}
                onChange={(event) => setField('resultadoGeneralEs', event.target.value)}
                rows={3}
              />
            </label>
            <label>
              Resultado general (EN)
              <textarea
                value={draft.resultadoGeneralEn}
                onChange={(event) => setField('resultadoGeneralEn', event.target.value)}
                rows={3}
              />
            </label>
            <label>
              Impactos cualitativos (ES) - una linea por item
              <textarea
                value={draft.impactosCualitativosEs}
                onChange={(event) => setField('impactosCualitativosEs', event.target.value)}
                rows={5}
              />
            </label>
            <label>
              Impactos cualitativos (EN) - una linea por item
              <textarea
                value={draft.impactosCualitativosEn}
                onChange={(event) => setField('impactosCualitativosEn', event.target.value)}
                rows={5}
              />
            </label>
            <label className="full-width">
              Metricas (JSON)
              <textarea value={draft.metricasJson} onChange={(event) => setField('metricasJson', event.target.value)} rows={8} />
              {errors.metricasJson && <span className="field-error">{errors.metricasJson}</span>}
            </label>
          </div>
        </section>

        <section className="admin-section">
          <h2>Media, links y metadata</h2>
          <div className="admin-grid two-cols">
            <label>
              Features destacadas (ES) - una linea por item
              <textarea
                value={draft.featuresDestacadasEs}
                onChange={(event) => setField('featuresDestacadasEs', event.target.value)}
                rows={5}
              />
            </label>
            <label>
              Features destacadas (EN) - una linea por item
              <textarea
                value={draft.featuresDestacadasEn}
                onChange={(event) => setField('featuresDestacadasEn', event.target.value)}
                rows={5}
              />
            </label>
            <label>
              Capturas de galeria - una ruta por linea (obligatorio)
              <textarea
                value={draft.capturasGaleria}
                onChange={(event) => setField('capturasGaleria', event.target.value)}
                rows={6}
                placeholder="/images/projects/proyecto-01.jpg"
              />
              {errors.capturasGaleria && <span className="field-error">{errors.capturasGaleria}</span>}
            </label>
            <label>
              Link video demo
              <input value={draft.linkVideoDemo} onChange={(event) => setField('linkVideoDemo', event.target.value)} />
            </label>
            <label>
              Link demo
              <input value={draft.linkDemo} onChange={(event) => setField('linkDemo', event.target.value)} />
            </label>
            <label>
              Link repositorio
              <input value={draft.linkRepositorio} onChange={(event) => setField('linkRepositorio', event.target.value)} />
            </label>
            <label>
              Link web
              <input value={draft.linkWeb} onChange={(event) => setField('linkWeb', event.target.value)} />
            </label>
            <label>
              Link App Store
              <input value={draft.linkAppStore} onChange={(event) => setField('linkAppStore', event.target.value)} />
            </label>
            <label>
              Link Play Store
              <input value={draft.linkPlayStore} onChange={(event) => setField('linkPlayStore', event.target.value)} />
            </label>
            <label>
              Tags (ES) - una linea por item
              <textarea value={draft.tagsEs} onChange={(event) => setField('tagsEs', event.target.value)} rows={5} />
            </label>
            <label>
              Tags (EN) - una linea por item
              <textarea value={draft.tagsEn} onChange={(event) => setField('tagsEn', event.target.value)} rows={5} />
            </label>
            <label>
              Idiomas disponibles - una linea por item
              <textarea
                value={draft.idiomasDisponibles}
                onChange={(event) => setField('idiomasDisponibles', event.target.value)}
                rows={3}
              />
              {errors.idiomasDisponibles && <span className="field-error">{errors.idiomasDisponibles}</span>}
            </label>
            <label>
              Fecha inicio
              <input value={draft.fechaInicio} onChange={(event) => setField('fechaInicio', event.target.value)} />
            </label>
            <label>
              Fecha fin
              <input value={draft.fechaFin} onChange={(event) => setField('fechaFin', event.target.value)} />
            </label>
            <label>
              Orden
              <input value={draft.orden} onChange={(event) => setField('orden', event.target.value)} />
              {errors.orden && <span className="field-error">{errors.orden}</span>}
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={draft.destacado}
                onChange={(event) => setField('destacado', event.target.checked)}
              />
              Proyecto destacado
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={draft.overwriteExisting}
                onChange={(event) => setField('overwriteExisting', event.target.checked)}
              />
              Sobrescribir proyecto existente (id o slug repetidos)
            </label>
          </div>
        </section>

        <div className="admin-actions">
          <button type="button" className="admin-secondary-button" onClick={resetForm} disabled={busy}>
            Limpiar formulario
          </button>
          <button type="submit" className="admin-primary-button" disabled={busy || !auth.authorized}>
            {busy ? 'Guardando...' : 'Guardar en repositorio'}
          </button>
        </div>

        </form>
      )}

      {message && <p className="admin-message">{message}</p>}
    </main>
  )
}

export default AdminProjectPage
