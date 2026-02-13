import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { searchLeads } from './actions'
import { LeadsSearchForm } from "@/components/leads/leads-search-form"
import { Users } from "lucide-react"

export default async function LeadsContent() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('extracted_at', { ascending: false })

    const { data: settings } = await supabase
        .from('settings')
        .select('prefectures')
        .eq('user_id', user.id)
        .single()

    const savedPrefectures = settings?.prefectures || []


    return (
        <div className="flex flex-1 flex-col gap-6">
            <div className="flex items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">リスト抽出</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        営業対象リストを検索・管理します
                    </p>
                </div>
            </div>

            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-base font-semibold text-gray-900">新規リスト抽出</CardTitle>
                            <CardDescription className="text-sm text-gray-500 mt-1">
                                エリアと業種を指定してリストを取得
                            </CardDescription>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium text-gray-700">本日の新規探索上限：残り 50 社</div>
                            <div className="text-xs text-blue-600 font-medium mt-1">反応率を考慮して探索数を自動調整します（Pro）</div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <LeadsSearchForm action={searchLeads} savedPrefectures={savedPrefectures} />
                </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                    <CardTitle className="text-base font-semibold text-gray-900">抽出済みリスト</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                        全 {leads?.length || 0} 件
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {leads && leads.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50/50">
                                        <th className="text-left px-4 py-3 font-medium text-xs text-gray-600 uppercase tracking-wider">会社名</th>
                                        <th className="text-left px-4 py-3 font-medium text-xs text-gray-600 uppercase tracking-wider">住所</th>
                                        <th className="text-left px-4 py-3 font-medium text-xs text-gray-600 uppercase tracking-wider">業種</th>
                                        <th className="text-left px-4 py-3 font-medium text-xs text-gray-600 uppercase tracking-wider">ステータス</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {leads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900">{lead.company_name}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600">{lead.address}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600">{lead.industry}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600">{lead.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 px-4">
                            <Users className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                            <p className="text-base font-medium text-gray-900">まだリストが登録されていません</p>
                            <p className="text-sm text-gray-500 mt-2">上のフォームから検索を開始してください。</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
