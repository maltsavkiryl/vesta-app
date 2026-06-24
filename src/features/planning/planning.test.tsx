/**
 * Integration tests for the planning feature screens.
 *
 * Each test mounts the screen component and asserts on visible output or user
 * interactions. Hooks are mocked at their module boundaries so we exercise
 * the real screen component logic without network calls.
 */
import { act, fireEvent, render, screen } from "@testing-library/react-native"

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
    default: ({
      onChange,
      value,
    }: {
      onChange?: (event: unknown, date?: Date) => void
      value: Date
    }) => {
      void onChange
      void value
      return React.createElement(View, { testID: "date-time-picker" })
    },
  }
})

jest.mock("@/providers/app-provider", () => ({
  useAppSession: () => ({ accountId: "test-account-id" }),
}))

jest.mock("@/ui/feedback", () => ({
  ...jest.requireActual("@/ui/feedback"),
  useToast: () => ({
    showToast: jest.fn(),
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showInfo: jest.fn(),
    showWarning: jest.fn(),
  }),
}))

// ── Screen hook mocks (set up per test suite) ─────────────────────────────────

const mockScheduleQuery = jest.fn()
const mockTodosQuery = jest.fn()
const mockCallsQuery = jest.fn()
const mockRequestsQuery = jest.fn()
const mockLeaveQuery = jest.fn()
const mockSwapCandidatesQuery = jest.fn()

