"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight } from "lucide-react"

interface Step5CompleteProps {
    onComplete: () => void
    isSaving: boolean
}

export default function Step5Complete({ onComplete, isSaving }: Step5CompleteProps) {
    return (
        <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-gray-900">設定が完了しました！</h2>
                <p className="text-sm text-gray-500 mt-2">
                    V-Lyncを使い始める準備が整いました
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-md mx-auto">
                <h3 className="font-semibold text-gray-900 mb-3">次にやること</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">1.</span>
                        <span>リスト抽出ページで営業対象企業を検索</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">2.</span>
                        <span>送信スケジュールを確認・調整</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">3.</span>
                        <span>自動送信が開始されます</span>
                    </li>
                </ul>
            </div>

            <div className="pt-4">
                <Button
                    onClick={onComplete}
                    disabled={isSaving}
                    size="lg"
                    className="px-8"
                >
                    {isSaving ? "完了処理中..." : "ダッシュボードへ"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
