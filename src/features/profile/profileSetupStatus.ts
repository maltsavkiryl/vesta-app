import type { AppStoreState } from "@/core/models"
import { translate } from "@/i18n/translate"

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
      complete:
        hasValue(profile.firstName) && hasValue(profile.lastName) && hasValue(profile.email),
      detail: translate("profile:setup.basicsHint"),
      id: "identity",
      weight: 20,
    },
    {
      complete: employers.length > 0,
      detail: translate("profile:setup.linkWorkplaceHint"),
      id: "workplaces",
      weight: 15,
    },
    {
      complete: hasValue(profile.phone),
      detail: translate("profile:setup.phoneHint"),
      id: "contact",
      weight: 15,
    },
    {
      complete:
        hasValue(profile.address.street) &&
        hasValue(profile.address.postalCode) &&
        hasValue(profile.address.city) &&
        hasValue(profile.address.country),
      detail: translate("profile:setup.addressHint"),
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
      detail: translate("profile:setup.payrollHint"),
      id: "payroll",
      weight: 25,
    },
    {
      complete:
        hasValue(profile.emergencyContact.name) &&
        hasValue(profile.emergencyContact.relationship) &&
        hasValue(profile.emergencyContact.phone),
      detail: translate("profile:setup.emergencyHint"),
      id: "emergency",
      weight: 10,
    },
  ]
}

export function getProfileSetupStatus(state: AppStoreState): ProfileSetupStatus {
  const steps = getSetupSteps(state)
  const completedWeight = steps.reduce(
    (total, step) => total + (step.complete ? step.weight : 0),
    0,
  )
  const remainingSteps = steps.filter((step) => !step.complete)
  const remainingCount = remainingSteps.length

  if (remainingCount === 0) {
    return {
      detail: translate("profile:setup.readyBody"),
      progress: 100,
      remainingCount: 0,
      title: translate("profile:setup.readyTitle"),
    }
  }

  return {
    detail: remainingSteps[0]?.detail ?? translate("profile:setup.almostBody"),
    progress: completedWeight,
    remainingCount,
    title:
      completedWeight >= 70
        ? translate("profile:setup.almostTitle")
        : translate("profile:setup.accountSetup"),
  }
}
