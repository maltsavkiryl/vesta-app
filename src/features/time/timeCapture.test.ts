import { buildAddressLabel, buildCoordinateLabel } from "./timeCapture"

describe("time capture labels", () => {
  it("builds a readable address label from reverse-geocoded components", () => {
    expect(
      buildAddressLabel({
        city: "Brussels",
        postalCode: "1000",
        street: "Rue Royale",
        streetNumber: "10",
      }),
    ).toBe("Rue Royale 10, 1000 Brussels")
  })

  it("falls back to captured coordinates when no address is available", () => {
    expect(buildCoordinateLabel(50.123456, 4.654321)).toBe("Captured at 50.12346, 4.65432")
  })
})
