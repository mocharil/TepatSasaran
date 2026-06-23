import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AnomalyListClient from './AnomalyListClient'

export default async function AnomalyPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} title="Pusat Anomali — Deteksi Kebocoran Real-Time" />
      <AnomalyListClient user={user} />
    </div>
  )
}
