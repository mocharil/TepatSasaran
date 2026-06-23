'use client'

import { useEffect, useState } from 'react'
import type { Anomali, User } from '@/types'
import { formatDate } from '@/lib/utils'
import { tipeLabel } from '@/lib/anomaly'
import AiText from '@/components/AiText'

async function requestAiExplanation(anomali: Anomali): Promise<string> {
  const konteks = `Tipe: ${anomali.tipe}
Severity: ${anomali.severity}
Deskripsi: ${anomali.deskripsi}
Transaksi ID: ${anomali.transaksiId ?? '-'}
Waktu: ${anomali.createdAt}`

  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ konteks, tipe: 'ANOMALI_EXPLAINER' }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'AI error')
  return data.result as string
}

interface Props { user: User }

const TIPE_COLOR: Record<string, string> = {
  INCLUSION_ERROR: 'bg-red-100 text-red-800 border-red-200',
  OVER_KUOTA: 'bg-orange-100 text-orange-800 border-orange-200',
  MARKUP_HET: 'bg-amber-100 text-amber-800 border-amber-200',
  GHOST_RECIPIENT: 'bg-purple-100 text-purple-800 border-purple-200',
  EXCLUSION_ERROR: 'bg-blue-100 text-blue-800 border-blue-200',
  BLANK_SPOT: 'bg-gray-100 text-gray-800 border-gray-200',
}

const SEVERITY_ICON: Record<string, string> = {
  KRITIS: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🟢',
}

export default function AnomalyListClient({ user }: Props) {
  const [anomali, setAnomali] = useState<Anomali[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({})
  const [aiResult, setAiResult] = useState<Record<string, string>>({})

  const koperasiId = user.koperasiId

  useEffect(() => {
    const url = koperasiId ? `/api/anomali?koperasiId=${koperasiId}` : '/api/anomali'
    fetch(url)
      .then((r) => r.json())
      .then((d) => { setAnomali(d.anomali ?? []); setLoading(false) })
  }, [koperasiId])

  const filtered = filter === 'ALL' ? anomali : anomali.filter((a) => a.tipe === filter)

  async function handleAiExplain(a: Anomali) {
    setAiLoading((prev) => ({ ...prev, [a.id]: true }))
    try {
      const text = await requestAiExplanation(a)
      setAiResult((prev) => ({ ...prev, [a.id]: text }))
    } catch (e) {
      setAiResult((prev) => ({ ...prev, [a.id]: `Gagal mendapat penjelasan AI: ${e instanceof Error ? e.message : 'error'}` }))
    } finally {
      setAiLoading((prev) => ({ ...prev, [a.id]: false }))
    }
  }

  const counts = anomali.reduce<Record<string, number>>((acc, a) => {
    acc[a.tipe] = (acc[a.tipe] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Anomali</p>
          <p className="text-2xl font-black text-gray-900">{anomali.length}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 shadow-sm">
          <p className="text-xs text-red-600">Kebocoran Subsidi</p>
          <p className="text-2xl font-black text-red-700">{counts['INCLUSION_ERROR'] ?? 0}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 shadow-sm">
          <p className="text-xs text-amber-600">Markup HET</p>
          <p className="text-2xl font-black text-amber-700">{counts['MARKUP_HET'] ?? 0}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'INCLUSION_ERROR', 'OVER_KUOTA', 'MARKUP_HET', 'GHOST_RECIPIENT', 'EXCLUSION_ERROR', 'BLANK_SPOT'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              filter === t ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
            }`}
          >
            {t === 'ALL' ? 'Semua' : tipeLabel(t as Anomali['tipe'])}
            {t !== 'ALL' && counts[t] ? ` (${counts[t]})` : ''}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading && <p className="text-gray-400 text-sm">Memuat...</p>}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p className="text-4xl mb-2">✅</p>
            <p className="text-gray-600 font-medium">Tidak ada anomali {filter !== 'ALL' ? `tipe ${tipeLabel(filter as Anomali['tipe'])}` : ''}</p>
          </div>
        )}
        {filtered.map((a) => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">{SEVERITY_ICON[a.severity]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TIPE_COLOR[a.tipe]}`}>
                    {tipeLabel(a.tipe)}
                  </span>
                  <span className="text-xs text-gray-400">{a.severity}</span>
                  {a.resolved && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Resolved</span>
                  )}
                </div>
                <p className="text-sm text-gray-800 font-medium">{a.deskripsi}</p>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-xs text-gray-400">{formatDate(a.createdAt)}</p>
                  {a.transaksiId && (
                    <p className="text-xs text-gray-400">Trx: {a.transaksiId.slice(0, 12)}...</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {!a.resolved && (
                  <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    Tindak Lanjut
                  </button>
                )}
                <button
                  onClick={() => aiResult[a.id] ? setAiResult((p) => { const n = {...p}; delete n[a.id]; return n }) : handleAiExplain(a)}
                  disabled={aiLoading[a.id]}
                  className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2 py-1 rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  {aiLoading[a.id] ? '⏳ AI...' : aiResult[a.id] ? '▲ Tutup AI' : '✨ Tanya AI'}
                </button>
              </div>
            </div>

            {/* AI Explanation Panel */}
            {aiResult[a.id] && (
              <div className="mt-3 pt-3 border-t border-purple-100 bg-purple-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-purple-700">✨ Analisis AI Gemini</span>
                  <span className="text-xs text-purple-400">gemini-2.5-flash</span>
                </div>
                <AiText text={aiResult[a.id]} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
