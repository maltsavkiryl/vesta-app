import { fireEvent, render } from "@testing-library/react-native"
import * as Haptics from "expo-haptics"

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

function createController(): TimeOverviewCardController {
  const initialState = createInitialState()

  return {
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
    openClockOut: jest.fn(),
    snapshot: {
      breakSeconds: 0,
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
})
