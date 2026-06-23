import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function PemdaPage() {
  const user = await getSession()
  if (!user) redirect('/login')
  if (user.peran !== 'PEMDA') redirect('/login')
  // Pemda lihat Control Tower + Peta
  redirect('/pusat')
}
