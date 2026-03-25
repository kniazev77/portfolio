import legacySource from './json_proyecto.json'

const contentModules = import.meta.glob('../../content/projects/*.json', { eager: true })
const contentProjects = Object.values(contentModules)
  .map((module) => module?.default ?? module)
  .filter(Boolean)

const sourceProjects = contentProjects.length > 0 ? contentProjects : legacySource.proyectos ?? []

const emptyLocale = { es: '', en: '' }

const toLocale = (value) => {
  if (!value) {
    return emptyLocale
  }

  if (typeof value === 'object' && ('es' in value || 'en' in value)) {
    const esValue = value.es ?? value.en ?? ''
    const enValue = value.en ?? value.es ?? ''
    return { es: String(esValue), en: String(enValue) }
  }

  return { es: String(value), en: String(value) }
}

const toLocaleArray = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value) && ('es' in value || 'en' in value)) {
    const esArray = Array.isArray(value.es) ? value.es.map((item) => String(item)) : []
    const enArray = Array.isArray(value.en) ? value.en.map((item) => String(item)) : []

    return {
      es: esArray.length > 0 ? esArray : enArray,
      en: enArray.length > 0 ? enArray : esArray,
    }
  }

  if (!Array.isArray(value) || value.length === 0) {
    return { es: [], en: [] }
  }

  const normalized = value.map((item) => String(item))
  return { es: normalized, en: normalized }
}

const normalizeMedia = (project) => {
  const imageEntries = Array.isArray(project.capturas_galeria)
    ? project.capturas_galeria.map((src) => ({ src, type: 'image' }))
    : []

  const rawVideo = project.links?.video_demo
  const videoSources = Array.isArray(rawVideo)
    ? rawVideo.filter(Boolean)
    : rawVideo
      ? [rawVideo]
      : []

  const videoEntries = videoSources.map((src) => ({ src, type: 'video' }))

  return [...imageEntries, ...videoEntries]
}

const normalizeTechnologies = (project) => {
  const tech = project.tecnologias ?? {}
  return {
    frontend: tech.frontend ?? [],
    backend: tech.backend ?? [],
    baseDatos: tech.base_datos ?? [],
    autenticacion: tech.autenticacion ?? [],
    infraestructura: tech.infraestructura_deploy ?? [],
    apisExternas: tech.apis_externas ?? [],
  }
}

const normalizeLinks = (project) => {
  const links = project.links ?? {}
  return {
    demo: links.demo ?? '',
    repositorio: links.repositorio ?? '',
    web: links.web ?? '',
    appStore: links.app_store ?? '',
    playStore: links.play_store ?? '',
    videoDemo: links.video_demo ?? '',
  }
}

export const projects = sourceProjects
  .map((project) => ({
    id: project.id,
    slug: project.slug,
    title: toLocale(project.nombre),
    shortTitle: toLocale(project.titulo_corto),
    summary: toLocale(project.resumen),
    status: toLocale(project.estado),
    kind: toLocale(project.tipo),
    businessCase: toLocale(project.caso_negocio),
    contextProblem: toLocale(project.problema_contexto),
    proposedSolution: toLocale(project.propuesta_solucion),
    targetUsers: toLocaleArray(project.usuarios_objetivo),
    role: {
      main: toLocale(project.mi_rol?.rol_principal),
      responsibilities: toLocaleArray(project.mi_rol?.responsabilidades),
    },
    deliveredSolution: {
      type: toLocale(project.solucion_entregada?.tipo),
      modules: toLocaleArray(project.solucion_entregada?.modulos_principales),
    },
    technologies: normalizeTechnologies(project),
    challenges: Array.isArray(project.desafios)
      ? project.desafios.map((challenge) => ({
          title: toLocale(challenge.titulo),
          description: toLocale(challenge.descripcion),
          resolution: toLocale(challenge.como_lo_resolvi),
        }))
      : [],
    impact: {
      generalResult: toLocale(project.resultado_impacto?.resultado_general),
      qualitativeImpacts: toLocaleArray(project.resultado_impacto?.impactos_cualitativos),
      metrics: project.resultado_impacto?.metricas ?? {},
    },
    links: normalizeLinks(project),
    tags: toLocaleArray(project.tags),
    languages: project.idiomas_disponibles ?? [],
    featured: Boolean(project.destacado),
    order: Number(project.orden ?? 0),
    media: normalizeMedia(project),
  }))
  .sort((a, b) => a.order - b.order)
