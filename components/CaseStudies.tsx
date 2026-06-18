import Image from 'next/image'
import Link from 'next/link'
import { FiArrowUpRight } from 'react-icons/fi'
import { labels } from '@/lib/i18n'
import type { Locale, Project } from '@/lib/schema'

export function CaseStudies({ locale, projects }: { locale: Locale; projects: Project[] }) {
  const t = labels[locale]
  return (
    <section className="section" id="cases">
      <div className="container">
        <p className="section-kicker">{t.selectedCases}</p>
        <h2 className="section-title">{locale === 'fr' ? 'Le travail, expliqué par les décisions.' : locale === 'es' ? 'El trabajo, explicado desde las decisiones.' : 'The work, explained through decisions.'}</h2>
        <p className="section-lede">{t.casesIntro}</p>
        <div className="case-list">
          {projects.map((project, index) => (
            <article className="case-band" key={project.id}>
              <div className="case-copy">
                <span className="case-index">{String(index + 1).padStart(2, '0')} · {project.status[locale]}</span>
                <h3>{project.title[locale]}</h3>
                <p className="case-short">{project.short[locale]}</p>
                <dl className="case-facts">
                  <div className="case-fact"><dt>{t.problem}</dt><dd>{project.problem[locale]}</dd></div>
                  <div className="case-fact"><dt>{t.contribution}</dt><dd>{project.contribution[locale]}</dd></div>
                  <div className="case-fact"><dt>{t.outcome}</dt><dd>{project.outcome[locale]}</dd></div>
                </dl>
                <div className="tag-list">
                  {project.stack.map((tech) => <span className="tag" key={tech}>{tech}</span>)}
                </div>
                <p><Link className="case-link" href={`/${locale}/projects/${project.slug}`}>{t.viewCase} <FiArrowUpRight aria-hidden /></Link></p>
              </div>
              {project.media[0] ? (
                <div className="case-visual">
                  <Image src={project.media[0]} alt={`${project.title[locale]} preview`} width={900} height={640} />
                </div>
              ) : (
                <div className="case-visual case-text-visual" aria-hidden="true">
                  <div>
                    <strong>{project.title[locale]}</strong>
                    <span>{project.short[locale]}</span>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
