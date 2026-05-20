import { createInitialState } from "@/core/mockState"

import { getProfileSetupStatus } from "./profileSetupStatus"

describe("getProfileSetupStatus", () => {
  it("reports the next missing setup step from the real profile data", () => {
    const status = getProfileSetupStatus(createInitialState())

    expect(status.progress).toBe(35)
    expect(status.title).toBe("Account setup")
    expect(status.remainingCount).toBe(4)
    expect(status.detail).toBe("Add your phone number so employers can reach you quickly about shifts.")
  })

  it("marks the profile ready when all required setup details are present", () => {
    const state = createInitialState()

    state.profile.phone = "+32 470 00 00 00"
    state.profile.address.street = "Rue de la Loi 123"
    state.profile.address.postalCode = "1000"
    state.profile.emergencyContact = {
      name: "Emma Fischer",
      phone: "+32 470 11 11 11",
      relationship: "Sister",
    }
    state.profile.bankAccount = {
      accountHolder: "Sofia Fischer",
      bankName: "KBC",
      bic: "KREDBEBB",
      iban: "BE68539007547034",
    }
    state.profile.legal = {
      ...state.profile.legal,
      nationalRegisterNumber: "93.05.17-001.45",
      socialSecurityNumber: "BE-7733-2288",
      taxId: "BE123456789",
    }

    const status = getProfileSetupStatus(state)

    expect(status.progress).toBe(100)
    expect(status.title).toBe("Ready to work")
    expect(status.remainingCount).toBe(0)
    expect(status.detail).toBe("Everything important is on file for shifts, payroll, and support.")
  })
})
