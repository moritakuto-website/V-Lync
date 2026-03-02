import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { verifyUnsubscribeTokenDetailed } from '@/utils/unsubscribe-token'

type SP = { token?: string;[key: string]: string | string[] | undefined }

export default async function UnsubscribePage({
    searchParams,
}: {
    searchParams: Promise<SP>
}) {
    const sp = await searchParams
    const token = typeof sp.token === 'string' ? sp.token.trim() : ''

    // ── searchParams診断 ──────────────────────────────────────────────────────
    console.debug('[unsub:page]', JSON.stringify({
        stage: 'searchParams',
        hasToken: token.length > 0,
        tokenLen: token.length,
        spKeys: Object.keys(sp),
    }))

    if (!token) {
        return <InvalidLink message="URLが正しくありません。メール内のリンクを再度ご確認ください。" reason="missing_token" />
    }

    // ── Token検証 ─────────────────────────────────────────────────────────────
    const result = verifyUnsubscribeTokenDetailed(token)

    if (!result.ok) {
        return <InvalidLink
            message="このリンクは無効または期限切れです。"
            reason={result.reason}
        />
    }

    const email = result.email

    // ── DB Insert ─────────────────────────────────────────────────────────────
    const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // べき等: 既に登録済みなら成功扱い
    const { data: existing } = await supabase
        .from('unsubscribes')
        .select('email')
        .eq('email', email)
        .limit(1)
        .maybeSingle()

    let isSuccess = true
    if (!existing) {
        const { error } = await supabase
            .from('unsubscribes')
            .insert({ email, token, created_at: new Date().toISOString() })

        if (error) {
            console.debug('[unsub:page]', JSON.stringify({ stage: 'db_insert', error: error.message }))
            isSuccess = false
        } else {
            console.debug('[unsub:page]', JSON.stringify({ stage: 'db_insert', status: 'ok' }))
        }
    } else {
        console.debug('[unsub:page]', JSON.stringify({ stage: 'db_insert', status: 'already_exists' }))
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    {isSuccess ? (
                        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    ) : (
                        <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    )}
                    <CardTitle>{isSuccess ? '配信停止しました' : 'エラーが発生しました'}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    {isSuccess ? (
                        <div>
                            <p className="font-medium">{email} への配信を停止しました。</p>
                            <p className="mt-3 text-sm">今後このアドレスへの送信はスキップされます。</p>
                            <p className="mt-2 text-xs">ご利用ありがとうございました。</p>
                        </div>
                    ) : (
                        <p>処理中にエラーが発生しました。<br />時間をおいて再度お試しください。</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

// ── Error UI ──────────────────────────────────────────────────────────────────
function InvalidLink({ message, reason }: { message: string; reason: string }) {
    // reason はサーバーログ済みなのでここでは表示しない
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <CardTitle>無効なリンクです</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    {message}
                </CardContent>
            </Card>
        </div>
    )
}
