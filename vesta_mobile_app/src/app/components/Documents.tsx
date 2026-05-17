import { useState, useRef } from "react";
import {
  FileText, Upload, AlertCircle, CheckCircle2, Clock,
  Download, ChevronRight, FileBadge, FileSignature, Banknote,
  X, PenLine, Eye, Search
} from "lucide-react";
import type { SheetConfig } from "./types";
import { useTheme } from "../theme";

type Category = "required" | "payslips" | "contracts";

const CATEGORIES = [
  { id: "required"  as const, label: "Required",  Icon: FileBadge     },
  { id: "payslips"  as const, label: "Payslips",   Icon: Banknote      },
  { id: "contracts" as const, label: "Contracts",  Icon: FileSignature },
];

interface DocItem  { id: number; name: string; status: string; dueDate?: string; uploadDate?: string }
interface Payslip  { id: number; month: string; period: string; net: string; date: string; rows: { lbl: string; amt: string; type: "+" | "-" }[] }
interface Contract { id: number; name: string; type: string; date: string; status: string; body: string }

const PAYSLIPS: Payslip[] = [
  {
    id: 1, month: "March 2026", period: "Mar 1 – Mar 31", net: "€1,847.50", date: "Apr 1, 2026",
    rows: [
      { lbl: "Regular hours (156h × €12.02)", amt: "€1,875.12", type: "+" },
      { lbl: "Overtime bonus",                amt: "€72.12",    type: "+" },
      { lbl: "NSSO contribution",             amt: "–€74.96",   type: "-" },
      { lbl: "Advance holiday pay",           amt: "–€24.78",   type: "-" },
    ],
  },
  {
    id: 2, month: "February 2026", period: "Feb 1 – Feb 28", net: "€1,923.20", date: "Mar 1, 2026",
    rows: [
      { lbl: "Regular hours (160h × €12.02)", amt: "€1,923.20", type: "+" },
      { lbl: "NSSO contribution",             amt: "–€76.93",   type: "-" },
      { lbl: "Advance holiday pay",           amt: "–€25.74",   type: "-" },
    ],
  },
  {
    id: 3, month: "January 2026", period: "Jan 1 – Jan 31", net: "€1,765.80", date: "Feb 1, 2026",
    rows: [
      { lbl: "Regular hours (144h × €12.02)", amt: "€1,730.88", type: "+" },
      { lbl: "Holiday supplement",            amt: "€34.92",    type: "+" },
      { lbl: "NSSO contribution",             amt: "–€70.63",   type: "-" },
      { lbl: "Advance holiday pay",           amt: "–€23.55",   type: "-" },
    ],
  },
];

const CONTRACT_BODY = (name: string, date: string) =>
  `This employment contract is entered into between Bistro Noir BVBA ("Employer") and ${name} ("Employee"), effective ${date}.\n\n1. POSITION\nThe Employee is engaged as Waiter/Waitress on a part-time basis, averaging 24 hours per week.\n\n2. COMPENSATION\nGross hourly wage of €12.02, payable monthly on the 1st.\n\n3. WORKING HOURS\nShifts assigned weekly by the Employer. The Employee agrees to maintain their availability profile.\n\n4. DURATION\nThis contract is concluded for an indefinite period, commencing ${date}.\n\n5. TERMINATION\nEither party may terminate with 7 calendar days' written notice.`;

const AMEND_BODY = `This amendment to the employment contract (January 15, 2026) is entered into between Bistro Noir BVBA and Sofia Fischer, effective March 1, 2026.\n\n1. AMENDMENT\nSection 3 (Working Hours) is amended. Effective March 1, 2026, the Employee's Friday evening shift will run from 17:00 to 00:00 midnight, replacing the previous 17:00–23:00 schedule.\n\n2. COMPENSATION\nExtended hours compensated at the existing rate of €12.02/h. Overtime regulations apply beyond 8h/day.\n\n3. ALL OTHER TERMS\nAll other terms of the original contract remain in full force.`;

const INIT_CONTRACTS: Contract[] = [
  { id: 1, name: "Employment Contract",      type: "Part-time", date: "Jan 15, 2026", status: "signed",  body: CONTRACT_BODY("Sofia Fischer", "January 15, 2026") },
  { id: 2, name: "Schedule Amendment",       type: "Amendment", date: "Mar 1, 2026",  status: "pending", body: AMEND_BODY },
];

