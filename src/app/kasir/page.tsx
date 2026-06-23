import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import KasirDashboardClient from './KasirDashboardClient'

export default async function KasirPage() {
  const user = await getSession()
  if (!user) redirect('/login')
  if (user.peran !== 'KASIR') redirect(`/${user.peran.toLowerCase()}`)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} title="Beranda Kasir" />
      <KasirDashboardClient user={user} />
    </div>
  )
}
