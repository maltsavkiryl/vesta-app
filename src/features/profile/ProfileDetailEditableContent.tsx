import type { ReactNode } from "react"

import {
  BankingVerificationSection,
  LegalPrivacyPreviewSection,
} from "@/features/profile/ProfileDetailSections"
import {
  AddressEditSections,
  BankingEditSections,
  ContactEditSections,
  LegalEditSections,
  PersonalEditSections,
} from "@/features/profile/ProfileEditableSections"
import { SectionFooter } from "@/features/profile/sections/ProfileSectionShared"
import { maskSensitiveId } from "@/utils/formatters"

import type { SectionKey } from "./profileSections"
import type { ProfileDetailScreenState } from "./useProfileDetailScreen"

export const EDITABLE_SECTION_CONTENT: Partial<
  Record<
    SectionKey,
    {
      editable: boolean
      render: (screen: ProfileDetailScreenState) => ReactNode
    }
  >
> = {
  address: {
    editable: true,
    render: ({ addressState, setAddressState }) => (
      <>
        <AddressEditSections addressState={addressState} setAddressState={setAddressState} />
        <SectionFooter text="This address is used for employment records, payroll correspondence, and legally required mail." />
      </>
    ),
  },
  banking: {
    editable: true,
    render: ({ bankState, setBankState, tokens }) => (
      <>
        <BankingEditSections bankState={bankState} setBankState={setBankState} />
        <SectionFooter text="Bank details are masked in the app and only used by payroll once your employer verifies them." />
        <BankingVerificationSection hasIban={Boolean(bankState.iban)} tokens={tokens} />
      </>
    ),
  },
  contact: {
    editable: true,
    render: ({ contactState, setContactState }) => (
      <>
        <ContactEditSections contactState={contactState} setContactState={setContactState} />
        <SectionFooter text="Your active employer can use these details for schedule changes and urgent shift updates." />
      </>
    ),
  },
  legal: {
    editable: true,
    render: ({ legalState, setLegalState, tokens }) => (
      <>
        <LegalEditSections legalState={legalState} setLegalState={setLegalState} />
        <SectionFooter text="Identity numbers stay hidden after saving. Vesta only exposes what payroll and employment compliance require." />
        <LegalPrivacyPreviewSection
          maskedNationalNumber={maskSensitiveId(legalState.nationalRegisterNumber)}
          tokens={tokens}
        />
      </>
    ),
  },
  personal: {
    editable: true,
    render: ({ personalState, setPersonalState }) => (
      <PersonalEditSections personalState={personalState} setPersonalState={setPersonalState} />
    ),
  },
}
