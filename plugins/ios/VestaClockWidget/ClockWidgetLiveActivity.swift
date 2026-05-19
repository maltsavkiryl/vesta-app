import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - Helpers

private func elapsedSeconds(from isoString: String, breakSeconds: Int, status: String, breakStartedAt: String?) -> Int {
  let formatter = ISO8601DateFormatter()
  formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  guard let start = formatter.date(from: isoString) else { return 0 }
  let total = Int(Date().timeIntervalSince(start))
  var breaks = breakSeconds
  if status == "onBreak", let bsStr = breakStartedAt, let bs = formatter.date(from: bsStr) {
    breaks += Int(Date().timeIntervalSince(bs))
  }
  return max(0, total - breaks)
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
  let formatter = ISO8601DateFormatter()
  formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  guard let date = formatter.date(from: isoString) else { return isoString }
  let display = DateFormatter()
  display.dateFormat = "HH:mm"
  return display.string(from: date)
}

// MARK: - Lock Screen view

struct ClockLockScreenView: View {
  let attributes: ClockActivityAttributes
  let state: ClockActivityAttributes.ContentState

  var body: some View {
    let elapsed = elapsedSeconds(
      from: state.startedAt,
      breakSeconds: state.accumulatedBreakSeconds,
      status: state.status,
      breakStartedAt: state.breakStartedAt
    )
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

        Text(formattedDuration(elapsed))
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
  let attributes: ClockActivityAttributes
  let state: ClockActivityAttributes.ContentState

  var body: some View {
    let elapsed = elapsedSeconds(
      from: state.startedAt,
      breakSeconds: state.accumulatedBreakSeconds,
      status: state.status,
      breakStartedAt: state.breakStartedAt
    )
    Text(formattedDuration(elapsed))
      .font(.caption.monospacedDigit().bold())
      .foregroundStyle(.primary)
  }
}

struct ClockDynamicIslandExpandedView: View {
  let attributes: ClockActivityAttributes
  let state: ClockActivityAttributes.ContentState

  var body: some View {
    let elapsed = elapsedSeconds(
      from: state.startedAt,
      breakSeconds: state.accumulatedBreakSeconds,
      status: state.status,
      breakStartedAt: state.breakStartedAt
    )
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

        Text(formattedDuration(elapsed))
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
          ClockDynamicIslandCompactTrailing(
            attributes: context.attributes,
            state: context.state
          )
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
        ClockDynamicIslandCompactTrailing(
          attributes: context.attributes,
          state: context.state
        )
      } minimal: {
        let isOnBreak = context.state.status == "onBreak"
        Image(systemName: isOnBreak ? "pause.circle.fill" : "clock.fill")
          .foregroundStyle(isOnBreak ? Color.orange : Color.green)
      }
    }
  }
}
