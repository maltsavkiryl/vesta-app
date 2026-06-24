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
import { translate } from "@/i18n/translate"
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
        <SectionFooter text={translate("profile:detailHints.address")} />
      </>
    ),
  },
  banking: {
    editable: true,
    render: ({ bankState, setBankState, tokens }) => (
      <>
        <BankingEditSections bankState={bankState} setBankState={setBankState} />
        <SectionFooter text={translate("profile:detailHints.bank")} />
        <BankingVerificationSection hasIban={Boolean(bankState.iban)} tokens={tokens} />
      </>
    ),
  },
  contact: {
    editable: true,
    render: ({ contactState, setContactState }) => (
      <>
        <ContactEditSections contactState={contactState} setContactState={setContactState} />
        <SectionFooter text={translate("profile:detailHints.reachability")} />
      </>
    ),
  },
  legal: {
    editable: true,
    render: ({ legalState, setLegalState, tokens }) => (
      <>
        <LegalEditSections legalState={legalState} setLegalState={setLegalState} />
        <SectionFooter text={translate("profile:detailHints.identity")} />
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
