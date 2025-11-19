/**
 * Timezone Utilities for Santiago, Chile (America/Santiago)
 * Handles timezone conversion and date calculations for streak tracking
 */

/**
 * Gets the current date in Santiago, Chile timezone
 * @returns Date string in YYYY-MM-DD format for Santiago timezone
 */
export function getSantiagoDate(): string {
  // Santiago timezone is UTC-3 (or UTC-4 during DST)
  const now = new Date()
  
  // Convert to Santiago timezone using Intl.DateTimeFormat
  const santiagoDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now)
  
  return santiagoDateStr // Returns YYYY-MM-DD format
}

/**
 * Gets the current timestamp in Santiago timezone
 * @returns ISO string timestamp in Santiago timezone
 */
export function getSantiagoTimestamp(): string {
  const now = new Date()
  
  // Get the timestamp in Santiago timezone
  const santiagoTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now)
  
  return new Date(santiagoTime).toISOString()
}

/**
 * Checks if a given date string is today in Santiago timezone
 * @param dateStr Date string in YYYY-MM-DD format
 * @returns true if the date is today in Santiago timezone
 */
export function isSantiagoToday(dateStr: string): boolean {
  return dateStr === getSantiagoDate()
}

/**
 * Checks if a given date is yesterday in Santiago timezone
 * @param dateStr Date string in YYYY-MM-DD format
 * @returns true if the date is yesterday in Santiago timezone
 */
export function isSantiagoYesterday(dateStr: string): boolean {
  const today = new Date(getSantiagoDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  return dateStr === yesterdayStr
}

/**
 * Gets the number of days between two date strings
 * @param dateStr1 First date in YYYY-MM-DD format
 * @param dateStr2 Second date in YYYY-MM-DD format
 * @returns Number of days between the dates
 */
export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  const date1 = new Date(dateStr1)
  const date2 = new Date(dateStr2)
  
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}
