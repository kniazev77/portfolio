import { z } from 'zod'

export const localized = z.object({
  es: z.string().min(1),
  en: z.string().min(1),
  fr: z.string().min(1)
})

const month = z.string().regex(/^\d{4}-\d{2}$/)
const url = z.string().url()

export const schemas = {
  'profile.json': z.object({
    name: z.string().min(1),
    shortName: z.string().min(1),
    headline: localized,
    positioning: localized,
    summary: localized,
    location: z.object({ city: z.string(), country: z.string(), display: localized }),
    availability: localized,
    workAuthorization: z.object({ expires: z.iso.date(), text: localized }),
    email: z.email(),
    phone: z.string().min(8),
    linkedin: url,
    github: url,
    languages: z.array(z.object({ code: z.string(), name: localized, level: localized })).min(1),
    proofPoints: z.array(z.object({ value: z.string(), label: localized })).length(3),
    lastReviewed: z.iso.date()
  }),
  'experience.json': z.array(z.object({
    id: z.string(), company: z.string(), industry: localized, role: localized,
    start: month, end: month.nullable(), location: z.string(), summary: localized,
    highlights: z.object({ es: z.array(z.string()), en: z.array(z.string()), fr: z.array(z.string()) }),
    tags: z.array(z.string())
  })),
  'education.json': z.object({
    education: z.array(z.object({
      institution: z.string(), location: z.string(), start: month, end: month,
      title: localized, status: localized, url
    })),
    certifications: z.array(z.object({
      name: z.string(), issuer: z.string(), status: z.enum(['completed', 'in-progress']), url
    })),
    achievement: z.object({ date: month, title: localized, description: localized, url })
  }),
  'projects.json': z.array(z.object({
    id: z.string(), slug: z.string().regex(/^[a-z0-9-]+$/), featured: z.boolean(),
    focus: z.array(z.enum(['delivery', 'software', 'data'])).min(1),
    status: localized, title: localized, short: localized, problem: localized,
    contribution: localized, outcome: localized, stack: z.array(z.string()).min(1),
    media: z.array(z.string()), links: z.array(z.object({ label: z.string(), url }))
  })),
  'cvVariants.json': z.array(z.object({
    id: z.enum(['delivery', 'software', 'data']), label: localized,
    file: z.string().startsWith('/cv/').endsWith('.pdf'),
    prioritySkills: z.array(z.string()).min(1), projectIds: z.array(z.string()).min(1)
  })).length(3)
}
