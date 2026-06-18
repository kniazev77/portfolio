import { experiences } from '@/lib/content'
import { labels } from '@/lib/i18n'
import type { Locale } from '@/lib/schema'

const formatMonth = (value: string | null, locale: Locale, current: string) => {
  if (!value) return current
  const date = new Date(`${value}-01T00:00:00Z`)
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date)
}

export function ExperienceTimeline({ locale }: { locale: Locale }) {
  const t = labels[locale]
  return (
    <section className="section" id="experience">
      <div className="container">
        <p className="section-kicker">{t.experience}</p>
        <h2 className="section-title">{locale === 'fr' ? 'Livrer, stabiliser, améliorer.' : locale === 'es' ? 'Entregar, estabilizar, mejorar.' : 'Deliver, stabilize, improve.'}</h2>
        <div className="timeline">
          {experiences.map((item) => (
            <article className="timeline-item" key={item.id}>
              <div className="timeline-date">
                {formatMonth(item.start, locale, t.current)} — {formatMonth(item.end, locale, t.current)}
              </div>
              <div className="timeline-role">
                <h3>{item.role[locale]}</h3>
                <div className="timeline-company">{item.company} · {item.industry[locale]}</div>
                <p className="timeline-summary">{item.summary[locale]}</p>
                <div className="tag-list">
                  {item.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
                </div>
              </div>
              <ul className="timeline-highlights">
                {item.highlights[locale].map((highlight) => <li key={highlight}>{highlight}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
