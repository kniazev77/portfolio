import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/content'

export function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }, { lang: 'fr' }]
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  return children
}