interface Props { openSheet?: (cfg: SheetConfig) => void }

export function Documents({ openSheet: _openSheet }: Props) {
  const { colors, theme } = useTheme();
  const ACCENT = colors.accent;
  const BG = colors.bg;
  const CARD = colors.card;
  const TEXT1 = colors.text1;
  const TEXT2 = colors.text2;
  const TEXT3 = colors.text3;
  const SEP = colors.sep;
  const GREEN = colors.green;
  const RED = colors.red;
  const AMBER = colors.amber;
  const SHADOW = colors.shadow;

  const STATUS_CFG: Record<string, { Icon: React.ElementType; color: string; bg: string; label: string }> = {
    missing:      { Icon: AlertCircle,  color: RED,   bg: theme === "dark" ? "rgba(255,69,58,0.15)" : "rgba(255,59,48,0.08)",  label: "Missing"      },
    approved:     { Icon: CheckCircle2, color: GREEN, bg: theme === "dark" ? "rgba(48,209,88,0.15)" : "rgba(52,199,89,0.08)",  label: "Approved"     },
    under_review: { Icon: Clock,        color: AMBER, bg: theme === "dark" ? "rgba(255,214,10,0.15)" : "rgba(255,159,10,0.08)", label: "Under review" },
    pending:      { Icon: Clock,        color: AMBER, bg: theme === "dark" ? "rgba(255,214,10,0.15)" : "rgba(255,159,10,0.08)", label: "Pending"      },
    signed:       { Icon: CheckCircle2, color: GREEN, bg: theme === "dark" ? "rgba(48,209,88,0.15)" : "rgba(52,199,89,0.08)",  label: "Signed"       },
  };

  const Sheet = ({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) => {
    const [closing, setClosing] = useState(false);
    const close = () => { setClosing(true); setTimeout(onClose, 300); };
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 400 }}>
        <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", animation: closing ? "bdOut 0.3s ease forwards" : "bdIn 0.22s ease" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: CARD, borderRadius: "24px 24px 0 0", maxHeight: "92%", overflowY: "auto", animation: closing ? "sheetDown 0.3s cubic-bezier(0.32,0.72,0,1) forwards" : "sheetUp 0.36s cubic-bezier(0.32,0.72,0,1)" }}>
          <div style={{ width: "36px", height: "4px", background: "#D1D1D6", borderRadius: "99px", margin: "12px auto 0" }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "18px 22px 0" }}>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.4px" }}>{title}</div>
              {subtitle && <div style={{ fontSize: "13px", color: TEXT2, marginTop: "3px" }}>{subtitle}</div>}
            </div>
            <button onClick={close} style={{ width: "30px", height: "30px", borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <X size={15} style={{ color: TEXT2 }} />
            </button>
          </div>
          <div style={{ padding: "18px 22px 44px" }}>{children}</div>
        </div>
      </div>
    );
  };

  const [cat,         setCat]         = useState<Category>("required");
  const [searchQ,     setSearchQ]     = useState("");
  const [showSearch,  setShowSearch]  = useState(false);

  const [docs, setDocs] = useState<DocItem[]>([
    { id: 1, name: "ID Card",            status: "missing",      dueDate:    "May 5, 2026"  },
    { id: 2, name: "Bank Account Proof", status: "approved",     uploadDate: "Apr 15, 2026" },
    { id: 3, name: "Work Permit",        status: "under_review", uploadDate: "Apr 20, 2026" },
    { id: 4, name: "Tax Form",           status: "approved",     uploadDate: "Apr 10, 2026" },
  ]);
  const [contracts, setContracts] = useState<Contract[]>(INIT_CONTRACTS);

  /* Upload state */
  const [uploadDoc,      setUploadDoc]      = useState<string | null>(null);
  const [uploadPct,      setUploadPct]      = useState(0);
  const [uploading,      setUploading]      = useState(false);
  const [uploadSuccess,  setUploadSuccess]  = useState(false);

  /* Payslip detail */
  const [payslip, setPayslip] = useState<Payslip | null>(null);

  /* Doc viewer */
  const [viewDoc, setViewDoc] = useState<DocViewer | null>(null);

  /* Download */
  const [downloading,   setDownloading]   = useState(false);
  const [downloadToast, setDownloadToast] = useState(false);

  /* Contract detail / sign */
  const [viewContract,  setViewContract]  = useState<Contract | null>(null);
  const [signContract,  setSignContract]  = useState<Contract | null>(null);
  const [sigName,       setSigName]       = useState("");
  const [signing,       setSigning]       = useState(false);
  const [signSuccess,   setSignSuccess]   = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Upload ── */
  const startUpload = (name: string) => {
    setUploadDoc(name); setUploadPct(0); setUploading(false); setUploadSuccess(false);
  };
  const runUpload = () => {
    setUploading(true); setUploadPct(0);
    timerRef.current = setInterval(() => {
      setUploadPct((p) => {
        if (p >= 100) {
          clearInterval(timerRef.current!);
          setUploadSuccess(true);
          setTimeout(() => {
            setDocs((prev) => prev.map((d) => d.name === uploadDoc
              ? { ...d, status: "under_review", uploadDate: "Apr 26, 2026", dueDate: undefined }
              : d
            ));
            setUploadDoc(null); setUploading(false); setUploadSuccess(false);
          }, 1400);
          return 100;
        }
        return Math.min(p + Math.random() * 22 + 4, 100);
      });
    }, 160);
  };

  /* ── Download ── */
  const runDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadToast(true);
      setTimeout(() => setDownloadToast(false), 2600);
    }, 1500);
  };

  /* ── Sign ── */
  const runSign = () => {
    if (!sigName.trim() || !signContract) return;
    setSigning(true);
    setTimeout(() => {
      setSigning(false); setSignSuccess(true);
      setTimeout(() => {
        setContracts((prev) => prev.map((c) => c.id === signContract.id ? { ...c, status: "signed" } : c));
        setSignContract(null); setSigName(""); setSignSuccess(false);
      }, 1600);
    }, 1200);
  };

  const missingCount = docs.filter((d) => d.status === "missing").length;

  return (
    <div style={{ background: BG, minHeight: "100%", display: "flex", flexDirection: "column", position: "relative" }}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{ padding: "20px 20px 14px" }}>
        {showSearch ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", animation: "fadeUp 0.15s ease" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", background: CARD, boxShadow: SHADOW, borderRadius: "12px", padding: "9px 13px" }}>
              <Search size={14} style={{ color: TEXT3, flexShrink: 0 }} />
              <input
                autoFocus
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search documents…"
                style={{ flex: 1, fontSize: "15px", color: TEXT1, background: "none", border: "none", outline: "none", fontFamily: "inherit" }}
              />
              {searchQ && (
                <button onClick={() => setSearchQ("")} style={{ background: "none", flexShrink: 0 }}>
                  <X size={13} style={{ color: TEXT3 }} />
                </button>
              )}
            </div>
            <button onClick={() => { setShowSearch(false); setSearchQ(""); }} style={{ color: ACCENT, fontSize: "14px", fontWeight: 500, background: "none", flexShrink: 0 }}>Cancel</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.6px" }}>Documents</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setShowSearch(true)}
                style={{ width: "34px", height: "34px", borderRadius: "50%", background: CARD, boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Search size={15} style={{ color: TEXT2 }} />
              </button>
              <button
                onClick={() => startUpload("Document")}
                style={{ display: "flex", alignItems: "center", gap: "5px", background: ACCENT, borderRadius: "20px", padding: "7px 14px", color: "#fff", fontSize: "13px", fontWeight: 500 }}
              >
                <Upload size={13} strokeWidth={2.5} /> Upload
              </button>
            </div>
          </div>
        )}

        {/* Missing docs alert */}
        {missingCount > 0 && !showSearch && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,59,48,0.06)", borderRadius: "12px", padding: "10px 14px", marginBottom: "12px", border: "1px solid rgba(255,59,48,0.12)", animation: "fadeUp 0.2s ease" }}>
            <AlertCircle size={14} style={{ color: RED, flexShrink: 0 }} />
            <span style={{ fontSize: "13px", color: RED, fontWeight: 500, flex: 1 }}>
              {missingCount} document{missingCount > 1 ? "s" : ""} need{missingCount === 1 ? "s" : ""} attention
            </span>
            <button onClick={() => setCat("required")} style={{ fontSize: "12px", color: RED, fontWeight: 600, background: "none" }}>View</button>
          </div>
        )}

        {/* Category picker */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", background: "rgba(116,116,128,0.1)", borderRadius: "10px", padding: "2px" }}>
          {CATEGORIES.map(({ id, label, Icon }) => {
            const active = cat === id;
            return (
              <button key={id} onClick={() => setCat(id)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "7px", borderRadius: "8px", background: active ? CARD : "transparent", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none", fontSize: "13px", fontWeight: active ? 600 : 400, color: active ? TEXT1 : TEXT2, transition: "all 0.15s" }}
              >
                <Icon size={13} /> {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 28px" }}>

        {/* Required */}
        {cat === "required" && (
          <div style={{ animation: "fadeUp 0.18s ease" }}>
            {docs
              .filter((d) => !searchQ || d.name.toLowerCase().includes(searchQ.toLowerCase()))
              .map((doc, idx, arr) => {
                const cfg = STATUS_CFG[doc.status];
                return (
                  <button
                    key={doc.id}
                    onClick={() => doc.status !== "missing" ? setViewDoc({ doc }) : startUpload(doc.name)}
                    style={{ width: "100%", padding: "14px 0", borderBottom: idx < arr.length - 1 ? `0.5px solid ${SEP}` : "none", background: "none", textAlign: "left" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <cfg.Icon size={18} style={{ color: cfg.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "15px", fontWeight: 500, color: TEXT1 }}>{doc.name}</div>
                        <div style={{ fontSize: "12px", color: TEXT2, marginTop: "2px" }}>
                          {doc.status === "missing" ? `Due ${doc.dueDate}` : `Uploaded ${doc.uploadDate}`}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                        <span style={{ fontSize: "12px", color: cfg.color, fontWeight: 500 }}>{cfg.label}</span>
                        {doc.status === "missing" && (
                          <div style={{ background: ACCENT, borderRadius: "8px", padding: "5px 11px", color: "#fff", fontSize: "12px", fontWeight: 600 }}>
                            Upload
                          </div>
                        )}
                        {doc.status !== "missing" && (
                          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: CARD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Eye size={13} style={{ color: TEXT2 }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        )}

        {/* Payslips */}
        {cat === "payslips" && (
          <div style={{ animation: "fadeUp 0.18s ease" }}>
            {PAYSLIPS
              .filter((p) => !searchQ || p.month.toLowerCase().includes(searchQ.toLowerCase()))
              .map((p, idx, arr) => (
                <button
                  key={p.id}
                  onClick={() => setPayslip(p)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "15px 0", borderBottom: idx < arr.length - 1 ? `0.5px solid ${SEP}` : "none", background: "none", textAlign: "left" }}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: "rgba(52,199,89,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Banknote size={18} style={{ color: GREEN }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "15px", fontWeight: 500, color: TEXT1 }}>{p.month}</div>
                    <div style={{ fontSize: "12px", color: TEXT2, marginTop: "2px" }}>Paid {p.date}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.3px" }}>{p.net}</div>
                    <div style={{ fontSize: "11px", color: TEXT3, marginTop: "2px" }}>Net pay</div>
                  </div>
                  <ChevronRight size={14} style={{ color: TEXT3, flexShrink: 0 }} />
                </button>
              ))}
          </div>
        )}

        {/* Contracts */}
        {cat === "contracts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", animation: "fadeUp 0.18s ease" }}>
            {contracts
              .filter((c) => !searchQ || c.name.toLowerCase().includes(searchQ.toLowerCase()))
              .map((contract) => {
                const cfg = STATUS_CFG[contract.status];
                return (
                  <div key={contract.id} style={{ background: CARD, borderRadius: "17px", padding: "16px", boxShadow: SHADOW }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <cfg.Icon size={18} style={{ color: cfg.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "15px", fontWeight: 600, color: TEXT1 }}>{contract.name}</div>
                        <div style={{ fontSize: "12px", color: TEXT2, marginTop: "2px" }}>{contract.type} · {contract.date}</div>
                      </div>
                      <span style={{ fontSize: "12px", color: cfg.color, fontWeight: 600, flexShrink: 0 }}>{cfg.label}</span>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => setViewContract(contract)}
                        style={{ flex: 1, background: BG, border: `1px solid ${SEP}`, borderRadius: "11px", padding: "10px", fontSize: "13px", fontWeight: 500, color: TEXT1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}
                      >
                        <Eye size={14} /> View
                      </button>
                      {contract.status === "pending" && (
                        <button
                          onClick={() => setSignContract(contract)}
                          style={{ flex: 2, background: ACCENT, borderRadius: "11px", padding: "10px", color: "#fff", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}
                        >
                          <PenLine size={14} /> Review & sign
                        </button>
                      )}
                      {contract.status === "signed" && (
                        <button
                          onClick={runDownload}
                          style={{ flex: 2, background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.12)", borderRadius: "11px", padding: "10px", color: GREEN, fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}
                        >
                          <Download size={14} /> Download
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── Download toast ───────────────────────────────────────────── */}
      {downloadToast && (
        <div style={{ position: "absolute", bottom: "90px", left: "50%", transform: "translateX(-50%)", background: TEXT1, borderRadius: "20px", padding: "10px 18px", display: "flex", alignItems: "center", gap: "8px", animation: "pop 0.3s ease", zIndex: 500, whiteSpace: "nowrap", boxShadow: "0 8px 32px rgba(0,0,0,0.24)" }}>
          <CheckCircle2 size={15} style={{ color: GREEN }} />
          <span style={{ fontSize: "13px", color: "#fff", fontWeight: 500 }}>Downloaded successfully</span>
        </div>
      )}

      {/* ── Upload Sheet ─────────────────────────────────────────────── */}
      {uploadDoc && (
        <Sheet title="Upload document" subtitle={uploadDoc} onClose={() => { if (!uploading) { setUploadDoc(null); } }}>
          {!uploading ? (
            <>
              <div style={{ border: `2px dashed ${SEP}`, borderRadius: "16px", padding: "32px 20px", marginBottom: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", background: BG }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(0,122,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Upload size={24} style={{ color: ACCENT }} />
                </div>
                <div style={{ fontSize: "15px", fontWeight: 600, color: TEXT1 }}>Choose a file</div>
                <div style={{ fontSize: "13px", color: TEXT2 }}>PDF, JPG, PNG · Max 10 MB</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                {["Take photo", "Browse files"].map((opt) => (
                  <button key={opt} onClick={runUpload}
                    style={{ background: BG, border: `1px solid ${SEP}`, borderRadius: "13px", padding: "13px", fontSize: "14px", fontWeight: 500, color: TEXT1 }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button onClick={runUpload} style={{ width: "100%", background: ACCENT, borderRadius: "14px", padding: "15px", color: "#fff", fontSize: "15px", fontWeight: 600 }}>
                Upload
              </button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px", padding: "16px 0 8px" }}>
              {uploadSuccess ? (
                <div style={{ animation: "bounceIn 0.4s ease" }}>
                  <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: "rgba(52,199,89,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={34} style={{ color: GREEN }} />
                  </div>
                </div>
              ) : (
                <div style={{ width: "68px", height: "68px", borderRadius: "50%", border: `6px solid ${BG}`, borderTopColor: ACCENT, animation: "spin 0.7s linear infinite" }} />
              )}
              <div style={{ width: "100%", height: "6px", background: BG, borderRadius: "99px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(uploadPct, 100)}%`, background: uploadSuccess ? GREEN : ACCENT, borderRadius: "99px", transition: "width 0.2s ease, background 0.3s ease" }} />
              </div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: TEXT1 }}>
                {uploadSuccess ? "Upload complete!" : `Uploading… ${Math.floor(Math.min(uploadPct, 100))}%`}
              </div>
            </div>
          )}
        </Sheet>
      )}

      {/* ── Payslip Detail Sheet ─────────────────────────────────────── */}
      {payslip && (
        <Sheet title={payslip.month} subtitle={payslip.period} onClose={() => setPayslip(null)}>
          {/* Net pay hero */}
          <div style={{ background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.12)", borderRadius: "16px", padding: "16px 20px", marginBottom: "18px", textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: GREEN, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Net pay</div>
            <div style={{ fontSize: "38px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.8px" }}>{payslip.net}</div>
            <div style={{ fontSize: "13px", color: TEXT2, marginTop: "4px" }}>Paid {payslip.date}</div>
          </div>

          {/* Breakdown */}
          <div style={{ fontSize: "11px", fontWeight: 600, color: TEXT3, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Breakdown</div>
          <div style={{ background: BG, borderRadius: "14px", overflow: "hidden", marginBottom: "18px" }}>
            {payslip.rows.map((row, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: i < arr.length - 1 ? `0.5px solid ${SEP}` : "none" }}>
                <span style={{ fontSize: "13px", color: TEXT2, flex: 1, paddingRight: "8px" }}>{row.lbl}</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: row.type === "-" ? RED : GREEN, flexShrink: 0 }}>{row.amt}</span>
              </div>
            ))}
          </div>

          <button
            onClick={runDownload}
            style={{ width: "100%", background: ACCENT, borderRadius: "14px", padding: "15px", color: "#fff", fontSize: "15px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {downloading
              ? <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
              : <><Download size={16} /> Download PDF</>
            }
          </button>
        </Sheet>
      )}

      {/* ── Contract View Sheet ──────────────────────────────────────── */}
      {viewContract && (
        <Sheet title={viewContract.name} subtitle={`${viewContract.type} · ${viewContract.date}`} onClose={() => setViewContract(null)}>
          <div style={{ background: BG, borderRadius: "14px", padding: "16px", maxHeight: "320px", overflowY: "auto", marginBottom: "16px" }}>
            <pre style={{ fontSize: "13px", color: TEXT1, lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>{viewContract.body}</pre>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={runDownload} style={{ flex: 1, background: BG, border: `1px solid ${SEP}`, borderRadius: "13px", padding: "13px", fontSize: "14px", fontWeight: 500, color: TEXT1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
              <Download size={14} /> Download
            </button>
            {viewContract.status === "pending" && (
              <button onClick={() => { setViewContract(null); setTimeout(() => setSignContract(viewContract), 200); }} style={{ flex: 2, background: ACCENT, borderRadius: "13px", padding: "13px", color: "#fff", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                <PenLine size={14} /> Sign contract
              </button>
            )}
          </div>
        </Sheet>
      )}

      {/* ── Contract Sign Sheet ──────────────────────────────────────── */}
      {signContract && (
        <Sheet title="Sign contract" subtitle={signContract.name} onClose={() => { if (!signing) { setSignContract(null); setSigName(""); setSignSuccess(false); } }}>
          {signSuccess ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", padding: "16px 0", animation: "pop 0.3s ease" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(52,199,89,0.1)", display: "flex", alignItems: "center", justifyContent: "center", animation: "bounceIn 0.45s ease" }}>
                <CheckCircle2 size={36} style={{ color: GREEN }} />
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: TEXT1, textAlign: "center" }}>Contract signed!</div>
              <div style={{ fontSize: "14px", color: TEXT2, textAlign: "center", lineHeight: 1.5 }}>A copy has been sent to your email address.</div>
            </div>
          ) : (
            <>
              {/* Contract preview */}
              <div style={{ background: BG, borderRadius: "13px", padding: "14px 16px", maxHeight: "160px", overflowY: "auto", marginBottom: "18px" }}>
                <pre style={{ fontSize: "12px", color: TEXT2, lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>
                  {signContract.body.substring(0, 360)}…
                </pre>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: TEXT3, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Your signature</div>
                <input
                  value={sigName}
                  onChange={(e) => setSigName(e.target.value)}
                  placeholder="Type your full legal name…"
                  style={{ width: "100%", background: CARD, border: `1.5px solid ${sigName ? ACCENT : SEP}`, borderRadius: "13px", padding: "14px 16px", fontSize: "17px", color: TEXT1, outline: "none", fontFamily: "'Helvetica Neue', sans-serif", fontStyle: "italic", letterSpacing: "0.3px", boxSizing: "border-box", transition: "border-color 0.15s" }}
                />
                {sigName && (
                  <div style={{ fontSize: "12px", color: GREEN, marginTop: "6px" }}>✓ Typed signature accepted under eIDAS regulation</div>
                )}
              </div>

              <div style={{ background: "rgba(255,159,10,0.06)", border: "1px solid rgba(255,159,10,0.12)", borderRadius: "12px", padding: "10px 14px", marginBottom: "18px" }}>
                <span style={{ fontSize: "12px", color: AMBER }}>By signing, you confirm you have read and agree to all terms of this document.</span>
              </div>

              <button
                onClick={runSign}
                disabled={!sigName.trim() || signing}
                style={{ width: "100%", background: sigName.trim() ? ACCENT : "#C7C7CC", borderRadius: "14px", padding: "15px", color: "#fff", fontSize: "15px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 0.2s" }}
              >
                {signing
                  ? <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                  : <><PenLine size={16} /> Sign document</>
                }
              </button>
            </>
          )}
        </Sheet>
      )}

      {/* ── Doc Viewer Sheet ─────────────────────────────────────────── */}
      {viewDoc && (() => {
        const docCfg = STATUS_CFG[viewDoc.doc.status];
        const DocIcon = docCfg.Icon;
        return (
        <Sheet title={viewDoc.doc.name} subtitle={`${docCfg.label} · Uploaded ${viewDoc.doc.uploadDate}`} onClose={() => setViewDoc(null)}>
          {/* Mock document preview */}
          <div style={{ background: BG, borderRadius: "14px", padding: "20px", marginBottom: "16px", minHeight: "200px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Document header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: TEXT1 }}>{viewDoc.doc.name}</div>
                <div style={{ fontSize: "12px", color: TEXT2, marginTop: "2px" }}>Uploaded {viewDoc.doc.uploadDate}</div>
              </div>
              <div style={{ padding: "4px 10px", background: docCfg.bg, borderRadius: "20px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: docCfg.color }}>{docCfg.label}</span>
              </div>
            </div>
            {/* Mock redacted preview lines */}
            {[0.9, 0.7, 0.8, 0.6, 0.75, 0.5].map((w, i) => (
              <div key={i} style={{ height: "10px", background: `rgba(0,0,0,${0.06 + (i % 2) * 0.03})`, borderRadius: "5px", width: `${w * 100}%` }} />
            ))}
            <div style={{ height: "1px", background: SEP, margin: "4px 0" }} />
            {[0.85, 0.65, 0.9].map((w, i) => (
              <div key={i} style={{ height: "10px", background: `rgba(0,0,0,0.05)`, borderRadius: "5px", width: `${w * 100}%` }} />
            ))}
            <div style={{ marginTop: "8px", padding: "8px 12px", background: docCfg.bg, borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <DocIcon size={13} style={{ color: docCfg.color }} />
              <span style={{ fontSize: "12px", color: docCfg.color, fontWeight: 500 }}>
                {viewDoc.doc.status === "approved" ? "Document verified and approved by HR" : "Document is under review by HR"}
              </span>
            </div>
          </div>

          {/* Metadata */}
          <div style={{ background: BG, borderRadius: "13px", overflow: "hidden", marginBottom: "16px" }}>
            {[
              { lbl: "Document type",   val: viewDoc.doc.name              },
              { lbl: "Upload date",     val: viewDoc.doc.uploadDate || "—" },
              { lbl: "Submitted to",    val: "Bistro Noir HR"               },
              { lbl: "Review status",   val: docCfg.label                  },
            ].map((row, i, arr) => (
              <div key={row.lbl} style={{ display: "flex", justifyContent: "space-between", padding: "11px 14px", borderBottom: i < arr.length - 1 ? `0.5px solid ${SEP}` : "none" }}>
                <span style={{ fontSize: "13px", color: TEXT2 }}>{row.lbl}</span>
                <span style={{ fontSize: "13px", fontWeight: 500, color: TEXT1 }}>{row.val}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={runDownload} style={{ flex: 1, background: BG, border: `1px solid ${SEP}`, borderRadius: "13px", padding: "13px", fontSize: "14px", fontWeight: 500, color: TEXT1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
              <Download size={14} /> Download
            </button>
            <button onClick={() => { setViewDoc(null); setTimeout(() => startUpload(viewDoc.doc.name), 200); }} style={{ flex: 2, background: ACCENT, borderRadius: "13px", padding: "13px", color: "#fff", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
              <Upload size={14} /> Replace document
            </button>
          </div>
        </Sheet>
        );
      })()}
    </div>
  );
}