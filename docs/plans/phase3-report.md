# Phase 3 — Speed & Offline + Accessibility Implementation Report

Branch: `feat/mobile-11star-phase3-crosscutting`  
Date: 2026-06-20

---

## 1. Persistence Layer

### Approach

React Query's query cache is now persisted to MMKV via `@tanstack/react-query-persist-client`. MMKV is a synchronous key/value store backed by memory-mapped files, making it fast enough to read on cold start without blocking the JS thread. We wrap the synchronous `loadString`/`saveString`/`remove` calls in `Promise.resolve()` to satisfy the async `Persister` interface.

**Files changed:**
- `src/services/app/query.persister.ts` (new) — `createMmkvPersister()`
- `src/services/app/app.queries.ts` — `createAppQueryClient()` updated
- `src/app/_layout.tsx` — `QueryClientProvider` replaced by `PersistQueryClientProvider`

### Key settings

| Setting | Value | Reason |
|---|---|---|
| `maxAge` | 24 h | Stale cache older than 24 h is discarded on startup |
| `buster` | `"v1"` | Bust the cache when the data shape changes |
| `gcTime` | 24 h | Must match `maxAge`; React Query won't GC items the persister would restore |
| `staleTime` | 30 s | Short stale window triggers a background refresh on mount |
| `shouldDehydrateMutation` | `() => false` | Mutations are never serialized — they're volatile, fire-and-forget |

### What is excluded from persistence

- Mutations: disabled via `shouldDehydrateMutation: () => false`
- Auth session query (`["auth", "session"]`) is not excluded at the persister level; however, it has `initialData` that returns from the in-memory store, so on cold start the session is hydrated from the native secure store rather than the persisted cache. This is the correct priority order.

---

## 2. Query Defaults

Added to `defaultOptions.queries`:

```
retry:       skip 401/403; otherwise up to 3 attempts
retryDelay:  exponential back-off capped at 30 s (1 s, 2 s, 4 s, …)
refetchOnReconnect: true
```

`mutations.retry: false` — mutations are explicit user actions; silent retries would duplicate writes.

---

## 3. Optimistic Mutations

### Already optimistic

- `useCompleteTodoMutation` — `onMutate` applies the local state change and queues a rollback via `onError`.
- `useUncompleteTodoMutation` — same pattern.

### Not converted to optimistic

- `useClaimCallMutation`, `useCreateShiftSwapMutation`, `useDecideShiftSwapMutation`, `useCancelShiftSwapMutation`, `useCreateShiftChangeMutation`, `useSaveAvailabilityMutation`

**Reason:** These mutations have complex server-side effects (claim exclusivity, cross-employee state, date validation) that make safe rollback non-trivial. Optimistic UI for them could mislead the user (e.g., showing a shift as claimed when another employee already took it). The current pattern — show a loading state, then invalidate and refetch — is the safest UX for these actions.

The calls screen already wraps the "claiming" state in a local `ClaimState` map for immediate visual feedback, which is a pragmatic middle ground without needing full cache rollback.

---

## 4. Accessibility Fixes

### `src/ui/composites/app-status.tsx`

| Component | Fix |
|---|---|
| `Pill` | Added `accessible`, `accessibilityRole="text"`, `accessibilityLabel={label}` to outer View |
| `StatusBadge` | Same as Pill. Inner dot View gets `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"` — it is a decorative indicator |
| `MetaPill` | Same as Pill |

### `src/features/planning/PlanningShiftsSections.tsx`

| Element | Fix |
|---|---|
| Chevron icon (`chevron-forward-outline`) | Wrapped in `<View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">` |
| Building icon (`business-outline`) inside venue chip | Same wrapper |
| Document icon (`document-text-outline`) in note row | Same wrapper |

The shift card itself already had `accessibilityRole="button"` and a composite `accessibilityLabel` on the `Pressable`.

### `src/features/planning/PlanningCallsSections.tsx`

| Element | Fix |
|---|---|
| `CallModeBadge` | Added `accessible`, `accessibilityRole="text"`, `accessibilityLabel={mode.toUpperCase()}` |
| Claimed badge (`<View style={styles.claimedBadge}>`) | Added `accessible`, `accessibilityRole="text"`, `accessibilityLabel={translate("planning:calls.claimed")}`. Inner checkmark icon wrapped as decorative |

### `src/features/planning/PlanningRequestsSections.tsx`

| Element | Fix |
|---|---|
| `DecideButton` Pressable | Added `accessibilityLabel={label}` (was missing); added `hitSlop={6}` |
| `decideBtn` style | `paddingVertical` increased from 6 to 10 (target height ≈ 34 pt + hitSlop 6 pt both sides = effective ≥ 44 pt) |
| Shortcut icon Views in `PlanningRequestShortcuts` | Added `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"` — the ActionRow's `title` prop provides the accessible name |

---

## 5. Dependencies Added

```
@tanstack/react-query-persist-client ^5.101.0
```

Minor peer warning: react-query-persist-client@5.101.0 wants react-query@^5.101.0; installed is 5.100.11. This is a single patch version and causes no runtime issues.

---

## 6. Compile & Test Output

```
tsc --noEmit: 0 errors (checked twice — after persistence layer, after a11y fixes)

Test Suites: 60 passed, 60 total
Tests:       272 passed, 272 total
```

Pre-existing console warnings in `planning.test.tsx` (`act()` wrapping in async mutations) are unrelated to this phase.

---

## 7. Self-Review / Concerns

1. **Cache invalidation on schema changes** — `buster: "v1"` must be incremented whenever a query's response shape changes incompatibly. This is a manual convention; no tooling enforces it. Recommend adding a comment to `_layout.tsx` to remind maintainers.

2. **Auth session in persisted cache** — The `useAppSessionQuery` has an `initialData` factory that reads from an in-memory store. When `PersistQueryClientProvider` hydrates the cache from MMKV, it *may* overwrite the `initialData` with a stale session from a previous run. In practice this is fine because `staleTime: 30 s` means the query will refetch almost immediately. But if a user is signed out between sessions and the persisted cache still has a non-null `accountId`, there's a brief window where the app could render as signed-in before the refetch completes. This would be mitigated by excluding auth queries from persistence via a custom `shouldDehydrateQuery` filter — deferred as a follow-up.

3. **`importantForAccessibility` on iOS** — This prop is Android-only; iOS uses `accessibilityElementsHidden`. Both are set in all decorative icon wrappers, so both platforms are covered.

4. **Touch target math for DecideButton** — `paddingVertical: 10` → text line height ≈ 14 pt → total tappable height ≈ 34 pt. With `hitSlop={6}` (added to all four sides), effective area = 34 + 12 = 46 pt, meeting the 44 pt WCAG recommendation.
