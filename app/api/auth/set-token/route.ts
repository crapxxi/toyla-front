import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  const res = NextResponse.json({ ok: true })
  res.cookies.set('toyla_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: Number(process.env.JWT_COOKIE_MAX_AGE ?? 86400),
    path: '/',
  })
  return res
}
