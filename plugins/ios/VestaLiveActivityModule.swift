import Foundation
import ActivityKit

// Defined here to avoid duplicate file-name collision with the widget extension target.
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

private let kSessionActivityMap = "VestaLiveActivitySessionMap"

@objc(VestaLiveActivityModule)
class VestaLiveActivityModule: NSObject {

  // MARK: - Session tracking

  private func storedActivityId(for sessionId: String) -> String? {
    let map = UserDefaults.standard.dictionary(forKey: kSessionActivityMap) as? [String: String] ?? [:]
    return map[sessionId]
  }

  private func storeActivityId(_ activityId: String, for sessionId: String) {
    var map = UserDefaults.standard.dictionary(forKey: kSessionActivityMap) as? [String: String] ?? [:]
    map[sessionId] = activityId
    UserDefaults.standard.set(map, forKey: kSessionActivityMap)
  }

  private func removeActivityId(for sessionId: String) {
    var map = UserDefaults.standard.dictionary(forKey: kSessionActivityMap) as? [String: String] ?? [:]
    map.removeValue(forKey: sessionId)
    UserDefaults.standard.set(map, forKey: kSessionActivityMap)
  }

  // MARK: - Payload parsing

  private func parseContentState(from payload: NSDictionary) -> ClockActivityAttributes.ContentState? {
    guard
      let status = payload["status"] as? String,
      let startedAt = payload["startedAt"] as? String,
      let accumulatedBreakSeconds = payload["accumulatedBreakSeconds"] as? Int
    else { return nil }

    return ClockActivityAttributes.ContentState(
      status: status,
      startedAt: startedAt,
      breakStartedAt: payload["breakStartedAt"] as? String,
      accumulatedBreakSeconds: accumulatedBreakSeconds
    )
  }

  private func parseAttributes(from payload: NSDictionary) -> ClockActivityAttributes? {
    guard
      let sessionId = payload["sessionId"] as? String,
      let scheduledStart = payload["scheduledStart"] as? String,
      let scheduledEnd = payload["scheduledEnd"] as? String,
      let role = payload["role"] as? String,
      let venueName = payload["venueName"] as? String
    else { return nil }

    return ClockActivityAttributes(
      sessionId: sessionId,
      scheduledStart: scheduledStart,
      scheduledEnd: scheduledEnd,
      role: role,
      venueName: venueName
    )
  }

  // MARK: - RN methods

  @objc func isLiveActivitySupported(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    if #available(iOS 16.2, *) {
      resolve(ActivityAuthorizationInfo().areActivitiesEnabled)
    } else {
      resolve(false)
    }
  }

  @objc func startClockLiveActivity(
    _ payload: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard #available(iOS 16.2, *) else {
      resolve(nil)
      return
    }

    guard
      let attributes = parseAttributes(from: payload),
      let contentState = parseContentState(from: payload)
    else {
      reject("INVALID_PAYLOAD", "Missing required fields in payload", nil)
      return
    }

    do {
      let activity = try Activity<ClockActivityAttributes>.request(
        attributes: attributes,
        contentState: contentState,
        pushType: nil
      )
      storeActivityId(activity.id, for: attributes.sessionId)
      resolve(activity.id)
    } catch {
      reject("START_FAILED", error.localizedDescription, error)
    }
  }

  @objc func updateClockLiveActivity(
    _ payload: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard #available(iOS 16.2, *) else {
      resolve(nil)
      return
    }

    guard
      let sessionId = payload["sessionId"] as? String,
      let contentState = parseContentState(from: payload)
    else {
      reject("INVALID_PAYLOAD", "Missing required fields in payload", nil)
      return
    }

    guard let activityId = storedActivityId(for: sessionId) else {
      resolve(nil)
      return
    }

    let activity = Activity<ClockActivityAttributes>.activities.first { $0.id == activityId }
    guard let activity else {
      removeActivityId(for: sessionId)
      resolve(nil)
      return
    }

    Task {
      await activity.update(using: contentState)
      resolve(nil)
    }
  }

  @objc func endClockLiveActivity(
    _ payload: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard #available(iOS 16.2, *) else {
      resolve(nil)
      return
    }

    let sessionId = payload["sessionId"] as? String

    Task {
      if let sessionId {
        if let activityId = storedActivityId(for: sessionId) {
          let activity = Activity<ClockActivityAttributes>.activities.first { $0.id == activityId }
          await activity?.end(dismissalPolicy: .immediate)
          removeActivityId(for: sessionId)
        }
      } else {
        for activity in Activity<ClockActivityAttributes>.activities {
          await activity.end(dismissalPolicy: .immediate)
        }
        UserDefaults.standard.removeObject(forKey: kSessionActivityMap)
      }
      resolve(nil)
    }
  }
}
