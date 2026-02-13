import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, CheckCircle2, Clock, XCircle } from 'lucide-react'

export async function DashboardStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch queue stats
    let queuedCount = 0
    let todaySkippedCount = 0

    if (user) {
        // Count queued items (processing)
        const { count: queued } = await supabase
            .from('sending_queue')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'queued')

        queuedCount = queued || 0

        // Count today's skipped items
        const today = new Date().toISOString().split('T')[0]
        const { count: skipped } = await supabase
            .from('sending_queue')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'skipped')
            .gte('created_at', `${today}T00:00:00`)
            .lt('created_at', `${today}T23:59:59`)

        todaySkippedCount = skipped || 0
    }

    return (
        <div className="space-y-3">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            本日 自動送信数
                        </CardTitle>
                        <Send className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent className="pt-1">
                        <div className="text-3xl font-bold text-gray-900">0<span className="text-xl text-gray-400 font-normal"> / 100</span></div>
                        <p className="text-xs text-gray-500 mt-2">
                            プラン上限まで残り 100通
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            今月 自動送信済み
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent className="pt-1">
                        <div className="text-3xl font-bold text-gray-900">0</div>
                        <p className="text-xs text-gray-500 mt-2">
                            先月比 +0%
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            現在処理中の送信
                        </CardTitle>
                        <Clock className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent className="pt-1">
                        <div className="text-3xl font-bold text-gray-900">{queuedCount}</div>
                        <p className="text-xs text-gray-500 mt-2">
                            キュー待機中
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            本日スキップされた送信
                        </CardTitle>
                        <XCircle className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent className="pt-1">
                        <div className="text-3xl font-bold text-gray-900">{todaySkippedCount}</div>
                        <p className="text-xs text-gray-500 mt-2">
                            除外・配信停止など
                        </p>
                    </CardContent>
                </Card>
            </div>
            <p className="text-[10px] text-gray-400 text-center pt-1">
                ※この数値は設定に基づき自動更新されます
            </p>
        </div>
    )
}