jest.mock("@/features/planning/data/planning.queries", () => ({
  usePlanningScheduleQuery: (...args: any[]) => mockScheduleQuery(...args),
  usePlanningTodosQuery: (...args: any[]) => mockTodosQuery(...args),
  usePlanningCallsQuery: (...args: any[]) => mockCallsQuery(...args),
  useMyRequestsQuery: (...args: any[]) => mockRequestsQuery(...args),
  useLeaveEntitlementQuery: (...args: any[]) => mockLeaveQuery(...args),
  usePlanningSwapCandidatesQuery: (...args: any[]) => mockSwapCandidatesQuery(...args),
  planningQueryKeys: {
    all: (id: string) => ["planning", id],
    schedule: (id: string, p: any) => ["planning", id, "schedule", p],
    todos: (id: string) => ["planning", id, "todos"],
    calls: (id: string, p: any) => ["planning", id, "calls", p],
    requests: (id: string) => ["planning", id, "requests"],
    leave: (id: string) => ["planning", id, "leave"],
    availability: (id: string) => ["planning", id, "availability"],
    swapCandidates: (id: string, code: string | null) => ["planning", id, "swap-candidates", code],
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

const SAMPLE_CANDIDATE = {
  shiftId: "candidate-shift-001",
  employeeId: "employee-001",
  employeeName: "Jane Doe",
  shiftDate: "2099-07-16",
  startTime: "08:00",
  endTime: "16:00",
  teamId: "team-001",
  teamName: "Morning Team",
  taskId: "task-001",
  taskName: "Cashier",
  city: "Brussels",
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
    // The empty state title — real English text from en.ts planning.schedule.noShifts
    const nodes = screen.getAllByText(/No upcoming shifts/)
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
    mockScheduleQuery.mockReturnValue({
      state: null,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    })
    const { PlanningShiftsScreen } = require("./PlanningShiftsScreen")
    render(<PlanningShiftsScreen />)
    // Real English text from en.ts planning.schedule.loadError
    const nodes = screen.getAllByText(/Couldn't load your schedule/)
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
    // Real English text from en.ts planning.todos.noTasksTitle
    expect(screen.getByText(/No tasks today/)).toBeTruthy()
  })

  it("renders pending todo item", () => {
    mockTodosQuery.mockReturnValue(idleQuery({ todos: [SAMPLE_TODO], dressNote: null, note: null }))
    const { PlanningTodosScreen } = require("./PlanningTodosScreen")
    render(<PlanningTodosScreen />)
    expect(screen.getByText("Check stock levels")).toBeTruthy()
  })

  it("calls completeTodo mutation when checkbox pressed on pending todo", async () => {
    mockTodosQuery.mockReturnValue(idleQuery({ todos: [SAMPLE_TODO], dressNote: null, note: null }))
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
    // Real English text from en.ts planning.calls.noCallsTitle
    expect(screen.getByText(/No open calls/)).toBeTruthy()
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
    // Real English text from en.ts planning.calls.claim
    const claimButton = screen.getByRole("button", { name: /Claim/ })
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
// Signature moments

describe("Signature moments", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("calls completeTodo mutation on checkbox press (check-off signature moment)", async () => {
    mockTodosQuery.mockReturnValue(idleQuery({ todos: [SAMPLE_TODO], dressNote: null, note: null }))
    const { PlanningTodosScreen } = require("./PlanningTodosScreen")
    render(<PlanningTodosScreen />)
    const checkbox = screen.getByRole("checkbox", { name: "Check stock levels" })
    fireEvent.press(checkbox)
    await Promise.resolve()
    // Core behaviour: mutation called with the right todo code
    expect(mockCompleteTodoMutation).toHaveBeenCalledWith({ todoCode: "todo-001" })
  })

  it("calls claimCall mutation on claim press (claim signature moment)", async () => {
    mockClaimCallMutation.mockResolvedValue({ ok: true })
    mockCallsQuery.mockReturnValue(idleQuery([SAMPLE_CALL]))
    const { PlanningCallsScreen } = require("./PlanningCallsScreen")
    render(<PlanningCallsScreen />)
    // Real English text from en.ts planning.calls.claim
    const claimButton = screen.getByRole("button", { name: /Claim/ })
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
    // Default: no shift selected yet → candidates query idle with no data
    mockSwapCandidatesQuery.mockReturnValue(idleQuery(null))
  })

  it("submit button is disabled without a shift selected", () => {
    const { PlanningSwapNewScreen } = require("./PlanningSwapNewScreen")
    render(<PlanningSwapNewScreen />)
    // Real English text from en.ts planning.requests.shiftSwap
    const submitBtn = screen.getByRole("button", { name: /Shift swap/ })
    expect(submitBtn.props.accessibilityState?.disabled).toBe(true)
  })

  it("shows 'pick your shift first' prompt before a shift is selected", () => {
    const { PlanningSwapNewScreen } = require("./PlanningSwapNewScreen")
    render(<PlanningSwapNewScreen />)
    // Real English text from en.ts planning.requests.pickShiftFirst
    expect(screen.getByText(/Select your shift above to see available swaps/)).toBeTruthy()
  })

  it("submit button is disabled with shift selected but no candidate chosen", () => {
    mockSwapCandidatesQuery.mockReturnValue(idleQuery([]))
    const { PlanningSwapNewScreen } = require("./PlanningSwapNewScreen")
    render(<PlanningSwapNewScreen />)

    // Select a shift row (radio button)
    const shiftRows = screen.getAllByRole("radio")
    fireEvent.press(shiftRows[0])

    // Real English text from en.ts planning.requests.shiftSwap
    const submitBtn = screen.getByRole("button", { name: /Shift swap/ })
    expect(submitBtn.props.accessibilityState?.disabled).toBe(true)
  })

  it("shows empty state when candidates list is empty after shift selection", () => {
    mockSwapCandidatesQuery.mockReturnValue(idleQuery([]))
    const { PlanningSwapNewScreen } = require("./PlanningSwapNewScreen")
    render(<PlanningSwapNewScreen />)

    const shiftRows = screen.getAllByRole("radio")
    fireEvent.press(shiftRows[0])

    // Real English text from en.ts planning.requests.noSwapCandidates
    expect(screen.getByText(/No swappable shifts found/)).toBeTruthy()
  })

  it("renders candidate rows after shift selection", () => {
    mockSwapCandidatesQuery.mockReturnValue(idleQuery([SAMPLE_CANDIDATE]))
    const { PlanningSwapNewScreen } = require("./PlanningSwapNewScreen")
    render(<PlanningSwapNewScreen />)

    const shiftRows = screen.getAllByRole("radio")
    fireEvent.press(shiftRows[0])

    // Candidate employee name should appear
    expect(screen.getByText("Jane Doe")).toBeTruthy()
  })

  it("submit enabled and calls mutation when my shift + candidate are selected", async () => {
    mockSwapCandidatesQuery.mockReturnValue(idleQuery([SAMPLE_CANDIDATE]))
    const { PlanningSwapNewScreen } = require("./PlanningSwapNewScreen")
    render(<PlanningSwapNewScreen />)

    // Select my shift (first radio)
    const shiftRows = screen.getAllByRole("radio")
    fireEvent.press(shiftRows[0])

    // Select candidate (second radio that appears — "Jane Doe")
    const allRadios = screen.getAllByRole("radio")
    // The candidate row is the second radio
    fireEvent.press(allRadios[1])

    // Real English text from en.ts planning.requests.shiftSwap
    const submitBtn = screen.getByRole("button", { name: /Shift swap/ })
    expect(submitBtn.props.accessibilityState?.disabled).toBe(false)

    fireEvent.press(submitBtn)
    await Promise.resolve()

    expect(mockCreateShiftSwapMutation).toHaveBeenCalledWith({
      input: {
        requesterShiftId: "shift-001",
        targetShiftId: "candidate-shift-001",
        note: undefined,
      },
    })
  })

  it("shows error row when mutation returns ok: false", async () => {
    mockCreateShiftSwapMutation.mockResolvedValue({
      ok: false,
      error: { type: "validation", message: "fail" },
    })
    mockSwapCandidatesQuery.mockReturnValue(idleQuery([SAMPLE_CANDIDATE]))
    const { PlanningSwapNewScreen } = require("./PlanningSwapNewScreen")
    render(<PlanningSwapNewScreen />)

    const shiftRows = screen.getAllByRole("radio")
    fireEvent.press(shiftRows[0])

    const allRadios = screen.getAllByRole("radio")
    fireEvent.press(allRadios[1])

    // Real English text from en.ts planning.requests.shiftSwap
    const submitBtn = screen.getByRole("button", { name: /Shift swap/ })
    await act(async () => {
      fireEvent.press(submitBtn)
    })

    // Error row appears — real English text from en.ts planning.requests.submitError
    expect(screen.getByText(/Couldn't submit request/)).toBeTruthy()
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
    // Real English text from en.ts planning.requests.changeRequest
    const submitBtn = screen.getByRole("button", { name: /Change request/ })
    expect(submitBtn.props.accessibilityState?.disabled).toBe(true)
  })

  it("submit enabled after selecting a shift and entering a note", () => {
    const { PlanningChangeNewScreen } = require("./PlanningChangeNewScreen")
    render(<PlanningChangeNewScreen />)

    const shiftRow = screen.getByRole("radio", { name: /./i })
    fireEvent.press(shiftRow)
    // A note counts as a change — canSubmit requires at least one field to differ
    fireEvent.changeText(screen.getByLabelText(/Note/i), "Please adjust my shift")

    // Real English text from en.ts planning.requests.changeRequest
    const submitBtn = screen.getByRole("button", { name: /Change request/ })
    expect(submitBtn.props.accessibilityState?.disabled).toBe(false)
  })

  it("calls mutation with shift ID when submitted", async () => {
    const { PlanningChangeNewScreen } = require("./PlanningChangeNewScreen")
    render(<PlanningChangeNewScreen />)

    const shiftRow = screen.getByRole("radio", { name: /./i })
    fireEvent.press(shiftRow)
    fireEvent.changeText(screen.getByLabelText(/Note/i), "Please adjust my shift")

    // Real English text from en.ts planning.requests.changeRequest
    const submitBtn = screen.getByRole("button", { name: /Change request/ })
    fireEvent.press(submitBtn)
    await Promise.resolve()

    expect(mockCreateShiftChangeMutation).toHaveBeenCalledWith({
      input: expect.objectContaining({ shiftId: "shift-001" }),
    })
  })

  it("renders pressable date/time picker rows", () => {
    const { PlanningChangeNewScreen } = require("./PlanningChangeNewScreen")
    render(<PlanningChangeNewScreen />)
    // Picker rows render as buttons with real translated label text
    // planning.requests.requestedDate => "Requested date"
    // planning.requests.requestedStartTime => "Start time"
    // planning.requests.requestedEndTime => "End time"
    expect(screen.getByText(/Requested date/i)).toBeTruthy()
    expect(screen.getByText(/Start time/i)).toBeTruthy()
    expect(screen.getByText(/End time/i)).toBeTruthy()
  })

  it("shows error row when mutation returns ok: false", async () => {
    mockCreateShiftChangeMutation.mockResolvedValue({
      ok: false,
      error: { type: "validation", message: "fail" },
    })
    const { PlanningChangeNewScreen } = require("./PlanningChangeNewScreen")
    render(<PlanningChangeNewScreen />)

    const shiftRow = screen.getByRole("radio", { name: /./i })
    fireEvent.press(shiftRow)
    fireEvent.changeText(screen.getByLabelText(/Note/i), "Please adjust my shift")

    // Real English text from en.ts planning.requests.changeRequest
    const submitBtn = screen.getByRole("button", { name: /Change request/ })
    await act(async () => {
      fireEvent.press(submitBtn)
    })

    // Real English text from en.ts planning.requests.submitError
    expect(screen.getByText(/Couldn't submit request/)).toBeTruthy()
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
    // Real English text from en.ts planning.leave.noLeaveTitle
    expect(screen.getByText(/No leave balance/)).toBeTruthy()
  })

  it("renders leave balance card with translated metric labels", () => {
    mockLeaveQuery.mockReturnValue(idleQuery(SAMPLE_ENTITLEMENT))
    const { PlanningLeaveScreen } = require("./PlanningLeaveScreen")
    render(<PlanningLeaveScreen />)
    // Real English metric labels from en.ts planning.leave.*
    expect(screen.getByText(/Statutory/)).toBeTruthy()
    expect(screen.getByText(/Employer/)).toBeTruthy()
    expect(screen.getByText(/Total/)).toBeTruthy()
    // Values from fixture
    expect(screen.getByText("20d")).toBeTruthy()
    expect(screen.getByText("5d")).toBeTruthy()
    expect(screen.getByText("25d")).toBeTruthy()
  })

  it("renders error state when entitlement query errors", () => {
    mockLeaveQuery.mockReturnValue({
      state: null,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    })
    const { PlanningLeaveScreen } = require("./PlanningLeaveScreen")
    render(<PlanningLeaveScreen />)
    // Real English text from en.ts planning.schedule.loadError
    const nodes = screen.getAllByText(/Couldn't load your schedule/)
    expect(nodes.length).toBeGreaterThan(0)
  })
})
