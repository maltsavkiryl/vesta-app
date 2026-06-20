import Animated from "react-native-reanimated"
import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { PlanningTodo } from "@/core/models"
import { EmptyState, GroupedSection, Skeleton, useDesignTokens } from "@/ui"
import { Text } from "@/ui/primitives/Text"
import { translate } from "@/i18n/translate"
import { useListItemEntrance, useCelebratePulse } from "@/ui/foundations/motion"
import { fireHaptic } from "@/utils/haptics"

// ─── Brief card ───────────────────────────────────────────────────────────────

export function PlanningTodosBrief({ dressNote, note }: { dressNote?: string; note?: string }) {
  const tokens = useDesignTokens()
  if (!dressNote && !note) return null

  return (
    <GroupedSection title={translate("planning:todos.brief")}>
      <View style={styles.briefBody}>
        {dressNote ? (
          <View style={styles.briefRow}>
            <Ionicons color={tokens.accent} name="shirt-outline" size={14} />
            <Text
              size="xs"
              style={{ color: tokens.textPrimary }}
              text={dressNote}
              weight="medium"
            />
          </View>
        ) : null}
        {note ? (
          <View style={styles.briefRow}>
            <Ionicons color={tokens.textMuted} name="information-circle-outline" size={14} />
            <Text
              size="xs"
              style={[styles.briefNote, { color: tokens.textSecondary }]}
              text={note}
            />
          </View>
        ) : null}
      </View>
    </GroupedSection>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function PlanningTodosSkeleton() {
  return (
    <View style={styles.todoList}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.skeletonRow}>
          <Skeleton width={24} height={24} radius={8} />
          <Skeleton width={180 - i * 20} height={13} radius={6} />
        </View>
      ))}
    </View>
  )
}

// ─── Individual Todo Item ─────────────────────────────────────────────────────

export function PlanningTodoItem({
  index = 0,
  isCompleting,
  onComplete,
  onUncomplete,
  todo,
}: {
  index?: number
  isCompleting: boolean
  onComplete: (id: string) => void
  onUncomplete: (id: string) => void
  todo: PlanningTodo
}) {
  const tokens = useDesignTokens()
  const done = todo.isCompletedByMe
  const { animatedStyle: entranceStyle } = useListItemEntrance(index, { baseDelay: 20, step: 36 })
  const { animatedStyle: pulseStyle, triggerPulse } = useCelebratePulse()

  const handlePress = () => {
    if (done) {
      onUncomplete(todo.id)
      fireHaptic("selection")
    } else {
      onComplete(todo.id)
      // Signature moment: haptic + spring pulse on check-off
      fireHaptic("success")
      triggerPulse()
    }
  }

  return (
    <Animated.View style={entranceStyle}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={todo.label}
        disabled={isCompleting}
        onPress={handlePress}
        style={({ pressed }) => [styles.todoRow, { opacity: pressed ? 0.8 : 1 }]}
      >
        {/* Animated checkbox with celebrate pulse */}
        <Animated.View style={pulseStyle}>
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: done ? tokens.success : "transparent",
                borderColor: done ? tokens.success : tokens.border,
              },
            ]}
          >
            {done ? (
              <Ionicons color={tokens.surface} name="checkmark" size={13} />
            ) : null}
          </View>
        </Animated.View>

        {/* Label */}
        <View style={styles.todoContent}>
          <Text
            size="sm"
            style={[
              { color: done ? tokens.textMuted : tokens.textPrimary },
              done ? styles.strikethrough : undefined,
            ]}
            text={todo.label}
            weight={done ? "normal" : "medium"}
          />
        </View>
      </Pressable>
    </Animated.View>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function PlanningTodosSection({
  isCompleting,
  onComplete,
  onUncomplete,
  title,
  todos,
}: {
  isCompleting: boolean
  onComplete: (id: string) => void
  onUncomplete: (id: string) => void
  title: string
  todos: PlanningTodo[]
}) {
  if (todos.length === 0) return null

  return (
    <GroupedSection title={title}>
      <View style={styles.todoList}>
        {todos.map((todo, i) => (
          <PlanningTodoItem
            key={todo.id}
            index={i}
            isCompleting={isCompleting}
            onComplete={onComplete}
            onUncomplete={onUncomplete}
            todo={todo}
          />
        ))}
      </View>
    </GroupedSection>
  )
}

// ─── Empty ────────────────────────────────────────────────────────────────────

export function PlanningTodosEmpty() {
  const tokens = useDesignTokens()
  return (
    <EmptyState
      icon={<Ionicons color={tokens.textMuted} name="checkmark-done-outline" size={18} />}
      subtitle={translate("planning:todos.noTasksSubtitle")}
      title={translate("planning:todos.noTasksTitle")}
    />
  )
}

const styles = StyleSheet.create({
  briefBody: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  briefNote: {
    flex: 1,
  },
  briefRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
  checkbox: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 8,
    borderWidth: 1.5,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  skeletonRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  strikethrough: {
    textDecorationLine: "line-through",
  },
  todoContent: {
    flex: 1,
    gap: 2,
  },
  todoList: {
    gap: 0,
  },
  todoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
})
