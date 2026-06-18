import { z } from 'zod'

export const locales = ['es', 'en', 'fr'] as const
export const focusIds = ['delivery', 'software', 'data'] as const

export type Locale = (typeof locales)[number]
export type FocusId = (typeof focusIds)[number]

export const localizedSchema = z.object({
  es: z.string().min(1),
  en: z.string().min(1),
  fr: z.string().min(1)
})

const urlSchema = z.string().url()
const monthSchema = z.string().regex(/^\d{4}-\d{2}$/)

export const profileSchema = z.object({
  name: z.string().min(1),
  shortName: z.string().min(1),
  headline: localizedSchema,
  positioning: localizedSchema,
  summary: localizedSchema,
  location: z.object({
    city: z.string().min(1),
    country: z.string().min(1),
    display: localizedSchema
  }),
  availability: localizedSchema,
  workAuthorization: z.object({
    expires: z.iso.date(),
    text: localizedSchema
  }),
  email: z.email(),
  phone: z.string().min(8),
  linkedin: urlSchema,
  github: urlSchema,
  languages: z.array(
    z.object({
      code: z.string().min(2),
      name: localizedSchema,
      level: localizedSchema
    })
  ).min(1),
  proofPoints: z.array(z.object({ value: z.string().min(1), label: localizedSchema })).length(3),
  lastReviewed: z.iso.date()
})

export const experienceSchema = z.array(
  z.object({
    id: z.string().min(1),
    company: z.string().min(1),
    industry: localizedSchema,
    role: localizedSchema,
    start: monthSchema,
    end: monthSchema.nullable(),
    location: z.string().min(1),
    summary: localizedSchema,
    highlights: z.object({
      es: z.array(z.string().min(1)).min(1),
      en: z.array(z.string().min(1)).min(1),
      fr: z.array(z.string().min(1)).min(1)
    }),
    tags: z.array(z.string().min(1)).min(1)
  })
)

export const educationSchema = z.object({
  education: z.array(
    z.object({
      institution: z.string().min(1),
      location: z.string().min(1),
      start: monthSchema,
      end: monthSchema,
      title: localizedSchema,
      status: localizedSchema,
      url: urlSchema
    })
  ),
  certifications: z.array(
    z.object({
      name: z.string().min(1),
      issuer: z.string().min(1),
      status: z.enum(['completed', 'in-progress']),
      url: urlSchema
    })
  ),
  achievement: z.object({
    date: monthSchema,
    title: localizedSchema,
    description: localizedSchema,
    url: urlSchema
  })
})

const projectLinkSchema = z.object({ label: z.string().min(1), url: urlSchema })

export const projectsSchema = z.array(
  z.object({
    id: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    featured: z.boolean(),
    focus: z.array(z.enum(focusIds)).min(1),
    status: localizedSchema,
    title: localizedSchema,
    short: localizedSchema,
    problem: localizedSchema,
    contribution: localizedSchema,
    outcome: localizedSchema,
    stack: z.array(z.string().min(1)).min(1),
    media: z.array(z.string().min(1)),
    links: z.array(projectLinkSchema)
  })
)

export const cvVariantsSchema = z.array(
  z.object({
    id: z.enum(focusIds),
    label: localizedSchema,
    file: z.string().startsWith('/cv/').endsWith('.pdf'),
    prioritySkills: z.array(z.string().min(1)).min(1),
    projectIds: z.array(z.string().min(1)).min(1)
  })
).length(3)

export const contentFileSchemas = {
  'profile.json': profileSchema,
  'experience.json': experienceSchema,
  'education.json': educationSchema,
  'projects.json': projectsSchema,
  'cvVariants.json': cvVariantsSchema
} as const

export type Profile = z.infer<typeof profileSchema>
export type Experience = z.infer<typeof experienceSchema>[number]
export type Education = z.infer<typeof educationSchema>
export type Project = z.infer<typeof projectsSchema>[number]
export type CvVariant = z.infer<typeof cvVariantsSchema>[number]
