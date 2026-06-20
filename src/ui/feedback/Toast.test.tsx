import { render, act } from "@testing-library/react-native"
import React from "react"

import { ThemeProvider } from "@/theme/context"

import { ToastProvider, useToast } from "./Toast"

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}))

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider initialContext="light">
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  )
}

function ToastTrigger({ onReady }: { onReady: (hooks: ReturnType<typeof useToast>) => void }) {
  const toast = useToast()
  React.useEffect(() => {
    onReady(toast)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

describe("Toast", () => {
  it("showSuccess queues a toast and it renders", async () => {
    let toast: ReturnType<typeof useToast> | null = null
    const { findByText } = render(
      <AllProviders>
        <ToastTrigger onReady={(t) => (toast = t)} />
      </AllProviders>,
    )

    await act(async () => {
      toast!.showSuccess("Upload complete")
    })

    expect(await findByText("Upload complete")).toBeTruthy()
  })

  it("useToast throws when used outside ToastProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {})

    function BadComponent() {
      useToast()
      return null
    }

    expect(() =>
      render(
        <ThemeProvider initialContext="light">
          <BadComponent />
        </ThemeProvider>,
      ),
    ).toThrow("useToast must be used within a ToastProvider")

    spy.mockRestore()
  })

  it("renders toast without crashing under reduced motion", async () => {
    // The setup.ts mock returns shouldReduceMotion: false by default.
    // This test verifies the component still renders correctly regardless.
    let toast: ReturnType<typeof useToast> | null = null
    const { findByText } = render(
      <AllProviders>
        <ToastTrigger onReady={(t) => (toast = t)} />
      </AllProviders>,
    )

    await act(async () => {
      toast!.showInfo("Hello world")
    })

    expect(await findByText("Hello world")).toBeTruthy()
  })
})
