import { success } from "@/shared/result"

import type { AuthRepository } from "./auth.repository"
import { completeOnboardingWorkflow } from "./auth.workflow"

function fakeRepository(): AuthRepository {
  const session = { accountId: "acc-1", isSignedIn: true, needsOnboarding: false }
  return {
    completeOnboarding: jest.fn(async () => success(session)),
  } as unknown as AuthRepository
}

describe("completeOnboardingWorkflow", () => {
  it("completes without an employer (Skip for now)", async () => {
    const repository = fakeRepository()
    const result = await completeOnboardingWorkflow(repository, "acc-1", {
      role: "Waiter",
      employerId: "",
    })

    expect(result.ok).toBe(true)
    expect(repository.completeOnboarding).toHaveBeenCalledWith("acc-1", {
      role: "Waiter",
      employerId: "",
    })
  })

  it("rejects only when the role is missing", async () => {
    const repository = fakeRepository()
    const result = await completeOnboardingWorkflow(repository, "acc-1", {
      role: "",
      employerId: "",
    })

    expect(result.ok).toBe(false)
    expect(repository.completeOnboarding).not.toHaveBeenCalled()
  })
})
