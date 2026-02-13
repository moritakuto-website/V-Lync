"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateApiKeys } from "@/app/settings/actions"
import { useFormStatus } from "react-dom"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "保存中..." : "保存"}
        </Button>
    )
}

export function ApiKeyForm({
    hasGoogleMapsKey,
    hasStripePk,
    hasStripeSk
}: {
    hasGoogleMapsKey: boolean
    hasStripePk: boolean
    hasStripeSk: boolean
}) {
    return (
        <form action={updateApiKeys} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>API設定</CardTitle>
                    <CardDescription>
                        外部サービスの連携キーを設定します。入力内容はマスクされ、変更する場合のみ入力してください。
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="google_maps_key">Google Maps API Key</Label>
                        <Input
                            id="google_maps_key"
                            name="google_maps_key"
                            placeholder={hasGoogleMapsKey ? "設定済み (変更する場合のみ入力)" : "AIza..."}
                            type="password"
                            autoComplete="new-password"
                        />
                        {hasGoogleMapsKey && <p className="text-xs text-green-600">✓ 設定済み</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="stripe_pk">Stripe Publishable Key</Label>
                        <Input
                            id="stripe_pk"
                            name="stripe_pk"
                            placeholder={hasStripePk ? "設定済み (変更する場合のみ入力)" : "pk_test_..."}
                            type="password"
                            autoComplete="new-password"
                        />
                        {hasStripePk && <p className="text-xs text-green-600">✓ 設定済み</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="stripe_sk">Stripe Secret Key</Label>
                        <Input
                            id="stripe_sk"
                            name="stripe_sk"
                            placeholder={hasStripeSk ? "設定済み (変更する場合のみ入力)" : "sk_test_..."}
                            type="password"
                            autoComplete="new-password"
                        />
                        {hasStripeSk && <p className="text-xs text-green-600">✓ 設定済み</p>}
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    )
}
