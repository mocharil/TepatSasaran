'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { User } from '@/types'
import { formatRupiah, skorRisikoColor } from '@/lib/utils'

interface Props { user: User }

interface KoperasiItem {
  id: string; nama: string; lat: number; lng: number
  status: string; skorRisiko: number; anomaliCount: number; warna: string; label: string
}
interface DesaItem {
  id: string; nama: string; lat: number; lng: number
  indeksKemiskinan: number; jumlahPenduduk: number
}
interface PetaData {
  koperasi: KoperasiItem[]
  desa: DesaItem[]
  analitik: {
    kabupaten: string; totalKoperasi: number; koperasiAktif: number
    nilaiTepatSasaran: number; nilaiKebocoran: number; nilaiKebocoranRupiah: number
    exclusionError: string[]; blankSpot: string[]
  }
  stats: {
    totalAnomali: number; anomaliUnresolved: number
    koperasiBerisiko: number; blankSpotCount: number; exclusionCount: number
  }
}

type LayerKey = 'semua' | 'risiko' | 'blankspot' | 'exclusion'

const LAYER_INFO: Record<LayerKey, { label: string; desc: string; icon: string }> = {
  semua:     { label: 'Semua', desc: 'Tampilkan semua koperasi & titik', icon: '🗺️' },
  risiko:    { label: 'Risiko Tinggi', desc: 'Koperasi skor risiko ≥70', icon: '🔴' },
  blankspot: { label: 'Blank Spot', desc: 'Desa tanpa koperasi', icon: '⚫' },
  exclusion: { label: 'Exclusion Error', desc: 'Warga miskin tak terlayani', icon: '🟠' },
}

