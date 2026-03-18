import { Link } from 'react-router-dom'
import { resolveAssetPath } from '../utils/assetPath'

function ProjectCard({ project, language }) {
  const cover = project.media[0]

  return (
    <article className="project-card">
      <div className="project-card-image-wrap">
        {!cover ? (
          <div className="project-card-placeholder">
            {language === 'es' ? 'Sin preview' : 'No preview'}
          </div>
        ) : cover.type === 'video' ? (
          <video className="project-card-image" muted playsInline preload="metadata">
            <source src={resolveAssetPath(cover.src)} type="video/mp4" />
          </video>
        ) : (
          <img
            src={resolveAssetPath(cover?.src ?? '')}
            alt={project.title[language]}
            className="project-card-image"
          />
        )}
      </div>
      <div className="project-card-content">
        <p className="project-year">{project.status[language]}</p>
        <h3>{project.title[language]}</h3>
        <p>{project.shortTitle[language]}</p>
      </div>
      <Link className="project-card-link" to={`/project/${project.id}`}>
        {language === 'es' ? 'Ver proyecto' : 'View project'}
      </Link>
    </article>
  )
}

export default ProjectCard
