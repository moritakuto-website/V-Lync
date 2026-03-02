import { NextRequest, NextResponse } from 'next/server'
import { generateUnsubscribeToken } from '@/utils/unsubscribe-token'

export const dynamic = 'force-dynamic'

// NOTE: DEV-ONLY。本番ではこのルートを削除またはCRON_SECRET等で保護する。
export async function GET(req: NextRequest) {
    const email = req.nextUrl.searchParams.get('email') ?? ''

    if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'email query param required (e.g. ?email=foo@example.com)' }, { status: 400 })
    }

    const token = generateUnsubscribeToken(email)
    const unsubUrl = `${req.nextUrl.origin}/unsubscribe?token=${token}`

    return NextResponse.json({ email, token, unsubUrl })
}
