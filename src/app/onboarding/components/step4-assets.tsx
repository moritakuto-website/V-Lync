"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Video, Check, X } from "lucide-react"
import { uploadAsset } from "../actions"
import { cn } from "@/lib/utils"

interface Step4AssetsProps {
    savedData: any
    onNext: (data: any) => void
    onBack: () => void
    isSaving: boolean
}

export default function Step4Assets({ savedData, onNext, onBack, isSaving }: Step4AssetsProps) {
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [pdfUploading, setPdfUploading] = useState(false)
    const [videoUploading, setVideoUploading] = useState(false)
    const [pdfUploaded, setPdfUploaded] = useState(!!savedData?.pdf_asset_path)
    const [videoUploaded, setVideoUploaded] = useState(!!savedData?.video_asset_path)
    const pdfInputRef = useRef<HTMLInputElement>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setPdfFile(file)
        setPdfUploading(true)

        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadAsset(formData, 'pdf')

        if (result.error) {
            alert(result.error)
            setPdfUploading(false)
            return
        }

        setPdfUploaded(true)
        setPdfUploading(false)
    }

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setVideoFile(file)
        setVideoUploading(true)

        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadAsset(formData, 'video')

        if (result.error) {
            alert(result.error)
            setVideoUploading(false)
            return
        }

        setVideoUploaded(true)
        setVideoUploading(false)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({})
    }

    const canProceed = pdfUploaded && videoUploaded

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">素材をアップロードしてください</h2>
                <p className="text-sm text-gray-500 mt-1">
                    メール添付用のPDFとサンプル動画をアップロードします
                </p>
            </div>

            <div className="space-y-4">
                {/* PDF Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                            pdfUploaded ? "bg-green-100" : "bg-gray-100"
                        )}>
                            {pdfUploaded ? (
                                <Check className="h-6 w-6 text-green-600" />
                            ) : (
                                <FileText className="h-6 w-6 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <Label className="text-base font-semibold text-gray-900">
                                PDFファイル
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                                最大10MB、PDF形式のみ
                            </p>
                            {pdfFile && (
                                <p className="text-sm text-gray-700 mt-2 font-medium">
                                    {pdfFile.name}
                                </p>
                            )}
                            {pdfUploaded && !pdfFile && (
                                <p className="text-sm text-green-600 mt-2 font-medium">
                                    ✓ アップロード済み
                                </p>
                            )}
                        </div>
                        <div>
                            <input
                                ref={pdfInputRef}
                                type="file"
                                accept="application/pdf"
                                onChange={handlePdfUpload}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => pdfInputRef.current?.click()}
                                disabled={pdfUploading || pdfUploaded}
                            >
                                {pdfUploading ? "アップロード中..." : pdfUploaded ? "完了" : "選択"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Video Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                            videoUploaded ? "bg-green-100" : "bg-gray-100"
                        )}>
                            {videoUploaded ? (
                                <Check className="h-6 w-6 text-green-600" />
                            ) : (
                                <Video className="h-6 w-6 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <Label className="text-base font-semibold text-gray-900">
                                動画ファイル (MP4)
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                                最大200MB、MP4形式のみ
                            </p>
                            {videoFile && (
                                <p className="text-sm text-gray-700 mt-2 font-medium">
                                    {videoFile.name}
                                </p>
                            )}
                            {videoUploaded && !videoFile && (
                                <p className="text-sm text-green-600 mt-2 font-medium">
                                    ✓ アップロード済み
                                </p>
                            )}
                        </div>
                        <div>
                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/mp4"
                                onChange={handleVideoUpload}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => videoInputRef.current?.click()}
                                disabled={videoUploading || videoUploaded}
                            >
                                {videoUploading ? "アップロード中..." : videoUploaded ? "完了" : "選択"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {!canProceed && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        両方のファイルをアップロードしてください
                    </p>
                </div>
            )}

            <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={onBack} disabled={isSaving || pdfUploading || videoUploading}>
                    戻る
                </Button>
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onNext({})}
                        disabled={isSaving || pdfUploading || videoUploading}
                    >
                        スキップ
                    </Button>
                    <Button
                        type="submit"
                        disabled={!canProceed || isSaving || pdfUploading || videoUploading}
                        className="px-8"
                    >
                        {isSaving ? "保存中..." : "登録して次へ"}
                    </Button>
                </div>
            </div>
        </form>
    )
}
