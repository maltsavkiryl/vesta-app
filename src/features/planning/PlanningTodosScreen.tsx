import { StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { translate } from "@/i18n/translate"
import { AppScrollScreen, EmptyState, GroupedSection, PageHeader, useDesignTokens } from "@/ui"
import { useRefreshHandler } from "@/utils/useRefreshHandler"

import {
  PlanningTodosBrief,
  PlanningTodosEmpty,
  PlanningTodosSection,
  PlanningTodosSkeleton,
} from "./PlanningTodosSections"
import { usePlanningTodosScreen } from "./usePlanningTodosScreen"

export function PlanningTodosScreen({ embedded = false }: { embedded?: boolean }) {
  const tokens = useDesignTokens()
  const screen = usePlanningTodosScreen()
  const { onRefresh, refreshing } = useRefreshHandler(screen.refetch)

  if (screen.isError && screen.todos.length === 0) {
    return (
      <AppScrollScreen
        variant="grouped"
        contentContainerStyle={styles.screen}
        onRefresh={onRefresh}
        refreshing={refreshing}
      >
        {embedded ? null : <PageHeader delay={0} title={translate("planning:todos.title")} />}
        <EmptyState
          actionLabel={translate("common:actions.retry")}
          icon={<Ionicons color={tokens.textMuted} name="wifi-outline" size={18} />}
          onAction={onRefresh}
          subtitle={translate("planning:schedule.loadErrorSubtitle")}
          title={translate("planning:schedule.loadError")}
        />
      </AppScrollScreen>
    )
  }

  const isFirstLoad = screen.isLoading && screen.todos.length === 0
  const hasTodos = screen.todos.length > 0

  return (
    <AppScrollScreen
      variant="grouped"
      contentContainerStyle={styles.screen}
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      {embedded ? null : <PageHeader delay={0} title={translate("planning:todos.title")} />}
      {isFirstLoad ? (
        <GroupedSection title={translate("planning:todos.sectionTodo")}>
          <PlanningTodosSkeleton />
        </GroupedSection>
      ) : !hasTodos ? (
        <PlanningTodosEmpty />
      ) : (
        <>
          <PlanningTodosBrief dressNote={screen.dressNote} note={screen.note} />
          <PlanningTodosSection
            isCompleting={screen.isCompleting || screen.isUncompleting}
            onComplete={(id) => {
              void screen.handleComplete(id)
            }}
            onUncomplete={(id) => {
              void screen.handleUncomplete(id)
            }}
            title={translate("planning:todos.sectionTodo")}
            todos={screen.pendingTodos}
          />
          <PlanningTodosSection
            isCompleting={screen.isCompleting || screen.isUncompleting}
            onComplete={(id) => {
              void screen.handleComplete(id)
            }}
            onUncomplete={(id) => {
              void screen.handleUncomplete(id)
            }}
            title={translate("planning:todos.sectionDone")}
            todos={screen.completedTodos}
          />
        </>
      )}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  screen: {
    gap: 22,
    paddingBottom: 32,
  },
})
