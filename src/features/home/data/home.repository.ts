import type { HomeTask, NotificationItem, Shift, UserProfile } from "@/core/models"

export interface HomeOverview {
  notifications: NotificationItem[]
  profile: UserProfile
  shifts: Shift[]
  tasks: HomeTask[]
  unreadNotifications: number
}

export interface HomeRepository {
  getHomeOverview(accountId: string): Promise<HomeOverview>
}
