import { format, parseISO, isValid, differenceInDays, differenceInHours, differenceInMinutes, addDays, addHours, addMinutes, startOfDay, endOfDay, isToday, isTomorrow, isYesterday, isThisWeek, isThisMonth, isThisYear } from 'date-fns'
import { APP_CONSTANTS } from './constants'

export type DateInput = Date | string | number

export function parseDate(date: DateInput): Date {
  if (date instanceof Date) {
    return date
  }
  
  if (typeof date === 'string') {
    const parsed = parseISO(date)
    return isValid(parsed) ? parsed : new Date(date)
  }
  
  return new Date(date)
}

export function formatDate(date: DateInput, formatString: string = APP_CONSTANTS.DATE_FORMATS.DISPLAY): string {
  try {
    const parsedDate = parseDate(date)
    return isValid(parsedDate) ? format(parsedDate, formatString) : 'Invalid Date'
  } catch {
    return 'Invalid Date'
  }
}

export function formatDisplayDate(date: DateInput): string {
  return formatDate(date, APP_CONSTANTS.DATE_FORMATS.DISPLAY)
}

export function formatDisplayDateTime(date: DateInput): string {
  return formatDate(date, APP_CONSTANTS.DATE_FORMATS.DISPLAY_WITH_TIME)
}

export function formatTime(date: DateInput): string {
  return formatDate(date, APP_CONSTANTS.DATE_FORMATS.TIME)
}

export function formatInputDate(date: DateInput): string {
  return formatDate(date, APP_CONSTANTS.DATE_FORMATS.INPUT)
}

export function formatFullDate(date: DateInput): string {
  return formatDate(date, APP_CONSTANTS.DATE_FORMATS.FULL)
}

export function getRelativeDate(date: DateInput): string {
  const parsedDate = parseDate(date)
  
  if (!isValid(parsedDate)) {
    return 'Invalid Date'
  }
  
  if (isToday(parsedDate)) {
    return 'Today'
  }
  
  if (isTomorrow(parsedDate)) {
    return 'Tomorrow'
  }
  
  if (isYesterday(parsedDate)) {
    return 'Yesterday'
  }
  
  const daysFromNow = differenceInDays(parsedDate, new Date())
  
  if (Math.abs(daysFromNow) <= 7) {
    if (daysFromNow > 0) {
      return `In ${daysFromNow} day${daysFromNow === 1 ? '' : 's'}`
    } else {
      return `${Math.abs(daysFromNow)} day${Math.abs(daysFromNow) === 1 ? '' : 's'} ago`
    }
  }
  
  return formatDisplayDate(parsedDate)
}

export function getTimeAgo(date: DateInput): string {
  const parsedDate = parseDate(date)
  const now = new Date()
  
  if (!isValid(parsedDate)) {
    return 'Invalid Date'
  }
  
  const minutesAgo = differenceInMinutes(now, parsedDate)
  const hoursAgo = differenceInHours(now, parsedDate)
  const daysAgo = differenceInDays(now, parsedDate)
  
  if (minutesAgo < 1) {
    return 'Just now'
  }
  
  if (minutesAgo < 60) {
    return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`
  }
  
  if (hoursAgo < 24) {
    return `${hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`
  }
  
  if (daysAgo < 30) {
    return `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`
  }
  
  return formatDisplayDate(parsedDate)
}

export function isOverdue(date: DateInput): boolean {
  const parsedDate = parseDate(date)
  const now = new Date()
  
  if (!isValid(parsedDate)) {
    return false
  }
  
  return parsedDate < startOfDay(now)
}

export function isDueToday(date: DateInput): boolean {
  const parsedDate = parseDate(date)
  return isValid(parsedDate) && isToday(parsedDate)
}

export function isDueTomorrow(date: DateInput): boolean {
  const parsedDate = parseDate(date)
  return isValid(parsedDate) && isTomorrow(parsedDate)
}

export function isDueThisWeek(date: DateInput): boolean {
  const parsedDate = parseDate(date)
  return isValid(parsedDate) && isThisWeek(parsedDate)
}

export function isDueThisMonth(date: DateInput): boolean {
  const parsedDate = parseDate(date)
  return isValid(parsedDate) && isThisMonth(parsedDate)
}

export function getDueDateStatus(date: DateInput): 'overdue' | 'today' | 'tomorrow' | 'this-week' | 'this-month' | 'future' {
  const parsedDate = parseDate(date)
  
  if (!isValid(parsedDate)) {
    return 'future'
  }
  
  if (isOverdue(parsedDate)) {
    return 'overdue'
  }
  
  if (isDueToday(parsedDate)) {
    return 'today'
  }
  
  if (isDueTomorrow(parsedDate)) {
    return 'tomorrow'
  }
  
  if (isDueThisWeek(parsedDate)) {
    return 'this-week'
  }
  
  if (isDueThisMonth(parsedDate)) {
    return 'this-month'
  }
  
  return 'future'
}

export function getDueDateClass(date: DateInput): string {
  const status = getDueDateStatus(date)
  
  switch (status) {
    case 'overdue':
      return 'text-red-600 dark:text-red-400'
    case 'today':
      return 'text-orange-600 dark:text-orange-400'
    case 'tomorrow':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'this-week':
      return 'text-blue-600 dark:text-blue-400'
    case 'this-month':
      return 'text-green-600 dark:text-green-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

export function addDaysToDate(date: DateInput, days: number): Date {
  return addDays(parseDate(date), days)
}

export function addHoursToDate(date: DateInput, hours: number): Date {
  return addHours(parseDate(date), hours)
}

export function addMinutesToDate(date: DateInput, minutes: number): Date {
  return addMinutes(parseDate(date), minutes)
}

export function getStartOfDay(date: DateInput): Date {
  return startOfDay(parseDate(date))
}

export function getEndOfDay(date: DateInput): Date {
  return endOfDay(parseDate(date))
}

export function getDateRange(startDate: DateInput, endDate: DateInput): Date[] {
  const start = getStartOfDay(startDate)
  const end = getStartOfDay(endDate)
  const dates: Date[] = []
  
  let currentDate = start
  while (currentDate <= end) {
    dates.push(new Date(currentDate))
    currentDate = addDays(currentDate, 1)
  }
  
  return dates
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatPomodoroTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function parseDuration(duration: string): number {
  const parts = duration.split(':').map(Number)
  
  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1]
  }
  
  if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  
  return 0
}

export function getWeekDates(): Date[] {
  const today = new Date()
  const currentDay = today.getDay()
  const monday = addDays(today, -currentDay + (currentDay === 0 ? -6 : 1))
  
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

export function getMonthDates(date: DateInput = new Date()): Date[] {
  const parsedDate = parseDate(date)
  const year = parsedDate.getFullYear()
  const month = parsedDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  return getDateRange(firstDay, lastDay)
}

export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && isValid(date)
}

export function isValidDateString(dateString: string): boolean {
  return isValid(parseISO(dateString))
}

export default {
  parseDate,
  formatDate,
  formatDisplayDate,
  formatDisplayDateTime,
  formatTime,
  formatInputDate,
  formatFullDate,
  getRelativeDate,
  getTimeAgo,
  isOverdue,
  isDueToday,
  isDueTomorrow,
  isDueThisWeek,
  isDueThisMonth,
  getDueDateStatus,
  getDueDateClass,
  addDaysToDate,
  addHoursToDate,
  addMinutesToDate,
  getStartOfDay,
  getEndOfDay,
  getDateRange,
  formatDuration,
  formatPomodoroTime,
  parseDuration,
  getWeekDates,
  getMonthDates,
  isValidDate,
  isValidDateString,
}