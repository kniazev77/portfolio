import type { MetadataRoute } from 'next'
import { projects } from '@/lib/content'

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kniazev77.vercel.app'
  const locales = ['es', 'en', 'fr']
  return [
    ...locales.map((locale) => ({
      url: `${site}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: locale === 'en' ? 1 : 0.9
    })),
    ...locales.flatMap((locale) =>
      projects.map((project) => ({
        url: `${site}/${locale}/projects/${project.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7
      }))
    )
  ]
}
