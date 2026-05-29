import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ ok: false, error: 'missing token' }, { status: 400 })
  const cookieStore = await cookies()
  cookieStore.set('toyla_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: Number(process.env.JWT_COOKIE_MAX_AGE ?? 86400),
    path: '/',
  })
  return NextResponse.json({ ok: true })
}
