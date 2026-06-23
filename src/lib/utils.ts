import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function keputusanColor(keputusan: string) {
  switch (keputusan) {
    case 'BOLEH': return 'text-green-600 bg-green-50 border-green-200'
    case 'TOLAK': return 'text-red-600 bg-red-50 border-red-200'
    case 'WARNING': return 'text-amber-600 bg-amber-50 border-amber-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function keputusanIcon(keputusan: string) {
  switch (keputusan) {
    case 'BOLEH': return '✓'
    case 'TOLAK': return '✕'
    case 'WARNING': return '⚠'
    default: return '?'
  }
}

export function skorRisikoColor(skor: number) {
  if (skor >= 70) return '#dc2626'
  if (skor >= 40) return '#d97706'
  if (skor >= 20) return '#65a30d'
  return '#16a34a'
}
