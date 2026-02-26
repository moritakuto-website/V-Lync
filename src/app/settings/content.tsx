import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateSettings } from './actions'
import { ApiKeyForm } from "@/components/settings/api-key-form"
import { PLANS } from '@/lib/plans'

export default async function SettingsContent() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const { data: settings } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">設定 (Settings)</h1>
            </div>

            <div className="grid gap-6">
                {/* Client Profile Settings */}
                <form action={updateSettings} className="space-y-6">
                    <input type="hidden" name="action_type" value="profile_update" />
                    <Card>
                        <CardHeader>
                            <CardTitle>クライアント情報設定</CardTitle>
                            <CardDescription>
                                メールの差出人情報やプランの設定を行います。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="company_name">会社名 <span className="text-red-500">*</span></Label>
                                <Input id="company_name" name="company_name" defaultValue={profile?.company_name || ''} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="rep_name">担当者名 <span className="text-red-500">*</span></Label>
                                <Input id="rep_name" name="rep_name" defaultValue={profile?.rep_name || ''} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="company_url">自社URL <span className="text-red-500">*</span></Label>
                                <Input id="company_url" name="company_url" type="url" defaultValue={profile?.company_url || ''} placeholder="https://..." required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="reply_email">返信先メールアドレス (Reply-To) <span className="text-red-500">*</span></Label>
                                <Input id="reply_email" name="reply_email" type="email" defaultValue={profile?.reply_email || ''} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="plan_type">プラン選択 <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <select
                                        id="plan_type"
                                        name="plan_type"
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        defaultValue={profile?.plan_type || 'free'}
                                        required
                                    >
                                        {Object.values(PLANS).map(plan => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.name} - ¥{plan.price.toLocaleString()}/月 (1日{plan.dailyLimit}通)
                                            </option>
                                        ))}
                                        <option value="unlimited_free">Admin / Unlimited</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <span className="text-xs text-muted-foreground">▼</span>
                                    </div>
                                </div>
                            </div>
                            {/* Emergency Stop Toggle */}
                            <div className="grid gap-2 col-span-full mt-2">
                                <div className="flex items-center gap-3">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="sending_enabled"
                                            id="sending_enabled"
                                            className="sr-only peer"
                                            defaultChecked={profile?.sending_enabled !== false}
                                        />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                    <Label htmlFor="sending_enabled" className="cursor-pointer">自動送信 (ON/OFF)</Label>
                                </div>
                                {profile?.sending_enabled === false && (
                                    <p className="text-sm font-medium text-red-600">
                                        ※送信を一時停止中です。ONに戻すまで自動送信は行われません。
                                    </p>
                                )}
                            </div>
                        </CardContent>
                        {/* Read-only Info Section */}
                        <CardContent className="border-t pt-4 mt-2 bg-muted/20">
                            <div className="grid gap-4 md:grid-cols-2 text-sm">
                                <div className="grid gap-1">
                                    <Label className="text-muted-foreground">送信者名 (From Name)</Label>
                                    <div className="font-medium p-2 bg-muted rounded-md text-muted-foreground">
                                        {profile?.rep_name && profile?.company_name
                                            ? `${profile.rep_name} | ${profile.company_name}`
                                            : '(会社名と担当者名を入力してください)'}
                                    </div>
                                </div>
                                <div className="grid gap-1">
                                    <Label className="text-muted-foreground">送信元アドレス (From Address)</Label>
                                    <div className="font-medium p-2 bg-muted rounded-md text-muted-foreground">
                                        info@v-lync.com (固定)
                                    </div>
                                </div>
                                <div className="grid gap-1">
                                    <Label className="text-muted-foreground">送信間隔</Label>
                                    <div className="font-medium p-2 bg-muted rounded-md text-muted-foreground">
                                        45秒間隔 (固定 / Mock)
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <div className="flex justify-end p-6 pt-0">
                            <Button type="submit">クライアント情報を保存</Button>
                        </div>
                    </Card>
                </form>

                <form action={updateSettings} className="space-y-6">
                    <input type="hidden" name="action_type" value="schedule_update" />
                    <Card>
                        <CardHeader>
                            <CardTitle>送信スケジュール設定</CardTitle>
                            <CardDescription>
                                自動送信を行う時間帯とルールを設定します。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="daily_limit">1日の送信上限数</Label>
                                <Input
                                    type="number"
                                    id="daily_limit"
                                    name="daily_limit"
                                    defaultValue={settings?.daily_limit ?? 100}
                                    min={1}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sending_hours_start">開始時間</Label>
                                <Input
                                    type="time"
                                    id="sending_hours_start"
                                    name="sending_hours_start"
                                    defaultValue={settings?.sending_hours_start ?? '09:00'}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sending_hours_end">終了時間</Label>
                                <Input
                                    type="time"
                                    id="sending_hours_end"
                                    name="sending_hours_end"
                                    defaultValue={settings?.sending_hours_end ?? '19:00'}
                                />
                            </div>

                            {/* Read-only weekend/holiday skip notice */}
                            <div className="col-span-full p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-sm font-medium text-blue-900">
                                    📅 土日祝日は送信しない (固定)
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    システムが自動的に営業日のみ送信します。この設定は変更できません。
                                </p>
                            </div>

                            <div className="col-span-full mt-4 p-3 bg-muted/50 rounded-md border text-sm text-muted-foreground">
                                <p>この設定に基づき、毎営業日自動で送信されます</p>
                                <p className="text-xs text-blue-600 mt-1">設定に不備がある場合は自動的に安全な範囲に補正されます (Pro)</p>
                            </div>

                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button type="submit">スケジュール設定を保存</Button>
                    </div>
                </form>

                {/* Onboarding Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>オンボーディング状況</CardTitle>
                        <CardDescription>
                            初期設定の完了状況を確認できます
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                <span className="text-sm font-medium">設定状況</span>
                                <span className={`text-sm font-semibold ${settings?.onboarding_completed ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {settings?.onboarding_completed ? '✓ 完了' : '未完了'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                <span className="text-sm font-medium">プラン</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {profile?.plan_type && Object.values(PLANS).find(p => p.id === profile.plan_type)
                                        ? `${Object.values(PLANS).find(p => p.id === profile.plan_type)?.name} (1日${Object.values(PLANS).find(p => p.id === profile.plan_type)?.dailyLimit}通)`
                                        : profile?.plan_type || 'Not Set'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                <span className="text-sm font-medium">PDF素材</span>
                                <span className={`text-sm font-semibold ${settings?.pdf_asset_path ? 'text-green-600' : 'text-gray-400'}`}>
                                    {settings?.pdf_asset_path ? '✓ 登録済み' : '未登録'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                <span className="text-sm font-medium">動画素材</span>
                                <span className={`text-sm font-semibold ${settings?.video_asset_path ? 'text-green-600' : 'text-gray-400'}`}>
                                    {settings?.video_asset_path ? '✓ 登録済み' : '未登録'}
                                </span>
                            </div>
                        </div>
                        {!settings?.onboarding_completed && (
                            <a
                                href="/onboarding"
                                className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                            >
                                オンボーディングを完了する
                            </a>
                        )}
                    </CardContent>
                </Card>

                <ApiKeyForm
                    hasGoogleMapsKey={!!settings?.google_maps_key}
                    hasStripePk={!!settings?.stripe_pk}
                    hasStripeSk={!!settings?.stripe_sk}
                />
            </div>
        </div>
    )
}
