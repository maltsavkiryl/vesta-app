import { act, fireEvent, render, screen } from "@testing-library/react-native"

import { ThemeProvider } from "@/ui"

import { HomeScreen } from "./HomeScreen"

const refetch = jest.fn()

let mockHomeScreen: Record<string, unknown> = {}

jest.mock("./useHomeScreen", () => ({
  useHomeScreen: () => mockHomeScreen,
}))

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}))

function baseScreen(overrides: Record<string, unknown>) {
  return {
    completeTask: jest.fn(),
    greeting: "Good morning",
    home: undefined,
    homeSummary: "",
    isError: false,
    isLoading: false,
    openLatestPayslip: jest.fn(),
    openNotifications: jest.fn(),
    openSchedule: jest.fn(),
    openShift: jest.fn(),
    openTasks: jest.fn(),
    pendingTasks: [],
    refetch,
    runAction: jest.fn(),
    shouldShowTasksSection: false,
    shouldShowUpdatesSection: false,
    upcomingShifts: [],
    ...overrides,
  }
}

function renderHome() {
  return render(
    <ThemeProvider initialContext="light">
      <HomeScreen />
    </ThemeProvider>,
  )
}

describe("HomeScreen states", () => {
  beforeEach(() => {
    refetch.mockReset()
  })

  it("shows a skeleton while loading and does not fabricate €0.00 earnings", () => {
    mockHomeScreen = baseScreen({ isLoading: true, home: undefined })

    renderHome()

    expect(screen.getByLabelText("Loading home")).toBeTruthy()
    expect(screen.queryByText("View latest payslip")).toBeNull()
    expect(screen.queryByText(/€/)).toBeNull()
  })

  it("shows an error state with a retry that triggers refetch", async () => {
    refetch.mockResolvedValue(undefined)
    mockHomeScreen = baseScreen({ isError: true, home: undefined })

    renderHome()

    expect(screen.getByText("Something went wrong")).toBeTruthy()
    fireEvent.press(screen.getByText("Try again"))
    expect(refetch).toHaveBeenCalledTimes(1)
    await act(async () => {})
  })
})
