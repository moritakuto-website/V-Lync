import holidays from '@/data/japanese-holidays.json'

const SEND_INTERVAL_SECONDS = 45

/**
 * Check if a date is a Japanese national holiday
 */
export function isJapaneseHoliday(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
    const year = date.getFullYear().toString()

    if (!holidays[year as keyof typeof holidays]) {
        return false
    }

    return holidays[year as keyof typeof holidays].includes(dateStr)
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
    const day = date.getDay()
    return day === 0 || day === 6 // 0 = Sunday, 6 = Saturday
}

/**
 * Check if a date is a business day (not weekend, not holiday)
 */
export function isBusinessDay(date: Date): boolean {
    return !isWeekend(date) && !isJapaneseHoliday(date)
}

/**
 * Get the next business day from a given date
 */
export function getNextBusinessDay(date: Date): Date {
    const next = new Date(date)
    next.setDate(next.getDate() + 1)

    while (!isBusinessDay(next)) {
        next.setDate(next.getDate() + 1)
    }

    return next
}

/**
 * Calculate the next sending time based on schedule settings
 * 
 * @param startTime - Start time in HH:MM format (e.g., "09:00")
 * @param endTime - End time in HH:MM format (e.g., "19:00")
 * @param currentTime - Current time (defaults to now in Asia/Tokyo)
 * @returns Next scheduled sending time
 */
export function getNextSendingTime(
    startTime: string,
    endTime: string,
    currentTime?: Date
): Date {
    // Default to current time in Asia/Tokyo
    const now = currentTime || new Date()

    // Parse start and end times
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    // Validate inputs
    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
        throw new Error('Invalid time format. Use HH:MM')
    }

    // Create date objects for today's start and end times
    const todayStart = new Date(now)
    todayStart.setHours(startHour, startMinute, 0, 0)

    const todayEnd = new Date(now)
    todayEnd.setHours(endHour, endMinute, 0, 0)

    // Rule 1 & 2: If today is weekend or holiday, move to next business day
    if (!isBusinessDay(now)) {
        const nextBizDay = getNextBusinessDay(now)
        nextBizDay.setHours(startHour, startMinute, 0, 0)
        return nextBizDay
    }

    // Rule 3: If current time is past end time, move to next business day
    if (now >= todayEnd) {
        const nextBizDay = getNextBusinessDay(now)
        nextBizDay.setHours(startHour, startMinute, 0, 0)
        return nextBizDay
    }

    // Rule 4: If current time is before start time, return today's start time
    if (now < todayStart) {
        return todayStart
    }

    // Rule 5: We're in business hours - calculate next 45s tick
    const secondsSinceStart = Math.floor((now.getTime() - todayStart.getTime()) / 1000)
    const ticksPassed = Math.floor(secondsSinceStart / SEND_INTERVAL_SECONDS)
    const nextTick = todayStart.getTime() + ((ticksPassed + 1) * SEND_INTERVAL_SECONDS * 1000)
    const nextSendTime = new Date(nextTick)

    // If next tick is past end time, move to next business day
    if (nextSendTime >= todayEnd) {
        const nextBizDay = getNextBusinessDay(now)
        nextBizDay.setHours(startHour, startMinute, 0, 0)
        return nextBizDay
    }

    return nextSendTime
}

/**
 * Format next sending time for display
 */
export function formatNextSendingTime(nextTime: Date): string {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const isToday = nextTime.toDateString() === now.toDateString()
    const isTomorrow = nextTime.toDateString() === tomorrow.toDateString()

    const timeStr = nextTime.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })

    if (isToday) {
        return `本日 ${timeStr}`
    } else if (isTomorrow) {
        return `明日 ${timeStr}`
    } else {
        const dateStr = nextTime.toLocaleDateString('ja-JP', {
            month: 'numeric',
            day: 'numeric'
        })
        return `${dateStr} ${timeStr}`
    }
}
