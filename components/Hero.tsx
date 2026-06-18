import Link from 'next/link'
import { FiArrowDownRight, FiDownload } from 'react-icons/fi'
import type { FocusId, Locale } from '@/lib/schema'
import { getCvVariant, profile } from '@/lib/content'
import { labels } from '@/lib/i18n'

export function Hero({ locale, focus }: { locale: Locale; focus: FocusId }) {
  const t = labels[locale]
  const cv = getCvVariant(focus)
  const facts = [
    { label: locale === 'fr' ? 'Localisation' : locale === 'es' ? 'Ubicación' : 'Location', value: profile.location.display[locale] },
    { label: locale === 'fr' ? 'Disponibilité' : locale === 'es' ? 'Disponibilidad' : 'Availability', value: profile.availability[locale] },
    { label: locale === 'fr' ? 'Autorisation' : locale === 'es' ? 'Permiso de trabajo' : 'Work authorization', value: profile.workAuthorization.text[locale] }
  ]

  return (
    <>
      <section className="hero" id="profile">
        <div className="container">
          <div className="hero-grid">
            <div>
              <p className="eyebrow">{t.eyebrow}</p>
              <h1>{profile.headline[locale]}</h1>
              <p className="hero-positioning">{profile.positioning[locale]}</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#cases">
                  {t.viewWork} <FiArrowDownRight aria-hidden />
                </a>
                <a className="button button-secondary" href={cv.file} download>
                  {t.downloadCv} <FiDownload aria-hidden />
                </a>
              </div>
            </div>
            <aside className="hero-aside" aria-label="Professional availability">
              {facts.map((fact) => (
                <div className="hero-fact" key={fact.label}>
                  <span className="hero-fact-label">{fact.label}</span>
                  <span>{fact.value}</span>
                </div>
              ))}
            </aside>
          </div>
          <div className="focus-wrap">
            <span className="focus-label">{t.focusLabel}</span>
            <div className="focus-tabs" role="navigation" aria-label={t.focusLabel}>
              {(['delivery', 'software', 'data'] as FocusId[]).map((item) => (
                <Link
                  key={item}
                  className="focus-tab"
                  href={`/${locale}?focus=${item}`}
                  aria-current={item === focus ? 'true' : undefined}
                >
                  {t[item]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="proof-strip">
        <div className="container proof-grid">
          {profile.proofPoints.map((point) => (
            <div className="proof-item" key={point.value}>
              <strong className="proof-value">{point.value}</strong>
              <span className="proof-label">{point.label[locale]}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
