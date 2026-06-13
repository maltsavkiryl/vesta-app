import type { UserProfile } from "@/core/models"

import { getPayrollProfileGaps, isPayrollProfileComplete } from "./payrollProfile"

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: "employee-1",
    firstName: "Sofia",
    lastName: "Fischer",
    email: "sofia@example.com",
    preferredName: "Sofia",
    phone: "+32 470 00 00 00",
    dateOfBirth: "1995-01-01",
    nationality: "Belgian",
    homeCity: "Brussels",
    address: {
      street: "Rue de la Loi 123",
      postalCode: "1000",
      city: "Brussels",
      country: "Belgium",
    },
    emergencyContact: { name: "", relationship: "", phone: "" },
    onboardingComplete: true,
    bio: "",
    language: "en",
    motionPreference: "system",
    themePreference: "system",
    security: { faceIdEnabled: false, biometricType: "", passwordLastChangedAt: "" },
    privacy: {
      analyticsEnabled: true,
      crashReportsEnabled: true,
      employerDataSharingEnabled: true,
    },
    bankAccount: {
      iban: "BE68 5390 0754 7034",
      bic: "GKCCBEBB",
      bankName: "Belfius",
      accountHolder: "Sofia Fischer",
    },
    legal: {
      nationalRegisterNumber: "00.00.00-000.00",
      taxId: "",
      socialSecurityNumber: "00000000000",
      workPermitStatus: "",
      payrollStatus: "",
    },
    notificationPreferences: {
      shiftReminders: true,
      scheduleChanges: true,
      documentRequests: true,
      payslips: true,
      employerAnnouncements: false,
    },
    ...overrides,
  }
}

describe("getPayrollProfileGaps", () => {
  it("returns no gaps for a fully completed payroll profile", () => {
    expect(getPayrollProfileGaps(makeProfile())).toEqual([])
    expect(isPayrollProfileComplete(makeProfile())).toBe(true)
  })

  it("flags a missing IBAN", () => {
    const gaps = getPayrollProfileGaps(
      makeProfile({ bankAccount: { iban: "", bic: "", bankName: "", accountHolder: "" } }),
    )

    expect(gaps).toEqual([{ key: "iban", label: "Bank account (IBAN)" }])
    expect(
      isPayrollProfileComplete(
        makeProfile({ bankAccount: { iban: "", bic: "", bankName: "", accountHolder: "" } }),
      ),
    ).toBe(false)
  })

  it("flags a missing SSIN (social security number)", () => {
    const gaps = getPayrollProfileGaps(
      makeProfile({
        legal: {
          nationalRegisterNumber: "x",
          taxId: "",
          socialSecurityNumber: "",
          workPermitStatus: "",
          payrollStatus: "",
        },
      }),
    )

    expect(gaps).toEqual([{ key: "ssin", label: "National number (SSIN)" }])
  })

  it("treats the address as a single gap when any part is missing", () => {
    const gaps = getPayrollProfileGaps(
      makeProfile({
        address: {
          street: "Rue de la Loi 123",
          postalCode: "",
          city: "Brussels",
          country: "Belgium",
        },
      }),
    )

    expect(gaps).toEqual([{ key: "address", label: "Home address" }])
  })

  it("returns two gaps when both IBAN and address are missing", () => {
    const gaps = getPayrollProfileGaps(
      makeProfile({
        bankAccount: { iban: "", bic: "", bankName: "", accountHolder: "" },
        address: { street: "", postalCode: "", city: "", country: "" },
      }),
    )

    expect(gaps.map((gap) => gap.key)).toEqual(["iban", "address"])
    expect(gaps).toHaveLength(2)
  })

  it("treats whitespace-only values as missing", () => {
    const gaps = getPayrollProfileGaps(makeProfile({ phone: "   " }))

    expect(gaps).toEqual([{ key: "phone", label: "Phone number" }])
  })

  it("still flags missing name and email when absent", () => {
    const gaps = getPayrollProfileGaps(makeProfile({ firstName: "", lastName: "", email: "" }))

    expect(gaps.map((gap) => gap.key)).toEqual(["firstName", "lastName", "email"])
  })
})
