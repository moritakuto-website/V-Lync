import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
    // 90-day cleanup rule

    const supabase = await createClient()

    // Calculate date 90 days ago
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    // Logic: 
    // 1. Delete videos older than 90 days from Storage
    // 2. Delete video records from DB

    // const { error } = await supabase
    //   .from('videos')
    //   .delete()
    //   .lt('created_at', ninetyDaysAgo.toISOString())

    return NextResponse.json({ message: 'Cleanup job executed (placeholder)' })
}
