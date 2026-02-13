"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step1PlanProps {
    savedData: any
    onNext: (data: any) => void
    isSaving: boolean
}

const plans = [
    {
        id: "free",
        name: "Free Plan",
        price: "¥0",
        period: "/月",
        features: [
            "毎日10通まで自動送信",
            "基本的な配信停止管理",
            "標準サポート",
        ],
    },
    {
        id: "pro",
        name: "Pro Plan",
        price: "¥29,800",
        period: "/月",
        features: [
            "毎日100通まで自動送信",
            "反応率による自動最適化",
            "除外・補完の自動化",
            "優先サポート",
        ],
        recommended: true,
    },
]

export default function Step1Plan({ savedData, onNext, isSaving }: Step1PlanProps) {
    const [selectedPlan, setSelectedPlan] = useState(savedData?.plan_type || "free")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({ plan_type: selectedPlan })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">プランを選択してください</h2>
                <p className="text-sm text-gray-500 mt-1">
                    後からいつでも変更できます
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {plans.map((plan) => (
                    <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlan(plan.id)}
                        className={cn(
                            "relative p-6 rounded-lg border-2 transition-all text-left",
                            selectedPlan === plan.id
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                        )}
                    >
                        {plan.recommended && (
                            <div className="absolute -top-3 left-4 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                おすすめ
                            </div>
                        )}
                        {selectedPlan === plan.id && (
                            <div className="absolute top-4 right-4">
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white" />
                                </div>
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                                <div className="mt-2 flex items-baseline">
                                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                                    <span className="text-sm text-gray-500 ml-1">{plan.period}</span>
                                </div>
                            </div>
                            <ul className="space-y-2">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start text-sm text-gray-600">
                                        <Check className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </button>
                ))}
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSaving} className="px-8">
                    {isSaving ? "保存中..." : "次へ"}
                </Button>
            </div>
        </form>
    )
}
