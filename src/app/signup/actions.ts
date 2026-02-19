'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Next.js 15対応修正（重要）
    const headersList = await headers()

    const origin =
        headersList.get('origin') ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        'http://localhost:3000'

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        return redirect(
            `/signup?message=${encodeURIComponent(error.message)}`
        )
    }

    return redirect(
        '/signup?message=Check email to continue sign in process'
    )
}
