import type { UserProfile } from "@/core/models"
import { translate } from "@/i18n/translate"

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

export async function saveProfileSection({
  addressState,
  bankState,
  contactState,
  dirtyState,
  legalState,
  onError,
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
  onError: (message: string) => void
  onSaved: () => void
  personalState: PersonalState
  section: SectionKey
  updateProfile: (
    payload: Partial<UserProfile>,
  ) => Promise<{ ok: boolean; error?: { message: string } }>
}) {
  const payloadBySection: Partial<Record<SectionKey, Partial<UserProfile>>> = {
    personal: dirtyState.personal ? personalState : undefined,
    contact: dirtyState.contact ? contactState : undefined,
    address: dirtyState.address ? addressState : undefined,
    banking: dirtyState.banking ? { bankAccount: bankState } : undefined,
    legal: dirtyState.legal ? { legal: legalState } : undefined,
  }

  const payload = payloadBySection[section]
  // Nothing changed for this section — close without a network call.
  if (!payload) {
    onSaved()
    return
  }

  // Only confirm the save (and close the editor) once the write actually
  // succeeds — otherwise the user would lose their edits on a failed save.
  try {
    const result = await updateProfile(payload)
    if (!result.ok) {
      onError(result.error?.message ?? translate("profile:formError"))
      return
    }
  } catch {
    onError(translate("profile:formError"))
    return
  }

  onSaved()
}
