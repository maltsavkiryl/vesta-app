import type { AppStoreState } from "@/core/models"

export interface ProfileSetupStatus {
  detail: string
  progress: number
  remainingCount: number
  title: string
}

interface SetupStep {
  complete: boolean
  detail: string
  id: string
  weight: number
}

function hasValue(value?: string) {
  return Boolean(value?.trim())
}

function getSetupSteps(state: AppStoreState): SetupStep[] {
  const { employers, profile } = state

  return [
    {
      complete: hasValue(profile.firstName) && hasValue(profile.lastName) && hasValue(profile.email),
      detail: "Complete your profile basics so the rest of your setup stays accurate.",
      id: "identity",
      weight: 20,
    },
    {
      complete: employers.length > 0,
      detail: "Link a workplace before you start managing shifts and documents.",
      id: "workplaces",
      weight: 15,
    },
    {
      complete: hasValue(profile.phone),
      detail: "Add your phone number so employers can reach you quickly about shifts.",
      id: "contact",
      weight: 15,
    },
    {
      complete:
        hasValue(profile.address.street) &&
        hasValue(profile.address.postalCode) &&
        hasValue(profile.address.city) &&
        hasValue(profile.address.country),
      detail: "Add your home address for payroll and official correspondence.",
      id: "address",
      weight: 15,
    },
    {
      complete:
        hasValue(profile.bankAccount.iban) &&
        hasValue(profile.bankAccount.bic) &&
        hasValue(profile.bankAccount.accountHolder) &&
        hasValue(profile.legal.nationalRegisterNumber) &&
        hasValue(profile.legal.taxId) &&
        hasValue(profile.legal.socialSecurityNumber),
      detail: "Finish your payroll details so payouts and compliance stay on track.",
      id: "payroll",
      weight: 25,
    },
    {
      complete:
        hasValue(profile.emergencyContact.name) &&
        hasValue(profile.emergencyContact.relationship) &&
        hasValue(profile.emergencyContact.phone),
      detail: "Add an emergency contact so employers know who to call if needed.",
      id: "emergency",
      weight: 10,
    },
  ]
}

export function getProfileSetupStatus(state: AppStoreState): ProfileSetupStatus {
  const steps = getSetupSteps(state)
  const completedWeight = steps.reduce((total, step) => total + (step.complete ? step.weight : 0), 0)
  const remainingSteps = steps.filter((step) => !step.complete)
  const remainingCount = remainingSteps.length

  if (remainingCount === 0) {
    return {
      detail: "Everything important is on file for shifts, payroll, and support.",
      progress: 100,
      remainingCount: 0,
      title: "Ready to work",
    }
  }

  return {
    detail: remainingSteps[0]?.detail ?? "Finish the remaining setup details to keep your account ready.",
    progress: completedWeight,
    remainingCount,
    title: completedWeight >= 70 ? "Almost ready" : "Account setup",
  }
}
