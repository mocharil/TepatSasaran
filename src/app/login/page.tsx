'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_ACCOUNTS = [
  { email: 'kasir@bentangan.id', password: 'demo1234', role: 'Kasir Gerai', icon: '🏪', path: '/kasir' },
  { email: 'manajer@bentangan.id', password: 'demo1234', role: 'Manajer Koperasi', icon: '📊', path: '/manajer' },
  { email: 'pemda@klaten.go.id', password: 'demo1234', role: 'Dinas Kab. Klaten', icon: '🏛️', path: '/pemda' },
  { email: 'admin@kemenkop.go.id', password: 'demo1234', role: 'Admin Kemenkop (Control Tower)', icon: '🗺️', path: '/pusat' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Login gagal')
      return
    }

    // Arahkan ke halaman sesuai peran
    const peran = data.user.peran
    const paths: Record<string, string> = {
      KASIR: '/kasir',
      MANAJER: '/manajer',
      PEMDA: '/pemda',
      PUSAT: '/pusat',
    }
    router.push(paths[peran] ?? '/')
  }

  function quickLogin(acc: typeof DEMO_ACCOUNTS[0]) {
    setEmail(acc.email)
    setPassword(acc.password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-3xl font-bold text-white">TepatSasaran</h1>
          <p className="text-green-200 mt-1 text-sm">Rel Transparansi Distribusi KDMP</p>
          <div className="mt-2 text-xs text-green-300 bg-green-900/50 rounded-full px-3 py-1 inline-block">
            Kab. Klaten · Hackathon Demo
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Demo quick-login */}
          <div className="bg-amber-50 border-b border-amber-100 p-4">
            <p className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wide">Demo — Pilih Peran</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => quickLogin(acc)}
                  className="text-left text-xs border border-amber-200 rounded-lg p-2 hover:bg-amber-100 transition-colors"
                >
                  <span className="mr-1">{acc.icon}</span>
                  <span className="font-medium text-amber-900">{acc.role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kasir@bentangan.id"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="demo1234"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          <div className="px-6 pb-4 text-center">
            <p className="text-xs text-gray-400">
              Data warga bersifat sintetis · Patuh UU PDP · Adapter siap terhubung DTSEN
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
