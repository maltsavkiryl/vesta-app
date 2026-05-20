import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - Helpers

private func parseISODate(_ isoString: String?) -> Date? {
  guard let isoString else { return nil }

  let formatter = ISO8601DateFormatter()
  formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  if let date = formatter.date(from: isoString) {
    return date
  }

  formatter.formatOptions = [.withInternetDateTime]
  return formatter.date(from: isoString)
}

private func displayedTimerSeconds(for state: ClockActivityAttributes.ContentState) -> Int {
  if state.status == "onBreak", let breakStartedAt = parseISODate(state.breakStartedAt) {
    return max(Int(Date().timeIntervalSince(breakStartedAt)), 0)
  }

  guard let startedAt = parseISODate(state.startedAt) else { return 0 }
  return max(Int(Date().timeIntervalSince(startedAt)), 0)
}

private func formattedDuration(_ seconds: Int) -> String {
  let h = seconds / 3600
  let m = (seconds % 3600) / 60
  if h > 0 {
    return String(format: "%d:%02d", h, m)
  }
  return String(format: "%d min", m)
}

private func scheduledEndTime(_ isoString: String) -> String {
  guard let date = parseISODate(isoString) else { return isoString }
  let display = DateFormatter()
  display.dateFormat = "HH:mm"
  return display.string(from: date)
}

@ViewBuilder
private func liveTimerText(for state: ClockActivityAttributes.ContentState) -> some View {
  if state.status == "onBreak", let breakStartedAt = parseISODate(state.breakStartedAt) {
    Text(breakStartedAt, style: .timer)
  } else if let startedAt = parseISODate(state.startedAt) {
    Text(startedAt, style: .timer)
  } else {
    Text(formattedDuration(displayedTimerSeconds(for: state)))
  }
}

// MARK: - Lock Screen view

struct ClockLockScreenView: View {
  let attributes: ClockActivityAttributes
  let state: ClockActivityAttributes.ContentState

  var body: some View {
    let isOnBreak = state.status == "onBreak"

    VStack(alignment: .leading, spacing: 6) {
      HStack {
        Label(
          isOnBreak ? "On break" : "Working",
          systemImage: isOnBreak ? "pause.circle.fill" : "clock.fill"
        )
        .font(.headline)
        .foregroundStyle(isOnBreak ? Color.orange : Color.green)

        Spacer()

        liveTimerText(for: state)
          .font(.title2.monospacedDigit().bold())
          .foregroundStyle(.primary)
      }

      Divider()

      HStack {
        VStack(alignment: .leading, spacing: 2) {
          Text(attributes.role)
            .font(.caption.bold())
            .lineLimit(1)
          Text(attributes.venueName)
            .font(.caption)
            .foregroundStyle(.secondary)
            .lineLimit(1)
        }
        Spacer()
        VStack(alignment: .trailing, spacing: 2) {
          Text("Until")
            .font(.caption)
            .foregroundStyle(.secondary)
          Text(scheduledEndTime(attributes.scheduledEnd))
            .font(.caption.bold().monospacedDigit())
        }
      }
    }
    .padding(.horizontal, 16)
    .padding(.vertical, 12)
  }
}

// MARK: - Dynamic Island views

struct ClockDynamicIslandCompactLeading: View {
  let state: ClockActivityAttributes.ContentState

  var body: some View {
    let isOnBreak = state.status == "onBreak"
    Image(systemName: isOnBreak ? "pause.circle.fill" : "clock.fill")
      .foregroundStyle(isOnBreak ? Color.orange : Color.green)
      .font(.caption)
  }
}

struct ClockDynamicIslandCompactTrailing: View {
  let state: ClockActivityAttributes.ContentState

  var body: some View {
    liveTimerText(for: state)
      .font(.caption.monospacedDigit().bold())
      .foregroundStyle(.primary)
      .lineLimit(1)
      .minimumScaleFactor(0.7)
  }
}

struct ClockDynamicIslandExpandedView: View {
  let attributes: ClockActivityAttributes
  let state: ClockActivityAttributes.ContentState

  var body: some View {
    let isOnBreak = state.status == "onBreak"

    VStack(spacing: 8) {
      HStack {
        Label(
          isOnBreak ? "On break" : "Working",
          systemImage: isOnBreak ? "pause.circle.fill" : "clock.fill"
        )
        .foregroundStyle(isOnBreak ? Color.orange : Color.green)
        .font(.subheadline.bold())

        Spacer()

        liveTimerText(for: state)
          .font(.title3.monospacedDigit().bold())
      }

      HStack {
        VStack(alignment: .leading, spacing: 2) {
          Text(attributes.role)
            .font(.caption.bold())
            .lineLimit(1)
          Text(attributes.venueName)
            .font(.caption)
            .foregroundStyle(.secondary)
            .lineLimit(1)
        }
        Spacer()
        Text("Until \(scheduledEndTime(attributes.scheduledEnd))")
          .font(.caption)
          .foregroundStyle(.secondary)
      }
    }
    .padding(.horizontal)
    .padding(.vertical, 8)
  }
}

// MARK: - Widget

struct VestaClockWidget: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: ClockActivityAttributes.self) { context in
      ClockLockScreenView(
        attributes: context.attributes,
        state: context.state
      )
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          ClockDynamicIslandCompactLeading(state: context.state)
        }
        DynamicIslandExpandedRegion(.trailing) {
          ClockDynamicIslandCompactTrailing(state: context.state)
        }
        DynamicIslandExpandedRegion(.bottom) {
          ClockDynamicIslandExpandedView(
            attributes: context.attributes,
            state: context.state
          )
        }
      } compactLeading: {
        ClockDynamicIslandCompactLeading(state: context.state)
      } compactTrailing: {
        ClockDynamicIslandCompactTrailing(state: context.state)
      } minimal: {
        let isOnBreak = context.state.status == "onBreak"
        Image(systemName: isOnBreak ? "pause.circle.fill" : "clock.fill")
          .foregroundStyle(isOnBreak ? Color.orange : Color.green)
      }
    }
  }
}
