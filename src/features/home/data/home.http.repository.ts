import type { DocumentsRepository } from "@/features/documents/data/documents.repository"
import type { NotificationsRepository } from "@/features/notifications/data/notifications.repository"
import type { ProfileRepository } from "@/features/profile/data/profile.repository"
import type { ScheduleRepository } from "@/features/schedule/data/schedule.repository"

import type { HomeOverview, HomeRepository } from "./home.repository"
import { deriveHomeTasks } from "./home.tasks"

export interface HomeHttpRepositoryDeps {
  documents: DocumentsRepository
  notifications: NotificationsRepository
  profile: ProfileRepository
  schedule: ScheduleRepository
}

/**
 * The home overview is an aggregate of data the backend already exposes through
 * dedicated endpoints (profile, schedule, notifications, documents). Rather than
 * add a bespoke aggregation endpoint, this repository composes the existing real
 * repositories and reuses their verified DTO→domain mappers, fetching in
 * parallel. Task derivation is shared with the mock via {@link deriveHomeTasks}.
 */
export function createHomeHttpRepository(deps: HomeHttpRepositoryDeps): HomeRepository {
  return {
    async getHomeOverview(accountId): Promise<HomeOverview> {
      const [profile, schedule, notifications, documents] = await Promise.all([
        deps.profile.getProfile(accountId),
        deps.schedule.getSchedule(accountId),
        deps.notifications.getNotifications(accountId),
        deps.documents.getDocuments(accountId),
      ])

      return {
        notifications,
        profile,
        shifts: schedule.shifts,
        tasks: deriveHomeTasks({
          documents,
          planningWindows: schedule.planningWindows,
          shifts: schedule.shifts,
        }),
        unreadNotifications: notifications.filter((notification) => notification.unread).length,
      }
    },
  }
}
