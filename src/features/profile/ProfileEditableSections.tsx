import { Dispatch, SetStateAction } from "react"

import type { UserProfile } from "@/core/models"
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
      <GroupedSection title="Profile">
        <DetailFieldGroup>
          <DetailFieldRow
            label="First name"
            onChangeText={(firstName) => setPersonalState((current) => ({ ...current, firstName }))}
            value={personalState.firstName}
          />
          <DetailFieldRow
            label="Last name"
            onChangeText={(lastName) => setPersonalState((current) => ({ ...current, lastName }))}
            value={personalState.lastName}
          />
          <DetailFieldRow
            label="Preferred name"
            onChangeText={(preferredName) =>
              setPersonalState((current) => ({ ...current, preferredName }))
            }
            value={personalState.preferredName}
          />
          <DetailFieldRow
            keyboardType="numbers-and-punctuation"
            label="Date of birth"
            onChangeText={(dateOfBirth) =>
              setPersonalState((current) => ({ ...current, dateOfBirth }))
            }
            placeholder="DD/MM/YYYY"
            value={personalState.dateOfBirth}
          />
          <DetailFieldRow
            label="Nationality"
            onChangeText={(nationality) =>
              setPersonalState((current) => ({ ...current, nationality }))
            }
            value={personalState.nationality}
          />
        </DetailFieldGroup>
      </GroupedSection>
      <GroupedSection title="About">
        <DetailFieldGroup>
          <DetailFieldRow
            label="Employee note"
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
      <GroupedSection title="Reachability">
        <DetailFieldGroup>
          <DetailFieldRow
            autoCapitalize="none"
            keyboardType="email-address"
            label="Email"
            onChangeText={(email) => setContactState((current) => ({ ...current, email }))}
            value={contactState.email}
          />
          <DetailFieldRow
            keyboardType="phone-pad"
            label="Mobile phone"
            onChangeText={(phone) => setContactState((current) => ({ ...current, phone }))}
            value={contactState.phone}
          />
        </DetailFieldGroup>
      </GroupedSection>
      <GroupedSection title="Emergency contact">
        <DetailFieldGroup>
          <DetailFieldRow
            label="Full name"
            onChangeText={(name) =>
              setContactState((current) => ({
                ...current,
                emergencyContact: { ...current.emergencyContact, name },
              }))
            }
            value={contactState.emergencyContact.name}
          />
          <DetailFieldRow
            label="Relationship"
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
            label="Phone"
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
    <GroupedSection title="Home address">
      <DetailFieldGroup>
        <DetailFieldRow
          label="Street and number"
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
          label="Postal code"
          onChangeText={(postalCode) =>
            setAddressState((current) => ({
              ...current,
              address: { ...current.address, postalCode },
            }))
          }
          value={addressState.address.postalCode}
        />
        <DetailFieldRow
          label="City"
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
          label="Country"
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
    <GroupedSection title="Payroll account">
      <DetailFieldGroup>
        <DetailFieldRow
          autoCapitalize="characters"
          label="IBAN"
          onChangeText={(iban) => setBankState((current) => ({ ...current, iban }))}
          value={bankState.iban}
        />
        <DetailFieldRow
          autoCapitalize="characters"
          label="BIC"
          onChangeText={(bic) => setBankState((current) => ({ ...current, bic }))}
          value={bankState.bic}
        />
        <DetailFieldRow
          label="Bank name"
          onChangeText={(bankName) => setBankState((current) => ({ ...current, bankName }))}
          value={bankState.bankName}
        />
        <DetailFieldRow
          label="Account holder"
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
      <GroupedSection title="Identity">
        <DetailFieldGroup>
          <DetailFieldRow
            keyboardType="numbers-and-punctuation"
            label="National register number"
            onChangeText={(nationalRegisterNumber) =>
              setLegalState((current) => ({ ...current, nationalRegisterNumber }))
            }
            value={legalState.nationalRegisterNumber}
          />
          <DetailFieldRow
            autoCapitalize="characters"
            label="Tax ID"
            onChangeText={(taxId) => setLegalState((current) => ({ ...current, taxId }))}
            value={legalState.taxId}
          />
          <DetailFieldRow
            keyboardType="numbers-and-punctuation"
            label="Social security"
            onChangeText={(socialSecurityNumber) =>
              setLegalState((current) => ({ ...current, socialSecurityNumber }))
            }
            value={legalState.socialSecurityNumber}
          />
        </DetailFieldGroup>
      </GroupedSection>
      <GroupedSection title="Employment compliance">
        <DetailFieldGroup>
          <DetailFieldRow
            label="Work permit status"
            onChangeText={(workPermitStatus) =>
              setLegalState((current) => ({ ...current, workPermitStatus }))
            }
            value={legalState.workPermitStatus}
          />
          <DetailFieldRow
            label="Payroll status"
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
