"use client"

import { useState, KeyboardEvent, useRef } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { COMMON_INDUSTRIES } from "@/lib/constants"

interface KeywordTagInputProps {
    name: string
    placeholder?: string
}

export function KeywordTagInput({ name, placeholder }: KeywordTagInputProps) {
    const [tags, setTags] = useState<string[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isComposing, setIsComposing] = useState(false) // For IME (Japanese input) handling

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

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        if (value) {
            addTag(value)
            e.target.value = "" // Reset select
        }
    }

    return (
        <div className="space-y-3">
            {/* Hidden input to submit values to server action */}
            <input type="hidden" name={name} value={tags.join(',')} />

            <div className="flex flex-wrap gap-2 mb-2 p-1 min-h-[30px]">
                {tags.map((tag, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200 gap-1 pr-1 flex items-center">
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="text-blue-600 hover:text-blue-800 focus:outline-none"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>

            <div className="space-y-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    placeholder={placeholder || "キーワードを入力してEnter"}
                    className="w-full"
                />

                <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">よく使われる業種:</Label>
                    <select
                        onChange={handleSelectChange}
                        className="h-8 w-full rounded-md border border-input bg-background px-3 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value=""
                    >
                        <option value="" disabled>タグを追加...</option>
                        {COMMON_INDUSTRIES.map((industry) => (
                            <option key={industry} value={industry}>{industry}</option>
                        ))}
                    </select>
                </div>
            </div>

            <p className="text-xs text-muted-foreground">
                ※カンマ「,」またはEnterキーでタグを確定・追加できます。
            </p>
        </div>
    )
}
