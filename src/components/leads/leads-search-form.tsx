"use client"

import { useState, useRef, KeyboardEvent, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PREFECTURES, COMMON_INDUSTRIES } from '@/lib/constants'
import { updatePrefectures } from '@/app/settings/actions'

interface LeadsSearchFormProps {
    action: (formData: FormData) => void
    savedPrefectures?: string[]
}

export function LeadsSearchForm({ action, savedPrefectures = [] }: LeadsSearchFormProps) {
    const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>(savedPrefectures)
    const [tags, setTags] = useState<string[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isComposing, setIsComposing] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const formRef = useRef<HTMLFormElement>(null)

    // Sync savedPrefectures to state when it changes
    useEffect(() => {
        setSelectedPrefectures(savedPrefectures)
    }, [savedPrefectures])

    const handlePrefectureSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        if (value && !selectedPrefectures.includes(value)) {
            if (selectedPrefectures.length >= 3) {
                alert('最大3都道府県まで選択できます')
                e.target.value = ""
                return
            }
            const newPrefectures = [...selectedPrefectures, value]
            setSelectedPrefectures(newPrefectures)
            // Save to settings
            await updatePrefectures(newPrefectures)
        }
        e.target.value = "" // Reset selection
    }

    const removePrefecture = async (index: number) => {
        const newPrefectures = selectedPrefectures.filter((_, i) => i !== index)
        setSelectedPrefectures(newPrefectures)
        // Save to settings
        await updatePrefectures(newPrefectures)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (isComposing) return

        if (e.key === 'Enter') {
            e.preventDefault()
            addTag(inputValue)
        } else if (e.key === ',' || e.key === '、') {
            e.preventDefault()
            addTag(inputValue)
        } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            removeTag(tags.length - 1)
        }
    }

    const addTag = (value: string) => {
        const trimmed = value.trim()
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed])
        }
        setInputValue("")
    }

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index))
    }

    const handleIndustrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        if (value) {
            addTag(value)
            e.target.value = "" // Reset selection
        }
        inputRef.current?.focus()
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setIsPending(true)
        // Ensure strictly native submission if action is a server action passed down
        // But for standard form actions in Next.js, we can just let it bubble if we don't preventDefault
        // However, we need to ensure the hidden inputs are populated.
    }

    return (
        <div className="w-full">
            <form
                ref={formRef}
                action={action}
                onSubmit={handleSubmit}
                className="flex flex-col lg:flex-row items-stretch w-full border rounded-lg overflow-hidden shadow-sm bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
            >
                {/* Hidden inputs for selected prefectures */}
                {selectedPrefectures.map((pref, idx) => (
                    <input key={idx} type="hidden" name="prefectures[]" value={pref} />
                ))}

                {/* 1. Prefecture Multi-Select Section */}
                <div className="w-full lg:w-auto shrink-0 border-b lg:border-b-0 lg:border-r bg-background">
                    <div className="flex flex-col h-full">
                        {/* Selected Prefecture Tags */}
                        {selectedPrefectures.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 px-3 py-2 border-b">
                                {selectedPrefectures.map((pref, index) => (
                                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 gap-1 pr-1 flex items-center whitespace-nowrap">
                                        {pref}
                                        <button
                                            type="button"
                                            onClick={() => removePrefecture(index)}
                                            className="text-blue-600 hover:text-blue-800 focus:outline-none ml-1 rounded-full hover:bg-blue-300 p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                        {/* Prefecture Dropdown */}
                        <select
                            onChange={handlePrefectureSelect}
                            className="flex h-12 w-full lg:w-[140px] bg-transparent px-3 py-2 text-sm font-medium focus:outline-none cursor-pointer"
                            disabled={selectedPrefectures.length >= 3}
                            value=""
                        >
                            <option value="">都道府県...</option>
                            {PREFECTURES.map((pref) => (
                                <option
                                    key={pref}
                                    value={pref}
                                    disabled={selectedPrefectures.includes(pref)}
                                >
                                    {pref}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 2. Tag Input Container */}
                <div
                    className="flex-1 flex flex-wrap items-center gap-1.5 px-3 py-1 bg-transparent min-h-[48px] cursor-text"
                    onClick={() => inputRef.current?.focus()}
                >
                    <input type="hidden" name="keyword" value={tags.join(',')} />

                    {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 gap-1 pr-1 flex items-center whitespace-nowrap">
                            {tag}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    removeTag(index)
                                }}
                                className="text-blue-600 hover:text-blue-800 focus:outline-none ml-1 rounded-full hover:bg-blue-300 p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}

                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        placeholder={tags.length === 0 ? "キーワード (例: 建設業, 不動産)..." : ""}
                        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[100px] h-full"
                    />
                </div>

                {/* 3. Industry Dropdown */}
                <div className="w-full lg:w-[180px] shrink-0 border-t lg:border-t-0 lg:border-l relative hover:bg-muted/50 transition-colors">
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-end px-3">
                        <span className="text-muted-foreground text-[10px]">▼</span>
                    </div>
                    <select
                        onChange={handleIndustrySelect}
                        className="flex h-12 w-full appearance-none bg-transparent px-3 py-2 text-sm text-muted-foreground focus:outline-none cursor-pointer"
                        defaultValue=""
                    >
                        <option value="" disabled>＋ よく使われる業種</option>
                        {COMMON_INDUSTRIES.map((industry) => (
                            <option key={industry} value={industry}>{industry}</option>
                        ))}
                    </select>
                </div>

                {/* 4. Search Button */}
                <Button
                    type="submit"
                    className="w-full lg:w-auto rounded-none h-12 px-6 font-bold"
                    disabled={isPending}
                >
                    {isPending ? '検索中...' : '検索'}
                </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 px-1">
                ※最大3都道府県まで選択できます。キーワードを入力してEnter、または「よく使われる業種」から追加できます。
            </p>
        </div>
    )
}
