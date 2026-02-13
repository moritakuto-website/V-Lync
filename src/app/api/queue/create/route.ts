import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has reply_email configured
    const { data: profile } = await supabase
        .from('profiles')
        .select('reply_email')
        .eq('id', user.id)
        .single()

    if (!profile?.reply_email) {
        return NextResponse.json(
            {
                error: 'Reply-To email is required. Please configure your reply email in Settings before creating a campaign.'
            },
            { status: 400 }
        )
    }

    // Parse request body
    const body = await request.json()
    const { lead_ids } = body // Array of lead IDs to add to queue

    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
        return NextResponse.json(
            { error: 'lead_ids array is required and must not be empty' },
            { status: 400 }
        )
    }

    // Generate campaign ID for this batch
    const campaign_id = randomUUID()

    // Fetch leads with their emails
    const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, email')
        .in('id', lead_ids)
        .eq('user_id', user.id)

    if (leadsError || !leads) {
        return NextResponse.json(
            { error: 'Failed to fetch leads' },
            { status: 500 }
        )
    }

    // Fetch unsubscribe list for this client
    const { data: unsubscribes } = await supabase
        .from('unsubscribes')
        .select('email')
        .eq('user_id', user.id)

    const unsubscribedEmails = new Set(unsubscribes?.map(u => u.email.toLowerCase()) || [])

    // Prepare queue items
    const queueItems = leads.map(lead => {
        let status = 'queued'
        let skip_reason = null

        // Check skip conditions
        if (!lead.email || lead.email.trim() === '') {
            status = 'skipped'
            skip_reason = 'no_email'
        } else if (unsubscribedEmails.has(lead.email.toLowerCase())) {
            status = 'skipped'
            skip_reason = 'opt-out'
        }

        return {
            user_id: user.id,
            lead_id: lead.id,
            campaign_id,
            status,
            skip_reason,
            scheduled_at: new Date().toISOString(),
            created_at: new Date().toISOString()
        }
    })

    // Insert queue items
    const { data: insertedItems, error: insertError } = await supabase
        .from('sending_queue')
        .insert(queueItems)
        .select()

    if (insertError) {
        console.error('Queue insert error:', insertError)
        return NextResponse.json(
            { error: 'Failed to create queue items' },
            { status: 500 }
        )
    }

    const stats = {
        total: queueItems.length,
        queued: queueItems.filter(i => i.status === 'queued').length,
        skipped: queueItems.filter(i => i.status === 'skipped').length,
        skip_reasons: {
            no_email: queueItems.filter(i => i.skip_reason === 'no_email').length,
            opt_out: queueItems.filter(i => i.skip_reason === 'opt-out').length
        }
    }

    return NextResponse.json({
        success: true,
        campaign_id,
        stats,
        items: insertedItems
    })
}
