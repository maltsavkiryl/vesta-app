export const ONBOARDING_TOTAL_STEPS = 6

// Display labels live in i18n (`onboarding:*`); these arrays carry only the
// stable ids/icons plus the translation keys to resolve at render.
export const ONBOARDING_ROLES = [
  { id: "Waiter", labelKey: "onboarding:roles.Waiter", icon: "restaurant-outline" },
  { id: "Bartender", labelKey: "onboarding:roles.Bartender", icon: "wine-outline" },
  { id: "Chef", labelKey: "onboarding:roles.Chef", icon: "fast-food-outline" },
  { id: "Host", labelKey: "onboarding:roles.Host", icon: "people-outline" },
  { id: "Cashier", labelKey: "onboarding:roles.Cashier", icon: "card-outline" },
  { id: "Manager", labelKey: "onboarding:roles.Manager", icon: "briefcase-outline" },
  { id: "Driver", labelKey: "onboarding:roles.Driver", icon: "car-outline" },
  { id: "Cleaner", labelKey: "onboarding:roles.Cleaner", icon: "sparkles-outline" },
  { id: "Other", labelKey: "onboarding:roles.Other", icon: "add-outline" },
] as const

export const ONBOARDING_DAYS = [
  { id: "Mon", labelKey: "onboarding:days.Mon" },
  { id: "Tue", labelKey: "onboarding:days.Tue" },
  { id: "Wed", labelKey: "onboarding:days.Wed" },
  { id: "Thu", labelKey: "onboarding:days.Thu" },
  { id: "Fri", labelKey: "onboarding:days.Fri" },
  { id: "Sat", labelKey: "onboarding:days.Sat" },
  { id: "Sun", labelKey: "onboarding:days.Sun" },
] as const

export const ONBOARDING_TIME_SLOTS = [
  {
    id: "mornings",
    labelKey: "onboarding:timeSlots.morningsLabel",
    subKey: "onboarding:timeSlots.morningsSub",
  },
  {
    id: "evenings",
    labelKey: "onboarding:timeSlots.eveningsLabel",
    subKey: "onboarding:timeSlots.eveningsSub",
  },
  {
    id: "full",
    labelKey: "onboarding:timeSlots.fullLabel",
    subKey: "onboarding:timeSlots.fullSub",
  },
  {
    id: "flexible",
    labelKey: "onboarding:timeSlots.flexibleLabel",
    subKey: "onboarding:timeSlots.flexibleSub",
  },
] as const

export const ONBOARDING_NOTIFICATION_OPTIONS = [
  {
    key: "shifts",
    icon: "calendar-outline",
    labelKey: "onboarding:notifications.shiftsLabel",
    descKey: "onboarding:notifications.shiftsDesc",
  },
  {
    key: "schedule",
    icon: "calendar-outline",
    labelKey: "onboarding:notifications.scheduleLabel",
    descKey: "onboarding:notifications.scheduleDesc",
  },
  {
    key: "payslips",
    icon: "document-text-outline",
    labelKey: "onboarding:notifications.payslipsLabel",
    descKey: "onboarding:notifications.payslipsDesc",
  },
  {
    key: "timeoff",
    icon: "notifications-outline",
    labelKey: "onboarding:notifications.timeoffLabel",
    descKey: "onboarding:notifications.timeoffDesc",
  },
  {
    key: "updates",
    icon: "notifications-outline",
    labelKey: "onboarding:notifications.updatesLabel",
    descKey: "onboarding:notifications.updatesDesc",
  },
] as const

export interface OnboardingEmployer {
  id: string
  code: string
  name: string
  type: string
  city: string
  teamSize: number
  rating: number
}
