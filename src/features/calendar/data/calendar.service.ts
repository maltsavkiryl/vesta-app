import { httpClient } from "@/services/api"

interface CalendarFeedDto {
  url: string
}

/**
 * Fetches the employee's private iCalendar subscribe URL (creating the feed on
 * first use). Returns null when unavailable (e.g. running against mock data).
 */
export async function getCalendarFeedUrl(): Promise<string | null> {
  const res = await httpClient.get<CalendarFeedDto>("/employee/calendar/feed")
  return res.ok && res.data?.url ? res.data.url : null
}
