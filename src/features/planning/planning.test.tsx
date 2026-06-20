/**
 * Integration tests for the planning feature screens.
 *
 * Each test mounts the screen component and asserts on visible output or user
 * interactions. Hooks are mocked at their module boundaries so we exercise
 * the real screen component logic without network calls.
 */
import { fireEvent, render, screen } from "@testing-library/react-native"

// ── Additional mocks (global mocks already in test/setup.ts) ─────────────────

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}))

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}))

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => {
    const React = require("react")
    const { Text } = require("react-native")
    return React.createElement(Text, { testID: `icon-${name}` }, name)
  },
}))

jest.mock("@/theme/context", () => ({
  useAppTheme: () => ({
    themeContext: "light",
    theme: {
      colors: { text: "#1C1C1E" },
      isDark: false,
    },
    themed: (value: any) => {
      const entries = [value].flat(4)
      return Object.assign(
        {},
        ...entries.map((entry: any) =>
          typeof entry === "function"
            ? entry({ colors: { text: "#1C1C1E" }, isDark: false })
            : entry,
        ),
      )
    },
  }),
}))

jest.mock("@react-native-community/datetimepicker", () => {
  const React = require("react")
  const { View } = require("react-native")
  return {
    __esModule: true,
    default: ({ onChange, value }: { onChange?: Function; value: Date }) => {
      void onChange
      void value
      return React.createElement(View, { testID: "date-time-picker" })
    },
  }
})

jest.mock("@/providers/app-provider", () => ({
  useAppSession: () => ({ accountId: "test-account-id" }),
}))

// ── Screen hook mocks (set up per test suite) ─────────────────────────────────

const mockScheduleQuery = jest.fn()
const mockTodosQuery = jest.fn()
const mockCallsQuery = jest.fn()
const mockRequestsQuery = jest.fn()
const mockLeaveQuery = jest.fn()

jest.mock("@/features/planning/data/planning.queries", () => ({
  usePlanningScheduleQuery: (...args: any[]) => mockScheduleQuery(...args),
  usePlanningTodosQuery: (...args: any[]) => mockTodosQuery(...args),
  usePlanningCallsQuery: (...args: any[]) => mockCallsQuery(...args),
  useMyRequestsQuery: (...args: any[]) => mockRequestsQuery(...args),
  useLeaveEntitlementQuery: (...args: any[]) => mockLeaveQuery(...args),
  planningQueryKeys: {
    all: (id: string) => ["planning", id],
    schedule: (id: string, p: any) => ["planning", id, "schedule", p],
    todos: (id: string) => ["planning", id, "todos"],
    calls: (id: string, p: any) => ["planning", id, "calls", p],
    requests: (id: string) => ["planning", id, "requests"],
    leave: (id: string) => ["planning", id, "leave"],
    availability: (id: string) => ["planning", id, "availability"],
  },
}))

const mockClaimCallMutation = jest.fn()
const mockCompleteTodoMutation = jest.fn()
const mockUncompleteTodoMutation = jest.fn()
const mockCreateShiftSwapMutation = jest.fn()
const mockCreateShiftChangeMutation = jest.fn()

jest.mock("@/features/planning/data/planning.mutations", () => ({
  useClaimCallMutation: () => ({
    mutateAsync: mockClaimCallMutation,
    isPending: false,
  }),
  useCompleteTodoMutation: () => ({
    mutateAsync: mockCompleteTodoMutation,
    isPending: false,
  }),
  useUncompleteTodoMutation: () => ({
    mutateAsync: mockUncompleteTodoMutation,
    isPending: false,
  }),
  useCreateShiftSwapMutation: () => ({
    mutateAsync: mockCreateShiftSwapMutation,
    isPending: false,
  }),
  useCreateShiftChangeMutation: () => ({
    mutateAsync: mockCreateShiftChangeMutation,
    isPending: false,
  }),
  useDecideShiftSwapMutation: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
  useCancelShiftSwapMutation: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
  useSaveAvailabilityMutation: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}))

