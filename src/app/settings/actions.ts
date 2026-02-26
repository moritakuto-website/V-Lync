'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSettings(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const action_type = formData.get('action_type')

    if (action_type === 'profile_update') {
        const company_name = formData.get('company_name') as string
        const rep_name = formData.get('rep_name') as string
        const company_url = formData.get('company_url') as string
        const reply_email = formData.get('reply_email') as string
        const plan_type = formData.get('plan_type') as string
        const sending_enabled = formData.get('sending_enabled') === 'on'

        const { error } = await supabase
            .from('profiles')
            .update({
                company_name,
                rep_name,
                company_url,
                reply_email,
                plan_type,
                sending_enabled,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (error) {
            console.error('Error updating profile:', error)
            throw new Error('Failed to update profile')
        }
    } else {
        // Schedule Update (Default)
        // Schedule Update (Default)
        const daily_limit = parseInt(formData.get('daily_limit') as string)
        // Force skip_weekends to always be true (weekends/holidays always skipped)
        const skip_weekends = true
        const sending_hours_start = formData.get('sending_hours_start') as string
        const sending_hours_end = formData.get('sending_hours_end') as string
        const auto_cleanup_90_days = formData.get('auto_cleanup_90_days') === 'on'

        // Upsert settings
        const { error } = await supabase
            .from('settings')
            .upsert({
                user_id: user.id,
                daily_limit,
                skip_weekends,
                sending_hours_start,
                sending_hours_end,
                auto_cleanup_90_days,
                updated_at: new Date().toISOString()
            })

        if (error) {
            console.error('Error updating settings:', error)
            throw new Error('Failed to update settings')
        }
    }

    revalidatePath('/settings')
    revalidatePath('/dashboard') // Update dashboard too as it might use profile info
}

export async function updateApiKeys(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const google_maps_key = formData.get('google_maps_key') as string
    const stripe_pk = formData.get('stripe_pk') as string
    const stripe_sk = formData.get('stripe_sk') as string

    // Fetch existing settings to determine if we update or insert
    const { data: existing } = await supabase.from('settings').select('id').eq('user_id', user.id).single()

    const updates: any = {
        user_id: user.id,
        updated_at: new Date().toISOString()
    }

    // Only add keys to updates if they are provided (non-empty)
    if (google_maps_key && google_maps_key.trim() !== '') {
        updates.google_maps_key = google_maps_key.trim()
    }
    if (stripe_pk && stripe_pk.trim() !== '') {
        updates.stripe_pk = stripe_pk.trim()
    }
    if (stripe_sk && stripe_sk.trim() !== '') {
        updates.stripe_sk = stripe_sk.trim()
    }

    let error;

    if (existing) {
        // Update existing row
        const { error: updateError } = await supabase
            .from('settings')
            .update(updates)
            .eq('user_id', user.id)
        error = updateError
    } else {
        // Insert new row
        // If inserting, we might want to ensure we don't insert empty strings if we want to rely on nulls, 
        // but here it's fine.
        const { error: insertError } = await supabase
            .from('settings')
            .insert(updates)
        error = insertError
    }

    if (error) {
        console.error('Error updating keys:', error)
        throw new Error('Failed to update keys')
    }

    revalidatePath('/settings')
}

export async function updatePrefectures(prefectures: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Validate max 3 prefectures
    if (prefectures.length > 3) {
        return { error: '最大3都道府県まで選択できます' }
    }

    // Upsert settings with prefectures
    const { error } = await supabase
        .from('settings')
        .upsert({
            user_id: user.id,
            prefectures,
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error('Error updating prefectures:', error)
        return { error: 'Failed to update prefectures' }
    }

    revalidatePath('/leads')
    return { success: true }
}
