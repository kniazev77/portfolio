import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContactFooter } from '@/components/ContactFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { getProject, isLocale, projects } from '@/lib/content'
import { labels } from '@/lib/i18n'

export function generateStaticParams() {
  return ['es', 'en', 'fr'].flatMap((lang) =>
    projects.map((project) => ({ lang, slug: project.slug }))
  )
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const project = getProject(slug)
  if (!isLocale(lang) || !project) return {}
  return {
    title: project.title[lang],
    description: project.short[lang]
  }
}

export default async function ProjectPage({
  params
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  if (!isLocale(lang)) notFound()
  const project = getProject(slug)
  if (!project) notFound()
  const t = labels[lang]
  const focus = project.focus[0]

  return (
    <div className="site-shell">
      <SiteHeader locale={lang} focus={focus} />
      <main>
        <section className="project-hero">
          <div className="container">
            <Link className="case-link" href={`/${lang}?focus=${focus}#cases`}>← {t.back}</Link>
            <p className="eyebrow" style={{ marginTop: '2rem' }}>{project.status[lang]}</p>
            <h1>{project.title[lang]}</h1>
            <p>{project.short[lang]}</p>
            <div className="tag-list">
              {project.stack.map((tech) => <span className="tag" key={tech}>{tech}</span>)}
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="project-detail-grid">
              <article><h2>{t.problem}</h2><p>{project.problem[lang]}</p></article>
              <article><h2>{t.contribution}</h2><p>{project.contribution[lang]}</p></article>
              <article><h2>{t.outcome}</h2><p>{project.outcome[lang]}</p></article>
            </div>
            {project.media.length > 0 && (
              <>
                <p className="section-kicker" style={{ marginTop: '5rem' }}>{t.gallery}</p>
                <div className="project-gallery">
                  {project.media.map((media, index) => (
                    <Image
                      key={media}
                      src={media}
                      alt={`${project.title[lang]} · ${index + 1}`}
                      width={1000}
                      height={620}
                    />
                  ))}
                </div>
              </>
            )}
            {project.links.length > 0 && (
              <div style={{ marginTop: '4rem' }}>
                <p className="section-kicker">{t.links}</p>
                <div className="hero-actions">
                  {project.links.map((link) => (
                    <a className="button button-secondary" href={link.url} target="_blank" rel="noreferrer" key={link.url}>
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <ContactFooter locale={lang} />
    </div>
  )
}
