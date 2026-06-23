'use client'

import { useRouter } from 'next/navigation'
import type { User } from '@/types'

interface NavbarProps {
  user: User
  title: string
}

const PERAN_LABEL: Record<string, string> = {
  KASIR: 'Kasir Gerai',
  MANAJER: 'Manajer Koperasi',
  PEMDA: 'Dinas Kab/Kota',
  PUSAT: 'Admin Kemenkop',
}

const NAV_LINKS: Record<string, { href: string; label: string }[]> = {
  KASIR: [
    { href: '/kasir', label: '🏠 Beranda' },
    { href: '/kasir/transaksi', label: '🪪 Transaksi Baru' },
  ],
  MANAJER: [
    { href: '/manajer', label: '📊 Dashboard' },
    { href: '/manajer/anomali', label: '🚩 Anomali' },
  ],
  PEMDA: [
    { href: '/pemda', label: '📊 Dashboard Wilayah' },
    { href: '/pusat/peta', label: '🗺️ Peta' },
  ],
  PUSAT: [
    { href: '/pusat', label: '📊 Control Tower' },
    { href: '/pusat/peta', label: '🗺️ Peta Keadilan' },
  ],
}

export default function Navbar({ user, title }: NavbarProps) {
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
  }

  const links = NAV_LINKS[user.peran] ?? []

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <span className="font-bold text-gray-900 text-sm">TepatSasaran</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-xs font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-md transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-gray-900">{user.nama}</p>
              <p className="text-xs text-gray-400">{PERAN_LABEL[user.peran]}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
              {user.nama[0]}
            </div>
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
      {title && (
        <div className="bg-gray-50 border-t border-gray-100 px-4 sm:px-6 lg:px-8 py-2">
          <h1 className="text-sm font-semibold text-gray-700">{title}</h1>
        </div>
      )}
    </nav>
  )
}
