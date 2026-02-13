"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import Step1Plan from "./components/step1-plan"
import Step2ClientInfo from "./components/step2-client-info"
import Step3Website from "./components/step3-website"
import Step4Assets from "./components/step4-assets"
import Step5Complete from "./components/step5-complete"
import { updateOnboardingStep, completeOnboarding } from "./actions"

interface OnboardingWizardProps {
    initialStep: number
    isCompleted: boolean
    savedData: any
}

const steps = [
    { number: 1, title: "プラン選択", description: "最適なプランを選択" },
    { number: 2, title: "クライアント情報", description: "会社名と担当者名" },
    { number: 3, title: "URL登録", description: "自社サイトのURL" },
    { number: 4, title: "素材登録", description: "PDF・動画をアップロード" },
    { number: 5, title: "完了", description: "設定完了" },
]

export default function OnboardingWizard({ initialStep, isCompleted, savedData }: OnboardingWizardProps) {
    const [currentStep, setCurrentStep] = useState(initialStep)
    const [formData, setFormData] = useState(savedData)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()

    const handleNext = async (stepData: any) => {
        setIsSaving(true)

        const newFormData = { ...formData, ...stepData }
        setFormData(newFormData)

        // Save to database
        const result = await updateOnboardingStep(currentStep + 1, stepData)

        if (result.error) {
            const detailStr = result.details ? `\n\n詳細: ${result.details.message || result.details.code}` : ""
            alert(`${result.error}${detailStr}`)
            setIsSaving(false)
            return
        }

        if (currentStep < 5) {
            setCurrentStep(currentStep + 1)
        }

        setIsSaving(false)
        router.refresh()
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleComplete = async () => {
        setIsSaving(true)
        const result = await completeOnboarding()

        if (result.error) {
            alert(result.error)
            setIsSaving(false)
            return
        }

        router.push('/dashboard')
    }

    return (
        <div className="flex flex-1 flex-col gap-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">初期設定</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        V-Lyncを始めるための設定を行います
                    </p>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                                    currentStep > step.number
                                        ? "bg-blue-600 text-white"
                                        : currentStep === step.number
                                            ? "bg-blue-600 text-white ring-4 ring-blue-100"
                                            : "bg-gray-200 text-gray-500"
                                )}
                            >
                                {currentStep > step.number ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    step.number
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <div className={cn(
                                    "text-xs font-medium",
                                    currentStep >= step.number ? "text-gray-900" : "text-gray-500"
                                )}>
                                    {step.title}
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5">
                                    {step.description}
                                </div>
                            </div>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    "h-0.5 flex-1 mx-2 transition-all",
                                    currentStep > step.number ? "bg-blue-600" : "bg-gray-200"
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-8">
                    {currentStep === 1 && (
                        <Step1Plan
                            savedData={formData}
                            onNext={handleNext}
                            isSaving={isSaving}
                        />
                    )}
                    {currentStep === 2 && (
                        <Step2ClientInfo
                            savedData={formData}
                            onNext={handleNext}
                            onBack={handleBack}
                            isSaving={isSaving}
                        />
                    )}
                    {currentStep === 3 && (
                        <Step3Website
                            savedData={formData}
                            onNext={handleNext}
                            onBack={handleBack}
                            isSaving={isSaving}
                        />
                    )}
                    {currentStep === 4 && (
                        <Step4Assets
                            savedData={formData}
                            onNext={handleNext}
                            onBack={handleBack}
                            isSaving={isSaving}
                        />
                    )}
                    {currentStep === 5 && (
                        <Step5Complete
                            onComplete={handleComplete}
                            isSaving={isSaving}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