// ── Sample fixtures ───────────────────────────────────────────────────────────

const SAMPLE_SHIFT = {
  id: "shift-001",
  date: "2099-07-15",
  startTime: "09:00",
  endTime: "17:00",
  role: "Cashier",
  venueName: "HQ Store",
  note: null,
  employerCode: "employer-1",
  establishmentCode: "est-1",
}

const SAMPLE_TODO = {
  id: "todo-001",
  label: "Check stock levels",
  isCompletedByMe: false,
  isRequired: true,
}

const SAMPLE_CALL = {
  id: "call-001",
  mode: "open",
  status: "open",
  createdAt: "2099-07-10T08:00:00Z",
  note: "Extra hands needed on floor",
  employerCode: "employer-1",
  establishmentCode: "est-1",
}

const SAMPLE_ENTITLEMENT = {
  calendarYear: 2099,
  statutoryDays: 20,
  employerPolicyDays: 5,
  totalDays: 25,
  entitlementHours: 0,
  source: 1,
}

// ── Idle query factory ────────────────────────────────────────────────────────

function idleQuery(state: any = null) {
  return {
    state,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PlanningShiftsScreen
// ─────────────────────────────────────────────────────────────────────────────

describe("PlanningShiftsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders empty state when no shifts are returned", () => {
    mockScheduleQuery.mockReturnValue(idleQuery([]))
    const { PlanningShiftsScreen } = require("./PlanningShiftsScreen")
    render(<PlanningShiftsScreen />)
    // The empty state title key — match exact key (not the subtitle which has "Subtitle" suffix)
    const nodes = screen.getAllByText(/planning:schedule\.noShifts/)
    expect(nodes.length).toBeGreaterThan(0)
  })

  it("renders shift card when shifts are returned", () => {
    mockScheduleQuery.mockReturnValue(idleQuery([SAMPLE_SHIFT]))
    const { PlanningShiftsScreen } = require("./PlanningShiftsScreen")
    render(<PlanningShiftsScreen />)
    // The shift card shows the venue name
    expect(screen.getByText("HQ Store")).toBeTruthy()
  })

  it("renders error state when query errors with no data", () => {
    mockScheduleQuery.mockReturnValue({ state: null, isLoading: false, isError: true, refetch: jest.fn() })
    const { PlanningShiftsScreen } = require("./PlanningShiftsScreen")
    render(<PlanningShiftsScreen />)
    const nodes = screen.getAllByText(/planning:schedule\.loadError/)
    expect(nodes.length).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PlanningTodosScreen
// ─────────────────────────────────────────────────────────────────────────────

describe("PlanningTodosScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCompleteTodoMutation.mockResolvedValue({ ok: true })
    mockUncompleteTodoMutation.mockResolvedValue({ ok: true })
  })

  it("renders empty state when no todos", () => {
    mockTodosQuery.mockReturnValue(idleQuery({ todos: [], dressNote: null, note: null }))
    const { PlanningTodosScreen } = require("./PlanningTodosScreen")
    render(<PlanningTodosScreen />)
    expect(screen.getByText(/planning:todos\.noTasksTitle/)).toBeTruthy()
  })

  it("renders pending todo item", () => {
    mockTodosQuery.mockReturnValue(
      idleQuery({ todos: [SAMPLE_TODO], dressNote: null, note: null }),
    )
    const { PlanningTodosScreen } = require("./PlanningTodosScreen")
    render(<PlanningTodosScreen />)
    expect(screen.getByText("Check stock levels")).toBeTruthy()
  })

  it("calls completeTodo mutation when checkbox pressed on pending todo", async () => {
    mockTodosQuery.mockReturnValue(
      idleQuery({ todos: [SAMPLE_TODO], dressNote: null, note: null }),
    )
    const { PlanningTodosScreen } = require("./PlanningTodosScreen")
    render(<PlanningTodosScreen />)
    const checkbox = screen.getByRole("checkbox", { name: "Check stock levels" })
    fireEvent.press(checkbox)
    // Allow microtask queue to flush
    await Promise.resolve()
    expect(mockCompleteTodoMutation).toHaveBeenCalledWith({ todoCode: "todo-001" })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PlanningCallsScreen
// ─────────────────────────────────────────────────────────────────────────────

describe("PlanningCallsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockClaimCallMutation.mockResolvedValue({ ok: true })
  })

  it("renders empty state when no calls", () => {
    mockCallsQuery.mockReturnValue(idleQuery([]))
    const { PlanningCallsScreen } = require("./PlanningCallsScreen")
    render(<PlanningCallsScreen />)
    expect(screen.getByText(/planning:calls\.noCallsTitle/)).toBeTruthy()
  })

  it("renders call card when calls are returned", () => {
    mockCallsQuery.mockReturnValue(idleQuery([SAMPLE_CALL]))
    const { PlanningCallsScreen } = require("./PlanningCallsScreen")
    render(<PlanningCallsScreen />)
    expect(screen.getByText("Extra hands needed on floor")).toBeTruthy()
  })

  it("calls claimCall mutation when claim button pressed", async () => {
    mockCallsQuery.mockReturnValue(idleQuery([SAMPLE_CALL]))
    const { PlanningCallsScreen } = require("./PlanningCallsScreen")
    render(<PlanningCallsScreen />)
    const claimButton = screen.getByRole("button", { name: /planning:calls\.claim/ })
    fireEvent.press(claimButton)
    await Promise.resolve()
    expect(mockClaimCallMutation).toHaveBeenCalledWith({
      callCode: "call-001",
      employerCode: "employer-1",
      establishmentCode: "est-1",
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PlanningSwapNewScreen
// ─────────────────────────────────────────────────────────────────────────────

describe("PlanningSwapNewScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateShiftSwapMutation.mockResolvedValue({ ok: true })
    mockScheduleQuery.mockReturnValue(idleQuery([SAMPLE_SHIFT]))
  })

  it("submit button is disabled without a shift selected", () => {
    const { PlanningSwapNewScreen } = require("./PlanningSwapNewScreen")
    render(<PlanningSwapNewScreen />)
    const submitBtn = screen.getByRole("button", { name: /planning:requests\.shiftSwap/ })
    expect(submitBtn.props.accessibilityState?.disabled).toBe(true)
  })

  it("submit button is disabled with shift selected but no target shift ID", () => {
    const { PlanningSwapNewScreen } = require("./PlanningSwapNewScreen")
    render(<PlanningSwapNewScreen />)

    // Select a shift row (radio button)
    const shiftRow = screen.getByRole("radio", { name: /./i })
    fireEvent.press(shiftRow)

    const submitBtn = screen.getByRole("button", { name: /planning:requests\.shiftSwap/ })
    expect(submitBtn.props.accessibilityState?.disabled).toBe(true)
  })

  it("submit enabled and calls mutation when shift + targetShiftId are entered", async () => {
    const { PlanningSwapNewScreen } = require("./PlanningSwapNewScreen")
    render(<PlanningSwapNewScreen />)

    // Select a shift
    const shiftRow = screen.getByRole("radio", { name: /./i })
    fireEvent.press(shiftRow)

    // Two TextFields exist: targetShiftId and note. Both are empty.
    // Type into the first one (target shift ID).
    const inputs = screen.getAllByDisplayValue("")
    fireEvent.changeText(inputs[0], "shift-xyz-999")

    const submitBtn = screen.getByRole("button", { name: /planning:requests\.shiftSwap/ })
    expect(submitBtn.props.accessibilityState?.disabled).toBe(false)

    fireEvent.press(submitBtn)
    await Promise.resolve()

    expect(mockCreateShiftSwapMutation).toHaveBeenCalledWith({
      input: {
        requesterShiftId: "shift-001",
        targetShiftId: "shift-xyz-999",
        note: undefined,
      },
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PlanningChangeNewScreen
// ─────────────────────────────────────────────────────────────────────────────

describe("PlanningChangeNewScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateShiftChangeMutation.mockResolvedValue({ ok: true })
    mockScheduleQuery.mockReturnValue(idleQuery([SAMPLE_SHIFT]))
  })

  it("submit button is disabled without a shift selected", () => {
    const { PlanningChangeNewScreen } = require("./PlanningChangeNewScreen")
    render(<PlanningChangeNewScreen />)
    const submitBtn = screen.getByRole("button", { name: /planning:requests\.changeRequest/ })
    expect(submitBtn.props.accessibilityState?.disabled).toBe(true)
  })

  it("submit enabled after selecting a shift", () => {
    const { PlanningChangeNewScreen } = require("./PlanningChangeNewScreen")
    render(<PlanningChangeNewScreen />)

    const shiftRow = screen.getByRole("radio", { name: /./i })
    fireEvent.press(shiftRow)

    const submitBtn = screen.getByRole("button", { name: /planning:requests\.changeRequest/ })
    expect(submitBtn.props.accessibilityState?.disabled).toBe(false)
  })

  it("calls mutation with shift ID when submitted", async () => {
    const { PlanningChangeNewScreen } = require("./PlanningChangeNewScreen")
    render(<PlanningChangeNewScreen />)

    const shiftRow = screen.getByRole("radio", { name: /./i })
    fireEvent.press(shiftRow)

    const submitBtn = screen.getByRole("button", { name: /planning:requests\.changeRequest/ })
    fireEvent.press(submitBtn)
    await Promise.resolve()

    expect(mockCreateShiftChangeMutation).toHaveBeenCalledWith({
      input: expect.objectContaining({ shiftId: "shift-001" }),
    })
  })

  it("renders pressable date/time picker rows", () => {
    const { PlanningChangeNewScreen } = require("./PlanningChangeNewScreen")
    render(<PlanningChangeNewScreen />)
    // Picker rows render as buttons with translated label text
    expect(screen.getByText(/planning:requests\.requestedDate/i)).toBeTruthy()
    expect(screen.getByText(/planning:requests\.requestedStartTime/i)).toBeTruthy()
    expect(screen.getByText(/planning:requests\.requestedEndTime/i)).toBeTruthy()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PlanningLeaveScreen
// ─────────────────────────────────────────────────────────────────────────────

describe("PlanningLeaveScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders empty state when no entitlement", () => {
    mockLeaveQuery.mockReturnValue(idleQuery(null))
    const { PlanningLeaveScreen } = require("./PlanningLeaveScreen")
    render(<PlanningLeaveScreen />)
    expect(screen.getByText(/planning:leave\.noLeaveTitle/)).toBeTruthy()
  })

  it("renders leave balance card with translated metric labels", () => {
    mockLeaveQuery.mockReturnValue(idleQuery(SAMPLE_ENTITLEMENT))
    const { PlanningLeaveScreen } = require("./PlanningLeaveScreen")
    render(<PlanningLeaveScreen />)
    // Metric labels use translate() — mocked i18n returns key strings
    expect(screen.getByText(/planning:leave\.statutory/)).toBeTruthy()
    expect(screen.getByText(/planning:leave\.employer/)).toBeTruthy()
    expect(screen.getByText(/planning:leave\.total/)).toBeTruthy()
    // Values from fixture
    expect(screen.getByText("20d")).toBeTruthy()
    expect(screen.getByText("5d")).toBeTruthy()
    expect(screen.getByText("25d")).toBeTruthy()
  })

  it("renders error state when entitlement query errors", () => {
    mockLeaveQuery.mockReturnValue({ state: null, isLoading: false, isError: true, refetch: jest.fn() })
    const { PlanningLeaveScreen } = require("./PlanningLeaveScreen")
    render(<PlanningLeaveScreen />)
    const nodes = screen.getAllByText(/planning:schedule\.loadError/)
    expect(nodes.length).toBeGreaterThan(0)
  })
})
