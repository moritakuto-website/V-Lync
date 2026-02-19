"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step2ClientInfoProps {
    savedData: any
    onNext: (data: any) => void
    onBack: () => void
    isSaving: boolean
}

export default function Step2ClientInfo({ savedData, onNext, onBack, isSaving }: Step2ClientInfoProps) {
    const [companyName, setCompanyName] = useState(savedData?.company_name || "")
    const [repName, setRepName] = useState(savedData?.rep_name || "")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({ company_name: companyName, rep_name: repName })
    }

    const isValid = companyName.trim() && repName.trim()

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">基本情報を入力してください</h2>
                <p className="text-sm text-gray-500 mt-1">
                    営業メールに表示される会社情報を入力してください。
                </p>
            </div>

            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="company_name">
                        会社名 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="company_name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="株式会社サンプル"
                        required
                    />
                    <p className="text-xs text-gray-500">
                        正式な会社名を入力してください
                    </p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="rep_name">
                        担当者名 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="rep_name"
                        value={repName}
                        onChange={(e) => setRepName(e.target.value)}
                        placeholder="山田 太郎"
                        required
                    />
                    <p className="text-xs text-gray-500">
                        メール送信者として表示される名前です
                    </p>
                </div>

                {companyName && repName && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">送信者名プレビュー</p>
                        <p className="text-base font-semibold text-blue-700">
                            {repName} | {companyName}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={onBack}>
                    戻る
                </Button>
                <Button type="submit" disabled={!isValid || isSaving} className="px-8">
                    {isSaving ? "保存中..." : "次へ"}
                </Button>
            </div>
        </form>
    )
}
