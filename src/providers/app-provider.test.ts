import { createInitialState } from "@/core/mockState"

import {
  createStateForPersistence,
  DEMO_AUTH_CREDENTIALS,
  restorePersistedState,
} from "./app-provider"

function createTestState() {
  return JSON.parse(JSON.stringify(createInitialState())) as ReturnType<typeof createInitialState>
}

describe("app-provider persistence", () => {
  it("does not persist sensitive profile fields", () => {
    const state = createTestState()
    state.profile.bankAccount.iban = "BE68 5390 0754 7034"
    state.profile.legal.nationalRegisterNumber = "95.01.15-123.45"

    const persisted = createStateForPersistence(state)

    expect(persisted.state.profile.bankAccount.iban).toBe("")
    expect(persisted.state.profile.legal.nationalRegisterNumber).toBe("")
  })

  it("restores supported persisted state over the current initial shape", () => {
    const state = createTestState()
    state.authStatus = "signedIn"
    state.profile.email = DEMO_AUTH_CREDENTIALS.email
    state.activeEmployerId = "grand-cafe"

    const restored = restorePersistedState(createStateForPersistence(state))

    expect(restored.authStatus).toBe("signedIn")
    expect(restored.profile.email).toBe(DEMO_AUTH_CREDENTIALS.email)
    expect(restored.activeEmployerId).toBe("grand-cafe")
    expect(restored.employerDirectory).toEqual(createInitialState().employerDirectory)
  })

  it("ignores unsupported persisted payloads", () => {
    const restored = restorePersistedState(null)

    expect(restored).toEqual(createInitialState())
  })
})
