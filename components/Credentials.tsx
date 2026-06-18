import { education, profile } from '@/lib/content'
import { labels } from '@/lib/i18n'
import type { Locale } from '@/lib/schema'

export function Credentials({ locale }: { locale: Locale }) {
  const t = labels[locale]
  return (
    <section className="section" id="education">
      <div className="container">
        <p className="section-kicker">{t.credentials}</p>
        <h2 className="section-title">{locale === 'fr' ? 'Une base formelle, entretenue par la pratique.' : locale === 'es' ? 'Una base formal, sostenida por la práctica.' : 'Formal foundations, sustained through practice.'}</h2>
        <div className="credentials-grid">
          <div>
            {education.education.map((item) => (
              <article className="credential-row" key={item.institution}>
                <h3>{item.title[locale]}</h3>
                <p>{item.institution} · {item.location}</p>
                <p>{item.status[locale]}</p>
                <a className="credential-link" href={item.url} target="_blank" rel="noreferrer">UDE ↗</a>
              </article>
            ))}
            <article className="credential-row">
              <h3>{education.achievement.title[locale]}</h3>
              <p>{education.achievement.description[locale]}</p>
              <a className="credential-link" href={education.achievement.url} target="_blank" rel="noreferrer">Evidence ↗</a>
            </article>
            {education.certifications.map((item) => (
              <article className="credential-row" key={item.name}>
                <h3>{item.name}</h3>
                <p>{item.issuer}</p>
                <a className="credential-link" href={item.url} target="_blank" rel="noreferrer">Credential ↗</a>
              </article>
            ))}
          </div>
          <aside>
            <p className="section-kicker">{locale === 'fr' ? 'Langues' : locale === 'es' ? 'Idiomas' : 'Languages'}</p>
            {profile.languages.map((item) => (
              <div className="language-row" key={item.code}>
                <span>{item.name[locale]}</span>
                <strong>{item.level[locale]}</strong>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </section>
  )
}
