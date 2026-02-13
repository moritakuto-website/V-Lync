import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { verifyUnsubscribeToken, normalizeEmail } from '@/utils/unsubscribe-token'

export default async function UnsubscribePage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const client_id = searchParams.client_id as string
    const email = searchParams.email as string
    const token = searchParams.token as string

    if (!client_id || !email || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <CardTitle>無効なリンクです</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground">
                        URLが正しくありません。メール内のリンクを再度ご確認ください。
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Normalize email and verify token
    const normalizedEmail = normalizeEmail(email)
    let isTokenValid = false

    try {
        isTokenValid = verifyUnsubscribeToken(client_id, normalizedEmail, token)
    } catch (error) {
        console.error('Token verification error:', error)
        isTokenValid = false
    }

    if (!isTokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <CardTitle>無効なリンクです</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground">
                        このリンクは無効です。セキュリティトークンが一致しません。
                    </CardContent>
                </Card>
            </div>
        )
    }

    const supabase = await createClient()

    // Record unsubscribe with verified token
    const { error } = await supabase
        .from('unsubscribes')
        .upsert({
            user_id: client_id,
            email: normalizedEmail,
            token: token,
            created_at: new Date().toISOString()
        }, { onConflict: 'user_id, email' })

    const isSuccess = !error

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
                            <p className="font-medium">{normalizedEmail} への配信を停止しました。</p>
                            <p className="mt-3 text-sm">このクライアントからの配信のみ停止されました。</p>
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
