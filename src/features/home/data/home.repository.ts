import type { Employer, HomeTask, NotificationItem, Shift, UserProfile } from "@/core/models"

export interface HomeOverview {
  earnings: {
    averageHourlyRate: number
    earnedAmount: number
    hoursWorked: number
    monthLabel: string
    shiftsWorked: number
    targetAmount: number
  }
  notifications: NotificationItem[]
  profile: UserProfile
  selectedEmployer?: Employer
  shifts: Shift[]
  tasks: HomeTask[]
  unreadNotifications: number
}

export interface HomeRepository {
  getHomeOverview(accountId: string): Promise<HomeOverview>
}
