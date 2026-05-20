import { StyleSheet, View } from "react-native"

import type { NotificationItem } from "@/core/models"
import { ListCard, SectionBlock, Text, useDesignTokens } from "@/ui"
import {
  completedTaskHistory,
  TaskRow,
  type TaskItem,
  UpdateRow,
} from "./HomeTaskSectionRows"

export type { TaskItem } from "./HomeTaskSectionRows"

export function HomeTasksSection({
  onComplete,
  onViewAll,
  tasks,
}: {
  onComplete: (task: TaskItem) => void
  onViewAll: () => void
  tasks: TaskItem[]
}) {
  if (tasks.length === 0) return null

  return (
    <SectionBlock
      actionLabel="View all"
      badgeLabel={`${tasks.length} pending`}
      title="Tasks"
      onAction={onViewAll}
    >
      <ListCard>
        {tasks.map((task, index) => (
          <TaskRow
            key={task.id}
            isLast={index === tasks.length - 1}
            item={task}
            onComplete={() => onComplete(task)}
          />
        ))}
      </ListCard>
    </SectionBlock>
  )
}

export function HomeUpdatesSection({
  notifications,
  onNotificationPress,
  onViewAll,
}: {
  notifications: NotificationItem[]
  onNotificationPress: (notification: NotificationItem) => void
  onViewAll: () => void
}) {
  if (notifications.length === 0) return null

  return (
    <SectionBlock actionLabel="View all" title="Updates" onAction={onViewAll}>
      <ListCard>
        {notifications.slice(0, 3).map((notification, index, items) => (
          <UpdateRow
            key={notification.id}
            isLast={index === items.length - 1}
            item={notification}
            onPress={() => onNotificationPress(notification)}
          />
        ))}
      </ListCard>
    </SectionBlock>
  )
}

export function HomeTasksDrawerGroups({
  backgroundColor,
  onComplete,
  pendingTasks,
}: {
  backgroundColor: string
  onComplete: (task: TaskItem) => void
  pendingTasks: TaskItem[]
}) {
  return (
    <>
      <TaskGroup
        backgroundColor={backgroundColor}
        onComplete={onComplete}
        tasks={pendingTasks}
        title="Pending"
      />
      <TaskGroup
        backgroundColor={backgroundColor}
        onComplete={() => undefined}
        tasks={completedTaskHistory}
        title="Completed"
      />
    </>
  )
}

function TaskGroup({
  backgroundColor,
  onComplete,
  tasks,
  title,
}: {
  backgroundColor: string
  onComplete: (task: TaskItem) => void
  tasks: TaskItem[]
  title: string
}) {
  const tokens = useDesignTokens()

  if (tasks.length === 0) return null

  return (
    <View style={styles.drawerGroup}>
      <Text
        text={title.toUpperCase()}
        size="xxs"
        weight="semiBold"
        style={[styles.capsLabel, { color: tokens.textMuted }]}
      />
      <ListCard style={[styles.drawerGroupCard, { backgroundColor }]}>
        {tasks.map((task, index) => (
          <TaskRow
            key={task.id}
            isLast={index === tasks.length - 1}
            item={task}
            onComplete={() => onComplete(task)}
          />
        ))}
      </ListCard>
    </View>
  )
}

const styles = StyleSheet.create({
  capsLabel: {
    letterSpacing: 0,
  },
  drawerGroup: {
    gap: 8,
    paddingTop: 16,
  },
  drawerGroupCard: {
    borderCurve: "continuous",
    borderRadius: 16,
    overflow: "hidden",
    paddingHorizontal: 0,
  },
})
