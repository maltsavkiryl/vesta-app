import type { UserProfile } from "@/core/models"

import type { SectionKey } from "./profileSections"

export type PersonalState = Pick<
  UserProfile,
  "bio" | "dateOfBirth" | "firstName" | "lastName" | "nationality" | "preferredName"
>
export type ContactState = Pick<UserProfile, "email" | "emergencyContact" | "phone">
export type AddressState = Pick<UserProfile, "address" | "homeCity">
export type BankingState = UserProfile["bankAccount"]
export type LegalState = UserProfile["legal"]

export function createProfileFormState(profile: UserProfile) {
  return {
    addressState: {
      address: profile.address,
      homeCity: profile.homeCity,
    },
    bankState: profile.bankAccount,
    contactState: {
      email: profile.email,
      emergencyContact: profile.emergencyContact,
      phone: profile.phone,
    },
    legalState: profile.legal,
    personalState: {
      bio: profile.bio,
      dateOfBirth: profile.dateOfBirth,
      firstName: profile.firstName,
      lastName: profile.lastName,
      nationality: profile.nationality,
      preferredName: profile.preferredName,
    },
  }
}

export function createDirtyProfileState({
  addressState,
  bankState,
  contactState,
  legalState,
  personalState,
  profile,
}: {
  addressState: AddressState
  bankState: BankingState
  contactState: ContactState
  legalState: LegalState
  personalState: PersonalState
  profile: UserProfile
}) {
  return {
    address:
      JSON.stringify(addressState) !==
      JSON.stringify({ address: profile.address, homeCity: profile.homeCity }),
    banking: JSON.stringify(bankState) !== JSON.stringify(profile.bankAccount),
    contact:
      JSON.stringify(contactState) !==
      JSON.stringify({
        email: profile.email,
        emergencyContact: profile.emergencyContact,
        phone: profile.phone,
      }),
    legal: JSON.stringify(legalState) !== JSON.stringify(profile.legal),
    personal:
      JSON.stringify(personalState) !==
      JSON.stringify({
        bio: profile.bio,
        dateOfBirth: profile.dateOfBirth,
        firstName: profile.firstName,
        lastName: profile.lastName,
        nationality: profile.nationality,
        preferredName: profile.preferredName,
      }),
  }
}

export function saveProfileSection({
  addressState,
  bankState,
  contactState,
  dirtyState,
  legalState,
  onSaved,
  personalState,
  section,
  updateProfile,
}: {
  addressState: AddressState
  bankState: BankingState
  contactState: ContactState
  dirtyState: ReturnType<typeof createDirtyProfileState>
  legalState: LegalState
  onSaved: () => void
  personalState: PersonalState
  section: SectionKey
  updateProfile: (payload: Partial<UserProfile>) => void
}) {
  if (section === "personal" && dirtyState.personal) {
    updateProfile(personalState)
    onSaved()
  }

  if (section === "contact" && dirtyState.contact) {
    updateProfile(contactState)
    onSaved()
  }

  if (section === "address" && dirtyState.address) {
    updateProfile(addressState)
    onSaved()
  }

  if (section === "banking" && dirtyState.banking) {
    updateProfile({ bankAccount: bankState })
    onSaved()
  }

  if (section === "legal" && dirtyState.legal) {
    updateProfile({ legal: legalState })
    onSaved()
  }
}
