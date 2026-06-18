import { FiMail } from 'react-icons/fi'
import { profile } from '@/lib/content'
import { labels } from '@/lib/i18n'
import type { Locale } from '@/lib/schema'

export function ContactFooter({ locale }: { locale: Locale }) {
  const t = labels[locale]
  return (
    <>
      <section className="contact-section" id="contact">
        <div className="container contact-grid">
          <div>
            <h2>{t.interviewTitle}</h2>
            <p>{t.interviewBody}</p>
          </div>
          <div className="contact-links">
            <a className="button button-primary" href={`mailto:${profile.email}`}>{t.emailMe} <FiMail aria-hidden /></a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
        </div>
      </section>
      <footer className="site-footer">
        <div className="container footer-inner">
          <span>© {new Date().getFullYear()} {profile.shortName}</span>
          <span>{t.lastReviewed}: {profile.lastReviewed}</span>
        </div>
      </footer>
    </>
  )
}
