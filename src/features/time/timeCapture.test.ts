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

  it("does not repeat the street line when reverse geocoding returns it as the place name", () => {
    expect(
      buildAddressLabel({
        city: "Diepenbeek",
        name: "Watertorenstraat 2",
        postalCode: "3590",
        street: "Watertorenstraat",
        streetNumber: "2",
      }),
    ).toBe("Watertorenstraat 2, 3590 Diepenbeek")
  })

  it("falls back to captured coordinates when no address is available", () => {
    expect(buildCoordinateLabel(50.123456, 4.654321)).toBe("Captured at 50.12346, 4.65432")
  })
})
