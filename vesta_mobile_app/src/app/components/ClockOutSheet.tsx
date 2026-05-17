import { useState } from "react";
import { X, Clock, Coffee, DollarSign, Star, CheckCircle2 } from "lucide-react";
import type { ClockSummary } from "./types";

const ACCENT = "#007AFF";
const BG     = "#FFFFFF";
const CARD   = "#F2F2F7";
const TEXT1  = "#1C1C1E";
const TEXT2  = "#6C6C70";
const TEXT3  = "#AEAEB2";
const SEP    = "#E5E5EA";
const GREEN  = "#34C759";
const RED    = "#FF3B30";

const HOURLY_RATE = 12.02; // €/hr

function secs(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return { h, m };
}
function fmt(s: number) {
  const { h, m } = secs(s);
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface Props {
  summary: ClockSummary;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function ClockOutSheet({ summary, onConfirm, onDismiss }: Props) {
  const [closing,   setClosing]   = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const close = () => { setClosing(true); setTimeout(onDismiss, 320); };

  const netSecs    = Math.max(summary.workedSecs - summary.breakSecs, 0);
  const earnings   = ((netSecs / 3600) * HOURLY_RATE).toFixed(2);
  const overtime   = netSecs > 6 * 3600 ? netSecs - 6 * 3600 : 0;

  const now = new Date();
  const clockOutDisplay = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      onConfirm();
      close();
    }, 1400);
  };

  return (
    <>
      <div
        onClick={!confirmed ? close : undefined}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.5)",
          animation: closing ? "bdOut 0.3s ease forwards" : "bdIn 0.25s ease",
        }}
      />
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: CARD, borderRadius: "24px 24px 0 0",
          paddingBottom: "40px",
          animation: closing
            ? "sheetDown 0.32s cubic-bezier(0.32,0.72,0,1) forwards"
            : "sheetUp 0.38s cubic-bezier(0.32,0.72,0,1)",
          maxHeight: "88%", overflowY: "auto", scrollbarWidth: "none",
        }}
      >
        <div style={{ width: "36px", height: "4px", background: "#D1D1D6", borderRadius: "99px", margin: "12px auto 0" }} />

        {confirmed ? (
          /* ── Success state ── */
          <div style={{ padding: "40px 24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", animation: "pop 0.4s ease" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(52,199,89,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={36} style={{ color: GREEN }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "22px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.5px" }}>Great shift!</div>
              <div style={{ fontSize: "14px", color: TEXT2, marginTop: "6px" }}>You've clocked out successfully</div>
            </div>
            <div style={{ display: "flex", gap: "20px", marginTop: "4px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.5px" }}>{fmt(netSecs)}</div>
                <div style={{ fontSize: "12px", color: TEXT2 }}>Worked</div>
              </div>
              <div style={{ width: "0.5px", background: SEP }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: 700, color: GREEN, letterSpacing: "-0.5px" }}>€{earnings}</div>
                <div style={{ fontSize: "12px", color: TEXT2 }}>Estimated</div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Summary ── */
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 0" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.5px" }}>End shift</div>
                <div style={{ fontSize: "13px", color: TEXT2, marginTop: "2px" }}>{summary.role} · {summary.location}</div>
              </div>
              <button onClick={close} style={{ width: "30px", height: "30px", borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={15} style={{ color: TEXT2 }} />
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              {/* Time summary */}
              <div style={{ background: BG, borderRadius: "16px", overflow: "hidden", marginBottom: "12px" }}>
                {[
                  { icon: Clock,  label: "Clocked in",  val: summary.clockInTime,      color: TEXT1 },
                  { icon: Clock,  label: "Clocked out",  val: clockOutDisplay,          color: TEXT1 },
                  { icon: Clock,  label: "Time worked",  val: fmt(netSecs),             color: TEXT1 },
                  { icon: Coffee, label: "Break time",   val: fmt(summary.breakSecs),   color: "#FF9F0A" },
                ].map(({ icon: Icon, label, val, color }, i, arr) => (
                  <div
                    key={label}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "13px 16px",
                      borderBottom: i < arr.length - 1 ? `0.5px solid ${SEP}` : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Icon size={14} style={{ color: TEXT3 }} />
                      <span style={{ fontSize: "14px", color: TEXT2 }}>{label}</span>
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 600, color }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Earnings estimate */}
              <div
                style={{
                  background: "rgba(52,199,89,0.05)",
                  border: "1px solid rgba(52,199,89,0.15)",
                  borderRadius: "16px",
                  padding: "16px",
                  marginBottom: "12px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <DollarSign size={16} style={{ color: GREEN }} />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>Estimated earnings</div>
                    <div style={{ fontSize: "12px", color: TEXT2 }}>€{HOURLY_RATE}/hr × {fmt(netSecs)}</div>
                  </div>
                </div>
                <span style={{ fontSize: "22px", fontWeight: 700, color: GREEN, letterSpacing: "-0.5px" }}>€{earnings}</span>
              </div>

              {/* Overtime */}
              {overtime > 0 && (
                <div style={{ background: "rgba(255,159,10,0.06)", border: "1px solid rgba(255,159,10,0.15)", borderRadius: "12px", padding: "10px 14px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Star size={13} style={{ color: "#FF9F0A" }} />
                  <span style={{ fontSize: "13px", color: "#FF9F0A", fontWeight: 500 }}>{fmt(overtime)} overtime</span>
                </div>
              )}

              {/* Confirm button */}
              <button
                onClick={handleConfirm}
                style={{
                  width: "100%", padding: "16px",
                  background: RED, borderRadius: "16px",
                  color: "#fff", fontSize: "16px", fontWeight: 600,
                  letterSpacing: "-0.2px",
                }}
              >
                Confirm clock out
              </button>
              <button
                onClick={close}
                style={{ width: "100%", padding: "12px", marginTop: "8px", color: TEXT2, fontSize: "14px", fontWeight: 500 }}
              >
                Keep working
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}