import React from 'react'
import { Document, Page, StyleSheet, Text, View, renderToFile } from '@react-pdf/renderer'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
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
  page: { padding: 34, fontFamily: 'Helvetica', fontSize: 9.2, color: '#17201a', lineHeight: 1.35 },
  header: { borderBottomWidth: 1, borderBottomColor: '#8d4d3f', paddingBottom: 10, marginBottom: 12 },
  name: { fontSize: 22, fontFamily: 'Helvetica-Bold', lineHeight: 1.05 },
  title: { fontSize: 11.5, color: '#31594c', lineHeight: 1.2, marginTop: 4, marginBottom: 5 },
  contact: { fontSize: 8.4, color: '#48574e' },
  section: { marginTop: 10 },
  sectionTitle: {
    fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: '#8d4d3f',
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 5
  },
  row: { marginBottom: 7 },
  role: { fontFamily: 'Helvetica-Bold', fontSize: 9.5 },
  meta: { color: '#667168', fontSize: 8.4, marginBottom: 2 },
  bullet: { marginLeft: 8, marginBottom: 1.5 },
  skills: { color: '#31594c' },
  link: { color: '#31594c', textDecoration: 'none' },
  footer: { position: 'absolute', bottom: 18, left: 34, right: 34, fontSize: 7.5, color: '#778078' }
})

const h = React.createElement
const pdfText = (value) => String(value).replace(/[\u2011\u2013\u2014]/g, '-')
const monthLabel = (value) => {
  if (!value) return 'Present'
  const [year, month] = value.split('-')
  return `${month}/${year}`
}

const bulletList = (items) =>
  items.map((item, index) => h(Text, { key: index, style: styles.bullet }, `- ${pdfText(item)}`))

function CvDocument({ variant }) {
  const selectedProjects = variant.projectIds
    .map((id) => projects.find((project) => project.id === id))
    .filter(Boolean)
    .slice(0, 3)

  return h(Document, null,
    h(Page, { size: 'A4', style: styles.page },
      h(View, { style: styles.header },
        h(Text, { style: styles.name }, pdfText(profile.shortName)),
        h(Text, { style: styles.title }, pdfText(variant.label.en)),
        h(Text, { style: styles.contact },
          `${profile.location.city}, ${profile.location.country} · ${profile.email} · ${profile.phone}`
        ),
        h(Text, { style: styles.contact },
          `${profile.linkedin} · ${profile.github}`
        )
      ),
      h(View, null,
        h(Text, { style: styles.sectionTitle }, 'Professional summary'),
        h(Text, null, profile.positioning.en),
        h(Text, { style: [styles.skills, { marginTop: 4 }] }, variant.prioritySkills.join(' · '))
      ),
      h(View, { style: styles.section },
        h(Text, { style: styles.sectionTitle }, 'Experience'),
        ...experiences.map((experience) =>
          h(View, { key: experience.id, style: styles.row },
            h(Text, { style: styles.role }, pdfText(`${experience.company} - ${experience.role.en}`)),
            h(Text, { style: styles.meta }, pdfText(`${monthLabel(experience.start)} - ${monthLabel(experience.end)} · ${experience.industry.en}`)),
            ...bulletList(experience.highlights.en)
          )
        )
      ),
      h(View, { style: styles.section },
        h(Text, { style: styles.sectionTitle }, 'Selected work'),
        ...selectedProjects.map((project) =>
          h(View, { key: project.id, style: styles.row },
            h(Text, { style: styles.role }, project.title.en),
            h(Text, null, project.outcome.en),
            h(Text, { style: styles.skills }, project.stack.join(' · '))
          )
        )
      ),
      h(View, { style: styles.section },
        h(Text, { style: styles.sectionTitle }, 'Education & credentials'),
        ...education.education.map((item) =>
          h(View, { key: item.institution, style: styles.row },
            h(Text, { style: styles.role }, pdfText(`${item.title.en} - ${item.institution}`)),
            h(Text, { style: styles.meta }, pdfText(`${monthLabel(item.start)} - ${monthLabel(item.end)} · ${item.status.en}`))
          )
        ),
        h(Text, null, education.certifications.map((item) => item.name).join(' · '))
      ),
      h(View, { style: styles.section },
        h(Text, { style: styles.sectionTitle }, 'Languages & work authorization'),
        h(Text, null, profile.languages.map((item) => `${item.name.en}: ${item.level.en}`).join(' · ')),
        h(Text, { style: { marginTop: 3 } }, profile.workAuthorization.text.en)
      ),
      h(Text, { style: styles.footer },
        `Generated from the portfolio's canonical content · reviewed ${profile.lastReviewed}`
      )
    )
  )
}

await mkdir(path.join(root, 'public', 'cv'), { recursive: true })

for (const variant of variants) {
  const output = path.join(root, 'public', variant.file.replace(/^\//, ''))
  await renderToFile(h(CvDocument, { variant }), output)
  console.log(`Generated ${variant.file}`)
}
