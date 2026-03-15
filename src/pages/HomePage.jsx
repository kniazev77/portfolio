import { useMemo, useState } from 'react'
import { profile } from '../data/profile'
import { projects } from '../data/projects'
import LanguageToggle from '../components/LanguageToggle'
import ProjectCard from '../components/ProjectCard'

function HomePage() {
  const [language, setLanguage] = useState('es')

  const labels = useMemo(
    () => ({
      introBadge: language === 'es' ? 'Portfolio' : 'Portfolio',
      aboutTitle: language === 'es' ? 'Sobre mi' : 'About me',
      experienceTitle: language === 'es' ? 'Experiencia' : 'Experience',
      projectsTitle: language === 'es' ? 'Proyectos destacados' : 'Featured projects',
      projectsSubtitle:
        language === 'es'
          ? 'Cada card abre una vista con carrusel horizontal y detalle completo.'
          : 'Each card opens a detailed page with a horizontal image carousel.',
      socialTitle: language === 'es' ? 'Redes y contacto' : 'Social and contact',
    }),
    [language],
  )

  return (
    <main className="page-shell">
      <header className="topbar">
        <p className="brand">Juan Portfolio</p>
        <LanguageToggle language={language} onChange={setLanguage} />
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">{labels.introBadge}</p>
          <h1>{profile.role[language]}</h1>
          <p>{profile.bio[language]}</p>
        </div>

        <aside className="hero-side">
          <h2>{labels.socialTitle}</h2>
          <ul className="social-list">
            {profile.social.map((network) => (
              <li key={network.label}>
                <a href={network.url} target="_blank" rel="noreferrer">
                  {network.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="experience-section">
        <h2>{labels.experienceTitle}</h2>
        <ul>
          {profile.experiences.map((item) => (
            <li key={item.es}>{item[language]}</li>
          ))}
        </ul>
      </section>

      <section className="projects-section">
        <div className="section-head">
          <h2>{labels.projectsTitle}</h2>
          <p>{labels.projectsSubtitle}</p>
        </div>

        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} language={language} project={project} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default HomePage
