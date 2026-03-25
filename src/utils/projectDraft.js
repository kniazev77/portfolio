const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const normalizeText = (value) => String(value ?? '').trim()

export const splitLines = (value) =>
  String(value ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

const parseMetrics = (rawMetrics) => {
  const trimmed = normalizeText(rawMetrics)
  if (!trimmed) {
    return {}
  }

  const parsed = JSON.parse(trimmed)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Las metricas deben ser un objeto JSON valido.')
  }

  return parsed
}

export const createInitialDraft = (nextOrder = 1) => ({
  id: '',
  slug: '',
  nombreEs: '',
  nombreEn: '',
  tituloCortoEs: '',
  tituloCortoEn: '',
  estadoEs: '',
  estadoEn: '',
  tipoEs: '',
  tipoEn: '',
  resumenEs: '',
  resumenEn: '',
  casoNegocioEs: '',
  casoNegocioEn: '',
  problemaContextoEs: '',
  problemaContextoEn: '',
  propuestaSolucionEs: '',
  propuestaSolucionEn: '',
  usuariosObjetivoEs: '',
  usuariosObjetivoEn: '',
  rolPrincipalEs: '',
  rolPrincipalEn: '',
  responsabilidadesEs: '',
  responsabilidadesEn: '',
  solucionTipoEs: '',
  solucionTipoEn: '',
  modulosPrincipalesEs: '',
  modulosPrincipalesEn: '',
  tecnologiasFrontend: '',
  tecnologiasBackend: '',
  tecnologiasBaseDatos: '',
  tecnologiasAutenticacion: '',
  tecnologiasInfraestructura: '',
  tecnologiasApisExternas: '',
  decisionesTecnicasEs: '',
  decisionesTecnicasEn: '',
  resultadoGeneralEs: '',
  resultadoGeneralEn: '',
  impactosCualitativosEs: '',
  impactosCualitativosEn: '',
  metricasJson: JSON.stringify(
    {
      usuarios: null,
      grupos_creados: null,
      partidos_procesados: null,
      otras_metricas: [],
    },
    null,
    2,
  ),
  featuresDestacadasEs: '',
  featuresDestacadasEn: '',
  capturasGaleria: '',
  linkDemo: '',
  linkRepositorio: '',
  linkWeb: '',
  linkAppStore: '',
  linkPlayStore: '',
  linkVideoDemo: '',
  tagsEs: '',
  tagsEn: '',
  idiomasDisponibles: 'es\nen',
  fechaInicio: '',
  fechaFin: '',
  destacado: false,
  orden: String(nextOrder),
  overwriteExisting: false,
})

export const createInitialChallenge = () => ({
  tituloEs: '',
  tituloEn: '',
  descripcionEs: '',
  descripcionEn: '',
  resolucionEs: '',
  resolucionEn: '',
})

export const validateDraft = (draft, challenges) => {
  const errors = {}

  const requiredFields = [
    ['id', 'El campo ID es obligatorio.'],
    ['slug', 'El campo slug es obligatorio.'],
    ['nombreEs', 'El nombre en ES es obligatorio.'],
    ['nombreEn', 'El nombre en EN es obligatorio.'],
    ['tituloCortoEs', 'El titulo corto en ES es obligatorio.'],
    ['tituloCortoEn', 'El titulo corto en EN es obligatorio.'],
    ['estadoEs', 'El estado en ES es obligatorio.'],
    ['estadoEn', 'El estado en EN es obligatorio.'],
    ['resumenEs', 'El resumen en ES es obligatorio.'],
    ['resumenEn', 'El resumen en EN es obligatorio.'],
  ]

  requiredFields.forEach(([key, message]) => {
    if (!normalizeText(draft[key])) {
      errors[key] = message
    }
  })

  if (normalizeText(draft.slug) && !PROJECT_SLUG_PATTERN.test(normalizeText(draft.slug))) {
    errors.slug = 'El slug solo puede contener minusculas, numeros y guiones (kebab-case).'
  }

  if (normalizeText(draft.id) && !PROJECT_SLUG_PATTERN.test(normalizeText(draft.id))) {
    errors.id = 'El ID solo puede contener minusculas, numeros y guiones.'
  }

  if (!splitLines(draft.capturasGaleria).length) {
    errors.capturasGaleria = 'Debes cargar al menos una ruta en capturas de galeria.'
  }

  if (!splitLines(draft.idiomasDisponibles).length) {
    errors.idiomasDisponibles = 'Debes indicar al menos un idioma disponible.'
  }

  const parsedOrder = Number.parseInt(normalizeText(draft.orden), 10)
  if (!Number.isFinite(parsedOrder) || parsedOrder < 0) {
    errors.orden = 'El orden debe ser un numero entero mayor o igual a 0.'
  }

  try {
    parseMetrics(draft.metricasJson)
  } catch (error) {
    errors.metricasJson = error.message
  }

  challenges.forEach((challenge, index) => {
    const requiredChallengeFields = [
      ['tituloEs', 'Titulo ES'],
      ['tituloEn', 'Titulo EN'],
      ['descripcionEs', 'Descripcion ES'],
      ['descripcionEn', 'Descripcion EN'],
      ['resolucionEs', 'Resolucion ES'],
      ['resolucionEn', 'Resolucion EN'],
    ]

    requiredChallengeFields.forEach(([field, label]) => {
      if (!normalizeText(challenge[field])) {
        errors[`challenge_${index}_${field}`] = `Desafio ${index + 1}: ${label} es obligatorio.`
      }
    })
  })

  return errors
}

