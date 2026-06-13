import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
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

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => {
    const React = require("react")
    const { Text } = require("react-native")
    return React.createElement(Text, null, name)
  },
}))

// HomeTimeCard pulls in clock mutations / session providers we don't exercise here;
// stub it so the loaded HomeScreen renders without standing up the whole app shell.
jest.mock("./components/HomeTimeCard", () => ({
  HomeTimeCard: () => null,
}))

function baseScreen(overrides: Record<string, unknown>) {
  return {
    completeTask: jest.fn(),
    dismissPayrollNudge: jest.fn(),
    greeting: "Good morning",
    home: undefined,
    homeSummary: "",
    isError: false,
    isLoading: false,
    openLatestPayslip: jest.fn(),
    openNotifications: jest.fn(),
    openPayrollProfile: jest.fn(),
    openSchedule: jest.fn(),
    openShift: jest.fn(),
    openTasks: jest.fn(),
    payrollProfileGaps: [],
    pendingTasks: [],
    refetch,
    runAction: jest.fn(),
    shouldShowPayrollNudge: false,
    shouldShowTasksSection: false,
    shouldShowUpdatesSection: false,
    upcomingShifts: [],
    ...overrides,
  }
}

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider initialContext="light">
        <HomeScreen />
      </ThemeProvider>
    </QueryClientProvider>,
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

  it("shows the payroll profile nudge when the profile has gaps", () => {
    mockHomeScreen = baseScreen({
      home: {
        profile: { firstName: "Sofia" },
        earnings: {},
        notifications: [],
        shifts: [],
        unreadNotifications: 0,
      },
      shouldShowPayrollNudge: true,
      payrollProfileGaps: [
        { key: "iban", label: "Bank account (IBAN)" },
        { key: "address", label: "Home address" },
      ],
    })

    renderHome()

    expect(screen.getByText("Finish setting up payroll")).toBeTruthy()
    expect(
      screen.getByText("Add your bank account and home address so you get paid on time."),
    ).toBeTruthy()
  })

  it("hides the payroll profile nudge when the profile is complete", () => {
    mockHomeScreen = baseScreen({
      home: {
        profile: { firstName: "Sofia" },
        earnings: {},
        notifications: [],
        shifts: [],
        unreadNotifications: 0,
      },
      shouldShowPayrollNudge: false,
      payrollProfileGaps: [],
    })

    renderHome()

    expect(screen.queryByText("Finish setting up payroll")).toBeNull()
  })
})
