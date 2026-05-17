import { useState } from "react";
import {
  X, MapPin, Clock, ChevronRight, RefreshCw,
  CalendarX2, CheckCircle2, Navigation2, Zap, Users
} from "lucide-react";
import type { ShiftEntry, SheetConfig } from "./types";

const ACCENT = "#007AFF";
const BG     = "#FFFFFF";
const CARD   = "#F2F2F7";
const TEXT1  = "#1C1C1E";
const TEXT2  = "#6C6C70";
const TEXT3  = "#AEAEB2";
const SEP    = "#E5E5EA";
const GREEN  = "#34C759";
const AMBER  = "#FF9F0A";

interface Props {
  shift:      ShiftEntry;
  onDismiss:  () => void;
  openSheet:  (cfg: SheetConfig) => void;
  onNavigate?: (tab: "time") => void;
}

const STATUS_CFG = {
  confirmed: { color: GREEN,  label: "Confirmed" },
  changed:   { color: AMBER,  label: "Changed"   },
  pending:   { color: TEXT3,  label: "Pending"   },
};

function timeToMins(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function calcDuration(time: string) {
  const [start, end] = time.split(" – ");
  let mins = timeToMins(end) - timeToMins(start);
  if (mins < 0) mins += 24 * 60;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Fake colleagues on same shift
const COLLEAGUES = ["Emma D.", "Lucas M.", "Yasmine K."];

export function ShiftDetailSheet({ shift, onDismiss, openSheet, onNavigate }: Props) {
  const [closing, setClosing] = useState(false);
  const sc       = STATUS_CFG[shift.status];
  const duration = calcDuration(shift.time);
  const [start, end] = shift.time.split(" – ");

  const close = () => { setClosing(true); setTimeout(onDismiss, 320); };

  const earn = (() => {
    const mins = timeToMins(end) - timeToMins(start);
    const h    = (mins < 0 ? mins + 24 * 60 : mins) / 60;
    return (h * 12.02).toFixed(2);
  })();

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
          paddingBottom: "36px",
          animation: closing ? "sheetDown 0.32s cubic-bezier(0.32,0.72,0,1) forwards" : "sheetUp 0.38s cubic-bezier(0.32,0.72,0,1)",
          maxHeight: "92%", overflowY: "auto",
        }}
      >
        <div style={{ width: "36px", height: "4px", background: "#D1D1D6", borderRadius: "99px", margin: "12px auto 0" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 20px 0" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: sc.color }} />
              <span style={{ fontSize: "12px", color: sc.color, fontWeight: 600 }}>{sc.label}</span>
              {shift.status === "changed" && (
                <span style={{ fontSize: "11px", color: AMBER, background: "rgba(255,159,10,0.1)", padding: "1px 7px", borderRadius: "20px", fontWeight: 500 }}>Updated</span>
              )}
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.6px", lineHeight: 1.15 }}>{shift.time}</div>
            <div style={{ fontSize: "14px", color: TEXT2, marginTop: "3px" }}>{shift.dayLabel} · {shift.dateLabel}</div>
          </div>
          <button onClick={close} style={{ width: "30px", height: "30px", borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <X size={15} style={{ color: TEXT2 }} />
          </button>
        </div>

        <div style={{ padding: "18px 20px 0" }}>
          {/* Detail rows */}
          <div style={{ background: BG, borderRadius: "16px", overflow: "hidden", marginBottom: "12px" }}>
            {[
              { lbl: "Role",     val: shift.role              },
              { lbl: "Duration", val: duration                },
              { lbl: "Est. pay", val: `€${earn}`             },
            ].map((row, i) => (
              <div key={row.lbl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: i < 2 ? `0.5px solid ${SEP}` : "none" }}>
                <span style={{ fontSize: "14px", color: TEXT2 }}>{row.lbl}</span>
                <span style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>{row.val}</span>
              </div>
            ))}
          </div>

          {/* Location */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: BG, borderRadius: "13px", padding: "13px 14px", marginBottom: "12px" }}>
            <MapPin size={16} style={{ color: TEXT3, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>{shift.location}</div>
              <div style={{ fontSize: "12px", color: TEXT2, marginTop: "1px" }}>{shift.address}</div>
            </div>
            <CheckCircle2 size={14} style={{ color: GREEN }} />
          </div>

          {/* Timeline */}
          <div style={{ background: BG, borderRadius: "16px", padding: "16px", marginBottom: "12px" }}>
            <div style={{ fontSize: "11px", color: TEXT3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Timeline</div>
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "3px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: GREEN }} />
                <div style={{ width: "1.5px", flex: 1, background: SEP, margin: "4px 0" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FF3B30" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: "22px" }}>
                  <div style={{ fontSize: "17px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.3px" }}>{start}</div>
                  <div style={{ fontSize: "12px", color: TEXT2, marginTop: "1px" }}>Clock in · {shift.location}</div>
                </div>
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.3px" }}>{end}</div>
                  <div style={{ fontSize: "12px", color: TEXT2, marginTop: "1px" }}>Clock out · {duration} total</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px", background: "rgba(52,199,89,0.1)", borderRadius: "20px" }}>
                  <CheckCircle2 size={11} style={{ color: GREEN }} />
                  <span style={{ fontSize: "11px", color: GREEN, fontWeight: 600 }}>Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Colleagues */}
          <div style={{ background: BG, borderRadius: "14px", padding: "12px 14px", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
              <Users size={13} style={{ color: TEXT3 }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: TEXT3, textTransform: "uppercase", letterSpacing: "0.4px" }}>On shift with you</span>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {COLLEAGUES.map((name, i) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: "5px", background: CARD, border: `1px solid ${SEP}`, borderRadius: "20px", padding: "4px 10px 4px 4px" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: ["rgba(0,122,255,0.12)", "rgba(52,199,89,0.12)", "rgba(255,159,10,0.12)"][i], display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: [ACCENT, GREEN, AMBER][i] }}>{name[0]}</span>
                  </div>
                  <span style={{ fontSize: "12px", color: TEXT1, fontWeight: 400 }}>{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clock in prompt */}
          {shift.date === "2026-04-26" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,159,10,0.06)", border: "1px solid rgba(255,159,10,0.12)", borderRadius: "12px", padding: "10px 14px", marginBottom: "12px" }}>
              <Zap size={13} style={{ color: AMBER, flexShrink: 0 }} />
              <span style={{ fontSize: "13px", color: AMBER, fontWeight: 500 }}>Clock-in opens at 16:45 · 3h away</span>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
            <button
              onClick={() => { close(); setTimeout(() => openSheet({ kind: "request" }), 350); }}
              style={{ background: BG, border: `1px solid ${SEP}`, borderRadius: "14px", padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}
            >
              <RefreshCw size={18} style={{ color: TEXT1 }} strokeWidth={1.6} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: TEXT1 }}>Swap shift</div>
                <div style={{ fontSize: "11px", color: TEXT2 }}>Find a replacement</div>
              </div>
            </button>
            <button
              onClick={() => { close(); setTimeout(() => openSheet({ kind: "request" }), 350); }}
              style={{ background: BG, border: `1px solid ${SEP}`, borderRadius: "14px", padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}
            >
              <CalendarX2 size={18} style={{ color: TEXT1 }} strokeWidth={1.6} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: TEXT1 }}>Request off</div>
                <div style={{ fontSize: "11px", color: TEXT2 }}>Time off request</div>
              </div>
            </button>
          </div>

          {/* Directions */}
          <button
            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(shift.address)}`, "_blank")}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: BG, borderRadius: "14px", padding: "14px 16px", border: `1px solid ${SEP}`, marginBottom: "10px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Navigation2 size={17} style={{ color: ACCENT }} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>Get directions</div>
                <div style={{ fontSize: "12px", color: TEXT2 }}>Open in Maps</div>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: TEXT3 }} />
          </button>

          {/* Clock in CTA for today */}
          {shift.date === "2026-04-26" && onNavigate && (
            <button
              onClick={() => { close(); onNavigate("time"); }}
              style={{ width: "100%", background: ACCENT, borderRadius: "14px", padding: "15px", color: "#fff", fontSize: "15px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}
            >
              <Clock size={16} /> Clock in now
            </button>
          )}
        </div>
      </div>
    </>
  );
}