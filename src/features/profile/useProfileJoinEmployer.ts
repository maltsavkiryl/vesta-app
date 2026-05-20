import { useCallback, useState } from "react"
import { useFocusEffect } from "@react-navigation/native"

import type { Employer } from "@/core/models"
import { consumePendingEmployerInviteCode } from "@/features/employers/employerQrScanSession"
import {
  findEmployerByInviteCode,
  normalizeEmployerInviteCode,
} from "@/features/employers/employerInviteCode"
import { fireHaptic } from "@/utils/haptics"

import type { JoinMode, SectionKey } from "./profileSections"

export function useProfileJoinEmployer({
  employers,
  employerDirectory,
  joinEmployerMutation,
  section,
}: {
  employers: Employer[]
  employerDirectory: Employer[]
  joinEmployerMutation: (employerId: string) => Promise<any>
  section: SectionKey
}) {
  const [joinMode, setJoinMode] = useState<JoinMode>("code")
  const [joinCode, setJoinCode] = useState("")
  const [joinSearch, setJoinSearch] = useState("")
  const [selectedJoinEmployerId, setSelectedJoinEmployerId] = useState<string | undefined>()
  const [joinedEmployerId, setJoinedEmployerId] = useState<string | undefined>()

  const availableEmployers = employerDirectory.filter(
    (employer) => !employers.some((existing) => existing.id === employer.id),
  )
  const codeMatchedEmployer = findEmployerByInviteCode(availableEmployers, joinCode)
  const searchResults = availableEmployers.filter((employer) => {
    const query = joinSearch.trim().toLowerCase()
    if (!query) return true

    return (
      employer.name.toLowerCase().includes(query) ||
      employer.type.toLowerCase().includes(query) ||
      employer.city.toLowerCase().includes(query) ||
      employer.code.toLowerCase().includes(query)
    )
  })
  const selectedJoinEmployer =
    joinMode === "code"
      ? codeMatchedEmployer
      : availableEmployers.find((employer) => employer.id === selectedJoinEmployerId)
  const joinedEmployer = employers.find((employer) => employer.id === joinedEmployerId)

  useFocusEffect(
    useCallback(() => {
      const scannedCode = consumePendingEmployerInviteCode()
      if (!scannedCode || section !== "join-employer") return

      setJoinMode("code")
      setJoinSearch("")
      setSelectedJoinEmployerId(undefined)
      setJoinedEmployerId(undefined)
      setJoinCode(normalizeEmployerInviteCode(scannedCode))
    }, [section]),
  )

  const joinEmployer = async (employerId: string) => {
    const result = await joinEmployerMutation(employerId)
    if (!result.ok) {
      fireHaptic("error")
      return result
    }

    fireHaptic("success")
    return result
  }

  return {
    availableEmployers,
    codeMatchedEmployer,
    joinCode,
    joinEmployer,
    joinedEmployer,
    joinedEmployerId,
    joinMode,
    joinSearch,
    searchResults,
    selectedJoinEmployer,
    selectedJoinEmployerId,
    setJoinCode,
    setJoinedEmployerId,
    setJoinMode,
    setJoinSearch,
    setSelectedJoinEmployerId,
  }
}
