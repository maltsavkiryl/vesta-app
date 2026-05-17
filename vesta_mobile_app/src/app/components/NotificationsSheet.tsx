import { useState } from "react";
import {
  X, Calendar, FileText, Bell, RefreshCw,
  AlertCircle, CheckCircle2, Banknote, Clock,
  ChevronRight, Trash2
} from "lucide-react";

const BG     = "#FFFFFF";
const CARD   = "#F2F2F7";
const TEXT1  = "#1C1C1E";
const TEXT2  = "#6C6C70";
const TEXT3  = "#AEAEB2";
const SEP    = "#E5E5EA";
const ACCENT = "#007AFF";
const GREEN  = "#34C759";
const RED    = "#FF3B30";
const AMBER  = "#FF9F0A";

interface Notif {
  id:        number;
  Icon:      React.ElementType;
  iconColor: string;
  iconBg:    string;
  title:     string;
  body:      string;
  time:      string;
  group:     "today" | "yesterday" | "earlier";
  unread:    boolean;
  cta?:      string;
}

const INIT: Notif[] = [
  {
    id: 1, Icon: Calendar,     iconColor: ACCENT, iconBg: "rgba(0,122,255,0.1)",
    title: "Schedule published",
    body: "Your schedule for week of Apr 27 is now available. You have 5 shifts.",
    time: "2h ago", group: "today", unread: true, cta: "View schedule",
  },
  {
    id: 2, Icon: AlertCircle,  iconColor: RED,   iconBg: "rgba(255,59,48,0.1)",
    title: "Action required",
    body: "Upload your ID card before May 5, 2026 to remain compliant.",
    time: "5h ago", group: "today", unread: true, cta: "Upload now",
  },
  {
    id: 3, Icon: Banknote,     iconColor: GREEN, iconBg: "rgba(52,199,89,0.1)",
    title: "Payslip ready",
    body: "Your March 2026 payslip (€1,847.50) is available in Documents.",
    time: "1d ago", group: "yesterday", unread: false, cta: "View payslip",
  },
  {
    id: 4, Icon: RefreshCw,    iconColor: AMBER, iconBg: "rgba(255,159,10,0.1)",
    title: "Shift updated",
    body: "Friday May 2 shift updated to 17:00–00:00 (+1h). Tap to review.",
    time: "2d ago", group: "yesterday", unread: false, cta: "View shift",
  },
  {
    id: 5, Icon: Clock,        iconColor: ACCENT, iconBg: "rgba(0,122,255,0.08)",
    title: "Availability reminder",
    body: "Set your availability for week of May 4 before Sunday.",
    time: "3d ago", group: "earlier", unread: false, cta: "Set availability",
  },
  {
    id: 6, Icon: CheckCircle2, iconColor: GREEN, iconBg: "rgba(52,199,89,0.08)",
    title: "Request approved",
    body: "Your shift swap for May 5 → May 7 has been approved by Bistro Noir.",
    time: "4d ago", group: "earlier", unread: false,
  },
  {
    id: 7, Icon: FileText,     iconColor: TEXT2, iconBg: BG,
    title: "Contract update",
    body: "A schedule amendment is available for your review and signature.",
    time: "5d ago", group: "earlier", unread: false, cta: "Review",
  },
];

const GROUP_LABELS: Record<string, string> = {
  today:     "Today",
  yesterday: "Yesterday",
  earlier:   "Earlier this week",
};

interface Props { onDismiss: () => void }

