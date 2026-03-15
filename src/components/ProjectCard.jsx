import { Link } from 'react-router-dom'
import { resolveAssetPath } from '../utils/assetPath'

function ProjectCard({ project, language }) {
  return (
    <article className="project-card">
      <div className="project-card-image-wrap">
        <img
          src={resolveAssetPath(project.images[0])}
          alt={project.title[language]}
          className="project-card-image"
        />
      </div>
      <div className="project-card-content">
        <p className="project-year">{project.year}</p>
        <h3>{project.title[language]}</h3>
        <p>{project.summary[language]}</p>
      </div>
      <Link className="project-card-link" to={`/project/${project.id}`}>
        {language === 'es' ? 'Ver proyecto' : 'View project'}
      </Link>
    </article>
  )
}

export default ProjectCard
