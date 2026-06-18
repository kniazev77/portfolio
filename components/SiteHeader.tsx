import Link from 'next/link'
import type { Locale } from '@/lib/schema'
import { labels } from '@/lib/i18n'
import { profile } from '@/lib/content'

export function SiteHeader({ locale, focus }: { locale: Locale; focus: string }) {
  const t = labels[locale]
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href={`/${locale}?focus=${focus}`}>{profile.shortName}</Link>
        <nav className="main-nav" aria-label="Primary navigation">
          <a href="#profile">{t.profile}</a>
          <a href="#experience">{t.experience}</a>
          <a href="#cases">{t.cases}</a>
          <a href="#capabilities">{t.capabilities}</a>
          <a href="#education">{t.education}</a>
          <a href="#contact">{t.contact}</a>
        </nav>
        <nav className="language-nav" aria-label="Language selector">
          {(['es', 'en', 'fr'] as Locale[]).map((item) => (
            <Link
              key={item}
              href={`/${item}?focus=${focus}`}
              aria-current={item === locale ? 'page' : undefined}
            >
              {item.toUpperCase()}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
