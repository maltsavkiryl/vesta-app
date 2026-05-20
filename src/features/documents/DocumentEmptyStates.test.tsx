import { render, screen } from "@testing-library/react-native"

import { DOCUMENTS_SECTION_CONTENT } from "@/features/profile/ProfileDetailDocumentsContent"
import { ThemeProvider } from "@/ui"

import { ContractDetailScreen } from "./ContractDetailScreen"
import { PayslipDetailScreen } from "./PayslipDetailScreen"

const mockBack = jest.fn()

let mockRouteParams: Record<string, string | undefined> = { id: "missing", mode: "view" }
let mockDocumentsScreen = {
  cancelSearch: jest.fn(),
  contracts: [],
  filteredContracts: [] as Array<any>,
  filteredDocuments: [] as Array<any>,
  filteredPayslips: [] as Array<any>,
  isSearching: false,
  missingCount: 0,
  openUploadOptions: jest.fn(),
  query: "",
  setIsSearching: jest.fn(),
  setQuery: jest.fn(),
}

jest.mock("expo-router", () => ({
  Stack: {
    Screen: () => null,
  },
  useLocalSearchParams: () => mockRouteParams,
  useRouter: () => ({
    back: mockBack,
    push: jest.fn(),
    replace: jest.fn(),
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

jest.mock("@/features/documents/components/DocumentsHeader", () => ({
  DocumentsHeader: () => null,
}))

jest.mock("@/features/documents/useDocumentsScreen", () => ({
  useDocumentsScreen: () => mockDocumentsScreen,
}))

jest.mock("@/features/documents/useContractDetailScreen", () => ({
  useContractDetailScreen: () => ({
    canSign: false,
    contract: undefined,
    mode: "view",
    router: { back: mockBack },
    setSignature: jest.fn(),
    signCurrentContract: jest.fn(),
    signature: "",
  }),
}))

function renderWithTheme(node: React.ReactElement) {
  return render(<ThemeProvider initialContext="light">{node}</ThemeProvider>)
}

function renderDocumentsSection(section: "contracts" | "legal-documents" | "payslips") {
  const content = DOCUMENTS_SECTION_CONTENT[section]?.render({} as never)
  if (!content || !("type" in (content as any))) {
    throw new Error(`Section ${section} did not render`)
  }

  return renderWithTheme(content as React.ReactElement)
}

describe("document empty states", () => {
  beforeEach(() => {
    mockBack.mockReset()
    mockRouteParams = { id: "missing", mode: "view" }
    mockDocumentsScreen = {
      cancelSearch: jest.fn(),
      contracts: [],
      filteredContracts: [],
      filteredDocuments: [],
      filteredPayslips: [],
      isSearching: false,
      missingCount: 0,
      openUploadOptions: jest.fn(),
      query: "",
      setIsSearching: jest.fn(),
      setQuery: jest.fn(),
    }
  })

  it("shows a no-data empty state for contracts", () => {
    renderDocumentsSection("contracts")

    expect(screen.getByText("No contracts on file")).toBeTruthy()
    expect(
      screen.getByText("Signed and pending agreements will appear here when your employer sends them."),
    ).toBeTruthy()
  })

  it("shows a no-data empty state for required legal documents", () => {
    renderDocumentsSection("legal-documents")

    expect(screen.getByText("Nothing needed right now")).toBeTruthy()
    expect(screen.getByText("Anything that needs an upload or review will appear here.")).toBeTruthy()
  })

  it("shows a search-empty state for payslips", () => {
    mockDocumentsScreen = {
      ...mockDocumentsScreen,
      query: "2098",
    }

    renderDocumentsSection("payslips")

    expect(screen.getByText("No matching payslips")).toBeTruthy()
    expect(screen.getByText("Clear search")).toBeTruthy()
  })

  it("shows an empty state for a stale contract route", () => {
    renderWithTheme(<ContractDetailScreen />)

    expect(screen.getByText("Contract not found")).toBeTruthy()
    expect(
      screen.getByText("This contract is no longer available in your local documents list."),
    ).toBeTruthy()
  })

  it("shows an empty state for a stale payslip route", () => {
    renderWithTheme(<PayslipDetailScreen />)

    expect(screen.getByText("Payslip not found")).toBeTruthy()
    expect(
      screen.getByText("This payslip is no longer available in the current local list."),
    ).toBeTruthy()
  })
})
