import { Dispatch, SetStateAction } from "react"

import type { UserProfile } from "@/core/models"
import { translate } from "@/i18n/translate"
import { GroupedSection } from "@/ui"
import { DetailFieldGroup, DetailFieldRow } from "@/ui"

type PersonalState = Pick<
  UserProfile,
  "bio" | "dateOfBirth" | "firstName" | "lastName" | "nationality" | "preferredName"
>
type ContactState = Pick<UserProfile, "email" | "emergencyContact" | "phone">
type AddressState = Pick<UserProfile, "address" | "homeCity">
type BankingState = UserProfile["bankAccount"]
type LegalState = UserProfile["legal"]

export function PersonalEditSections({
  personalState,
  setPersonalState,
}: {
  personalState: PersonalState
  setPersonalState: Dispatch<SetStateAction<PersonalState>>
}) {
  return (
    <>
      <GroupedSection title={translate("profile:edit.profile")}>
        <DetailFieldGroup>
          <DetailFieldRow
            label={translate("profile:edit.firstName")}
            onChangeText={(firstName) => setPersonalState((current) => ({ ...current, firstName }))}
            value={personalState.firstName}
          />
          <DetailFieldRow
            label={translate("profile:edit.lastName")}
            onChangeText={(lastName) => setPersonalState((current) => ({ ...current, lastName }))}
            value={personalState.lastName}
          />
          <DetailFieldRow
            label={translate("profile:edit.preferredName")}
            onChangeText={(preferredName) =>
              setPersonalState((current) => ({ ...current, preferredName }))
            }
            value={personalState.preferredName}
          />
          <DetailFieldRow
            keyboardType="numbers-and-punctuation"
            label={translate("profile:edit.dateOfBirth")}
            onChangeText={(dateOfBirth) =>
              setPersonalState((current) => ({ ...current, dateOfBirth }))
            }
            placeholder={translate("profile:edit.dobPlaceholder")}
            value={personalState.dateOfBirth}
          />
          <DetailFieldRow
            label={translate("profile:edit.nationality")}
            onChangeText={(nationality) =>
              setPersonalState((current) => ({ ...current, nationality }))
            }
            value={personalState.nationality}
          />
        </DetailFieldGroup>
      </GroupedSection>
      <GroupedSection title={translate("profile:edit.about")}>
        <DetailFieldGroup>
          <DetailFieldRow
            label={translate("profile:edit.employeeNote")}
            multiline
            onChangeText={(bio) => setPersonalState((current) => ({ ...current, bio }))}
            value={personalState.bio}
          />
        </DetailFieldGroup>
      </GroupedSection>
    </>
  )
}

export function ContactEditSections({
  contactState,
  setContactState,
}: {
  contactState: ContactState
  setContactState: Dispatch<SetStateAction<ContactState>>
}) {
  return (
    <>
      <GroupedSection title={translate("profile:edit.reachability")}>
        <DetailFieldGroup>
          <DetailFieldRow
            autoCapitalize="none"
            keyboardType="email-address"
            label={translate("profile:edit.email")}
            onChangeText={(email) => setContactState((current) => ({ ...current, email }))}
            value={contactState.email}
          />
          <DetailFieldRow
            keyboardType="phone-pad"
            label={translate("profile:edit.mobilePhone")}
            onChangeText={(phone) => setContactState((current) => ({ ...current, phone }))}
            value={contactState.phone}
          />
        </DetailFieldGroup>
      </GroupedSection>
      <GroupedSection title={translate("profile:edit.emergencyContact")}>
        <DetailFieldGroup>
          <DetailFieldRow
            label={translate("profile:edit.fullName")}
            onChangeText={(name) =>
              setContactState((current) => ({
                ...current,
                emergencyContact: { ...current.emergencyContact, name },
              }))
            }
            value={contactState.emergencyContact.name}
          />
          <DetailFieldRow
            label={translate("profile:edit.relationship")}
            onChangeText={(relationship) =>
              setContactState((current) => ({
                ...current,
                emergencyContact: { ...current.emergencyContact, relationship },
              }))
            }
            value={contactState.emergencyContact.relationship}
          />
          <DetailFieldRow
            keyboardType="phone-pad"
            label={translate("profile:edit.phone")}
            onChangeText={(phone) =>
              setContactState((current) => ({
                ...current,
                emergencyContact: { ...current.emergencyContact, phone },
              }))
            }
            value={contactState.emergencyContact.phone}
          />
        </DetailFieldGroup>
      </GroupedSection>
    </>
  )
}

