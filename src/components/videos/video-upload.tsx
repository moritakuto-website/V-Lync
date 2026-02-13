'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { uploadVideo } from "@/app/videos/actions"

export function VideoUpload() {
    const [isUploading, setIsUploading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsUploading(true)
        try {
            await uploadVideo(formData)
        } catch (error) {
            console.error(error)
            // In a real app, show toast error
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <form action={handleSubmit} className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="video">マスター動画 (15秒以内, .mp4)</Label>
            <Input id="video" name="video" type="file" accept="video/mp4,video/quicktime" required />
            <p className="text-xs text-muted-foreground">
                自撮りのマスター動画をアップロードしてください。
            </p>
            <Button type="submit" disabled={isUploading}>
                {isUploading ? 'アップロード中...' : 'アップロード'}
            </Button>
        </form>
    )
}
