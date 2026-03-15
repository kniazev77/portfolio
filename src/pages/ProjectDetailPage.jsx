import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LanguageToggle from '../components/LanguageToggle'
import ProjectCarousel from '../components/ProjectCarousel'
import { projects } from '../data/projects'

function ProjectDetailPage() {
  const { projectId } = useParams()
  const [language, setLanguage] = useState('es')

  const project = projects.find((item) => item.id === projectId)

  const labels = useMemo(
    () => ({
      back: language === 'es' ? 'Volver al inicio' : 'Back to home',
      notFoundTitle: language === 'es' ? 'Proyecto no encontrado' : 'Project not found',
      notFoundBody:
        language === 'es'
          ? 'El proyecto que buscas no existe o aun no fue publicado.'
          : 'The project you are looking for does not exist or is not published yet.',
      tech: language === 'es' ? 'Tecnologias' : 'Technologies',
      links: language === 'es' ? 'Enlaces' : 'Links',
      repository: language === 'es' ? 'Repositorio' : 'Repository',
      liveDemo: language === 'es' ? 'Demo online' : 'Live demo',
    }),
    [language],
  )

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
        <p className="eyebrow">{project.year}</p>
        <h1>{project.title[language]}</h1>
        <p>{project.summary[language]}</p>
      </section>

      <ProjectCarousel
        images={project.images}
        language={language}
        projectTitle={project.title[language]}
      />

      <section className="detail-content">
        <div>
          {project.description[language].map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <aside className="detail-meta">
          <h2>{labels.tech}</h2>
          <ul className="chip-list">
            {project.technologies.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>

          <h2>{labels.links}</h2>
          <ul className="link-list">
            <li>
              <a href={project.links.repo} target="_blank" rel="noreferrer">
                {labels.repository}
              </a>
            </li>
            <li>
              <a href={project.links.live} target="_blank" rel="noreferrer">
                {labels.liveDemo}
              </a>
            </li>
          </ul>
        </aside>
      </section>
    </main>
  )
}

export default ProjectDetailPage
