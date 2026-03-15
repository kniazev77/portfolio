import { useMemo, useState } from 'react'

function ProjectCarousel({ images, projectTitle, language }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const total = images.length

  const controlsLabel = useMemo(
    () => ({
      previous: language === 'es' ? 'Anterior' : 'Previous',
      next: language === 'es' ? 'Siguiente' : 'Next',
      image: language === 'es' ? 'Imagen' : 'Image',
    }),
    [language],
  )

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
          {images.map((image, index) => (
            <figure className="carousel-slide" key={image}>
              <img
                src={image}
                alt={`${controlsLabel.image} ${index + 1} - ${projectTitle}`}
              />
            </figure>
          ))}
        </div>
      </div>

      <div className="carousel-controls">
        <button type="button" onClick={goPrevious} aria-label={controlsLabel.previous}>
          {controlsLabel.previous}
        </button>
        <div className="carousel-dots" aria-hidden="true">
          {images.map((image, index) => (
            <span
              className={index === currentIndex ? 'dot active' : 'dot'}
              key={`${image}-${index}`}
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
