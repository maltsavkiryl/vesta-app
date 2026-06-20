import type { UserProfile } from "@/core/models"

// Wire shapes (camelCase JSON) owned by the backend.
export interface AddressDto {
  street?: string | null
  houseNumber?: string | null
  boxNumber?: string | null
  zipCode?: string | null
  city?: string | null
  country?: string | null
}

export interface EmployeeDto {
  uniqueCode: string
  firstName?: string | null
  lastName?: string | null
  iban?: string | null
  ssin?: string | null
  address?: AddressDto | null
  email?: string | null
  phoneNumber?: string | null
  culture?: string | null
  isActive?: boolean | null
  employerUniqueCode?: string | null
  employerName?: string | null
}

export interface UpdateMyEmployeeDto {
  firstName?: string
  lastName?: string
  iban?: string
  ssin?: string
  address?: AddressDto
  email?: string
  phoneNumber?: string
  culture?: string
}

function joinStreet(street?: string | null, houseNumber?: string | null): string {
  return [street, houseNumber]
    .filter((part) => part != null && part !== "")
    .join(" ")
    .trim()
}

/**
 * Map a backend EmployeeDto into the domain UserProfile.
 * Backend-owned fields come from the DTO; every UI-only field falls back to
 * `base` (if provided) or a sensible default so the result fully satisfies UserProfile.
 */
export function toUserProfile(dto: EmployeeDto, base?: Partial<UserProfile>): UserProfile {
  const firstName = dto.firstName ?? base?.firstName ?? ""
  const lastName = dto.lastName ?? base?.lastName ?? ""

  return {
    id: dto.uniqueCode,
    firstName,
    lastName,
    email: dto.email ?? base?.email ?? "",
    role: base?.role,
    preferredName: base?.preferredName ?? firstName,
    avatarUri: base?.avatarUri,
    phone: dto.phoneNumber ?? base?.phone ?? "",
    dateOfBirth: base?.dateOfBirth ?? "",
    nationality: base?.nationality ?? "",
    homeCity: dto.address?.city ?? base?.homeCity ?? "",
    address: {
      street:
        joinStreet(dto.address?.street, dto.address?.houseNumber) || (base?.address?.street ?? ""),
      postalCode: dto.address?.zipCode ?? base?.address?.postalCode ?? "",
      city: dto.address?.city ?? base?.address?.city ?? "",
      country: dto.address?.country ?? base?.address?.country ?? "",
    },
    emergencyContact: {
      name: base?.emergencyContact?.name ?? "",
      relationship: base?.emergencyContact?.relationship ?? "",
      phone: base?.emergencyContact?.phone ?? "",
    },
    onboardingComplete: base?.onboardingComplete ?? true,
    bio: base?.bio ?? "",
    language: dto.culture ?? base?.language ?? "en",
    motionPreference: base?.motionPreference ?? "system",
    themePreference: base?.themePreference ?? "system",
    security: {
      faceIdEnabled: base?.security?.faceIdEnabled ?? false,
      biometricType: base?.security?.biometricType ?? "",
      passwordLastChangedAt: base?.security?.passwordLastChangedAt ?? "",
    },
    privacy: {
      analyticsEnabled: base?.privacy?.analyticsEnabled ?? false,
      crashReportsEnabled: base?.privacy?.crashReportsEnabled ?? false,
      employerDataSharingEnabled: base?.privacy?.employerDataSharingEnabled ?? false,
    },
    bankAccount: {
      iban: dto.iban ?? base?.bankAccount?.iban ?? "",
      bic: base?.bankAccount?.bic ?? "",
      bankName: base?.bankAccount?.bankName ?? "",
      accountHolder: base?.bankAccount?.accountHolder ?? `${firstName} ${lastName}`.trim(),
    },
    legal: {
      nationalRegisterNumber: base?.legal?.nationalRegisterNumber ?? "",
      taxId: base?.legal?.taxId ?? "",
      socialSecurityNumber: dto.ssin ?? base?.legal?.socialSecurityNumber ?? "",
      workPermitStatus: base?.legal?.workPermitStatus ?? "",
      payrollStatus: base?.legal?.payrollStatus ?? "",
    },
    notificationPreferences: {
      shiftReminders: base?.notificationPreferences?.shiftReminders ?? true,
      scheduleChanges: base?.notificationPreferences?.scheduleChanges ?? true,
      documentRequests: base?.notificationPreferences?.documentRequests ?? true,
      payslips: base?.notificationPreferences?.payslips ?? true,
      employerAnnouncements: base?.notificationPreferences?.employerAnnouncements ?? true,
    },
  }
}

/**
 * Map a partial UserProfile into the backend UpdateMyEmployeeDto.
 * Only backend-owned fields are set, and only when present (undefined-guarded).
 */
export function toUpdateMyEmployeeDto(profile: Partial<UserProfile>): UpdateMyEmployeeDto {
  const dto: UpdateMyEmployeeDto = {}

  if (profile.firstName !== undefined) dto.firstName = profile.firstName
  if (profile.lastName !== undefined) dto.lastName = profile.lastName
  if (profile.email !== undefined) dto.email = profile.email
  if (profile.phone !== undefined) dto.phoneNumber = profile.phone
  if (profile.language !== undefined) dto.culture = profile.language
  if (profile.bankAccount?.iban !== undefined) dto.iban = profile.bankAccount.iban
  if (profile.legal?.socialSecurityNumber !== undefined)
    dto.ssin = profile.legal.socialSecurityNumber

  if (profile.address !== undefined) {
    dto.address = {
      street: profile.address.street,
      zipCode: profile.address.postalCode,
      city: profile.address.city,
      country: profile.address.country,
    }
  }

  return dto
}
