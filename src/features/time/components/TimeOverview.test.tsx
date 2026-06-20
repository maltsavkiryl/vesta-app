import * as Haptics from "expo-haptics"
import { fireEvent, render } from "@testing-library/react-native"

import { createInitialState } from "@/core/mockState"
import { ThemeProvider } from "@/ui"

import { TimeOverviewCard } from "./TimeOverview"
import type { TimeOverviewCardController } from "./timeOverview.types"

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => {
    const React = require("react")
    const { Text } = require("react-native")
    return React.createElement(Text, null, name)
  },
}))

jest.mock("react-native-keyboard-controller", () => {
  const React = require("react")
  const { ScrollView } = require("react-native")

  const KeyboardAwareScrollView = React.forwardRef(({ children, ...props }: any, ref: any) => (
    <ScrollView ref={ref} {...props}>
      {children}
    </ScrollView>
  ))
  KeyboardAwareScrollView.displayName = "KeyboardAwareScrollView"

  return {
    KeyboardAwareScrollView,
  }
})

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  }),
}))

jest.mock("@/providers/motion-provider", () => ({
  useAppMotion: () => ({
    enterDistance: 0,
    enterDuration: 0,
    mode: "reduced",
    preference: "reduced",
    prefersReducedMotion: true,
    shouldReduceMotion: true,
    staggerStep: 0,
  }),
}))

function createController(): TimeOverviewCardController {
  const initialState = createInitialState()

  return {
    averageHourlyRate: 12.04,
    clockInPending: false,
    elapsedSeconds: 0,
    handleClockIn: jest.fn(),
    handleEndBreak: jest.fn(),
    handleStartBreak: jest.fn(),
    idleState: {
      actionLabel: "Clock in",
      detailLabel: "Bistro Noir · Grand Place 1",
      helperLabel: "Available from 17:45",
      kind: "shift",
      subtitle: "Waiter · 5h planned",
      title: "18:00 - 23:00",
    },
    liveEarnings: 0,
    openClockOut: jest.fn(),
    payableSeconds: 0,
    snapshot: {
      breakSeconds: 0,
      payableSeconds: 0,
      workedSeconds: 0,
    },
    state: {
      clockSession: initialState.clockSession,
    },
    totalBreakSeconds: 0,
  }
}

describe("TimeOverviewCard", () => {
  const originalNodeEnv = process.env.NODE_ENV
  const pressEvent = { stopPropagation: jest.fn() }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(process.env as { NODE_ENV?: string }).NODE_ENV = "development"
  })

  afterAll(() => {
    ;(process.env as { NODE_ENV?: string }).NODE_ENV = originalNodeEnv
  })

  it("plays a subtle toggle haptic when expanding and collapsing the card", () => {
    const screen = render(
      <ThemeProvider initialContext="light">
        <TimeOverviewCard collapsible controller={createController()} defaultCollapsed />
      </ThemeProvider>,
    )

    fireEvent(screen.getByLabelText("Expand time card"), "press", pressEvent)

    expect(Haptics.impactAsync).toHaveBeenNthCalledWith(1, Haptics.ImpactFeedbackStyle.Light)

    fireEvent(screen.getByLabelText("Collapse time card"), "press", pressEvent)

    expect(Haptics.impactAsync).toHaveBeenNthCalledWith(2, Haptics.ImpactFeedbackStyle.Light)
  })

  it("shows payable (worked-minus-break) time as the hero and total on-shift time beneath", () => {
    const controller = createController()
    controller.state.clockSession = {
      ...controller.state.clockSession,
      state: "working",
      startedAt: new Date().toISOString(),
    }
    // 1h05m on shift, 15m of breaks → 50m payable.
    controller.elapsedSeconds = 3900
    controller.payableSeconds = 3000
    controller.snapshot = { breakSeconds: 900, payableSeconds: 3000, workedSeconds: 3900 }
    controller.totalBreakSeconds = 900
    controller.averageHourlyRate = 12
    controller.liveEarnings = 10

    const view = render(
      <ThemeProvider initialContext="light">
        <TimeOverviewCard controller={controller} />
      </ThemeProvider>,
    )

    // Hero shows payable (00:50:00), NOT the gross 01:05:00 wall-clock.
    expect(view.getByText("00:50:00")).toBeTruthy()
    expect(view.queryByText("01:05:00")).toBeNull()
    // Total presence is still surfaced honestly beneath.
    expect(view.getByText(/On shift 1h 5m/)).toBeTruthy()
    // Live earnings ticker is wired from rate + payable seconds.
    expect(view.getByText(/Earning/)).toBeTruthy()
  })
})
