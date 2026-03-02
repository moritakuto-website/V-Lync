import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { generateUnsubscribeToken } from '@/utils/unsubscribe-token'

export const dynamic = 'force-dynamic'

// ── Auth helper ────────────────────────────────────────────────────────────────
function authorizeCron(req: NextRequest): boolean {
    const secret = process.env.CRON_SECRET
    if (!secret) return true // no secret configured → allow (local dev)
    const auth = req.headers.get('authorization') ?? ''
    return auth === `Bearer ${secret}`
}

// ── Email HTML ─────────────────────────────────────────────────────────────────
function buildEmailHtml(contactName: string, companyName: string, unsubUrl: string): string {
    return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f4f4f5;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:32px 40px;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.3px;">V-Lync</h1>
    </div>
    <div style="padding:40px;">
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
        ${companyName ? `<strong>${companyName}</strong><br>` : ''}
        ${contactName} 様
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
        はじめまして。<br>この度は弊社サービスをご検討いただきありがとうございます。
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0;">
        引き続きどうぞよろしくお願いいたします。
      </p>
    </div>
    <div style="padding:24px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
        このメールは V-Lync より自動送信されています。<br>
        <a href="${unsubUrl}" style="color:#6b7280;">配信停止はこちら</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

// ── Main ───────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
    const startMs = Date.now()
    console.log('cron_send:start', new Date().toISOString())

    if (!authorizeCron(req)) {
        console.warn('cron_send:unauthorized')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const resend = new Resend(process.env.RESEND_API_KEY!)
    const appBase = process.env.APP_BASE_URL ?? 'https://v-lync.vercel.app'

    let processed = 0
    let skipped = 0
    let errors = 0

    try {
        // 1. Fetch all active users from profiles
        const { data: profiles, error: profileErr } = await supabase
            .from('profiles')
            .select('id, sending_enabled, reply_email, rep_name, company_name')
            .eq('sending_enabled', true)

        if (profileErr) throw profileErr

        for (const profile of (profiles ?? [])) {
            // Skip users with sending disabled (double-check)
            if (profile.sending_enabled === false) {
                skipped++
                continue
            }

            // 2. Fetch pending queue items for this user
            const { data: rows, error: queueErr } = await supabase
                .from('sending_queue')
                .select(`
                    id, to_email, lead_id,
                    leads:lead_id (company_name, contact_name, email)
                `)
                .eq('user_id', profile.id)
                .in('status', ['queued', 'pending'])
                .lte('scheduled_at', new Date().toISOString())
                .order('scheduled_at', { ascending: true })
                .limit(10)

            if (queueErr) {
                console.error('cron_send:queue_fetch_error', profile.id, queueErr)
                errors++
                continue
            }

            for (const row of (rows ?? []) as any[]) {
                const lead = row.leads
                const toEmail: string = lead?.email ?? row.to_email
                const contactName: string = lead?.contact_name ?? 'お客様'
                const companyName: string = lead?.company_name ?? ''

                if (!toEmail) {
                    await supabase.from('sending_queue')
                        .update({ status: 'failed', skip_reason: 'no_email' })
                        .eq('id', row.id)
                    skipped++
                    continue
                }

                // 3. Check unsubscribes
                const { data: unsub } = await supabase
                    .from('unsubscribes')
                    .select('email')
                    .eq('email', toEmail.toLowerCase())
                    .limit(1)
                    .single()

                if (unsub) {
                    await supabase.from('sending_queue')
                        .update({ status: 'SKIP', skip_reason: 'unsubscribed' })
                        .eq('id', row.id)
                    skipped++
                    continue
                }

                // 4. Build unsub token — generateUnsubscribeToken() is the sole source
                const token = generateUnsubscribeToken(toEmail)
                const unsubUrl = `${appBase}/unsubscribe?token=${encodeURIComponent(token)}`

                // 5. Send email
                try {
                    await resend.emails.send({
                        from: 'V-Lync <info@v-lync.com>',
                        to: toEmail,
                        replyTo: profile.reply_email ?? undefined,
                        subject: `【V-Lync】${companyName ? companyName + ' ' : ''}${contactName}様へのご案内`,
                        html: buildEmailHtml(contactName, companyName, unsubUrl),
                    })

                    await supabase.from('sending_queue')
                        .update({ status: 'sent', processed_at: new Date().toISOString() })
                        .eq('id', row.id)

                    processed++
                } catch (sendErr) {
                    const msg = sendErr instanceof Error ? sendErr.message : String(sendErr)
                    console.error('cron_send:send_error', toEmail, msg)
                    await supabase.from('sending_queue')
                        .update({ status: 'failed', skip_reason: msg.slice(0, 500) })
                        .eq('id', row.id)
                    errors++
                }
            }
        }
    } catch (err) {
        console.error('cron_send:fatal_error', err)
        return NextResponse.json({ error: 'Internal server error', detail: String(err) }, { status: 500 })
    }

    const durationMs = Date.now() - startMs
    const result = { processed, skipped, errors, durationMs }
    console.log('cron_send:done', result)

    return NextResponse.json({ ok: true, ...result })
}
