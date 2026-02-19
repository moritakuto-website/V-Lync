'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { PLANS } from '@/lib/plans'

export async function updateOnboardingStep(step: number, data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Update profiles with step-specific data
    const profileUpdates: any = {}
    if (data.plan_type) profileUpdates.plan_type = data.plan_type
    if (data.company_name) profileUpdates.company_name = data.company_name
    if (data.rep_name) profileUpdates.rep_name = data.rep_name

    // Normalize and validate URL
    if (data.company_url) {
        let url = data.company_url.trim().replace(/　/g, ' ') // Remove full-width spaces
        if (url.endsWith('/')) url = url.slice(0, -1) // Remove trailing slash

        try {
            const parsedUrl = new URL(url)
            if (!parsedUrl.protocol.startsWith('http')) {
                return { error: 'URLは http:// または https:// で始めてください' }
            }
            profileUpdates.company_url = url
        } catch (e) {
            return { error: '無効なURL形式です。正しい形式で入力してください' }
        }
    }

    if (Object.keys(profileUpdates).length > 0) {
        profileUpdates.updated_at = new Date().toISOString()
        const { error: profileError } = await supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('id', user.id)

        if (profileError) {
            console.error('Error updating profile:', profileError)
            return {
                error: `プロフィール更新に失敗しました: ${profileError.message} (${profileError.code})`,
                details: profileError
            }
        }
    }

    // Prepare settings update
    const settingsUpdates: any = {
        user_id: user.id,
        onboarding_step: step,
        updated_at: new Date().toISOString()
    }

    // If plan is selected, also save the corresponding daily_limit
    if (data.plan_type) {
        const selectedPlan = Object.values(PLANS).find(p => p.id === data.plan_type)
        if (selectedPlan) {
            settingsUpdates.daily_limit = selectedPlan.dailyLimit
        }
    }

    // Update settings with onboarding step and daily_limit
    const { error: settingsError } = await supabase
        .from('settings')
        .upsert(settingsUpdates, { onConflict: 'user_id' })

    if (settingsError) {
        console.error('Error updating settings:', settingsError)
        return {
            error: `設定の更新に失敗しました: ${settingsError.message} (${settingsError.code})`,
            details: settingsError
        }
    }

    revalidatePath('/onboarding')
    revalidatePath('/dashboard')
    revalidatePath('/settings')
    return { success: true }
}

export async function uploadAsset(formData: FormData, assetType: 'pdf' | 'video') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const file = formData.get('file') as File
    if (!file) return { error: 'No file provided' }

    // Validate file type
    if (assetType === 'pdf' && file.type !== 'application/pdf') {
        return { error: 'PDFファイルのみアップロード可能です' }
    }
    if (assetType === 'video' && file.type !== 'video/mp4') {
        return { error: 'MP4ファイルのみアップロード可能です' }
    }

    // Validate file size
    const maxSize = assetType === 'pdf' ? 10 * 1024 * 1024 : 200 * 1024 * 1024 // 10MB for PDF, 200MB for video
    if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024)
        return { error: `ファイルサイズは${maxSizeMB}MB以下にしてください` }
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${assetType}_${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        })

    if (uploadError) {
        console.error('Upload error:', uploadError)
        return { error: 'アップロードに失敗しました' }
    }

    // Save path to settings
    const columnName = assetType === 'pdf' ? 'pdf_asset_path' : 'video_asset_path'
    const { error: settingsError } = await supabase
        .from('settings')
        .upsert({
            user_id: user.id,
            [columnName]: uploadData.path,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

    if (settingsError) {
        console.error('Error saving asset path:', settingsError)
        return { error: 'アセットパスの保存に失敗しました' }
    }

    revalidatePath('/onboarding')
    return { success: true, path: uploadData.path }
}

import { redirect } from 'next/navigation'

export async function completeOnboarding() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Explicitly update both progress markers for stability
    // Ensure onboarding_step is 5 and onboarding_completed is true
    const { error } = await supabase
        .from('settings')
        .upsert({
            user_id: user.id,
            onboarding_completed: true,
            onboarding_step: 5,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

    if (error) {
        console.error('Error completing onboarding:', error)
        return {
            error: `オンボーディングの完了処理に失敗しました: ${error.message} (${error.code})`,
            details: error
        }
    }

    revalidatePath('/onboarding')
    revalidatePath('/dashboard')
    revalidatePath('/settings')

    // Perform redirect to dashboard
    redirect('/dashboard')
}

