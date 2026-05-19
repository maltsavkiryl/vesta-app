export const ONBOARDING_TOTAL_STEPS = 6

export const ONBOARDING_ROLES = [
  { id: "Waiter", label: "Waiter", icon: "restaurant-outline" as const },
  { id: "Bartender", label: "Bartender", icon: "wine-outline" as const },
  { id: "Chef", label: "Chef", icon: "fast-food-outline" as const },
  { id: "Host", label: "Host/ess", icon: "people-outline" as const },
  { id: "Cashier", label: "Cashier", icon: "card-outline" as const },
  { id: "Manager", label: "Manager", icon: "briefcase-outline" as const },
  { id: "Driver", label: "Driver", icon: "car-outline" as const },
  { id: "Cleaner", label: "Cleaner", icon: "sparkles-outline" as const },
  { id: "Other", label: "Other", icon: "add-outline" as const },
]

export const ONBOARDING_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export const ONBOARDING_TIME_SLOTS = [
  { id: "mornings", label: "Mornings", sub: "6:00 - 14:00" },
  { id: "evenings", label: "Evenings", sub: "14:00 - 23:00" },
  { id: "full", label: "Full day", sub: "6:00 - 23:00" },
  { id: "flexible", label: "Flexible", sub: "I'll specify" },
]

export const ONBOARDING_NOTIFICATION_OPTIONS = [
  {
    key: "shifts",
    icon: "calendar-outline" as const,
    label: "Shift updates",
    desc: "Reminders before your shift starts",
  },
  {
    key: "schedule",
    icon: "calendar-outline" as const,
    label: "Schedule changes",
    desc: "When your schedule is updated",
  },
  {
    key: "payslips",
    icon: "document-text-outline" as const,
    label: "New payslip",
    desc: "When your payslip is ready",
  },
  {
    key: "timeoff",
    icon: "notifications-outline" as const,
    label: "Request updates",
    desc: "Time off and swap responses",
  },
  {
    key: "updates",
    icon: "notifications-outline" as const,
    label: "App updates",
    desc: "New features and improvements",
  },
]

export interface OnboardingEmployer {
  id: string
  code: string
  name: string
  type: string
  city: string
  teamSize: number
  rating: number
}
