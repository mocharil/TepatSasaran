import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import TransaksiClient from './TransaksiClient'

export default async function TransaksiPage() {
  const user = await getSession()
  if (!user) redirect('/login')
  if (user.peran !== 'KASIR') redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} title="Transaksi Baru — Verifikasi Hak Penerima Subsidi" />
      <TransaksiClient user={user} />
    </div>
  )
}
