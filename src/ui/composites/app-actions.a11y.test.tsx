import { render } from "@testing-library/react-native"

import { ThemeProvider } from "@/theme/context"

import { AppButton, IconButton } from "./app-actions"

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
})
