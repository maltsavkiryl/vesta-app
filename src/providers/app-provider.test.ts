import { createInitialState } from "@/core/mockState"
import {
  createMockBackendDb,
  migrateLegacyPersistedState,
  toAccountSnapshotDto,
  toAppStoreState,
  DEMO_AUTH_CREDENTIALS,
} from "@/services/app/app.transformer"

describe("mock backend persistence", () => {
  it("seeds a demo account by default", () => {
    const db = createMockBackendDb()

    expect(db.accounts).toHaveLength(1)
    expect(db.accounts[0].email).toBe(DEMO_AUTH_CREDENTIALS.email)
    expect(db.session.accountId).toBeNull()
  })

  it("round-trips account snapshots back into app state", () => {
    const state = createInitialState()
    state.authStatus = "signedIn"
    state.profile.email = DEMO_AUTH_CREDENTIALS.email
    state.activeEmployerId = "grand-cafe"

    const restored = toAppStoreState(toAccountSnapshotDto(state), "signedIn")

    expect(restored.authStatus).toBe("signedIn")
    expect(restored.profile.email).toBe(DEMO_AUTH_CREDENTIALS.email)
    expect(restored.activeEmployerId).toBe("grand-cafe")
    expect(restored.employerDirectory).toEqual(createInitialState().employerDirectory)
  })

  it("migrates legacy persisted state into an account and session", () => {
    const legacyState = createInitialState()
    legacyState.authStatus = "signedIn"
    legacyState.profile.email = "legacy.employee@vesta.local"

    const migrated = migrateLegacyPersistedState({
      state: legacyState,
      version: 2,
    })

    expect(migrated?.accounts).toHaveLength(1)
    expect(migrated?.accounts[0].email).toBe("legacy.employee@vesta.local")
    expect(migrated?.session.accountId).toBe(migrated?.accounts[0].id)
  })
})
