import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardStats } from "@/components/dashboard/stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default async function DashboardContent() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: settings } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

    const { data: queueLogs } = await supabase
        .from('sending_queue')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

    return (
        <div className="flex flex-1 flex-col gap-6">
            <div className="flex items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">ダッシュボード</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        送信状況と統計を確認できます
                    </p>
                </div>
            </div>

            {/* Onboarding Banner */}
            {!settings?.onboarding_completed && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">🚀</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">初期設定を完了しましょう</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                V-Lyncを使い始めるには、プラン選択や素材のアップロードなどの初期設定が必要です。
                            </p>
                            <a
                                href="/onboarding"
                                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                            >
                                登録を完了する
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <DashboardStats />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-base font-semibold text-gray-900">自動送信ステータス</h3>
                            <p className="text-sm text-gray-500">
                                次回実行予定とステータスを表示します
                            </p>
                        </div>
                        <div className="p-6">
                            <RecentActivity settings={settings} logs={queueLogs || []} />
                        </div>
                    </div>
                </div>
                <div>
                    {/* Calendar or other widgets could go here */}
                </div>
            </div>
        </div>
    )
}
