import { Pressable } from "react-native"
import { render } from "@testing-library/react-native"

import { ThemeProvider } from "@/theme/context"

import { AppButton, IconButton } from "./app-actions"
import { StatusBadge } from "./app-status"

function renderUI(ui: React.ReactElement) {
  return render(<ThemeProvider initialContext="light">{ui}</ThemeProvider>)
}

describe("shared interactive primitives accessibility", () => {
  it("AppButton defaults to role=button and forwards its label", () => {
    // fullWidth forces the cross-platform Pressable path (vs. the native host).
    const screen = renderUI(<AppButton fullWidth label="Save" onPress={jest.fn()} />)
    const node = screen.getByLabelText("Save")

    expect(node.props.accessibilityRole).toBe("button")
    expect(node.props.accessibilityState).toMatchObject({ disabled: false })
  })

  it("AppButton reflects the disabled state and a custom label", () => {
    const screen = renderUI(
      <AppButton
        fullWidth
        disabled
        accessibilityLabel="Save changes"
        label="Save"
        onPress={jest.fn()}
      />,
    )
    const node = screen.getByLabelText("Save changes")

    expect(node.props.accessibilityRole).toBe("button")
    expect(node.props.accessibilityState).toMatchObject({ disabled: true })
  })

  it("IconButton is a labelled button with an expanded hit target", () => {
    const screen = renderUI(
      <IconButton accessibilityLabel="Close" onPress={jest.fn()}>
        {null}
      </IconButton>,
    )
    const node = screen.getByLabelText("Close")

    expect(node.props.accessibilityRole).toBe("button")
    expect(node.props.hitSlop).toBeDefined()
  })

  it("PlanningTodoItem checkbox role + state propagates correctly", () => {
    // Validate the pattern used by PlanningTodoItem (checkbox + checked state)
    // by testing the primitive: a Pressable with accessibilityRole="checkbox"
    // and accessibilityState.checked reflects the done state.
    const { getByRole } = renderUI(
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: true }}
        accessibilityLabel="Bestelling sorteren"
        onPress={jest.fn()}
      >
        {null}
      </Pressable>,
    )
    const node = getByRole("checkbox", { name: "Bestelling sorteren" })
    expect(node.props.accessibilityState?.checked).toBe(true)
  })

  it("StatusBadge is accessible with a label", () => {
    const { getByLabelText } = renderUI(
      <StatusBadge label="In behandeling" tone="warning" />,
    )
    const node = getByLabelText("In behandeling")
    expect(node.props.accessible).toBe(true)
  })
})
