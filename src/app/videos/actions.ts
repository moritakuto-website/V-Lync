'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadVideo(formData: FormData) {
    const videoFile = formData.get('video') as File

    if (!videoFile) {
        throw new Error('No video file provided')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Mock storage upload - in real app, use supabase.storage.from('videos').upload(...)
    // const { data, error } = await supabase.storage.from('videos').upload(...)

    // Create DB record
    const { error: dbError } = await supabase.from('videos').insert({
        user_id: user.id,
        storage_path: `mock/path/${videoFile.name}`,
        type: 'master'
    })

    if (dbError) {
        console.error('Database error:', dbError)
        throw new Error('Failed to save video record')
    }

    revalidatePath('/videos')
}
