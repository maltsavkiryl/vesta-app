import { renderHook } from "@testing-library/react-native"

import { useHomeQuery } from "./home.queries"

const mockQueryResult = {
  data: undefined as unknown,
  isError: false,
  isLoading: true,
  refetch: jest.fn(),
}

jest.mock("@tanstack/react-query", () => ({
  useQuery: () => mockQueryResult,
}))

jest.mock("@/providers/app-provider", () => ({
  useAppSession: () => ({ accountId: "account-1" }),
}))

jest.mock("@/composition/repositories", () => ({
  appRepositories: { home: { getHomeOverview: jest.fn() } },
}))

describe("useHomeQuery", () => {
  it("exposes loading/error/refetch alongside data instead of only data", () => {
    const { result } = renderHook(() => useHomeQuery())

    expect(result.current).toEqual({
      data: undefined,
      isError: false,
      isLoading: true,
      refetch: mockQueryResult.refetch,
    })
  })

  it("forwards error and loaded states from the underlying query", () => {
    mockQueryResult.data = { profile: { firstName: "Ada" } }
    mockQueryResult.isError = true
    mockQueryResult.isLoading = false

    const { result } = renderHook(() => useHomeQuery())

    expect(result.current.isError).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toEqual({ profile: { firstName: "Ada" } })
  })
})
