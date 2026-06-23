import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import PusatDashboardClient from './PusatDashboardClient'

export default async function PusatPage() {
  const user = await getSession()
  if (!user) redirect('/login')
  if (!['PUSAT', 'PEMDA'].includes(user.peran)) redirect('/manajer')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} title="Control Tower — Integritas Distribusi Nasional" />
      <PusatDashboardClient user={user} />
    </div>
  )
}