export default function PetaKeadilanClient({ user: _user }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<{ el: HTMLElement; koperasiId?: string; desaId?: string; tipe: string }[]>([])
  const [data, setData] = useState<PetaData | null>(null)
  const [selected, setSelected] = useState<KoperasiItem | null>(null)
  const [layer, setLayer] = useState<LayerKey>('semua')
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    fetch('/api/peta').then((r) => r.json()).then(setData)
  }, [])

  // Apply layer filter to markers
  useEffect(() => {
    markersRef.current.forEach(({ el, tipe }) => {
      let visible = false
      switch (layer) {
        case 'semua': visible = true; break
        case 'risiko': visible = tipe === 'koperasi-high'; break
        case 'blankspot': visible = tipe === 'blank_spot'; break
        case 'exclusion': visible = tipe === 'blank_spot' || tipe === 'koperasi-high'; break
      }
      el.style.display = visible ? 'flex' : 'none'
    })
  }, [layer])

  const buildMap = useCallback(() => {
    if (!data || !mapRef.current || mapReady) return

    import('maplibre-gl').then((mod) => {
      const maplibregl = mod.default

      const map = new maplibregl.Map({
        container: mapRef.current!,
        style: {
          version: 8,
          sources: {
            osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OSM' },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        },
        center: [110.5974, -7.7075],
        zoom: 11,
        attributionControl: false,
      })

      map.on('load', () => {
        setMapReady(true)

        // ── Koperasi markers ──────────────────────────────────────────────
        data.koperasi.forEach((kop) => {
          const isHigh = kop.skorRisiko >= 70
          const warna = kop.warna ?? skorRisikoColor(kop.skorRisiko)

          const wrapper = document.createElement('div')
          wrapper.style.cssText = 'position:relative; width:40px; height:40px; cursor:pointer'

          // Pulse ring for high risk
          if (isHigh) {
            const ring = document.createElement('div')
            ring.style.cssText = `
              position:absolute; inset:0; border-radius:50%;
              background:${warna}; opacity:0.35;
              animation: pulse-ring 1.5s cubic-bezier(0.215,0.61,0.355,1) infinite;
            `
            wrapper.appendChild(ring)
          }

          const dot = document.createElement('div')
          dot.style.cssText = `
            position:absolute; inset:4px; border-radius:50%;
            background:${warna}; border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
            display:flex; align-items:center; justify-content:center;
            color:white; font-weight:bold; font-size:12px;
            transition:transform 0.15s;
          `
          dot.textContent = isHigh ? '!' : kop.anomaliCount > 0 ? String(kop.anomaliCount) : '✓'
          wrapper.appendChild(dot)

          wrapper.addEventListener('mouseenter', () => { dot.style.transform = 'scale(1.25)' })
          wrapper.addEventListener('mouseleave', () => { dot.style.transform = 'scale(1)' })
          wrapper.addEventListener('click', () => setSelected(kop))

          const marker = new maplibregl.Marker({ element: wrapper })
            .setLngLat([kop.lng, kop.lat])
            .addTo(map)

          markersRef.current.push({
            el: marker.getElement(),
            koperasiId: kop.id,
            tipe: isHigh ? 'koperasi-high' : 'koperasi-ok',
          })
        })

        // ── Blank spot markers ────────────────────────────────────────────
        const blankIds = new Set(data.analitik.blankSpot)
        data.desa.filter((d) => blankIds.has(d.id)).forEach((d) => {
          const el = document.createElement('div')
          el.style.cssText = `
            width:32px; height:32px; border-radius:50%;
            background:#1f2937; border:2px dashed #6b7280;
            display:flex; align-items:center; justify-content:center;
            color:#9ca3af; font-size:16px; cursor:pointer;
            box-shadow:0 2px 6px rgba(0,0,0,0.4);
          `
          el.textContent = '⊘'

          const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(`
            <div style="font:13px/1.4 sans-serif; min-width:190px; padding:2px">
              <div style="font-weight:700; color:#111; margin-bottom:4px">⚫ Blank Spot</div>
              <div style="font-weight:600; font-size:14px">${d.nama}</div>
              <div style="color:#6b7280; margin:4px 0">${d.jumlahPenduduk.toLocaleString('id-ID')} jiwa · Kemiskinan ${(d.indeksKemiskinan*100).toFixed(0)}%</div>
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:6px;color:#dc2626;font-size:12px">
                Warga miskin di sini <strong>tidak terlayani</strong> koperasi mana pun — Exclusion Error
              </div>
            </div>
          `)

          el.addEventListener('click', () => popup.addTo(map))

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([d.lng, d.lat])
            .setPopup(popup)
            .addTo(map)

          markersRef.current.push({ el: marker.getElement(), desaId: d.id, tipe: 'blank_spot' })
        })
      })

      return () => { map.remove(); markersRef.current = [] }
    })
  }, [data, mapReady])

  useEffect(() => { buildMap() }, [buildMap])

  // ─── Sidebar Stats ──────────────────────────────────────────────────────────
  const analitik = data?.analitik
  const stats = data?.stats

  return (
    <div className="flex-1 flex flex-col lg:flex-row" style={{ minHeight: 'calc(100vh - 88px)' }}>

      {/* ── Sidebar ── */}
      <aside className="w-full lg:w-72 bg-gray-900 text-white flex-shrink-0 overflow-y-auto">
        <div className="p-4 space-y-5">

          {/* KPI chips */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '🎯', val: analitik ? `${(analitik.nilaiTepatSasaran*100).toFixed(0)}%` : '—', label: 'Tepat Sasaran', green: true },
              { icon: '🛡️', val: analitik ? formatRupiah(analitik.nilaiKebocoranRupiah) : '—', label: 'Dicegah' },
              { icon: '🚨', val: stats?.totalAnomali ?? '—', label: 'Anomali', red: true },
              { icon: '⊘', val: stats?.blankSpotCount ?? '—', label: 'Blank Spot', red: true },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl p-3 ${s.red ? 'bg-red-900/40 border border-red-800' : 'bg-gray-800'}`}>
                <div className="text-lg">{s.icon}</div>
                <div className={`font-black text-sm ${s.green ? 'text-green-400' : s.red ? 'text-red-400' : 'text-white'}`}>{s.val}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Layer toggle */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Layer Peta</p>
            <div className="space-y-1">
              {(Object.entries(LAYER_INFO) as [LayerKey, typeof LAYER_INFO[LayerKey]][]).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setLayer(key)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    layer === key ? 'bg-green-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span>{info.icon}</span>
                  <div>
                    <div className="font-medium">{info.label}</div>
                    <div className="text-xs opacity-60">{info.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Koperasi list */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Koperasi ({data?.koperasi.length ?? 0})</p>
            <div className="space-y-1.5">
              {data?.koperasi.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setSelected(k)}
                  className={`w-full text-left bg-gray-800 hover:bg-gray-700 rounded-lg p-2.5 transition-colors ${selected?.id === k.id ? 'ring-1 ring-green-400' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: k.warna }} />
                    <p className="text-xs font-medium text-white truncate leading-tight">{k.nama}</p>
                  </div>
                  <div className="flex gap-2 mt-1 text-xs text-gray-400">
                    <span>Skor <span style={{ color: k.warna }} className="font-bold">{k.skorRisiko}</span></span>
                    <span>·</span>
                    <span>{k.anomaliCount} anomali</span>
                    <span>·</span>
                    <span className={k.status === 'AKTIF' ? 'text-green-400' : 'text-red-400'}>{k.status}</span>
                  </div>
                </button>
              ))}

              {/* Blank spot desa */}
              <div className="bg-gray-800 rounded-lg p-2.5 border border-dashed border-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">⊘</span>
                  <div>
                    <p className="text-xs font-medium text-gray-300">Desa Karanganom</p>
                    <p className="text-xs text-gray-500">BLANK SPOT · 2.340 jiwa tak terlayani</p>
                    <p className="text-xs text-red-400">Kemiskinan 31%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legenda */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Legenda</p>
            <div className="space-y-1.5">
              {[
                { bg: '#dc2626', border: 'white', label: 'Risiko Tinggi (skor ≥70)', pulse: true },
                { bg: '#d97706', border: 'white', label: 'Risiko Sedang (skor 40–69)' },
                { bg: '#16a34a', border: 'white', label: 'Baik (skor <40)' },
                { bg: '#1f2937', border: '#6b7280', label: 'Blank Spot / Exclusion Error', dashed: true },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="relative w-4 h-4 flex-shrink-0">
                    {l.pulse && <div className="absolute inset-0 rounded-full opacity-40 animate-ping" style={{ background: l.bg }} />}
                    <div className="relative w-4 h-4 rounded-full" style={{
                      background: l.bg,
                      border: `2px ${l.dashed ? 'dashed' : 'solid'} ${l.border}`,
                    }} />
                  </div>
                  <span className="text-xs text-gray-300">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data source */}
          <div className="bg-blue-900/30 border border-blue-800 rounded-xl p-3">
            <p className="text-xs text-blue-300 font-semibold mb-1">Sumber Data</p>
            <p className="text-xs text-blue-200 leading-relaxed">
              Sintetis DTSEN + PODES BPS + batas BIG. Adapter siap ke API resmi saat diadopsi Kemenkop (patuh UU PDP).
            </p>
          </div>
        </div>
      </aside>

      {/* ── Map ── */}
      <div className="flex-1 relative min-h-96">
        <div ref={mapRef} className="absolute inset-0" />

        {/* Selected koperasi card */}
        {selected && (
          <div className="absolute top-4 right-4 bg-white rounded-2xl shadow-2xl p-4 w-64 z-10 border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-gray-900 text-sm leading-tight">{selected.nama}</p>
                <p className={`text-xs mt-0.5 font-semibold ${selected.status === 'AKTIF' ? 'text-green-600' : 'text-red-600'}`}>
                  ● {selected.status}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-600 ml-1">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Skor Risiko</span>
                  <span className="font-black text-xl" style={{ color: selected.warna }}>
                    {selected.skorRisiko}<span className="text-sm text-gray-400">/100</span>
                  </span>
                </div>
                <div className="bg-gray-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all"
                    style={{ width: `${selected.skorRisiko}%`, background: selected.warna }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-b border-gray-100">
                <span className="text-xs text-gray-500">Anomali Terdeteksi</span>
                <span className={`font-bold text-lg ${selected.anomaliCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {selected.anomaliCount}
                </span>
              </div>

              <div className={`text-xs font-semibold rounded-lg py-2 px-3 text-center ${
                selected.skorRisiko >= 70 ? 'bg-red-50 text-red-700' :
                selected.skorRisiko >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
              }`}>
                {selected.label}
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {!mapReady && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-20">
            <div className="text-center text-white">
              <div className="text-5xl mb-3 animate-pulse">🗺️</div>
              <p className="font-semibold text-lg">Memuat Peta Keadilan Distribusi</p>
              <p className="text-gray-400 text-sm mt-1">Kabupaten Klaten, Jawa Tengah</p>
            </div>
          </div>
        )}

        {/* Bottom bar */}
        {mapReady && analitik && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-white/90 backdrop-blur rounded-xl shadow-lg p-3 flex gap-4 text-xs border border-gray-100">
            <div>
              <span className="text-gray-500">Tepat Sasaran</span>
              <span className="ml-1 font-black text-green-700">{(analitik.nilaiTepatSasaran*100).toFixed(0)}%</span>
            </div>
            <div>
              <span className="text-gray-500">Kebocoran</span>
              <span className="ml-1 font-black text-red-600">{(analitik.nilaiKebocoran*100).toFixed(0)}%</span>
            </div>
            <div>
              <span className="text-gray-500">Dicegah</span>
              <span className="ml-1 font-black text-blue-700">{formatRupiah(analitik.nilaiKebocoranRupiah)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
