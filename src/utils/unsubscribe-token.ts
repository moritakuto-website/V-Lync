import crypto from 'crypto'

/**
 * Generate a base64url token embedding email + timestamp + HMAC-SHA256 sig.
 * Format: base64url( emailLower + "." + ts + "." + sig )
 * where sig = HMAC-SHA256(UNSUB_SECRET, emailLower + "." + ts) as base64url
 * ts is Unix seconds as a decimal string.
 */
export function generateUnsubscribeToken(email: string): string {
    const secret = process.env.UNSUB_SECRET ?? ''
    const emailLower = email.trim().toLowerCase()
    const ts = Math.floor(Date.now() / 1000).toString()
    const raw = `${emailLower}.${ts}`
    const sig = crypto
        .createHmac('sha256', secret)
        .update(raw)
        .digest('base64url')
    return Buffer.from(`${raw}.${sig}`).toString('base64url')
}

export type VerifyResult =
    | { ok: true; email: string }
    | { ok: false; reason: 'env_missing' | 'missing_token' | 'bad_format' | 'sig_mismatch' | 'bad_ts' | 'expired' | 'future_ts' }

/**
 * Decode and verify a token. Returns VerifyResult with structured diagnostics.
 */
export function verifyUnsubscribeTokenDetailed(
    token: string,
    maxAgeSec = 30 * 24 * 3600
): VerifyResult {
    const secret = process.env.UNSUB_SECRET ?? ''

    // ── 診断ログ (console.debug — devオーバーレイを出さない) ──────────────────
    const hasSecret = secret.length > 0
    const tokenLen = token.length

    if (!hasSecret) {
        console.debug('[unsub:verify]', JSON.stringify({ reason: 'env_missing', hasSecret, tokenLen }))
        return { ok: false, reason: 'env_missing' }
    }

    let decoded: string
    try {
        decoded = Buffer.from(token, 'base64url').toString('utf8')
    } catch {
        console.debug('[unsub:verify]', JSON.stringify({ reason: 'bad_format', hasSecret, tokenLen, stage: 'base64url_decode' }))
        return { ok: false, reason: 'bad_format' }
    }

    const decodedLen = decoded.length

    // Outer split: last "." separates payload from sig
    const lastDot = decoded.lastIndexOf('.')
    if (lastDot === -1) {
        console.debug('[unsub:verify]', JSON.stringify({ reason: 'bad_format', hasSecret, tokenLen, decodedLen, stage: 'no_sig_dot' }))
        return { ok: false, reason: 'bad_format' }
    }

    const payload = decoded.slice(0, lastDot)   // "emailLower.ts"
    const sig = decoded.slice(lastDot + 1)

    // Recompute sig
    const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('base64url')

    const sigMatch =
        expectedSig.length === sig.length &&
        crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig))

    if (!sigMatch) {
        console.debug('[unsub:verify]', JSON.stringify({ reason: 'sig_mismatch', hasSecret, tokenLen, decodedLen, payloadLen: payload.length }))
        return { ok: false, reason: 'sig_mismatch' }
    }

    // Inner split: last "." of payload separates email from ts
    const tsDot = payload.lastIndexOf('.')
    if (tsDot === -1) {
        console.debug('[unsub:verify]', JSON.stringify({ reason: 'bad_format', hasSecret, tokenLen, decodedLen, stage: 'no_ts_dot' }))
        return { ok: false, reason: 'bad_format' }
    }

    const emailLower = payload.slice(0, tsDot)
    const tsRaw = payload.slice(tsDot + 1)
    const ts = parseInt(tsRaw, 10)

    if (!ts || isNaN(ts)) {
        console.debug('[unsub:verify]', JSON.stringify({ reason: 'bad_ts', hasSecret, tokenLen, decodedLen, tsRaw, emailExtracted: emailLower.length > 0 }))
        return { ok: false, reason: 'bad_ts' }
    }

    const nowSec = Math.floor(Date.now() / 1000)
    const ageSec = nowSec - ts

    if (ageSec > maxAgeSec) {
        console.debug('[unsub:verify]', JSON.stringify({ reason: 'expired', hasSecret, tokenLen, decodedLen, ts, nowSec, ageSec, emailExtracted: true }))
        return { ok: false, reason: 'expired' }
    }

    if (ts > nowSec + 60) {
        console.debug('[unsub:verify]', JSON.stringify({ reason: 'future_ts', hasSecret, tokenLen, decodedLen, ts, nowSec, ageSec }))
        return { ok: false, reason: 'future_ts' }
    }

    console.debug('[unsub:verify]', JSON.stringify({ reason: 'ok', hasSecret, tokenLen, decodedLen, ts, ageSec, emailExtracted: true }))
    return { ok: true, email: emailLower }
}

/**
 * Convenience wrapper — returns email or null.
 */
export function verifyUnsubscribeToken(token: string, maxAgeSec = 30 * 24 * 3600): string | null {
    const result = verifyUnsubscribeTokenDetailed(token, maxAgeSec)
    return result.ok ? result.email : null
}
