import { useRouter } from "expo-router"

import type { Employer } from "@/core/models"
import type { DesignTokens } from "@/ui"

import { EmployerSearchPanel, InviteCodePanel } from "./ProfileEmployerJoinPanels"
import { JoinModeHero, JoinModePicker, JoinSuccessCard } from "./ProfileEmployerJoinShared"
import { EmployerPreviewCard } from "./ProfileEmployerShared"
import type { JoinMode } from "./ProfileSectionShared"

export function JoinEmployerSection(props: {
  availableEmployers: Employer[]
  codeMatchedEmployer?: Employer
  joinCode: string
  joinedEmployer?: Employer
  joinMode: JoinMode
  joinSearch: string
  onChangeMode: (mode: JoinMode) => void
  onChangeSearch: (value: string) => void
  onJoinSelectedEmployer: () => void
  onOpenQrScanner: () => void
  onSetJoinCode: (value: string) => void
  onSelectEmployer: (employerId: string) => void
  router: ReturnType<typeof useRouter>
  searchResults: Employer[]
  selectedJoinEmployer?: Employer
  selectedJoinEmployerId?: string
  tokens: DesignTokens
}) {
  const {
    availableEmployers,
    codeMatchedEmployer,
    joinCode,
    joinedEmployer,
    joinMode,
    joinSearch,
    onChangeMode,
    onChangeSearch,
    onJoinSelectedEmployer,
    onOpenQrScanner,
    onSelectEmployer,
    onSetJoinCode,
    router,
    searchResults,
    selectedJoinEmployer,
    selectedJoinEmployerId,
    tokens,
  } = props

  return (
    <>
      <JoinModeHero joinMode={joinMode} tokens={tokens} />
      <JoinModePicker joinMode={joinMode} onChangeMode={onChangeMode} tokens={tokens} />

      {joinMode === "code" ? (
        <InviteCodePanel
          codeMatchedEmployer={codeMatchedEmployer}
          joinCode={joinCode}
          onOpenQrScanner={onOpenQrScanner}
          onSetJoinCode={onSetJoinCode}
          tokens={tokens}
        />
      ) : null}

      {joinMode === "search" ? (
        <EmployerSearchPanel
          joinSearch={joinSearch}
          onChangeSearch={onChangeSearch}
          onSelectEmployer={onSelectEmployer}
          searchResults={searchResults}
          selectedJoinEmployerId={selectedJoinEmployerId}
          tokens={tokens}
        />
      ) : null}

      {selectedJoinEmployer && !joinedEmployer ? (
        <EmployerPreviewCard employer={selectedJoinEmployer} onJoin={onJoinSelectedEmployer} />
      ) : null}

      {joinedEmployer ? (
        <JoinSuccessCard joinedEmployer={joinedEmployer} router={router} tokens={tokens} />
      ) : null}
    </>
  )
}
