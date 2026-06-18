import type { FocusId, Locale } from '@/lib/schema'
import { labels } from '@/lib/i18n'

const content = {
  delivery: {
    title: { es: 'Delivery y AMOA', en: 'Delivery and business analysis', fr: 'Delivery et AMOA' },
    text: {
      es: 'Cadrado de necesidades, priorización, coordinación, validación, puesta en producción y soporte.',
      en: 'Requirements framing, prioritization, coordination, validation, production release and support.',
      fr: 'Cadrage des besoins, priorisation, coordination, validation, mise en production et support.'
    }
  },
  software: {
    title: { es: 'Software e integraciones', en: 'Software and integrations', fr: 'Logiciel et intégrations' },
    text: {
      es: 'C#, .NET, WPF, SQL Server, APIs y servicios que conectan sistemas reales.',
      en: 'C#, .NET, WPF, SQL Server, APIs and services connecting real systems.',
      fr: 'C#, .NET, WPF, SQL Server, APIs et services qui connectent des systèmes réels.'
    }
  },
  data: {
    title: { es: 'Data y automatización', en: 'Data and automation', fr: 'Data et automatisation' },
    text: {
      es: 'Python, BigQuery, calidad de datos y reporting para reducir fricción operativa.',
      en: 'Python, BigQuery, data quality and reporting to reduce operational friction.',
      fr: 'Python, BigQuery, qualité des données et reporting pour réduire la friction opérationnelle.'
    }
  }
}

export function Capabilities({ locale, focus }: { locale: Locale; focus: FocusId }) {
  const t = labels[locale]
  const ordered = (['delivery', 'software', 'data'] as FocusId[]).sort(
    (a, b) => Number(b === focus) - Number(a === focus)
  )
  return (
    <section className="section" id="capabilities">
      <div className="container">
        <p className="section-kicker">{t.capabilities}</p>
        <h2 className="section-title">{t.capabilitiesIntro}</h2>
        <div className="capability-grid">
          {ordered.map((id, index) => (
            <article className="capability" key={id}>
              <span className="capability-number">0{index + 1}</span>
              <h3>{content[id].title[locale]}</h3>
              <p>{content[id].text[locale]}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