export function NotificationsSheet({ onDismiss }: Props) {
  const [closing,    setClosing]    = useState(false);
  const [notifs,     setNotifs]     = useState(INIT);
  const [dismissing, setDismissing] = useState<number[]>([]);

  const close = () => { setClosing(true); setTimeout(onDismiss, 320); };

  const dismissOne = (id: number) => {
    setDismissing((p) => [...p, id]);
    setTimeout(() => setNotifs((p) => p.filter((n) => n.id !== id)), 500);
  };

  const markAllRead = () => setNotifs((p) => p.map((n) => ({ ...n, unread: false })));

  const clearAll = () => {
    const ids = notifs.map((n) => n.id);
    setDismissing(ids);
    setTimeout(() => setNotifs([]), 500);
  };

  const unreadCount = notifs.filter((n) => n.unread).length;

  const groups = (["today", "yesterday", "earlier"] as const)
    .map((g) => ({
      key:   g,
      label: GROUP_LABELS[g],
      items: notifs.filter((n) => n.group === g && !dismissing.includes(n.id)),
    }))
    .filter((g) => g.items.length > 0 || notifs.some((n) => n.group === g));

  const visibleGroups = groups.filter((g) => g.items.length > 0);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", animation: closing ? "bdOut 0.3s ease forwards" : "bdIn 0.25s ease" }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: CARD, borderRadius: "24px 24px 0 0",
          paddingBottom: "40px",
          animation: closing ? "sheetDown 0.32s cubic-bezier(0.32,0.72,0,1) forwards" : "sheetUp 0.38s cubic-bezier(0.32,0.72,0,1)",
          maxHeight: "90%", overflowY: "auto",
        }}
      >
        {/* Handle */}
        <div style={{ width: "36px", height: "4px", background: "#D1D1D6", borderRadius: "99px", margin: "12px auto 0" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: `0.5px solid ${SEP}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.4px" }}>Notifications</div>
            {unreadCount > 0 && (
              <div style={{ background: RED, borderRadius: "20px", padding: "1px 8px", minWidth: "20px", textAlign: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>{unreadCount}</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ fontSize: "13px", color: ACCENT, fontWeight: 500, background: "none" }}>
                Mark all read
              </button>
            )}
            {notifs.length > 0 && (
              <button onClick={clearAll} style={{ width: "30px", height: "30px", borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={14} style={{ color: TEXT2 }} />
              </button>
            )}
            <button onClick={close} style={{ width: "30px", height: "30px", borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={15} style={{ color: TEXT2 }} />
            </button>
          </div>
        </div>

        {/* Empty state */}
        {notifs.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "56px 32px", animation: "fadeUp 0.3s ease" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={30} style={{ color: TEXT3 }} />
            </div>
            <div style={{ fontSize: "18px", fontWeight: 600, color: TEXT1 }}>All caught up!</div>
            <div style={{ fontSize: "14px", color: TEXT2, textAlign: "center", lineHeight: 1.5 }}>
              No notifications right now. We'll let you know when something needs your attention.
            </div>
          </div>
        )}

        {/* Notification groups */}
        {visibleGroups.length > 0 && (
          <div style={{ padding: "8px 16px 0" }}>
            {visibleGroups.map((group) => (
              <div key={group.key} style={{ marginTop: "14px" }}>
                {/* Group label */}
                <div style={{ fontSize: "11px", fontWeight: 600, color: TEXT3, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px", paddingLeft: "2px" }}>
                  {group.label}
                </div>

                <div style={{ background: BG, borderRadius: "16px", overflow: "hidden" }}>
                  {group.items.map((n, idx) => {
                    const isDismissing = dismissing.includes(n.id);
                    return (
                      <div
                        key={n.id}
                        style={{
                          borderBottom: idx < group.items.length - 1 ? `0.5px solid ${SEP}` : "none",
                          background: n.unread ? "rgba(0,122,255,0.03)" : "transparent",
                          animation: isDismissing ? "slideOutLeft 0.45s ease forwards" : undefined,
                          overflow: "hidden",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "11px", padding: "13px 13px" }}>
                          {/* Icon */}
                          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: n.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                            <n.Icon size={18} style={{ color: n.iconColor }} />
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "6px", marginBottom: "3px" }}>
                              <span style={{ fontSize: "14px", fontWeight: n.unread ? 600 : 500, color: TEXT1, lineHeight: 1.3 }}>
                                {n.title}
                              </span>
                              <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                                <span style={{ fontSize: "11px", color: TEXT3 }}>{n.time}</span>
                                {n.unread && <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: ACCENT }} />}
                              </div>
                            </div>
                            <div style={{ fontSize: "13px", color: TEXT2, lineHeight: 1.45, marginBottom: n.cta ? "8px" : 0 }}>
                              {n.body}
                            </div>
                            {n.cta && (
                              <button
                                onClick={() => dismissOne(n.id)}
                                style={{ display: "inline-flex", alignItems: "center", gap: "3px", color: ACCENT, fontSize: "12px", fontWeight: 600, background: "rgba(0,122,255,0.06)", padding: "4px 10px", borderRadius: "8px" }}
                              >
                                {n.cta} <ChevronRight size={11} />
                              </button>
                            )}
                          </div>

                          {/* Dismiss ×  */}
                          <button
                            onClick={() => dismissOne(n.id)}
                            style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}
                          >
                            <X size={12} style={{ color: TEXT3 }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Clear all */}
            {notifs.length > 2 && (
              <button
                onClick={clearAll}
                style={{ width: "100%", marginTop: "14px", padding: "13px", color: RED, fontSize: "14px", fontWeight: 500, background: "rgba(255,59,48,0.05)", borderRadius: "14px", border: "1px solid rgba(255,59,48,0.1)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <Trash2 size={14} /> Clear all notifications
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}