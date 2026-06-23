import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/mock-db'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 })
    }

    const user = await getUserByEmail(email)

    // Mock auth: password check langsung (produksi: bcrypt.compare)
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    const { password: _, ...safeUser } = user
    const token = await signToken(safeUser)

    const res = NextResponse.json({ user: safeUser, token })
    res.cookies.set('ts_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 jam
      path: '/',
    })

    return res
  } catch (err) {
    console.error('Auth error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('ts_session')
  return res
}
