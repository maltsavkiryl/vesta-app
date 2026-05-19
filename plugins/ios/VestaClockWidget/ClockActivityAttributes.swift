import ActivityKit
import Foundation

struct ClockActivityAttributes: ActivityAttributes {
  struct ContentState: Codable, Hashable {
    let status: String
    let startedAt: String
    let breakStartedAt: String?
    let accumulatedBreakSeconds: Int
  }

  let sessionId: String
  let scheduledStart: String
  let scheduledEnd: String
  let role: String
  let venueName: String
}
