import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ManajerDashboardClient from './ManajerDashboardClient'

export default async function ManajerPage() {
  const user = await getSession()
  if (!user) redirect('/login')
  if (!['MANAJER', 'PEMDA', 'PUSAT'].includes(user.peran)) redirect('/kasir')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} title="Dashboard Koperasi" />
      <ManajerDashboardClient user={user} />
    </div>
  )
}
