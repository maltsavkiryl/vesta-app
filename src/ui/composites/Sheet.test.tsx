import { render, fireEvent } from "@testing-library/react-native"

import { ThemeProvider } from "@/theme/context"

import { Sheet } from "./Sheet"

jest.mock("react-native-gesture-handler", () => ({
  Gesture: {
    Pan: () => ({
      onUpdate: () => ({
        onEnd: () => ({}),
      }),
    }),
  },
  GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  PanGestureHandler: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider initialContext="light">{children}</ThemeProvider>
}

describe("Sheet", () => {
  it("renders children when isOpen=true", () => {
    const { getByText } = render(
      <Sheet isOpen onClose={jest.fn()} title="Test Sheet">
        <></>
      </Sheet>,
      { wrapper },
    )

    expect(getByText("Test Sheet")).toBeTruthy()
  })

  it("does not render content when isOpen=false", () => {
    const { queryByText } = render(
      <Sheet isOpen={false} onClose={jest.fn()} title="Hidden Sheet">
        <></>
      </Sheet>,
      { wrapper },
    )

    // When isOpen=false the component returns null (not visible)
    expect(queryByText("Hidden Sheet")).toBeNull()
  })

  it("calls onClose when backdrop is pressed", () => {
    const onClose = jest.fn()
    const { getByLabelText } = render(
      <Sheet isOpen onClose={onClose}>
        <></>
      </Sheet>,
      { wrapper },
    )

    fireEvent.press(getByLabelText("Close sheet"))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("reaches reduce-motion path when shouldReduceMotion=true", () => {
    // The motion-provider mock in test/setup.ts returns shouldReduceMotion: false
    // Override for this test
    jest.mock("@/providers/motion-provider", () => ({
      ...jest.requireActual("@/providers/motion-provider"),
      useAppMotion: () => ({
        enterDistance: 0,
        enterDuration: 0,
        mode: "reduced",
        preference: "system",
        prefersReducedMotion: true,
        shouldReduceMotion: true,
        staggerStep: 0,
      }),
    }))

    // Sheet should still render without crashing under reduced motion
    const { getByText } = render(
      <Sheet isOpen onClose={jest.fn()} title="Reduced">
        <></>
      </Sheet>,
      { wrapper },
    )

    expect(getByText("Reduced")).toBeTruthy()
  })
})
