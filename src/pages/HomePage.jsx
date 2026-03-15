import { useMemo, useState } from 'react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { profile } from '../data/profile'
import { projects } from '../data/projects'
import LanguageToggle from '../components/LanguageToggle'
import ProjectCard from '../components/ProjectCard'
import { resolveAssetPath } from '../utils/assetPath'

function HomePage() {
  const [language, setLanguage] = useState('es')

  const getSocialIcon = (network) => {
    const label = network.label.toLowerCase()
    const url = network.url.toLowerCase()

    if (label.includes('github') || url.includes('github')) {
      return <FaGithub aria-hidden="true" className="social-icon" />
    }

    if (label.includes('linkedin') || url.includes('linkedin')) {
      return <FaLinkedin aria-hidden="true" className="social-icon" />
    }

    if (label.includes('email') || label.includes('gmail') || url.startsWith('mailto:')) {
      return <MdEmail aria-hidden="true" className="social-icon" />
    }

    return null
  }

  const getStatusBadgeClass = (statusValue) => {
    const normalized = statusValue.toLowerCase()

    if (normalized.includes('finalizado') || normalized.includes('completed')) {
      return 'education-item-badge is-completed'
    }

    if (normalized.includes('en curso') || normalized.includes('in progress')) {
      return 'education-item-badge is-in-progress'
    }

    return 'education-item-badge'
  }

  const labels = useMemo(
    () => ({
      introBadge: language === 'es' ? 'Portfolio' : 'Portfolio',
      aboutTitle: language === 'es' ? 'Sobre mi' : 'About me',
      experienceTitle: language === 'es' ? 'Experiencia' : 'Experience',
      personalInfoTitle: language === 'es' ? 'Informacion personal' : 'Personal information',
      educationAchievementsTitle:
        language === 'es' ? 'Formacion y logros personales' : 'Education and personal achievements',
      locationLabel: language === 'es' ? 'Ubicacion actual' : 'Current location',
      availabilityLabel: language === 'es' ? 'Disponibilidad laboral' : 'Work availability',
      workPermitLabel: language === 'es' ? 'Permiso de trabajo / Situacion migratoria' : 'Work permit / Migration status',
      languagesLabel: language === 'es' ? 'Idiomas' : 'Languages',
      higherEducationLabel: language === 'es' ? 'Formacion terciaria formal' : 'Formal tertiary education',
      coursesCertificationsLabel: language === 'es' ? 'Cursos y Certificaciones' : 'Courses and certifications',
      achievementsLabel: language === 'es' ? 'Logros' : 'Achievements',
      educationItemLinkLabel: language === 'es' ? 'Ver enlace' : 'Open link',
      projectsTitle: language === 'es' ? 'Proyectos destacados' : 'Featured projects',
      projectsSubtitle:
        language === 'es'
          ? 'Cada card abre una vista con carrusel horizontal y detalle completo.'
          : 'Each card opens a detailed page with a horizontal image carousel.',
      socialTitle: language === 'es' ? 'Redes y contacto' : 'Social and contact',
      cvTitle: 'Curriculum Vitae',
    }),
    [language],
  )

  const cvFiles = [
    {
      label: 'Data Automation',
      file: 'cv/Juan-Kniazev-CV-Data-Automation.pdf',
    },
    {
      label: '.NET Developer',
      file: 'cv/Juan-Kniazev-CV-DotNet-Integration.pdf',
    },
    {
      label: 'Project Manager',
      file: 'cv/Juan-Kniazev-CV-PM.pdf',
    },
  ]

  return (
    <main className="page-shell">
      <header className="topbar">
        <p className="brand">Juan Francisco Kniazev - Portfolio</p>
        <LanguageToggle language={language} onChange={setLanguage} />
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">{labels.introBadge}</p>
          <h1>{profile.role[language]}</h1>
          <p>{profile.bio[language]}</p>
        </div>

        <div className="hero-side-stack">
          <aside className="hero-side hero-side-contact">
            <h2>{labels.socialTitle}</h2>
            <ul className="social-list">
              {profile.social.map((network) => (
                <li key={network.label}>
                  <a href={network.url} target="_blank" rel="noreferrer">
                    {getSocialIcon(network)}
                    {network.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <section className="hero-side hero-side-cv" aria-labelledby="cv-title">
            <h2 id="cv-title">{labels.cvTitle}</h2>
            <div className="cv-download-list">
              {cvFiles.map((cv) => (
                <a key={cv.label} href={resolveAssetPath(cv.file)} className="cv-download-button" download>
                  {cv.label}
                </a>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="experience-section">
        <h2>{labels.experienceTitle}</h2>
        <ul>
          {profile.experiences.map((item) => (
            <li key={item.es}>{item[language]}</li>
          ))}
        </ul>
      </section>

      <section className="personal-section">
        <h2>{labels.personalInfoTitle}</h2>
        <ul className="personal-list">
          <li>
            <span className="personal-item-label">{labels.locationLabel}:</span> {profile.personalInfo.location[language]}
          </li>
          <li>
            <span className="personal-item-label">{labels.availabilityLabel}:</span> {profile.personalInfo.availability[language]}
          </li>
          <li>
            <span className="personal-item-label">{labels.workPermitLabel}:</span> {profile.personalInfo.workPermit[language]}
          </li>
        </ul>

        <div className="languages-block">
          <h3>{labels.languagesLabel}</h3>
          <ul className="languages-list">
            {profile.personalInfo.languages.map((item) => (
              <li key={item.name.en}>
                <span>{item.emoji}</span>
                <span>{item.name[language]}</span>
                <strong>{item.level[language]}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="education-section">
        <h2>{labels.educationAchievementsTitle}</h2>
        <p className="education-intro">{profile.educationAndAchievements.intro[language]}</p>

        <div className="education-block">
          <h3>{labels.higherEducationLabel}</h3>
          <ul className="education-list">
            {profile.educationAndAchievements.higherEducation.map((item) => (
              <li key={item.en}>
                <div className="education-item-row">
                  <span className="education-item-text">{item[language]}</span>
                  <div className="education-item-actions">
                    <span className={getStatusBadgeClass(item.status[language])}>{item.status[language]}</span>
                    <a href={item.link} target="_blank" rel="noreferrer" className="education-item-link">
                      {labels.educationItemLinkLabel}
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="education-block">
          <h3>{labels.coursesCertificationsLabel}</h3>
          <ul className="education-list">
            {profile.educationAndAchievements.coursesAndCertifications.map((item) => (
              <li key={item.en}>
                <div className="education-item-row">
                  <span className="education-item-text">{item[language]}</span>
                  <div className="education-item-actions">
                    <span className={getStatusBadgeClass(item.status[language])}>{item.status[language]}</span>
                    <a href={item.link} target="_blank" rel="noreferrer" className="education-item-link">
                      {labels.educationItemLinkLabel}
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="education-block">
          <h3>{labels.achievementsLabel}</h3>
          <ul className="education-list">
            {profile.educationAndAchievements.achievements.map((item) => (
              <li key={item.en}>{item[language]}</li>
            ))}
          </ul>
        </div>
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
