import { StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppScrollScreen, EmptyState, PageHeader, useDesignTokens } from "@/ui"
import { translate } from "@/i18n/translate"
import { useRefreshHandler } from "@/utils/useRefreshHandler"
import { PlanningTodosBrief, PlanningTodosEmpty, PlanningTodosSection } from "./PlanningTodosSections"
import { usePlanningTodosScreen } from "./usePlanningTodosScreen"

export function PlanningTodosScreen() {
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
        <PageHeader delay={0} title={translate("planning:todos.title")} />
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

  const hasTodos = screen.todos.length > 0

  return (
    <AppScrollScreen
      variant="grouped"
      contentContainerStyle={styles.screen}
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <PageHeader delay={0} title={translate("planning:todos.title")} />
      {!hasTodos && !screen.isLoading ? (
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
            title="Te doen"
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
            title="Klaar"
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