export function AddressEditSections({
  addressState,
  setAddressState,
}: {
  addressState: AddressState
  setAddressState: Dispatch<SetStateAction<AddressState>>
}) {
  return (
    <GroupedSection title={translate("profile:edit.homeAddress")}>
      <DetailFieldGroup>
        <DetailFieldRow
          label={translate("profile:edit.streetAndNumber")}
          onChangeText={(street) =>
            setAddressState((current) => ({
              ...current,
              address: { ...current.address, street },
            }))
          }
          value={addressState.address.street}
        />
        <DetailFieldRow
          keyboardType="number-pad"
          label={translate("profile:edit.postalCode")}
          onChangeText={(postalCode) =>
            setAddressState((current) => ({
              ...current,
              address: { ...current.address, postalCode },
            }))
          }
          value={addressState.address.postalCode}
        />
        <DetailFieldRow
          label={translate("profile:edit.city")}
          onChangeText={(city) =>
            setAddressState((current) => ({
              ...current,
              address: { ...current.address, city },
              homeCity: city,
            }))
          }
          value={addressState.address.city}
        />
        <DetailFieldRow
          label={translate("profile:edit.country")}
          onChangeText={(country) =>
            setAddressState((current) => ({
              ...current,
              address: { ...current.address, country },
            }))
          }
          value={addressState.address.country}
        />
      </DetailFieldGroup>
    </GroupedSection>
  )
}

export function BankingEditSections({
  bankState,
  setBankState,
}: {
  bankState: BankingState
  setBankState: Dispatch<SetStateAction<BankingState>>
}) {
  return (
    <GroupedSection title={translate("profile:edit.payrollAccount")}>
      <DetailFieldGroup>
        <DetailFieldRow
          autoCapitalize="characters"
          label={translate("profile:edit.iban")}
          onChangeText={(iban) => setBankState((current) => ({ ...current, iban }))}
          value={bankState.iban}
        />
        <DetailFieldRow
          autoCapitalize="characters"
          label={translate("profile:edit.bic")}
          onChangeText={(bic) => setBankState((current) => ({ ...current, bic }))}
          value={bankState.bic}
        />
        <DetailFieldRow
          label={translate("profile:edit.bankName")}
          onChangeText={(bankName) => setBankState((current) => ({ ...current, bankName }))}
          value={bankState.bankName}
        />
        <DetailFieldRow
          label={translate("profile:edit.accountHolder")}
          onChangeText={(accountHolder) =>
            setBankState((current) => ({ ...current, accountHolder }))
          }
          value={bankState.accountHolder}
        />
      </DetailFieldGroup>
    </GroupedSection>
  )
}

export function LegalEditSections({
  legalState,
  setLegalState,
}: {
  legalState: LegalState
  setLegalState: Dispatch<SetStateAction<LegalState>>
}) {
  return (
    <>
      <GroupedSection title={translate("profile:edit.identity")}>
        <DetailFieldGroup>
          <DetailFieldRow
            keyboardType="numbers-and-punctuation"
            label={translate("profile:edit.nationalRegisterNumber")}
            onChangeText={(nationalRegisterNumber) =>
              setLegalState((current) => ({ ...current, nationalRegisterNumber }))
            }
            value={legalState.nationalRegisterNumber}
          />
          <DetailFieldRow
            autoCapitalize="characters"
            label={translate("profile:edit.taxId")}
            onChangeText={(taxId) => setLegalState((current) => ({ ...current, taxId }))}
            value={legalState.taxId}
          />
          <DetailFieldRow
            keyboardType="numbers-and-punctuation"
            label={translate("profile:edit.socialSecurity")}
            onChangeText={(socialSecurityNumber) =>
              setLegalState((current) => ({ ...current, socialSecurityNumber }))
            }
            value={legalState.socialSecurityNumber}
          />
        </DetailFieldGroup>
      </GroupedSection>
      <GroupedSection title={translate("profile:edit.employmentCompliance")}>
        <DetailFieldGroup>
          <DetailFieldRow
            label={translate("profile:edit.workPermitStatus")}
            onChangeText={(workPermitStatus) =>
              setLegalState((current) => ({ ...current, workPermitStatus }))
            }
            value={legalState.workPermitStatus}
          />
          <DetailFieldRow
            label={translate("profile:edit.payrollStatus")}
            onChangeText={(payrollStatus) =>
              setLegalState((current) => ({ ...current, payrollStatus }))
            }
            value={legalState.payrollStatus}
          />
        </DetailFieldGroup>
      </GroupedSection>
    </>
  )
}
