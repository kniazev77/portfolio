import { useMemo, useState } from 'react'
import { resolveAssetPath } from '../utils/assetPath'

function ProjectCarousel({ media, projectTitle, language }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const total = media.length

  const controlsLabel = useMemo(
    () => ({
      previous: language === 'es' ? 'Anterior' : 'Previous',
      next: language === 'es' ? 'Siguiente' : 'Next',
      image: language === 'es' ? 'Imagen' : 'Image',
      video: language === 'es' ? 'Video' : 'Video',
    }),
    [language],
  )

  if (total === 0) {
    return null
  }

  const goPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total)
  }

  return (
    <section className="carousel">
      <div className="carousel-track-wrap">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {media.map((item, index) => (
            <figure className="carousel-slide" key={`${item.src}-${index}`}>
              {item.type === 'video' ? (
                <video controls preload="metadata">
                  <source src={resolveAssetPath(item.src)} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={resolveAssetPath(item.src)}
                  alt={`${controlsLabel.image} ${index + 1} - ${projectTitle}`}
                />
              )}
              <figcaption className="sr-only">
                {item.type === 'video'
                  ? `${controlsLabel.video} ${index + 1}`
                  : `${controlsLabel.image} ${index + 1}`}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="carousel-controls">
        <button type="button" onClick={goPrevious} aria-label={controlsLabel.previous}>
          {controlsLabel.previous}
        </button>
        <div className="carousel-dots" aria-hidden="true">
          {media.map((item, index) => (
            <span
              className={index === currentIndex ? 'dot active' : 'dot'}
              key={`${item.src}-${index}`}
            ></span>
          ))}
        </div>
        <button type="button" onClick={goNext} aria-label={controlsLabel.next}>
          {controlsLabel.next}
        </button>
      </div>
    </section>
  )
}

export default ProjectCarousel