export const buildProjectPayload = (draft, challenges) => ({
  id: normalizeText(draft.id),
  slug: normalizeText(draft.slug),
  nombre: {
    es: normalizeText(draft.nombreEs),
    en: normalizeText(draft.nombreEn),
  },
  titulo_corto: {
    es: normalizeText(draft.tituloCortoEs),
    en: normalizeText(draft.tituloCortoEn),
  },
  estado: {
    es: normalizeText(draft.estadoEs),
    en: normalizeText(draft.estadoEn),
  },
  tipo: {
    es: normalizeText(draft.tipoEs),
    en: normalizeText(draft.tipoEn),
  },
  resumen: {
    es: normalizeText(draft.resumenEs),
    en: normalizeText(draft.resumenEn),
  },
  caso_negocio: {
    es: normalizeText(draft.casoNegocioEs),
    en: normalizeText(draft.casoNegocioEn),
  },
  problema_contexto: {
    es: normalizeText(draft.problemaContextoEs),
    en: normalizeText(draft.problemaContextoEn),
  },
  propuesta_solucion: {
    es: normalizeText(draft.propuestaSolucionEs),
    en: normalizeText(draft.propuestaSolucionEn),
  },
  usuarios_objetivo: {
    es: splitLines(draft.usuariosObjetivoEs),
    en: splitLines(draft.usuariosObjetivoEn),
  },
  mi_rol: {
    rol_principal: {
      es: normalizeText(draft.rolPrincipalEs),
      en: normalizeText(draft.rolPrincipalEn),
    },
    responsabilidades: {
      es: splitLines(draft.responsabilidadesEs),
      en: splitLines(draft.responsabilidadesEn),
    },
  },
  solucion_entregada: {
    tipo: {
      es: normalizeText(draft.solucionTipoEs),
      en: normalizeText(draft.solucionTipoEn),
    },
    modulos_principales: {
      es: splitLines(draft.modulosPrincipalesEs),
      en: splitLines(draft.modulosPrincipalesEn),
    },
  },
  tecnologias: {
    frontend: splitLines(draft.tecnologiasFrontend),
    backend: splitLines(draft.tecnologiasBackend),
    base_datos: splitLines(draft.tecnologiasBaseDatos),
    autenticacion: splitLines(draft.tecnologiasAutenticacion),
    infraestructura_deploy: splitLines(draft.tecnologiasInfraestructura),
    apis_externas: splitLines(draft.tecnologiasApisExternas),
  },
  desafios: challenges.map((challenge) => ({
    titulo: {
      es: normalizeText(challenge.tituloEs),
      en: normalizeText(challenge.tituloEn),
    },
    descripcion: {
      es: normalizeText(challenge.descripcionEs),
      en: normalizeText(challenge.descripcionEn),
    },
    como_lo_resolvi: {
      es: normalizeText(challenge.resolucionEs),
      en: normalizeText(challenge.resolucionEn),
    },
  })),
  decisiones_tecnicas: {
    es: splitLines(draft.decisionesTecnicasEs),
    en: splitLines(draft.decisionesTecnicasEn),
  },
  resultado_impacto: {
    resultado_general: {
      es: normalizeText(draft.resultadoGeneralEs),
      en: normalizeText(draft.resultadoGeneralEn),
    },
    impactos_cualitativos: {
      es: splitLines(draft.impactosCualitativosEs),
      en: splitLines(draft.impactosCualitativosEn),
    },
    metricas: parseMetrics(draft.metricasJson),
  },
  features_destacadas: {
    es: splitLines(draft.featuresDestacadasEs),
    en: splitLines(draft.featuresDestacadasEn),
  },
  capturas_galeria: splitLines(draft.capturasGaleria),
  links: {
    demo: normalizeText(draft.linkDemo),
    repositorio: normalizeText(draft.linkRepositorio),
    web: normalizeText(draft.linkWeb),
    app_store: normalizeText(draft.linkAppStore),
    play_store: normalizeText(draft.linkPlayStore),
    video_demo: normalizeText(draft.linkVideoDemo),
  },
  tags: {
    es: splitLines(draft.tagsEs),
    en: splitLines(draft.tagsEn),
  },
  idiomas_disponibles: splitLines(draft.idiomasDisponibles),
  fecha_inicio: normalizeText(draft.fechaInicio),
  fecha_fin: normalizeText(draft.fechaFin),
  destacado: Boolean(draft.destacado),
  orden: Number.parseInt(normalizeText(draft.orden), 10),
})

export const findDuplicateProject = (projects, id, slug) =>
  projects.find((project) => project.id === id || project.slug === slug)
