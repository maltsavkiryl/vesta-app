import { StyleSheet } from "react-native"
import { render } from "@testing-library/react-native"

import { ThemeProvider } from "@/ui"

import { Skeleton } from "./Skeleton"

const mockMotion = { shouldReduceMotion: false }

jest.mock("@/providers/motion-provider", () => ({
  useAppMotion: () => mockMotion,
}))

function renderSkeleton() {
  return render(
    <ThemeProvider initialContext="light">
      <Skeleton />
    </ThemeProvider>,
  )
}

describe("Skeleton", () => {
  afterEach(() => {
    mockMotion.shouldReduceMotion = false
  })

  it("renders an accessible loading placeholder", () => {
    const screen = renderSkeleton()

    const node = screen.getByLabelText("Loading")
    expect(node).toBeTruthy()
    expect(node.props.accessibilityState).toEqual({ busy: true })
  })

  it("pulses (animated opacity) when motion is allowed", () => {
    mockMotion.shouldReduceMotion = false

    const screen = renderSkeleton()
    const style = StyleSheet.flatten(screen.getByLabelText("Loading").props.style)

    // 0.45 + progress(0) * 0.4 from the animated style factory
    expect(style.opacity).toBeCloseTo(0.45)
  })

  it("collapses to a static block when reduced motion is enabled", () => {
    mockMotion.shouldReduceMotion = true

    const screen = renderSkeleton()
    const style = StyleSheet.flatten(screen.getByLabelText("Loading").props.style)

    expect(style.opacity).toBe(0.55)
  })
})
