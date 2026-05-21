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

private func statusTitle(for state: ClockActivityAttributes.ContentState) -> String {
  state.status == "onBreak" ? "On break" : "Working"
}

private func statusSymbolName(for state: ClockActivityAttributes.ContentState) -> String {
  state.status == "onBreak" ? "pause.circle.fill" : "clock.fill"
}

private func statusTint(for state: ClockActivityAttributes.ContentState) -> Color {
  state.status == "onBreak" ? .orange : .green
}

private func metadataLine(for attributes: ClockActivityAttributes) -> String {
  let venueName = attributes.venueName.trimmingCharacters(in: .whitespacesAndNewlines)
  let role = attributes.role.trimmingCharacters(in: .whitespacesAndNewlines)

  if venueName.isEmpty {
    return role
  }

  if role.isEmpty || role == "Timer" {
    return venueName
  }

  return "\(venueName) · \(role)"
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

struct ClockStatusLabel: View {
  let state: ClockActivityAttributes.ContentState

  var body: some View {
    Label(statusTitle(for: state), systemImage: statusSymbolName(for: state))
      .font(.caption.bold())
      .foregroundStyle(statusTint(for: state))
      .labelStyle(.titleAndIcon)
      .lineLimit(1)
  }
}

// MARK: - Lock Screen view

struct ClockLockScreenView: View {
  let attributes: ClockActivityAttributes
  let state: ClockActivityAttributes.ContentState

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack(alignment: .top, spacing: 12) {
        VStack(alignment: .leading, spacing: 4) {
          ClockStatusLabel(state: state)

          liveTimerText(for: state)
            .font(.title2.monospacedDigit().bold())
            .foregroundStyle(.primary)
            .lineLimit(1)
            .minimumScaleFactor(0.75)
        }

        Spacer(minLength: 0)

        VStack(alignment: .trailing, spacing: 2) {
          Text(scheduledEndTime(attributes.scheduledEnd))
            .font(.headline.monospacedDigit())
            .foregroundStyle(.primary)
            .lineLimit(1)
          Text("Ends")
            .font(.caption2)
            .foregroundStyle(.secondary)
        }
      }

      let metadata = metadataLine(for: attributes)
      if !metadata.isEmpty {
        Text(metadata)
          .font(.caption)
          .foregroundStyle(.secondary)
          .lineLimit(1)
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
    Image(systemName: statusSymbolName(for: state))
      .foregroundStyle(statusTint(for: state))
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

struct ClockDynamicIslandExpandedStatus: View {
  let state: ClockActivityAttributes.ContentState

  var body: some View {
    ClockStatusLabel(state: state)
      .font(.caption2.bold())
  }
}

struct ClockDynamicIslandExpandedEndTime: View {
  let attributes: ClockActivityAttributes

  var body: some View {
    VStack(alignment: .trailing, spacing: 1) {
      Text("Ends")
        .font(.caption2)
        .foregroundStyle(.secondary)
      Text(scheduledEndTime(attributes.scheduledEnd))
        .font(.caption.monospacedDigit())
        .fontWeight(.semibold)
        .foregroundStyle(.primary)
        .lineLimit(1)
    }
  }
}

struct ClockDynamicIslandExpandedView: View {
  let attributes: ClockActivityAttributes
  let state: ClockActivityAttributes.ContentState

  var body: some View {
    VStack(alignment: .leading, spacing: 4) {
      liveTimerText(for: state)
        .font(.title3.monospacedDigit().bold())
        .foregroundStyle(.primary)
        .lineLimit(1)
        .minimumScaleFactor(0.8)

      let metadata = metadataLine(for: attributes)
      if !metadata.isEmpty {
        Text(metadata)
          .font(.caption)
          .foregroundStyle(.secondary)
          .lineLimit(1)
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(.top, 2)
    .padding(.bottom, 8)
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
          ClockDynamicIslandExpandedStatus(state: context.state)
        }
        DynamicIslandExpandedRegion(.trailing) {
          ClockDynamicIslandExpandedEndTime(attributes: context.attributes)
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
        Image(systemName: statusSymbolName(for: context.state))
          .foregroundStyle(statusTint(for: context.state))
      }
    }
  }
}
