'use client'

import { useEffect, useState } from 'react'
import type { User, JenisBarang, Warga, Keputusan } from '@/types'
import { formatRupiah, keputusanColor, keputusanIcon } from '@/lib/utils'
import AiText from '@/components/AiText'

interface Props { user: User }

interface ItemRow {
  jenisBarangId: string
  jumlah: number
  hargaSatuan: number
}

interface EntitlementResult {
  keputusan: Keputusan
  alasan: string | null
  desilLabel: string | null
  kuotaInfo: string | null
  warga: { nama: string; desil: number; eligible: boolean } | null
}

interface TransaksiResult {
  transaksi: { id: string; totalHarga: number; keputusan: Keputusan }
  entitlement: EntitlementResult
  anomaliDetected: number
}

export default function TransaksiClient({ user }: Props) {
  const [step, setStep] = useState<'NIK' | 'ITEMS' | 'RESULT'>('NIK')
  const [nik, setNik] = useState('')
  const [wargaData, setWargaData] = useState<Warga | null>(null)
  const [nikLoading, setNikLoading] = useState(false)
  const [nikError, setNikError] = useState('')
  const [barangList, setBarangList] = useState<JenisBarang[]>([])
  const [items, setItems] = useState<ItemRow[]>([{ jenisBarangId: '', jumlah: 1, hargaSatuan: 0 }])
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<TransaksiResult | null>(null)
  const [aiTip, setAiTip] = useState<string>('')
  const [aiTipLoading, setAiTipLoading] = useState(false)

  useEffect(() => {
    fetch('/api/barang').then((r) => r.json()).then((d) => setBarangList(d.barang ?? []))
  }, [])

  async function checkNIK() {
    if (nik.length < 16) { setNikError('NIK harus 16 digit'); return }
    setNikLoading(true); setNikError('')
    const res = await fetch(`/api/warga?nik=${nik}`)
    const data = await res.json()
    setNikLoading(false)
    if (!res.ok) { setNikError(data.error ?? 'NIK tidak ditemukan'); return }
    setWargaData(data)
    setStep('ITEMS')
  }

  function setItemField(idx: number, field: keyof ItemRow, value: string | number) {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item
      const updated = { ...item, [field]: value }
      if (field === 'jenisBarangId') {
        const barang = barangList.find((b) => b.id === value)
        updated.hargaSatuan = barang?.het ?? 0
      }
      return updated
    }))
  }

  function addItem() {
    setItems((prev) => [...prev, { jenisBarangId: '', jumlah: 1, hargaSatuan: 0 }])
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const totalEstimasi = items.reduce((sum, item) => sum + item.jumlah * item.hargaSatuan, 0)

  async function submit() {
    if (!user.koperasiId) return
    if (items.some((i) => !i.jenisBarangId)) { alert('Pilih semua jenis barang'); return }

    setSubmitting(true)
    const res = await fetch('/api/transaksi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        koperasiId: user.koperasiId,
        nik,
        items: items.map((i) => ({
          jenisBarangId: i.jenisBarangId,
          jumlah: i.jumlah,
          hargaSatuan: i.hargaSatuan,
        })),
      }),
    })
    const data = await res.json()
    setSubmitting(false)
    setResult(data)
    setStep('RESULT')
  }

  function reset() {
    setStep('NIK'); setNik(''); setWargaData(null); setNikError('')
    setItems([{ jenisBarangId: '', jumlah: 1, hargaSatuan: 0 }])
    setResult(null); setAiTip(''); setAiTipLoading(false)
  }

  async function askAiHelper(r: TransaksiResult) {
    setAiTipLoading(true)
    const konteks = `Keputusan: ${r.entitlement.keputusan}
Nama warga: ${r.entitlement.warga?.nama ?? '-'}
Desil: ${r.entitlement.warga?.desil ?? '-'} (${r.entitlement.desilLabel ?? '-'})
Alasan penolakan: ${r.entitlement.alasan ?? '-'}
Info kuota: ${r.entitlement.kuotaInfo ?? '-'}
Anomali terdeteksi: ${r.anomaliDetected}`
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ konteks, tipe: 'KASIR_HELPER' }),
      })
      const data = await res.json()
      setAiTip(res.ok ? (data.result as string) : `Error: ${data.error}`)
    } catch (e) {
      setAiTip(`Gagal terhubung ke AI: ${e instanceof Error ? e.message : 'error'}`)
    } finally {
      setAiTipLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['NIK', 'ITEMS', 'RESULT'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === s ? 'bg-green-600 text-white' : i < ['NIK','ITEMS','RESULT'].indexOf(step) ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-500'}`}>
              {i + 1}
            </div>
            <span className="text-xs text-gray-500 hidden sm:block">{s === 'NIK' ? 'Scan NIK' : s === 'ITEMS' ? 'Pilih Barang' : 'Hasil'}</span>
            {i < 2 && <span className="text-gray-300">—</span>}
          </div>
        ))}
      </div>

      {/* Step 1: NIK */}
      {step === 'NIK' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">1. Masukkan NIK Penerima</h2>
          <p className="text-sm text-gray-500">NIK akan diverifikasi ke DTSEN untuk cek hak penerima subsidi.</p>

          <div className="space-y-3">
            <input
              type="text"
              value={nik}
              onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
              placeholder="Contoh: 3310010001000001"
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* Demo NIK hints */}
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              <p className="font-semibold mb-1">NIK Demo Klaten:</p>
              <div className="space-y-1">
                <button onClick={() => setNik('3310010001000001')} className="block hover:underline text-left">
                  ✓ 3310010001000001 → Siti Rahayu (Desil 2, petani) — BOLEH
                </button>
                <button onClick={() => setNik('3310010001000002')} className="block hover:underline text-left">
                  ✕ 3310010001000002 → Budi Hartono (Desil 9) — DITOLAK
                </button>
                <button onClick={() => setNik('3310010001000004')} className="block hover:underline text-left">
                  ⚠ 3310010001000004 → Sri Wahyuni (kuota habis) — WARNING
                </button>
              </div>
            </div>

            {nikError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{nikError}</div>
            )}

            <button
              onClick={checkNIK}
              disabled={nikLoading || nik.length < 16}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {nikLoading ? 'Memeriksa DTSEN...' : 'Cek Hak Penerima'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Pilih Barang */}
      {step === 'ITEMS' && wargaData && (
        <div className="space-y-4">
          {/* Warga info card */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-green-900 text-lg">{wargaData.nama}</p>
                <p className="text-sm text-green-700">NIK: {wargaData.nik}</p>
                <p className="text-sm text-green-700">{wargaData.profesi} · Desil {wargaData.desil}</p>
              </div>
              <div className="bg-green-100 rounded-lg px-3 py-1 text-xs font-semibold text-green-800">
                Terdaftar DTSEN
              </div>
            </div>
            {wargaData.kuotaPupuk > 0 && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs text-green-700">
                  Kuota pupuk: <span className="font-bold">{wargaData.kuotaPupukSisa} / {wargaData.kuotaPupuk} kg</span> tersisa
                </p>
                <div className="mt-1 bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${(wargaData.kuotaPupukSisa / wargaData.kuotaPupuk) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Item rows */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
            <h2 className="font-bold text-gray-900">2. Pilih Barang</h2>

            {items.map((item, idx) => {
              const barang = barangList.find((b) => b.id === item.jenisBarangId)
              return (
                <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={item.jenisBarangId}
                      onChange={(e) => setItemField(idx, 'jenisBarangId', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Pilih barang...</option>
                      {barangList.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.nama} {b.isSubsidi ? '🏷️' : ''} — HET Rp {b.het.toLocaleString('id-ID')}/{b.satuan}
                        </option>
                      ))}
                    </select>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-lg">✕</button>
                    )}
                  </div>

                  {barang && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Jumlah ({barang.satuan})</label>
                        <input
                          type="number"
                          min={1}
                          value={item.jumlah}
                          onChange={(e) => setItemField(idx, 'jumlah', parseInt(e.target.value) || 1)}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Harga/satuan (Rp)</label>
                        <input
                          type="number"
                          value={item.hargaSatuan}
                          onChange={(e) => setItemField(idx, 'hargaSatuan', parseInt(e.target.value) || 0)}
                          className={`w-full border rounded px-2 py-1.5 text-sm ${item.hargaSatuan > (barang?.het ?? 0) ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {item.hargaSatuan > (barang?.het ?? 0) && (
                          <p className="text-xs text-red-500 mt-0.5">⚠ Di atas HET Rp {barang.het.toLocaleString('id-ID')}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <button onClick={addItem} className="text-sm text-green-600 hover:text-green-800 font-medium">
              + Tambah barang
            </button>
          </div>

          {/* Total & submit */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 text-sm">Estimasi Total</span>
              <span className="text-xl font-bold text-gray-900">{formatRupiah(totalEstimasi)}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('NIK')} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                ← Kembali
              </button>
              <button
                onClick={submit}
                disabled={submitting || items.some((i) => !i.jenisBarangId)}
                className="flex-2 flex-grow bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                {submitting ? 'Memproses...' : 'Proses Transaksi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: RESULT */}
      {step === 'RESULT' && result && (
        <div className="space-y-4">
          {/* Keputusan utama */}
          <div className={`rounded-2xl border-2 p-6 text-center ${keputusanColor(result.entitlement.keputusan)}`}>
            <div className="text-6xl mb-3">{keputusanIcon(result.entitlement.keputusan)}</div>
            <h2 className="text-3xl font-black tracking-tight">
              {result.entitlement.keputusan === 'BOLEH' && 'TRANSAKSI DIIZINKAN'}
              {result.entitlement.keputusan === 'TOLAK' && 'TRANSAKSI DITOLAK'}
              {result.entitlement.keputusan === 'WARNING' && 'PERINGATAN'}
            </h2>
            {result.entitlement.warga && (
              <p className="mt-2 font-semibold text-lg">{result.entitlement.warga.nama}</p>
            )}
            {result.entitlement.desilLabel && (
              <p className="text-sm opacity-80">{result.entitlement.desilLabel}</p>
            )}
            {result.entitlement.alasan && (
              <div className="mt-4 bg-white/60 rounded-xl p-3 text-sm text-left">
                <p className="font-semibold mb-1">Alasan:</p>
                <p className="leading-relaxed">{result.entitlement.alasan}</p>
              </div>
            )}
            {result.entitlement.kuotaInfo && (
              <p className="mt-2 text-xs opacity-70">{result.entitlement.kuotaInfo}</p>
            )}
          </div>

          {/* Anomali terdeteksi */}
          {result.anomaliDetected > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="font-semibold text-orange-800">⚠ {result.anomaliDetected} anomali terdeteksi & dicatat</p>
              <p className="text-sm text-orange-700 mt-1">
                Anomali ini dikirim ke dashboard manajer & peta Control Tower Kemenkop secara real-time.
              </p>
            </div>
          )}

          {/* AI Kasir Helper — tampil saat TOLAK atau WARNING */}
          {(result.entitlement.keputusan === 'TOLAK' || result.entitlement.keputusan === 'WARNING') && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-purple-800">✨ Bantuan Kasir — Apa yang harus saya sampaikan?</p>
                {!aiTip && (
                  <button
                    onClick={() => askAiHelper(result)}
                    disabled={aiTipLoading}
                    className="text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    {aiTipLoading ? '⏳...' : 'Tanya AI'}
                  </button>
                )}
              </div>
              {aiTip ? (
                <AiText text={aiTip} />
              ) : (
                <p className="text-xs text-purple-600">Klik &quot;Tanya AI&quot; untuk mendapat panduan cara menjelaskan penolakan ini kepada warga.</p>
              )}
            </div>
          )}

          {/* Total */}
          {result.entitlement.keputusan !== 'TOLAK' && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex justify-between items-center">
              <span className="text-gray-600">Total Pembayaran</span>
              <span className="text-2xl font-bold text-gray-900">{formatRupiah(result.transaksi.totalHarga)}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors">
              Transaksi Baru
            </button>
            <a href="/kasir" className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 text-center flex items-center justify-center">
              Kembali ke Beranda
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
