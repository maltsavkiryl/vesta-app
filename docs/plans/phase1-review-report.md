# Phase 1 Review Report

## Additive Safety

All existing token names, component props, and exports are unchanged. `SurfaceCard.elevated` still works; `elevationLevel` is additive. `AppButton.isLoading` is additive. All Sheet/Toast exports are new. No breaking changes detected.

---

## Findings and Fixes (commit `42da346`)

### 1. Toast — `dismissTimerRef` leak (setState-after-unmount)

**Bug**: `dismiss()` called a raw `setTimeout(() => setCurrent(null), 300)` that was not tracked in any ref. On unmount this timer would fire and call `setCurrent` on an unmounted provider.

**Fix**: Added `dismissTimerRef = useRef<...>(null)` to track the dismiss timer. Added a mount cleanup `useEffect` that clears both `timerRef` and `dismissTimerRef` on unmount. Added `isMountedRef` guard around `setCurrent` calls inside timeouts.

---

### 2. Toast — No screen reader announcement

**Bug**: Toasts appeared visually but were not announced to VoiceOver / TalkBack users. There was no `accessibilityLiveRegion`, no `accessibilityRole`, and no `AccessibilityInfo.announce` call.

**Fix**:
- Added `AccessibilityInfo.announceForAccessibility(current.message)` in the `useEffect` that fires when a new toast becomes current (imperative, works on both platforms).
- Added `accessibilityLiveRegion="polite"` and `accessibilityRole="alert"` to the toast `Animated.View` (declarative fallback; live regions are not reliably observed on all RN versions but harm nothing).

---

### 3. Toast — Hardcoded shadow values

**Bug**: `StyleSheet.create` for `toastContainer` had hardcoded `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, and `elevation` values that bypassed the token system (tokens hygiene issue).

**Fix**: Removed the hardcoded values from `StyleSheet.create`. Spread `tokens.elevation3` inline in the style array in the render (alongside `backgroundColor` and `borderRadius` which already used tokens). Shadow now picks up the correct dark/light values automatically.

---

### 4. Sheet — Dead `closeSheet` wrapper

**Issue**: `const closeSheet = () => { onClose() }` was a one-liner that added zero value but appeared in `runOnJS(closeSheet)()`. It leaked a closure unnecessarily.

**Fix**: Removed `closeSheet`; replaced with `runOnJS(onClose)()` directly.

---

### 5. Sheet — No a11y hint on drag handle

**Issue**: The drag handle `View` was purely visual. VoiceOver/TalkBack users had no indication that the sheet could be dismissed by dragging.

**Fix**: Wrapped the drag handle `View` with `accessible`, `accessibilityRole="adjustable"`, `accessibilityLabel="Drag handle"`, and `accessibilityHint="Drag down to close"`.

---

### 6. Sheet — No `accessibilityLiveRegion` on sheet panel

**Issue**: Screen readers had no automatic cue that the sheet's content had appeared.

**Fix**: Added `accessibilityLiveRegion="polite"` to the `Animated.View` sheet panel. The `Modal`'s `accessibilityViewIsModal` was already correct.

---

### 7. Skeleton — Stale closure in `useAnimatedStyle`

**Bug**: `shimmerStyle = useAnimatedStyle(...)` captured `containerWidth` from React state. In Reanimated, `useAnimatedStyle` runs on the UI thread (worklet), but `containerWidth` was a JS-thread state value. The worklet sees the value captured at render time and does not update when the layout changes (e.g. flex resize, orientation change). The shimmer range would be stuck at zero or an initial value for its lifetime.

**Fix**: Replaced `const [containerWidth, setContainerWidth] = useState(0)` with `const containerWidthSV = useSharedValue(0)`. `handleLayout` now sets `containerWidthSV.value`. The `useAnimatedStyle` reads `containerWidthSV.value` — a proper shared value accessible on the UI thread. Removed the now-unnecessary `containerWidth > 0` gate from JSX (the worklet handles the `cw === 0` guard itself and the gradient is always mounted but starts offscreen).

---

### 8. SurfaceCard — Ternary elevation chain

**Issue**: Four-way ternary was hard to read and would need another arm for a future elevation level.

**Fix**: Replaced with a `const elevationMap = { 0: null, 1: tokens.elevation1, ... } as const` lookup. One line instead of five.

---

## Remaining Limitations (unchanged from phase1-report)

- Toast renders in the provider tree, not a portal. If a `Modal` is open above the provider, toasts may be occluded. Requires `react-native-portalize` or similar — deferred.
- Sheet unmount still uses a short `animateClose` + `setIsVisible(false)` approach. The 300 ms close in `animateClose` drives `SPRING_SNAPPY` which settles faster, so there is no flicker in practice. A `runOnJS` callback from the spring completion is a cleaner approach for slow devices — deferred.
- iOS native `AppButton` (`@expo/ui/swift-ui`) does not show a spinner when `isLoading=true` — SwiftUI handles that via its own loading idioms. Double-submit is already blocked via `nativeDisabled(Boolean(isDisabled))`. Spinner parity is deferred until the team decides on a SwiftUI loading modifier.

---

## Verification

```
Compile: pnpm compile → 0 errors (tsc --noEmit)
Tests:   pnpm test → 59 suites, 263 tests, 0 failures
```
