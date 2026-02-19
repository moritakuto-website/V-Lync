"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { PLANS } from "@/lib/plans"

interface Step1PlanProps {
    savedData: any
    onNext: (data: any) => void
    isSaving: boolean
}

export default function Step1Plan({ savedData, onNext, isSaving }: Step1PlanProps) {
    const [selectedPlan, setSelectedPlan] = useState(savedData?.plan_type || "standard")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({ plan_type: selectedPlan })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">プランを選択</h2>
                <p className="text-sm text-gray-500 mt-1">
                    ご利用予定の送信数に応じてプランを選択してください。後から変更可能です。
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {Object.values(PLANS).map((plan) => (
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
                                推奨
                            </div>
                        )}
                        {plan.popular && (
                            <div className="absolute -top-3 right-4 px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                                人気
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
                                <p className="text-xs text-gray-500 mt-1">{plan.label}</p>
                                <div className="mt-3 flex items-baseline">
                                    <span className="text-3xl font-bold text-gray-900">¥{plan.price.toLocaleString()}</span>
                                    <span className="text-sm text-gray-500 ml-1">/ 月</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                                <p className="text-sm text-gray-700 font-medium">
                                    <Check className="h-4 w-4 text-blue-600 inline mr-1" />
                                    1日{plan.dailyLimit}通まで
                                </p>
                            </div>
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
