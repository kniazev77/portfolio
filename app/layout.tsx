import type { Metadata } from 'next'
import { headers } from 'next/headers'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kniazev77.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Juan Kniazev - Technical Project Manager & Software Engineer',
    template: '%s - Juan Kniazev'
  },
  description: 'ERP delivery, .NET integrations, data automation and end-to-end product work.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg'
  },
  openGraph: {
    type: 'website',
    title: 'Juan Kniazev - Technical Project Manager & Software Engineer',
    description: 'ERP delivery, .NET integrations, data automation and end-to-end product work.'
  }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers()
  const lang = requestHeaders.get('x-portfolio-locale') ?? 'en'

  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  )
}
