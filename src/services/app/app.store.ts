import { parseDateValue } from "@/core/date"
import { createInitialState } from "@/core/mockState"
import type { AppStoreState } from "@/core/models"
import { load, remove, save } from "@/utils/storage"

import { isValidTimeEntry } from "./app-state.reducer"
import {
  createMockBackendDb,
  LEGACY_APP_STATE_STORAGE_KEY,
  MOCK_BACKEND_STORAGE_KEY,
  MOCK_BACKEND_VERSION,
  migrateLegacyPersistedState,
  toAppStoreStateFromAggregates,
  toPersistedAggregates,
} from "./app.transformer"
import type {
  AppAction,
  MockAccountDto,
  MockBackendDbDto,
  MockBackendSessionDto,
} from "./app.types"

function readDb() {
  return load<MockBackendDbDto>(MOCK_BACKEND_STORAGE_KEY)
}

export function writeDb(db: MockBackendDbDto) {
  save(MOCK_BACKEND_STORAGE_KEY, db)
}

export function ensureDb(): MockBackendDbDto {
  const existing = readDb()
  if (existing?.version === MOCK_BACKEND_VERSION && existing.accounts.length > 0) {
    return existing
  }

  const migrated =
    !existing || existing.version !== MOCK_BACKEND_VERSION
      ? migrateLegacyPersistedState(load(LEGACY_APP_STATE_STORAGE_KEY))
      : null

  const nextDb = migrated
    ? {
        seededAt: new Date().toISOString(),
        version: MOCK_BACKEND_VERSION,
        ...migrated,
      }
    : createMockBackendDb()

  writeDb(nextDb)
  remove(LEGACY_APP_STATE_STORAGE_KEY)
  return nextDb
}

export function buildSignedOutState(): AppStoreState {
  return {
    ...createInitialState(),
    authStatus: "signedOut",
  }
}

export function findAccountOrThrow(db: MockBackendDbDto, accountId: string) {
  const account = db.accounts.find((candidate) => candidate.id === accountId)
  if (!account) {
    throw new Error(`Missing account ${accountId}`)
  }
  return account
}

export function buildAccountState(
  account: MockAccountDto,
  authStatus: AppStoreState["authStatus"],
) {
  const state = toAppStoreStateFromAggregates(account.aggregates, authStatus)
  return {
    ...state,
    timeEntries: state.timeEntries.filter((entry) => isValidTimeEntry(entry, parseDateValue)),
  }
}

export function withUpdatedAccount(
  db: MockBackendDbDto,
  accountId: string,
  updater: (account: MockAccountDto) => MockAccountDto,
) {
  return {
    ...db,
    accounts: db.accounts.map((account) => (account.id === accountId ? updater(account) : account)),
  }
}

export function commitAccountAction(
  accountId: string,
  action: AppAction,
  applyAction: (state: AppStoreState, action: AppAction) => AppStoreState,
) {
  const db = ensureDb()
  const currentAccount = findAccountOrThrow(db, accountId)
  const currentState = buildAccountState(currentAccount, "signedIn")
  const nextState = applyAction(currentState, action)
  const nextDb = withUpdatedAccount(db, accountId, (account) => ({
    ...account,
    aggregates: toPersistedAggregates(nextState),
    updatedAt: new Date().toISOString(),
  }))

  writeDb(nextDb)
  return buildAccountState(findAccountOrThrow(nextDb, accountId), "signedIn")
}

export function getSession() {
  return ensureDb().session
}

export function setSession(session: MockBackendSessionDto) {
  const db = ensureDb()
  const nextDb = {
    ...db,
    session,
  }
  writeDb(nextDb)
  return nextDb.session
}

export function getAccountState(accountId: string) {
  const db = ensureDb()
  const account = findAccountOrThrow(db, accountId)
  return buildAccountState(account, db.session.accountId === accountId ? "signedIn" : "signedOut")
}

export function prependAccount(account: MockAccountDto, session: MockBackendSessionDto) {
  const db = ensureDb()
  const nextDb: MockBackendDbDto = {
    ...db,
    accounts: [account, ...db.accounts],
    session,
  }
  writeDb(nextDb)
  return {
    session: nextDb.session,
    state: buildAccountState(account, "signedIn"),
  }
}
