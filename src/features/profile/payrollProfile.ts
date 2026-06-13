import type { UserProfile } from "@/core/models"

/**
 * A single missing payroll-profile requirement, surfaced to the employee as a
 * friendly, actionable label rather than a raw field name.
 */
export interface PayrollProfileGap {
  key: string
  label: string
}

function hasValue(value?: string) {
  return Boolean(value?.trim())
}

/**
 * Mirrors the backend `EmployeeDto.IsProfileComplete()` contract: payroll cannot
 * run until these fields are on file. We compute the gaps from the mapped mobile
 * `UserProfile`, so the employee can be nudged to fill them in.
 *
 * Address is treated as a single gap: if any of street / postal code / city /
 * country is missing, we surface one "Home address" item rather than four.
 */
export function getPayrollProfileGaps(profile: UserProfile): PayrollProfileGap[] {
  const gaps: PayrollProfileGap[] = []

  if (!hasValue(profile.firstName)) {
    gaps.push({ key: "firstName", label: "First name" })
  }
  if (!hasValue(profile.lastName)) {
    gaps.push({ key: "lastName", label: "Last name" })
  }
  if (!hasValue(profile.email)) {
    gaps.push({ key: "email", label: "Email address" })
  }
  if (!hasValue(profile.phone)) {
    gaps.push({ key: "phone", label: "Phone number" })
  }
  if (!hasValue(profile.bankAccount.iban)) {
    gaps.push({ key: "iban", label: "Bank account (IBAN)" })
  }
  if (!hasValue(profile.legal.socialSecurityNumber)) {
    gaps.push({ key: "ssin", label: "National number (SSIN)" })
  }

  const addressComplete =
    hasValue(profile.address.street) &&
    hasValue(profile.address.postalCode) &&
    hasValue(profile.address.city) &&
    hasValue(profile.address.country)
  if (!addressComplete) {
    gaps.push({ key: "address", label: "Home address" })
  }

  return gaps
}

export function isPayrollProfileComplete(profile: UserProfile): boolean {
  return getPayrollProfileGaps(profile).length === 0
}
