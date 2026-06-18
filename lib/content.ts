import profileJson from '@/content/data/profile.json'
import experienceJson from '@/content/data/experience.json'
import educationJson from '@/content/data/education.json'
import projectsJson from '@/content/data/projects.json'
import cvVariantsJson from '@/content/data/cvVariants.json'
import {
  cvVariantsSchema,
  educationSchema,
  experienceSchema,
  profileSchema,
  projectsSchema,
  type FocusId,
  type Locale
} from '@/lib/schema'

export const profile = profileSchema.parse(profileJson)
export const experiences = experienceSchema.parse(experienceJson)
export const education = educationSchema.parse(educationJson)
export const projects = projectsSchema.parse(projectsJson)
export const cvVariants = cvVariantsSchema.parse(cvVariantsJson)

export const isLocale = (value: string): value is Locale =>
  ['es', 'en', 'fr'].includes(value)

export const isFocus = (value?: string): value is FocusId =>
  Boolean(value && ['delivery', 'software', 'data'].includes(value))

export const localize = <T extends Record<Locale, string>>(value: T, locale: Locale) =>
  value[locale]

export const getFocus = (value?: string): FocusId => (isFocus(value) ? value : 'delivery')

export const sortProjectsByFocus = (focus: FocusId) =>
  [...projects].sort((a, b) => {
    const focusDelta = Number(b.focus.includes(focus)) - Number(a.focus.includes(focus))
    if (focusDelta !== 0) return focusDelta
    return Number(b.featured) - Number(a.featured)
  })

export const getProject = (slug: string) => projects.find((project) => project.slug === slug)

export const getCvVariant = (focus: FocusId) =>
  cvVariants.find((variant) => variant.id === focus) ?? cvVariants[0]
