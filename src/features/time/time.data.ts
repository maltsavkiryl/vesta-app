export type WeekDayDatum = {
  day: string
  hours: number
  today?: boolean
}

export const weekData: WeekDayDatum[] = [
  { day: "M", hours: 6 },
  { day: "T", hours: 5.5 },
  { day: "W", hours: 6.2 },
  { day: "T", hours: 0 },
  { day: "F", hours: 5.75 },
  { day: "S", hours: 6 },
  { day: "S", hours: 0, today: true },
]
