import { useState } from "react"
import { useAppSession } from "@/providers/app-provider"
import { useLeaveBalancesQuery, useLeaveRequestsQuery } from "@/features/planning/data/planning.queries"
import { useCreateLeaveRequestMutation } from "@/features/planning/data/planning.mutations"
import { usePlanningEmployeeCode } from "@/features/planning/usePlanningEmployeeCode"
import { getLocalToday } from "@/core/date"
import type { CreateLeaveRequestParams } from "@/features/planning/data/planning.repository"

export type LeaveFormState = {
  startDate: string
  endDate: string
  notes: string
}

export function usePlanningLeaveScreen() {
  const { accountId } = useAppSession()
  const employeeCode = usePlanningEmployeeCode()
  const today = getLocalToday()

  const queryParams = {
    employerCode: accountId ?? "",
    employeeCode: employeeCode ?? "",
  }

  const balancesQuery = useLeaveBalancesQuery(queryParams)
  const requestsQuery = useLeaveRequestsQuery(queryParams)
  const createMutation = useCreateLeaveRequestMutation()

  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [form, setForm] = useState<LeaveFormState>({
    startDate: today,
    endDate: today,
    notes: "",
  })

  const currentYearBalance = (balancesQuery.state ?? []).find(
    (b) => b.calendarYear === new Date().getFullYear(),
  )

  const handleCreateLeave = async () => {
    if (!accountId || !employeeCode) return
    setIsCreating(true)
    setCreateError(null)

    const params: CreateLeaveRequestParams = {
      employerCode: accountId,
      employeeCode,
      input: {
        leaveTypeId: 1, // default — no leave type picker in v1
        startDate: form.startDate,
        endDate: form.endDate,
        requestNotes: form.notes.trim() || undefined,
      },
    }

    const result = await createMutation.mutateAsync(params)
    setIsCreating(false)

    if (!result.ok) {
      setCreateError("Kon verlofaanvraag niet indienen. Probeer het opnieuw.")
      return
    }

    setCreateSuccess(true)
    setForm({ startDate: today, endDate: today, notes: "" })
  }

  const dismissSuccess = () => setCreateSuccess(false)

  const refetch = () => {
    void balancesQuery.refetch()
    void requestsQuery.refetch()
  }

  return {
    balances: balancesQuery.state ?? [],
    createError,
    createSuccess,
    currentYearBalance,
    dismissSuccess,
    form,
    handleCreateLeave,
    isCreating,
    isError: balancesQuery.isError || requestsQuery.isError,
    isLoading: balancesQuery.isLoading || requestsQuery.isLoading,
    refetch,
    requests: requestsQuery.state ?? [],
    setForm,
    today,
  }
}

export type PlanningLeaveScreenModel = ReturnType<typeof usePlanningLeaveScreen>
