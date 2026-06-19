import React from 'react'
import { Document, Page, StyleSheet, Text, View, renderToFile } from '@react-pdf/renderer'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const locales = ['es', 'en', 'fr']

const localeLabels = {
  es: {
    summary: 'Resumen profesional',
    experience: 'Experiencia',
    selectedWork: 'Casos destacados',
    education: 'Formacion y credenciales',
    languages: 'Idiomas',
    current: 'Actualidad',
    focus: 'Areas clave',
    intermediate: 'Titulo intermedio',
    capstone: 'Proyecto final',
    achievement: 'Logro destacado',
    updated: 'Actualizado'
  },
  en: {
    summary: 'Professional summary',
    experience: 'Experience',
    selectedWork: 'Selected work',
    education: 'Education and credentials',
    languages: 'Languages',
    current: 'Present',
    focus: 'Focus areas',
    intermediate: 'Intermediate credential',
    capstone: 'Capstone project',
    achievement: 'Featured achievement',
    updated: 'Updated'
  },
  fr: {
    summary: 'Resume professionnel',
    experience: 'Experience',
    selectedWork: 'Cas selectionnes',
    education: 'Formation et certifications',
    languages: 'Langues',
    current: "Aujourd'hui",
    focus: 'Axes cles',
    intermediate: 'Titre intermediaire',
    capstone: 'Projet final',
    achievement: 'Realisation notable',
    updated: 'Mis a jour'
  }
}

const monthFormatters = {
  es: new Intl.DateTimeFormat('es-UY', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
  en: new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
  fr: new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

const readJson = async (file) =>
  JSON.parse(await readFile(path.join(root, 'content', 'data', file), 'utf8'))

const [profile, experiences, projects, education, variants] = await Promise.all([
  readJson('profile.json'),
  readJson('experience.json'),
  readJson('projects.json'),
  readJson('education.json'),
  readJson('cvVariants.json')
])

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 9, color: '#17201a', lineHeight: 1.34 },
  header: { borderBottomWidth: 1, borderBottomColor: '#8d4d3f', paddingBottom: 10, marginBottom: 12 },
  name: { fontSize: 21, fontFamily: 'Helvetica-Bold', lineHeight: 1.05 },
  headline: { fontSize: 11, color: '#31594c', lineHeight: 1.2, marginTop: 4 },
  title: { fontSize: 10.2, color: '#8d4d3f', lineHeight: 1.2, marginTop: 3, marginBottom: 5 },
  contact: { fontSize: 8.2, color: '#48574e', marginBottom: 1.5 },
  section: { marginTop: 10 },
  sectionTitle: {
    fontSize: 10.2,
    fontFamily: 'Helvetica-Bold',
    color: '#8d4d3f',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 5
  },
  row: { marginBottom: 7 },
  role: { fontFamily: 'Helvetica-Bold', fontSize: 9.4 },
  meta: { color: '#667168', fontSize: 8.2, marginBottom: 2 },
  body: { marginBottom: 3 },
  bullet: { marginLeft: 8, marginBottom: 1.4 },
  skills: { color: '#31594c', marginTop: 4 },
  footer: { position: 'absolute', bottom: 16, left: 30, right: 30, fontSize: 7.4, color: '#778078' }
})

const h = React.createElement
const pdfText = (value) => String(value).replace(/[\u2011\u2013\u2014]/g, '-')
const bulletList = (items) =>
  items.map((item, index) => h(Text, { key: index, style: styles.bullet }, `- ${pdfText(item)}`))

const monthLabel = (value, locale) => {
  if (!value) return localeLabels[locale].current
  const [year, month] = value.split('-').map(Number)
  return monthFormatters[locale].format(new Date(Date.UTC(year, month - 1, 1)))
}

