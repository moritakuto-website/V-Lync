"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalLink } from "lucide-react"

interface Step3WebsiteProps {
    savedData: any
    onNext: (data: any) => void
    onBack: () => void
    isSaving: boolean
}

export default function Step3Website({ savedData, onNext, onBack, isSaving }: Step3WebsiteProps) {
    const [companyUrl, setCompanyUrl] = useState(savedData?.company_url || "")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({ company_url: companyUrl })
    }

    const isValidUrl = (url: string) => {
        try {
            new URL(url)
            return url.startsWith('http://') || url.startsWith('https://')
        } catch {
            return false
        }
    }

    const isValid = companyUrl.trim() && isValidUrl(companyUrl)

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">自社URLを登録してください</h2>
                <p className="text-sm text-gray-500 mt-1">
                    メール本文に記載されます
                </p>
            </div>

            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="company_url">
                        自社URL <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="company_url"
                        type="url"
                        value={companyUrl}
                        onChange={(e) => setCompanyUrl(e.target.value)}
                        placeholder="https://example.com"
                        required
                    />
                    <p className="text-xs text-gray-500">
                        https:// または http:// から始まるURLを入力してください
                    </p>
                </div>

                {isValid && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-900 mb-2">URLプレビュー</p>
                        <a
                            href={companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            {companyUrl}
                            <ExternalLink className="h-4 w-4" />
                        </a>
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
