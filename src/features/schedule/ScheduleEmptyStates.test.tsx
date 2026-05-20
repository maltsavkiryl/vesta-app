import { render, screen } from "@testing-library/react-native"

import { createInitialState } from "@/core/mockState"
import { ThemeProvider } from "@/ui"

import { ScheduleScreen } from "./ScheduleScreen"
import { ShiftDetailScreen } from "./ShiftDetailScreen"

const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockRunAction = jest.fn()

let mockShiftId = "missing-shift"
let mockScheduleState = {
  ...createInitialState(),
  requests: [],
}

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: mockShiftId }),
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}))

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

  return {
    KeyboardAwareScrollView: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <ScrollView ref={ref} {...props}>
        {children}
      </ScrollView>
    )),
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

jest.mock("@/features/actions/useAppAction", () => ({
  useAppAction: () => ({
    runAction: mockRunAction,
  }),
}))

jest.mock("@/features/schedule/data/schedule.mutations", () => ({
  useScheduleActions: () => ({
    respondToShift: jest.fn(),
    submitPlanningWindow: jest.fn(),
  }),
}))

jest.mock("@/features/schedule/data/schedule.queries", () => ({
  useScheduleStateQuery: () => ({
    state: mockScheduleState,
  }),
}))

jest.mock("./PlanningMonthCalendar", () => ({
  PlanningMonthCalendar: () => null,
}))

jest.mock("./PlanningQuickActionsButton", () => ({
  PlanningQuickActionsButton: () => null,
}))

function renderWithTheme(node: React.ReactElement) {
  return render(<ThemeProvider initialContext="light">{node}</ThemeProvider>)
}

describe("schedule empty states", () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockReplace.mockReset()
    mockRunAction.mockReset()
    mockShiftId = "missing-shift"
    mockScheduleState = {
      ...createInitialState(),
      requests: [],
    }
  })

  it("shows an empty state when there are no requests", () => {
    renderWithTheme(<ScheduleScreen />)

    expect(screen.getByText("No requests yet")).toBeTruthy()
    expect(
      screen.getByText("Requests you send from planning will show up here while they are being reviewed."),
    ).toBeTruthy()
  })

  it("shows an empty state when a shift detail route is stale", () => {
    renderWithTheme(<ShiftDetailScreen />)

    expect(screen.getByText("Shift not found")).toBeTruthy()
    expect(
      screen.getByText("This shift is no longer available in your local planning data."),
    ).toBeTruthy()
    expect(screen.getByText("Back to Planning")).toBeTruthy()
  })
})
