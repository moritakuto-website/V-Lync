import crypto from 'crypto'

const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || 'default-secret-change-in-production'

/**
 * Generate HMAC-SHA256 token for unsubscribe link
 * @param clientId - User ID of the client
 * @param email - Email address to unsubscribe
 * @returns HMAC token
 */
export function generateUnsubscribeToken(clientId: string, email: string): string {
    const normalizedEmail = normalizeEmail(email)
    const payload = `${clientId}:${normalizedEmail}`

    return crypto
        .createHmac('sha256', UNSUBSCRIBE_SECRET)
        .update(payload)
        .digest('hex')
}

/**
 * Verify unsubscribe token
 * @param clientId - User ID of the client
 * @param email - Email address to unsubscribe
 * @param token - Token to verify
 * @returns true if token is valid
 */
export function verifyUnsubscribeToken(clientId: string, email: string, token: string): boolean {
    const expectedToken = generateUnsubscribeToken(clientId, email)

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
        Buffer.from(expectedToken),
        Buffer.from(token)
    )
}

/**
 * Normalize email address for consistent token generation
 * @param email - Raw email address
 * @returns Normalized email (trimmed, lowercased, URL decoded)
 */
export function normalizeEmail(email: string): string {
    return decodeURIComponent(email.trim().toLowerCase())
}
