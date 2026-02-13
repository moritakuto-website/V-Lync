import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, Send, Calendar, RefreshCcw } from "lucide-react"
import { getNextSendingTime, formatNextSendingTime } from "@/utils/schedule-calculator"

export function RecentActivity({ settings, logs }: { settings: any, logs: any[] }) {
    // Formatting helper
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    }

    // Calculate next sending time using schedule calculator
    let nextSchedule = "未設定"
    try {
        if (settings?.sending_hours_start && settings?.sending_hours_end) {
            const nextTime = getNextSendingTime(
                settings.sending_hours_start,
                settings.sending_hours_end
            )
            nextSchedule = formatNextSendingTime(nextTime)
        }
    } catch (error) {
        console.error('Error calculating next send time:', error)
        nextSchedule = "設定エラー"
    }

    const limit = settings?.daily_limit ?? 100
    const newCount = Math.floor(limit / 2)
    const existingCount = limit - newCount

    return (
        <div className="space-y-6">
            {logs && logs.length > 0 ? (
                <div className="space-y-5">
                    {logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-4 animate-in slide-in-from-left-2 duration-300">
                            <Avatar className="h-9 w-9 mt-0.5">
                                <AvatarFallback className="bg-gray-100 text-gray-600">
                                    {log.status === 'sent' ? <Send className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium text-gray-900 leading-none">
                                    {log.status === 'sent' ? '送信完了' :
                                        log.status === 'queued' ? '送信待機中' :
                                            log.status === 'skipped' ? '除外/スキップ' : log.status}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {log.error_log || `動画メールを送信しました`}
                                </p>
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                                {formatDate(log.created_at)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 space-y-5">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Clock className="h-4 w-4 text-blue-500" />
                            次回の自動送信
                        </div>
                        <div className="text-xl font-semibold text-gray-900">{nextSchedule}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <div className="text-xs text-gray-500 flex items-center gap-1.5">
                                <Send className="h-3 w-3" />
                                予定送信数
                            </div>
                            <div className="text-base font-semibold text-gray-900">
                                {limit}通 <span className="text-sm font-normal text-gray-400">(上限)</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="text-xs text-gray-500 flex items-center gap-1.5">
                                <RefreshCcw className="h-3 w-3" />
                                新規 / 既出
                            </div>
                            <div className="text-base font-semibold text-gray-900">{newCount} / {existingCount}</div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="text-xs text-gray-500">除外時の補完</div>
                            <div className="text-base font-semibold text-emerald-600">ON</div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="text-xs text-gray-500 flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" />
                                送信スケジュール
                            </div>
                            <div className="text-base font-semibold text-gray-900">平日のみ</div>
                        </div>
                    </div>

                    <div className="pt-3 text-xs text-gray-400 text-center border-t border-gray-100">
                        送信待機中です。開始時刻になると自動的に処理されます。
                    </div>
                </div>
            )}
        </div>
    )
}
