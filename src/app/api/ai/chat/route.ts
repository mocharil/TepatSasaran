import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { callGemini, SYSTEM_KOPDES } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { konteks, tipe } = body as { konteks: string; tipe: string }

    if (!konteks || typeof konteks !== 'string') {
      return NextResponse.json({ error: 'konteks wajib diisi' }, { status: 400 })
    }

    let systemPrompt = SYSTEM_KOPDES
    let prompt = ''

    switch (tipe) {
      case 'ANOMALI_EXPLAINER':
        prompt = `Analisis anomali berikut dan berikan:
1. Penjelasan singkat (2-3 kalimat) apa yang terjadi dan mengapa ini berbahaya
2. Dampak potensial terhadap program subsidi
3. Langkah penanganan yang disarankan (3-5 poin)

Data anomali:
${konteks}

Jawab dalam Bahasa Indonesia yang mudah dipahami pengurus koperasi desa.`
        break

      case 'DISTRIBUSI_INSIGHT':
        prompt = `Berdasarkan data distribusi subsidi berikut, berikan:
1. Ringkasan kondisi distribusi (2-3 kalimat)
2. Temuan paling penting / perlu perhatian segera
3. Rekomendasi kebijakan konkret (3-5 poin)
4. Prediksi risiko 1 bulan ke depan jika tidak ada tindakan

Data:
${konteks}

Jawab dalam Bahasa Indonesia. Format dengan jelas menggunakan nomor/poin.`
        break

      case 'KASIR_HELPER':
        prompt = `Transaksi warga ditolak/perlu peringatan. Berikan penjelasan kepada kasir:
1. Alasan penolakan dalam bahasa yang mudah dipahami (1-2 kalimat)
2. Apa yang harus disampaikan kasir kepada warga (1-2 kalimat, sopan)
3. Apakah ada alternatif/solusi? (jika ada)

Data transaksi:
${konteks}

Jawab singkat, praktis, dalam Bahasa Indonesia.`
        break

      default:
        prompt = konteks
    }

    const result = await callGemini(prompt, systemPrompt)
    return NextResponse.json({ result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'AI error'
    console.error('[AI Chat]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