function CvDocument({ variant, locale }) {
  const labels = localeLabels[locale]
  const selectedProjects = variant.projectIds
    .map((id) => projects.find((project) => project.id === id))
    .filter(Boolean)
    .slice(0, 4)

  const certifications = [...education.certifications]
    .sort((a, b) => b.date.localeCompare(a.date))

  return h(Document, null,
    h(Page, { size: 'A4', style: styles.page },
      h(View, { style: styles.header },
        h(Text, { style: styles.name }, pdfText(profile.shortName)),
        h(Text, { style: styles.headline }, pdfText(profile.headline[locale])),
        h(Text, { style: styles.title }, pdfText(variant.label[locale])),
        h(Text, { style: styles.contact },
          `${profile.location.display[locale]} | ${profile.email} | ${profile.phone}`
        ),
        h(Text, { style: styles.contact },
          `${profile.linkedin} | ${profile.website} | ${profile.github}`
        )
      ),
      h(View, null,
        h(Text, { style: styles.sectionTitle }, labels.summary),
        h(Text, { style: styles.body }, pdfText(variant.pitch[locale])),
        h(Text, null, pdfText(profile.summary[locale])),
        h(Text, { style: styles.skills }, variant.prioritySkills.join(' | '))
      ),
      h(View, { style: styles.section },
        h(Text, { style: styles.sectionTitle }, labels.experience),
        ...experiences.map((experience) =>
          h(View, { key: experience.id, style: styles.row },
            h(Text, { style: styles.role }, pdfText(`${experience.company} - ${experience.role[locale]}`)),
            h(Text, {
              style: styles.meta
            }, pdfText(`${monthLabel(experience.start, locale)} - ${monthLabel(experience.end, locale)} | ${experience.location} | ${experience.industry[locale]}`)),
            h(Text, { style: styles.body }, pdfText(experience.summary[locale])),
            ...bulletList(experience.highlights[locale])
          )
        )
      ),
      h(Text, { style: styles.footer }, `${labels.updated}: ${profile.lastReviewed}`)
    ),
    h(Page, { size: 'A4', style: styles.page },
      h(View, { style: styles.section },
        h(Text, { style: styles.sectionTitle }, labels.selectedWork),
        ...selectedProjects.map((project) =>
          h(View, { key: project.id, style: styles.row },
            h(Text, { style: styles.role }, pdfText(project.title[locale])),
            h(Text, { style: styles.body }, pdfText(project.outcome[locale])),
            h(Text, { style: styles.skills }, project.stack.join(' | '))
          )
        )
      ),
      h(View, { style: styles.section },
        h(Text, { style: styles.sectionTitle }, labels.education),
        ...education.education.map((item) =>
          h(View, { key: item.institution, style: styles.row },
            h(Text, { style: styles.role }, pdfText(`${item.title[locale]} - ${item.institution}`)),
            h(Text, { style: styles.meta }, pdfText(`${monthLabel(item.start, locale)} - ${monthLabel(item.end, locale)} | ${item.status[locale]}`)),
            h(Text, { style: styles.body }, pdfText(item.description[locale])),
            h(Text, { style: styles.meta }, `${labels.focus}: ${item.focusAreas[locale].join(', ')}`),
            h(Text, { style: styles.meta }, `${labels.intermediate}: ${item.intermediateCredential[locale]}`),
            h(Text, { style: styles.meta }, `${labels.capstone}: ${item.capstone.name} - ${item.capstone.description[locale]}`)
          )
        ),
        ...certifications.map((item) =>
          h(View, { key: item.name, style: styles.row },
            h(Text, { style: styles.role }, pdfText(item.name)),
            h(Text, { style: styles.meta }, pdfText(`${monthLabel(item.date, locale)} | ${item.issuer}`)),
            h(Text, null, pdfText(item.description[locale]))
          )
        ),
        h(View, { style: styles.row },
          h(Text, { style: styles.role }, pdfText(`${labels.achievement}: ${education.achievement.title[locale]}`)),
          h(Text, { style: styles.meta }, pdfText(monthLabel(education.achievement.date, locale))),
          h(Text, null, pdfText(education.achievement.description[locale]))
        )
      ),
      h(View, { style: styles.section },
        h(Text, { style: styles.sectionTitle }, labels.languages),
        h(Text, null, profile.languages.map((item) => `${item.name[locale]}: ${item.level[locale]}`).join(' | '))
      ),
      h(Text, { style: styles.footer }, `${labels.updated}: ${profile.lastReviewed}`)
    )
  )
}

await mkdir(path.join(root, 'public', 'cv'), { recursive: true })

for (const variant of variants) {
  for (const locale of locales) {
    const output = path.join(root, 'public', variant.files[locale].replace(/^\//, ''))
    await renderToFile(h(CvDocument, { variant, locale }), output)
    console.log(`Generated ${variant.files[locale]}`)
  }
}
