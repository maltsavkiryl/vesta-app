import { Easing } from "react-native-reanimated"

export const IOS_CLOSE_EASING = Easing.bezier(0.22, 0.61, 0.36, 1)
export const IOS_OPEN_SPRING = {
  damping: 23,
  mass: 0.92,
  overshootClamping: false,
  restDisplacementThreshold: 0.001,
  restSpeedThreshold: 0.001,
  stiffness: 205,
}
export const CARD_LIFT_SPRING = {
  damping: 20,
  mass: 0.88,
  overshootClamping: false,
  restDisplacementThreshold: 0.001,
  restSpeedThreshold: 0.001,
  stiffness: 215,
}
export const CARD_PRESS_IN_SPRING = {
  damping: 22,
  mass: 0.9,
  overshootClamping: false,
  restDisplacementThreshold: 0.001,
  restSpeedThreshold: 0.001,
  stiffness: 300,
}
export const CARD_PRESS_OUT_SPRING = {
  damping: 16,
  mass: 0.84,
  overshootClamping: false,
  restDisplacementThreshold: 0.001,
  restSpeedThreshold: 0.001,
  stiffness: 225,
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

export function getShiftDurationHours(start: string, end: string) {
  let minutes = timeToMinutes(end) - timeToMinutes(start)
  if (minutes < 0) minutes += 24 * 60
  return Math.round((minutes / 60) * 10) / 10
}

export function formatDurationHoursLabel(hours: number) {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)

  if (wholeHours === 0) return `${minutes}m`
  if (minutes === 0) return `${wholeHours}h`
  return `${wholeHours}h ${minutes}m`
}

export function getClockInOpenLabel(start: string) {
  const minutes = (timeToMinutes(start) + 24 * 60 - 15) % (24 * 60)
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0")
  const minuteValue = String(minutes % 60).padStart(2, "0")
  return `${hours}:${minuteValue}`
}
