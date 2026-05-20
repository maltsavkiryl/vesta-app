import type { ReactNode } from "react"

import { EmployersSection, JoinEmployerSection } from "@/features/profile/ProfileDetailSections"

import type { SectionKey } from "./profileSections"
import type { ProfileDetailScreenState } from "./useProfileDetailScreen"

export const EMPLOYER_SECTION_CONTENT: Partial<
  Record<
    SectionKey,
    {
      editable: boolean
      render: (screen: ProfileDetailScreenState) => ReactNode
    }
  >
> = {
  "employers": {
    editable: false,
    render: ({ availableEmployers, joinEmployer, router, state, tokens }) => (
      <EmployersSection
        availableEmployers={availableEmployers}
        employers={state.employers}
        onJoinEmployer={joinEmployer}
        onOpenJoinEmployer={() => router.push("/profile/join-employer")}
        tokens={tokens}
      />
    ),
  },
  "join-employer": {
    editable: false,
    render: ({
      availableEmployers,
      codeMatchedEmployer,
      joinCode,
      joinedEmployer,
      joinEmployer,
      joinMode,
      joinSearch,
      router,
      searchResults,
      selectedJoinEmployer,
      selectedJoinEmployerId,
      setJoinCode,
      setJoinedEmployerId,
      setJoinMode,
      setJoinSearch,
      setSelectedJoinEmployerId,
      tokens,
    }) => (
      <JoinEmployerSection
        availableEmployers={availableEmployers}
        codeMatchedEmployer={codeMatchedEmployer}
        joinCode={joinCode}
        joinedEmployer={joinedEmployer}
        joinMode={joinMode}
        joinSearch={joinSearch}
        onChangeMode={(mode) => {
          setJoinMode(mode)
          setJoinCode("")
          setJoinSearch("")
          setSelectedJoinEmployerId(undefined)
          setJoinedEmployerId(undefined)
        }}
        onChangeSearch={(value) => {
          setJoinSearch(value)
          setSelectedJoinEmployerId(undefined)
          setJoinedEmployerId(undefined)
        }}
        onJoinSelectedEmployer={() => {
          if (!selectedJoinEmployer) return
          joinEmployer(selectedJoinEmployer.id)
          setJoinedEmployerId(selectedJoinEmployer.id)
        }}
        onOpenQrScanner={() => router.push("/(app)/employer-join-scanner")}
        onSelectEmployer={(employerId) => {
          setSelectedJoinEmployerId(employerId)
          setJoinedEmployerId(undefined)
        }}
        onSetJoinCode={(value) => {
          setJoinCode(value)
          setJoinedEmployerId(undefined)
        }}
        router={router}
        searchResults={searchResults}
        selectedJoinEmployer={selectedJoinEmployer}
        selectedJoinEmployerId={selectedJoinEmployerId}
        tokens={tokens}
      />
    ),
  },
}
