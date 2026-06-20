/* eslint-disable react-native/no-inline-styles */

import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { PlanningTodo } from "@/core/models"
import { EmptyState, GroupedSection, useDesignTokens } from "@/ui"
import { Text } from "@/ui/primitives/Text"

export function PlanningTodoItem({
  isCompleting,
  onComplete,
  todo,
}: {
  isCompleting: boolean
  onComplete: (id: string) => void
  todo: PlanningTodo
}) {
  const tokens = useDesignTokens()
  const done = todo.isCompletedByMe
  const checkColor = done ? tokens.success : tokens.backgroundMuted
  const borderColor = done ? tokens.success : tokens.border

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={todo.label}
      disabled={done || isCompleting}
      onPress={() => onComplete(todo.id)}
      style={({ pressed }) => [styles.todoRow, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: done ? tokens.success : "transparent",
            borderColor,
          },
        ]}
      >
        {done ? (
          <Ionicons color={tokens.surface} name="checkmark" size={12} />
        ) : null}
      </View>
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
  )
}

export function PlanningTodosSection({
  isCompleting,
  onComplete,
  title,
  todos,
}: {
  isCompleting: boolean
  onComplete: (id: string) => void
  title: string
  todos: PlanningTodo[]
}) {
  if (todos.length === 0) return null

  return (
    <GroupedSection title={title}>
      <View style={styles.todoList}>
        {todos.map((todo) => (
          <PlanningTodoItem
            key={todo.id}
            isCompleting={isCompleting}
            onComplete={onComplete}
            todo={todo}
          />
        ))}
      </View>
    </GroupedSection>
  )
}

export function PlanningTodosEmpty() {
  const tokens = useDesignTokens()
  return (
    <EmptyState
      icon={<Ionicons color={tokens.textMuted} name="checkmark-done-outline" size={18} />}
      subtitle="Je hebt vandaag geen taken. Geniet van je shift!"
      title="Geen taken vandaag"
    />
  )
}

const styles = StyleSheet.create({
  checkbox: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 6,
    borderWidth: 1.5,
    height: 22,
    justifyContent: "center",
    width: 22,
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
