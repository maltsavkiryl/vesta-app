# Phase 1 Implementation Report — Premium-Native Design System

## 1. New Tokens (`src/ui/foundations/tokens.ts`)

### Elevation Scale
All four elevation levels added to both `DARK_DESIGN_TOKENS` and `LIGHT_DESIGN_TOKENS`.

| Token | iOS shadow | Android elevation |
|-------|-----------|-------------------|
| `elevation0` | no shadow | 0 |
| `elevation1` | `shadowRadius: 8, shadowOffset: {0, 2}` | 2 |
| `elevation2` | `shadowRadius: 16, shadowOffset: {0, 6}` | 6 |
| `elevation3` | `shadowRadius: 24, shadowOffset: {0, 12}` | 12 |

Dark mode uses `rgba(0,0,0,0.5)` shadow color; light mode uses `rgba(60,60,67,0.14)` with `shadowOpacity: 1` (Apple's standard drop-shadow idiom).

New `ElevationStyle` interface exported for typed spread.

### Radius Scale
| Token | Value |
|-------|-------|
| `radiusSm` | 8 |
| `radiusMd` | 12 |
| `radiusLg` | 16 |
| `radiusXl` | 20 |
| `radiusFull` | 999 |

### Semantic Additions
| Token | Light | Dark |
|-------|-------|------|
| `accentMuted` | `rgba(0, 122, 255, 0.07)` | `rgba(10, 132, 255, 0.08)` |
| `surfaceSheet` | `#FFFFFF` | `#1C1C1E` |

All existing token fields are unchanged (additive only).

---

## 2. Motion Vocabulary (`src/ui/foundations/motion.ts`)

### Spring Presets
```ts
SPRING_GENTLE = { damping: 26, stiffness: 180, mass: 1 }   // list entrances, screen transitions
SPRING_SNAPPY = { damping: 22, stiffness: 280, mass: 0.8 } // sheets, toasts, celebrate pulse
SCREEN_TRANSITION_SPRING = SPRING_GENTLE
```

### Duration Constants
```ts
DURATION_FAST   = 160
DURATION_NORMAL = 240
DURATION_SLOW   = 380
```

### Functions
```ts
getStaggerDelay(index: number, baseDelay?: number, step?: number): number
// Returns baseDelay + index * step (default step=48ms)

useListItemEntrance(index: number, options?: { baseDelay?: number; step?: number }): { animatedStyle: object }
// Spring-based opacity + translateY entrance per list item; instant if shouldReduceMotion

useCelebratePulse(): { animatedStyle: object; triggerPulse: () => void }
// Scale 1 → 1.06 → 1 on triggerPulse(); no-op if shouldReduceMotion
```

---

## 3. Sheet API (`src/ui/composites/Sheet.tsx`)

```ts
export interface SheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  snapPoint?: number | string   // default 400
  title?: string
  accessibilityLabel?: string
}

export function Sheet(props: SheetProps)
```

**How to use:**
```tsx
import { Sheet } from "@/ui/composites"

<Sheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Settings" snapPoint={480}>
  <Text text="Sheet content here" />
</Sheet>
```

Implementation notes:
- React Native `Modal` with `transparent + statusBarTranslucent`
- Gesture API v2: `Gesture.Pan()` + `GestureDetector` (react-native-gesture-handler 2.x)
- Backdrop `opacity` animates 0→0.52, sheet slides in from bottom with `SPRING_SNAPPY`
- Drag down > 80pt calls `onClose()`; smaller drags spring back
- Reduced motion: instant opacity show/hide, no spring
- `surfaceSheet` token for background, `radiusXl` (20) for top corners
- Safe-area bottom padding via `useSafeAreaInsets`
- Drag handle pill rendered at top

---

## 4. Toast API (`src/ui/feedback/Toast.tsx`)

### Mount ToastProvider near app root:
```tsx
// _layout.tsx or App.tsx
<ToastProvider>
  {children}
</ToastProvider>
```

### useToast hook:
```ts
const { showToast, showSuccess, showError, showInfo, showWarning } = useToast()

showToast(message: string, variant?: ToastVariant, duration?: number): void
showSuccess(message: string, duration?: number): void
showError(message: string, duration?: number): void
showInfo(message: string, duration?: number): void
showWarning(message: string, duration?: number): void
```

**Defaults:** `variant="info"`, `duration=3500ms`

Implementation notes:
- FIFO queue; one toast shown at a time
- Slides in from top using `SPRING_SNAPPY`, auto-dismisses after duration
- Themed: success/error/info/warning use `*Soft` background + colored text from tokens
- Safe-area top inset accounted for
- Reduced motion: instant appear/disappear
- `useToast()` throws if called outside `ToastProvider`
- Toast zIndex: 9999 (above Modal overlays)

---

## 5. Elevated Primitives

### `SurfaceCard` — `elevationLevel` prop
```ts
// Before (still works):
<SurfaceCard elevated>...</SurfaceCard>

// New:
<SurfaceCard elevationLevel={1}>...</SurfaceCard>   // subtle lift
<SurfaceCard elevationLevel={2}>...</SurfaceCard>   // moderate lift (sheet, popover)
<SurfaceCard elevationLevel={3}>...</SurfaceCard>   // strong lift (modal, toast)
```

`elevationLevel` spreads the full `ElevationStyle` object (shadowColor/Offset/Opacity/Radius + Android elevation). Default is `0` (backward compat). Existing `elevated?: boolean` unchanged.

### `Skeleton` — Shimmer gradient
- Replaced pure opacity pulse with a `LinearGradient` overlay that sweeps left→right via `translateX` animation
- Gradient colors: dark `rgba(255,255,255,0.06)`, light `rgba(255,255,255,0.65)` — matching the native iOS shimmer feel
- Width measured via `onLayout` to compute the translateX range
- Reduced motion: falls back to static block (opacity 0.55), no gradient rendered
- `SkeletonText` unchanged (calls `Skeleton` which gets the upgrade automatically)

### `AppButton` — `isLoading` prop
```ts
<AppButton label="Save" onPress={handleSave} isLoading={isSaving} />
```

When `isLoading=true`:
- `ActivityIndicator` replaces label text (same color as text would have been)
- Press is disabled (`disabled` state)
- Opacity set to 0.8 (softer than the 0.55 disabled state)

---

## 6. Exports

- `src/ui/composites/index.ts`: exports `Sheet`, `SheetProps`
- `src/ui/feedback/index.ts`: exports `ToastProvider`, `useToast`, `ToastVariant`

---

## 7. Verification

```
TypeScript: 0 errors (rtk proxy pnpm tsc --noEmit)

Tests:
  PASS src/ui/composites/Sheet.test.tsx
  PASS src/ui/foundations/motion.test.ts
  PASS src/ui/feedback/Toast.test.tsx
  PASS src/providers/motion-provider.test.ts
  Tests: 17 passed, 0 failed
```

---

## 8. Self-Review Notes

**Assumptions / deferred:**
- `Toast` renders inside the provider's render tree (not a Portal). If a Modal is open above the provider, toasts may be occluded. A proper portal (e.g. via `react-native-portalize`) would fix this — deferred as it requires an additional dependency.
- `Sheet.tsx` keeps the modal mounted while the close animation plays via a `isVisible` local state + `setTimeout(→setIsVisible(false), 300)`. A more robust approach would use a reanimated callback (`runOnJS`) to unmount — worth revisiting if the 300ms timeout causes flicker on slow devices.
- `Skeleton` shimmer requires an `onLayout` pass before the gradient appears (first frame renders base color only). This is a one-frame artifact, acceptable at this stage.
- `AppButton` `isLoading` on the iOS native SwiftUI path sets `nativeDisabled(true)` but does not show a spinner — SwiftUI handles loading states differently. Cross-platform consistency is maintained on Android/web.
