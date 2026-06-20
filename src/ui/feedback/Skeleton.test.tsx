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

  it("renders a shimmer container (not a static opacity block) when motion is allowed", () => {
    mockMotion.shouldReduceMotion = false

    const screen = renderSkeleton()
    const node = screen.getByLabelText("Loading")
    const style = StyleSheet.flatten(node.props.style)

    // Shimmer path renders a View with overflow:hidden (no fixed opacity) — the
    // translateX gradient overlay handles the animation.
    expect(style.overflow).toBe("hidden")
    expect(style.opacity).toBeUndefined()
  })

  it("collapses to a static block when reduced motion is enabled", () => {
    mockMotion.shouldReduceMotion = true

    const screen = renderSkeleton()
    const style = StyleSheet.flatten(screen.getByLabelText("Loading").props.style)

    expect(style.opacity).toBe(0.55)
  })
})
