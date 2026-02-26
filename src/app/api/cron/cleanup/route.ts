import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function authorizeCron(req: NextRequest): boolean {
    const secret = process.env.CRON_SECRET
    if (!secret) return true
    const auth = req.headers.get('authorization') ?? ''
    return auth === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
    const startMs = Date.now()
    console.log('cron_cleanup:start', new Date().toISOString())

    if (!authorizeCron(req)) {
        console.warn('cron_cleanup:unauthorized')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let deleted = 0
    let updated = 0

    try {
        // 1. Mark stale "pending" or "queued" items older than 7 days as expired (safe — no deletion)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: expired, error: expireErr } = await supabase
            .from('sending_queue')
            .update({ status: 'expired', skip_reason: 'timed_out_7d' })
            .in('status', ['queued', 'pending'])
            .lt('scheduled_at', sevenDaysAgo.toISOString())
            .select('id')

        if (expireErr) {
            console.error('cron_cleanup:expire_error', expireErr)
        } else {
            updated = expired?.length ?? 0
            console.log('cron_cleanup:expired_items', updated)
        }

        // 2. Delete SKIP/failed sending_queue rows older than 90 days (safe: already processed)
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        const { data: deletedRows, error: deleteErr } = await supabase
            .from('sending_queue')
            .delete()
            .in('status', ['sent', 'SKIP', 'failed', 'expired'])
            .lt('created_at', ninetyDaysAgo.toISOString())
            .select('id')

        if (deleteErr) {
            console.error('cron_cleanup:delete_error', deleteErr)
        } else {
            deleted = deletedRows?.length ?? 0
            console.log('cron_cleanup:deleted_old_rows', deleted)
        }
    } catch (err) {
        console.error('cron_cleanup:fatal_error', err)
        return NextResponse.json({ error: 'Internal server error', detail: String(err) }, { status: 500 })
    }

    const durationMs = Date.now() - startMs
    const result = { deleted, updated, durationMs }
    console.log('cron_cleanup:done', result)

    return NextResponse.json({ ok: true, ...result })
}
