import { resolveMotionMode } from "./motion.utils"

describe("resolveMotionMode", () => {
  it("follows the system setting when preference is system", () => {
    expect(resolveMotionMode("system", false)).toBe("full")
    expect(resolveMotionMode("system", true)).toBe("reduced")
  })

  it("forces reduced motion when selected in-app", () => {
    expect(resolveMotionMode("reduced", false)).toBe("reduced")
    expect(resolveMotionMode("reduced", true)).toBe("reduced")
  })

  it("forces full motion when selected in-app", () => {
    expect(resolveMotionMode("full", false)).toBe("full")
    expect(resolveMotionMode("full", true)).toBe("full")
  })
})
