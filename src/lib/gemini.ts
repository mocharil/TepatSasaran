// Gemini AI via Vertex AI (Google Cloud)
// Auth: Service Account (GOOGLE_APPLICATION_CREDENTIALS atau inline JSON)
// Model: gemini-2.5-flash

import { GoogleAuth } from 'google-auth-library'
import path from 'path'

const PROJECT_ID = process.env.GEMINI_PROJECT_ID ?? 'paper-ds-production'
const LOCATION = process.env.GEMINI_LOCATION ?? 'us-central1'
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash'

const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`

// Inisialisasi auth — pakai GOOGLE_APPLICATION_CREDENTIALS (path ke file SA)
function getAuth(): GoogleAuth {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (credPath) {
    const resolvedPath = path.resolve(process.cwd(), credPath)
    return new GoogleAuth({
      keyFilename: resolvedPath,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
  }
  // Fallback: GOOGLE_SERVICE_ACCOUNT_JSON (untuk Vercel env var)
  const jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (jsonStr) {
    return new GoogleAuth({
      credentials: JSON.parse(jsonStr),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
  }
  // Default: Application Default Credentials
  return new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] })
}

interface GeminiResponse {
  candidates: Array<{
    content: { parts: Array<{ text: string }> }
    finishReason: string
  }>
}

export async function callGemini(prompt: string, systemPrompt?: string): Promise<string> {
  const auth = getAuth()
  const client = await auth.getClient()
  const tokenResponse = await client.getAccessToken()
  const token = tokenResponse.token

  const body = {
    system_instruction: systemPrompt
      ? { parts: [{ text: systemPrompt }] }
      : undefined,
    contents: [
      { role: 'user', parts: [{ text: prompt }] },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      topP: 0.95,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    ],
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${err.slice(0, 300)}`)
  }

  const data: GeminiResponse = await res.json()
  return data.candidates[0]?.content?.parts[0]?.text ?? '(respons kosong)'
}

// ─── System prompts per konteks ─────────────────────────────────────────────

export const SYSTEM_KOPDES = `Kamu adalah asisten AI untuk aplikasi TepatSasaran — sistem pengawasan distribusi barang bersubsidi di Koperasi Desa/Kelurahan Merah Putih (KDMP) Indonesia.

Konteks program:
- KDMP menyalurkan pupuk subsidi, LPG 3kg, beras SPHP, bansos kepada warga berhak
- Kelayakan berdasarkan DTSEN (Data Tunggal Sosial Ekonomi Nasional), desil 1-7 berhak subsidi
- Kuota pupuk diatur RDKK (Rencana Definitif Kebutuhan Kelompok)
- HET = Harga Eceran Tertinggi yang tidak boleh dilampaui kasir

Gaya respons:
- Bahasa Indonesia yang jelas, mudah dipahami pengurus koperasi desa
- Langsung ke poin, tidak bertele-tele
- Jika ada masalah, berikan rekomendasi tindakan konkret
- Gunakan kata ganti "Anda" untuk pengurus koperasi`
