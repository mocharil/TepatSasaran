import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TepatSasaran — Rel Transparansi KDMP',
  description: 'Sistem verifikasi hak dan peta keadilan distribusi untuk Koperasi Desa/Kelurahan Merah Putih',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link href="https://unpkg.com/maplibre-gl@4/dist/maplibre-gl.css" rel="stylesheet" />
      </head>
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
