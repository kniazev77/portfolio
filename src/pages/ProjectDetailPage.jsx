import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LanguageToggle from '../components/LanguageToggle'
import ProjectCarousel from '../components/ProjectCarousel'
import { projects } from '../data/projects'

function ProjectDetailPage() {
  const { projectId } = useParams()
  const [language, setLanguage] = useState('es')

  const project = projects.find((item) => item.id === projectId || item.slug === projectId)

  const hasValue = (value) => {
    if (Array.isArray(value)) {
      return value.length > 0
    }

    if (value && typeof value === 'object') {
      return Object.values(value).some((nestedValue) => hasValue(nestedValue))
    }

    return Boolean(value)
  }

  const technologyGroups = project
    ? [
        {
          key: 'frontend',
          title: language === 'es' ? 'Frontend' : 'Frontend',
          items: project.technologies.frontend,
        },
        {
          key: 'backend',
          title: language === 'es' ? 'Backend' : 'Backend',
          items: project.technologies.backend,
        },
        {
          key: 'baseDatos',
          title: language === 'es' ? 'Base de datos' : 'Database',
          items: project.technologies.baseDatos,
        },
        {
          key: 'autenticacion',
          title: language === 'es' ? 'Autenticacion' : 'Authentication',
          items: project.technologies.autenticacion,
        },
        {
          key: 'infraestructura',
          title: language === 'es' ? 'Infraestructura' : 'Infrastructure',
          items: project.technologies.infraestructura,
        },
        {
          key: 'apisExternas',
          title: language === 'es' ? 'APIs externas' : 'External APIs',
          items: project.technologies.apisExternas,
        },
      ].filter((group) => hasValue(group.items))
    : []

  const metricsEntries = project
    ? Object.entries(project.impact.metrics).filter(([, value]) => hasValue(value))
    : []

  const labels = useMemo(
    () => ({
      back: language === 'es' ? 'Volver al inicio' : 'Back to home',
      notFoundTitle: language === 'es' ? 'Proyecto no encontrado' : 'Project not found',
      notFoundBody:
        language === 'es'
          ? 'El proyecto que buscas no existe o aun no fue publicado.'
          : 'The project you are looking for does not exist or is not published yet.',
      businessCase: language === 'es' ? 'Caso de negocio' : 'Business case',
      problemContext: language === 'es' ? 'Problema y contexto' : 'Problem and context',
      proposedSolution: language === 'es' ? 'Propuesta de solucion' : 'Proposed solution',
      deliveredSolution: language === 'es' ? 'Solucion entregada' : 'Delivered solution',
      deliveredType: language === 'es' ? 'Tipo de entrega' : 'Delivery type',
      deliveredModules: language === 'es' ? 'Modulos principales' : 'Main modules',
      challenges: language === 'es' ? 'Desafios' : 'Challenges',
      challengeResolution: language === 'es' ? 'Como lo resolvi' : 'How I solved it',
      resultImpact: language === 'es' ? 'Resultado e impacto' : 'Outcome and impact',
      qualitativeImpacts: language === 'es' ? 'Impactos cualitativos' : 'Qualitative impacts',
      metrics: language === 'es' ? 'Metricas' : 'Metrics',
      projectStatus: language === 'es' ? 'Estado del proyecto' : 'Project status',
      projectType: language === 'es' ? 'Tipo de proyecto' : 'Project type',
      targetUsers: language === 'es' ? 'Usuarios objetivo' : 'Target users',
      role: language === 'es' ? 'Mi rol' : 'My role',
      roleResponsibilities: language === 'es' ? 'Responsabilidades' : 'Responsibilities',
      tech: language === 'es' ? 'Tecnologias' : 'Technologies',
      tags: language === 'es' ? 'Tags' : 'Tags',
      links: language === 'es' ? 'Enlaces' : 'Links',
      linksDemo: language === 'es' ? 'Demo' : 'Demo',
      linksRepository: language === 'es' ? 'Repositorio' : 'Repository',
      linksWeb: language === 'es' ? 'Sitio web' : 'Website',
      linksAppStore: language === 'es' ? 'App Store' : 'App Store',
      linksPlayStore: language === 'es' ? 'Play Store' : 'Play Store',
      linksVideoDemo: language === 'es' ? 'Video demo' : 'Video demo',
      emptyLinks: language === 'es' ? 'Sin enlaces disponibles.' : 'No links available.',
    }),
    [language],
  )

  const linksList = project
    ? [
        { key: 'demo', label: labels.linksDemo, href: project.links.demo },
        { key: 'repositorio', label: labels.linksRepository, href: project.links.repositorio },
        { key: 'web', label: labels.linksWeb, href: project.links.web },
        { key: 'appStore', label: labels.linksAppStore, href: project.links.appStore },
        { key: 'playStore', label: labels.linksPlayStore, href: project.links.playStore },
        { key: 'videoDemo', label: labels.linksVideoDemo, href: project.links.videoDemo },
      ].filter((item) => item.href)
    : []

  if (!project) {
    return (
      <main className="detail-shell">
        <header className="topbar">
          <Link className="back-link" to="/">
            {labels.back}
          </Link>
          <LanguageToggle language={language} onChange={setLanguage} />
        </header>
        <section className="not-found">
          <h1>{labels.notFoundTitle}</h1>
          <p>{labels.notFoundBody}</p>
        </section>
      </main>
    )
  }

  return (
    <main className="detail-shell">
      <header className="topbar">
        <Link className="back-link" to="/">
          {labels.back}
        </Link>
        <LanguageToggle language={language} onChange={setLanguage} />
      </header>

      <section className="detail-hero">
        <p className="eyebrow">{project.status[language]}</p>
        <h1>{project.title[language]}</h1>
        <p>{project.shortTitle[language]}</p>
        <p>{project.summary[language]}</p>
      </section>

      <ProjectCarousel
        media={project.media}
        language={language}
        projectTitle={project.title[language]}
      />

      <section className="detail-content">
        <div className="detail-main">
          {hasValue(project.businessCase[language]) && (
            <article className="detail-block">
              <h2>{labels.businessCase}</h2>
              <p>{project.businessCase[language]}</p>
            </article>
          )}

          {hasValue(project.contextProblem[language]) && (
            <article className="detail-block">
              <h2>{labels.problemContext}</h2>
              <p>{project.contextProblem[language]}</p>
            </article>
          )}

          {hasValue(project.proposedSolution[language]) && (
            <article className="detail-block">
              <h2>{labels.proposedSolution}</h2>
              <p>{project.proposedSolution[language]}</p>
            </article>
          )}

          {(hasValue(project.deliveredSolution.type[language]) ||
            hasValue(project.deliveredSolution.modules[language])) && (
            <article className="detail-block">
              <h2>{labels.deliveredSolution}</h2>
              {hasValue(project.deliveredSolution.type[language]) && (
                <p>
                  <strong>{labels.deliveredType}: </strong>
                  {project.deliveredSolution.type[language]}
                </p>
              )}
              {hasValue(project.deliveredSolution.modules[language]) && (
                <>
                  <h3>{labels.deliveredModules}</h3>
                  <ul className="detail-list">
                    {project.deliveredSolution.modules[language].map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </article>
          )}

          {hasValue(project.challenges) && (
            <article className="detail-block">
              <h2>{labels.challenges}</h2>
              <div className="challenge-list">
                {project.challenges.map((challenge) => (
                  <section key={challenge.title[language]} className="challenge-item">
                    <h3>{challenge.title[language]}</h3>
                    <p>{challenge.description[language]}</p>
                    <p>
                      <strong>{labels.challengeResolution}: </strong>
                      {challenge.resolution[language]}
                    </p>
                  </section>
                ))}
              </div>
            </article>
          )}

          {(hasValue(project.impact.generalResult[language]) ||
            hasValue(project.impact.qualitativeImpacts[language]) ||
            hasValue(metricsEntries)) && (
            <article className="detail-block">
              <h2>{labels.resultImpact}</h2>
              {hasValue(project.impact.generalResult[language]) && <p>{project.impact.generalResult[language]}</p>}

              {hasValue(project.impact.qualitativeImpacts[language]) && (
                <>
                  <h3>{labels.qualitativeImpacts}</h3>
                  <ul className="detail-list">
                    {project.impact.qualitativeImpacts[language].map((impactItem) => (
                      <li key={impactItem}>{impactItem}</li>
                    ))}
                  </ul>
                </>
              )}

              {hasValue(metricsEntries) && (
                <>
                  <h3>{labels.metrics}</h3>
                  <ul className="detail-list">
                    {metricsEntries.map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}: </strong>
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </article>
          )}
        </div>

        <aside className="detail-meta">
          <article className="detail-block">
            <h2>{labels.projectStatus}</h2>
            <p>{project.status[language]}</p>
          </article>

          {hasValue(project.kind[language]) && (
            <article className="detail-block">
              <h2>{labels.projectType}</h2>
              <p>{project.kind[language]}</p>
            </article>
          )}

          {hasValue(project.targetUsers[language]) && (
            <article className="detail-block">
              <h2>{labels.targetUsers}</h2>
              <ul className="detail-list">
                {project.targetUsers[language].map((user) => (
                  <li key={user}>{user}</li>
                ))}
              </ul>
            </article>
          )}

          {(hasValue(project.role.main[language]) || hasValue(project.role.responsibilities[language])) && (
            <article className="detail-block">
              <h2>{labels.role}</h2>
              {hasValue(project.role.main[language]) && <p>{project.role.main[language]}</p>}
              {hasValue(project.role.responsibilities[language]) && (
                <>
                  <h3>{labels.roleResponsibilities}</h3>
                  <ul className="detail-list">
                    {project.role.responsibilities[language].map((responsibility) => (
                      <li key={responsibility}>{responsibility}</li>
                    ))}
                  </ul>
                </>
              )}
            </article>
          )}

          {hasValue(technologyGroups) && (
            <article className="detail-block">
              <h2>{labels.tech}</h2>
              <div className="tech-groups">
                {technologyGroups.map((group) => (
                  <section key={group.key}>
                    <h3>{group.title}</h3>
                    <ul className="chip-list">
                      {group.items.map((item) => (
                        <li key={`${group.key}-${item}`}>{item}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </article>
          )}

          {hasValue(project.tags[language]) && (
            <article className="detail-block">
              <h2>{labels.tags}</h2>
              <ul className="chip-list">
                {project.tags[language].map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          )}

          <article className="detail-block">
            <h2>{labels.links}</h2>
            {hasValue(linksList) ? (
              <ul className="link-list">
                {linksList.map((item) => (
                  <li key={item.key}>
                    <a href={item.href} target="_blank" rel="noreferrer">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{labels.emptyLinks}</p>
            )}
          </article>
        </aside>
      </section>
    </main>
  )
}

export default ProjectDetailPage
