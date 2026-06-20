import { StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppScrollScreen, EmptyState, PageHeader, useDesignTokens } from "@/ui"
import { useRefreshHandler } from "@/utils/useRefreshHandler"
import { PlanningTodosEmpty, PlanningTodosSection } from "./PlanningTodosSections"
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
        <PageHeader delay={0} title="Taken voor vandaag" />
        <EmptyState
          actionLabel="Opnieuw proberen"
          icon={<Ionicons color={tokens.textMuted} name="wifi-outline" size={18} />}
          onAction={onRefresh}
          subtitle="Kon je taken niet laden. Controleer je verbinding en probeer opnieuw."
          title="Er is iets misgegaan"
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
      <PageHeader delay={0} title="Taken voor vandaag" />
      {!hasTodos && !screen.isLoading ? (
        <PlanningTodosEmpty />
      ) : (
        <>
          <PlanningTodosSection
            isCompleting={screen.isCompleting}
            onComplete={(id) => {
              void screen.handleComplete(id)
            }}
            title="Te doen"
            todos={screen.pendingTodos}
          />
          <PlanningTodosSection
            isCompleting={screen.isCompleting}
            onComplete={(id) => {
              void screen.handleComplete(id)
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
