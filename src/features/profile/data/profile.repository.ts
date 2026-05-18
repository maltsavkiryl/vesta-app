import type { Employer, UserProfile } from "@/core/models"
import type { Result } from "@/shared/result"

import type { ProfileError } from "./profile.errors"

export interface EmployersOverview {
  activeEmployerId: string
  employerDirectory: Employer[]
  employers: Employer[]
}

export interface ProfileRepository {
  getEmployers(accountId: string): Promise<EmployersOverview>
  getProfile(accountId: string): Promise<UserProfile>
  joinEmployer(
    accountId: string,
    employerId: string,
  ): Promise<Result<EmployersOverview, ProfileError>>
  switchEmployer(
    accountId: string,
    employerId: string,
  ): Promise<Result<EmployersOverview, ProfileError>>
  updateProfile(
    accountId: string,
    profile: Partial<UserProfile>,
  ): Promise<Result<UserProfile, ProfileError>>
}
