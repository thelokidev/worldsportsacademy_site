/**
 * Format duration in minutes to a human-readable string
 * @param minutes - Duration in minutes
 * @returns Formatted string like "2 hours" or "1 hour" or "30 minutes"
 */
export function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = minutes / 60
    if (hours === 1) {
      return '1 hour'
    }
    return `${hours} hours`
  }
  return `${minutes} minutes`
}

/**
 * Format duration for display in pricing/promotional text
 * @param minutes - Duration in minutes
 * @returns Short format like "2h" or "1h" or "30m"
 */
export function formatDurationShort(minutes: number): string {
  if (minutes >= 60) {
    const hours = minutes / 60
    return `${hours}h`
  }
  return `${minutes}m`
}

