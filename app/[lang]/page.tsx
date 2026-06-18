import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Capabilities } from '@/components/Capabilities'
import { CaseStudies } from '@/components/CaseStudies'
import { ContactFooter } from '@/components/ContactFooter'
import { Credentials } from '@/components/Credentials'
import { ExperienceTimeline } from '@/components/ExperienceTimeline'
import { Hero } from '@/components/Hero'
import { SiteHeader } from '@/components/SiteHeader'
import { getFocus, isLocale, profile, sortProjectsByFocus } from '@/lib/content'

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  return {
    title: profile.headline[lang],
    description: profile.summary[lang],
    alternates: {
      canonical: `/${lang}`,
      languages: { es: '/es', en: '/en', fr: '/fr' }
    },
    openGraph: {
      locale: lang,
      title: `${profile.shortName} · ${profile.headline[lang]}`,
      description: profile.summary[lang],
      url: `/${lang}`
    }
  }
}

export default async function HomePage({
  params,
  searchParams
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ focus?: string }>
}) {
  const [{ lang }, query] = await Promise.all([params, searchParams])
  if (!isLocale(lang)) notFound()
  const focus = getFocus(query.focus)
  const orderedProjects = sortProjectsByFocus(focus).slice(0, 5)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.headline.en,
    email: `mailto:${profile.email}`,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    sameAs: [profile.linkedin, profile.github],
    knowsLanguage: profile.languages.map((language) => language.name.en),
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location.city,
      addressCountry: profile.location.country
    }
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader locale={lang} focus={focus} />
      <main id="main">
        <Hero locale={lang} focus={focus} />
        <ExperienceTimeline locale={lang} />
        <CaseStudies locale={lang} projects={orderedProjects} />
        <Capabilities locale={lang} focus={focus} />
        <Credentials locale={lang} />
      </main>
      <ContactFooter locale={lang} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </div>
  )
}
