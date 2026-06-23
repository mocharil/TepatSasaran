import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { User } from '@/types'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'tepatsasaran-dev-secret-change-in-production'
)

export async function signToken(user: User): Promise<string> {
  return new SignJWT({ id: user.id, email: user.email, peran: user.peran, koperasiId: user.koperasiId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return {
      id: payload.id as string,
      email: payload.email as string,
      nama: payload.nama as string ?? '',
      peran: payload.peran as User['peran'],
      koperasiId: payload.koperasiId as string | null,
    }
  } catch {
    return null
  }
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('ts_session')?.value
  if (!token) return null
  return verifyToken(token)
}
