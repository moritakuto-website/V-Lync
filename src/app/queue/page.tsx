import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Send, XCircle, CheckCircle } from "lucide-react"

export default async function QueuePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch queue items for current user
    const { data: queueItems } = await supabase
        .from('sending_queue')
        .select(`
            *,
            leads (
                company_name,
                email
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
        return date.toLocaleString('ja-JP', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"><CheckCircle className="h-3 w-3 mr-1" />送信完了</Badge>
            case 'queued':
                return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0"><Clock className="h-3 w-3 mr-1" />待機中</Badge>
            case 'sending':
                return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0"><Send className="h-3 w-3 mr-1" />送信中</Badge>
            case 'skipped':
                return <Badge className="bg-gray-500 hover:bg-gray-600 text-white border-0"><XCircle className="h-3 w-3 mr-1" />スキップ</Badge>
            default:
                return <Badge variant="outline" className="border-gray-300">{status}</Badge>
        }
    }

    const getSkipReasonText = (reason: string | null) => {
        if (!reason) return '-'
        switch (reason) {
            case 'opt-out':
                return '配信停止済み'
            case 'no_email':
                return 'メールアドレス未設定'
            case 'reply_to_missing':
                return 'Reply-To未設定'
            default:
                return reason
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">送信キュー</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        送信予定・送信済みのメールを確認できます
                    </p>
                </div>
            </div>

            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                    <CardTitle className="text-base font-semibold text-gray-900">キュー一覧</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                        全 {queueItems?.length || 0} 件
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {!queueItems || queueItems.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <Send className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                            <p className="text-base font-medium text-gray-900">送信キューは空です</p>
                            <p className="text-sm text-gray-500 mt-2">キャンペーンを作成すると、ここに表示されます。</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50/50">
                                        <th className="text-left px-4 py-3 font-medium text-xs text-gray-600 uppercase tracking-wider">送信先</th>
                                        <th className="text-left px-4 py-3 font-medium text-xs text-gray-600 uppercase tracking-wider">ステータス</th>
                                        <th className="text-left px-4 py-3 font-medium text-xs text-gray-600 uppercase tracking-wider">スキップ理由</th>
                                        <th className="text-left px-4 py-3 font-medium text-xs text-gray-600 uppercase tracking-wider">予定時刻</th>
                                        <th className="text-left px-4 py-3 font-medium text-xs text-gray-600 uppercase tracking-wider">処理時刻</th>
                                        <th className="text-left px-4 py-3 font-medium text-xs text-gray-600 uppercase tracking-wider">Campaign ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {queueItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.leads?.company_name || '(会社名なし)'}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {item.leads?.email || '(メールアドレスなし)'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {getSkipReasonText(item.skip_reason)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500">
                                                {formatDateTime(item.scheduled_at)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500">
                                                {formatDateTime(item.sent_at)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                                                    {item.campaign_id ? item.campaign_id.substring(0, 8) + '...' : '-'}
                                                </code>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
