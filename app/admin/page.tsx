import AdminClient from '@/components/admin/AdminClient'

export const metadata = {
  title: 'Portfolio CMS',
  robots: { index: false, follow: false }
}

export default function AdminPage() {
  return <AdminClient />
}
