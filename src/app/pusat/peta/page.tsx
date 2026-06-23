import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import PetaKeadilanClient from './PetaKeadilanClient'

export default async function PetaPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      <Navbar user={user} title="🗺️ Peta Keadilan Distribusi — Kabupaten Klaten" />
      <PetaKeadilanClient user={user} />
    </div>
  )
}
