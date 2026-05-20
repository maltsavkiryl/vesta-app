import { createInitialState } from "@/core/mockState"
import {
  createMockBackendDb,
  migrateLegacyPersistedState,
  migrateMockBackendDb,
  toAccountSnapshotDto,
  toAppStoreState,
  toAppStoreStateFromAggregates,
  DEMO_AUTH_CREDENTIALS,
} from "@/services/app/app.transformer"

describe("mock backend persistence", () => {
  it("seeds a demo account by default", () => {
    const db = createMockBackendDb()

    expect(db.accounts).toHaveLength(1)
    expect(db.accounts[0].email).toBe(DEMO_AUTH_CREDENTIALS.email)
    expect(db.session.accountId).toBeNull()
  })

  it("starts with an empty demo time history", () => {
    const state = createInitialState()

    expect(state.timeEntries).toEqual([])
    expect(state.earnings.earnedAmount).toBe(0)
    expect(state.earnings.hoursWorked).toBe(0)
    expect(state.earnings.shiftsWorked).toBe(0)
  })

  it("round-trips account snapshots back into app state", () => {
    const state = createInitialState()
    state.authStatus = "signedIn"
    state.profile.email = DEMO_AUTH_CREDENTIALS.email

    const restored = toAppStoreState(toAccountSnapshotDto(state), "signedIn")

    expect(restored.authStatus).toBe("signedIn")
    expect(restored.profile.email).toBe(DEMO_AUTH_CREDENTIALS.email)
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

  it("fills missing aggregate sections from defaults", () => {
    const state = createInitialState()
    state.profile.role = undefined

    const aggregates = createMockBackendDb().accounts[0].aggregates
    const restored = toAppStoreStateFromAggregates(
      {
        ...aggregates,
        home: {
          ...aggregates.home,
          highlights: undefined as never,
          tasks: undefined as never,
        },
        profile: {
          ...aggregates.profile,
          profile: state.profile,
        },
        schedule: {
          ...aggregates.schedule,
          planningWindows: undefined as never,
        },
      },
      "signedIn",
    )

    expect(restored.authStatus).toBe("signedIn")
    expect(restored.profile.role).toBeUndefined()
    expect(restored.highlights).toEqual(createInitialState().highlights)
    expect(restored.tasks).toEqual(createInitialState().tasks)
    expect(restored.planningWindows).toEqual(createInitialState().planningWindows)
  })

  it("removes seeded demo time entries from persisted mock accounts", () => {
    const db = createMockBackendDb()
    db.version = 2
    db.accounts[0].aggregates.time.timeEntries = [
      {
        id: "time-1",
        source: "shift",
        employerId: "bistro-noir",
        date: "2026-05-16",
        shiftLabel: "Evening",
        venueName: "Bistro Noir",
        venueAddress: "Rue de la Loi 123, Brussels",
        clockInAt: "2026-05-16T17:03:00.000Z",
        clockOutAt: "2026-05-16T23:04:00.000Z",
        grossSeconds: 21660,
        workedSeconds: 19860,
        breakSeconds: 1800,
        earningsAmount: 66.24,
        status: "approved",
        events: [],
        clockInProofPhoto: {
          capturedAt: "2026-05-16T17:03:00.000Z",
          fileName: "clock-in-proof.jpg",
          mimeType: "image/jpeg",
          uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
        },
      },
    ]
    db.accounts[0].aggregates.time.earnings.earnedAmount = 847.2
    db.accounts[0].aggregates.time.earnings.hoursWorked = 41.5
    db.accounts[0].aggregates.time.earnings.shiftsWorked = 7

    const migrated = migrateMockBackendDb(db)

    expect(migrated.version).toBeGreaterThan(db.version)
    expect(migrated.accounts[0].aggregates.time.timeEntries).toEqual([])
    expect(migrated.accounts[0].aggregates.time.earnings.earnedAmount).toBe(0)
    expect(migrated.accounts[0].aggregates.time.earnings.hoursWorked).toBe(0)
    expect(migrated.accounts[0].aggregates.time.earnings.shiftsWorked).toBe(0)
  })
})
