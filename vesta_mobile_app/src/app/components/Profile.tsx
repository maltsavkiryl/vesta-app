import { useState, useRef, type ElementType } from "react";
import {
  User, Mail, MapPin, CreditCard, FileText,
  Building2, Lock, Bell, Globe, HelpCircle, ChevronRight,
  LogOut, Shield, Camera, ChevronLeft, Check, Eye, EyeOff,
  Smartphone, Monitor, AlertTriangle, Plus, Search, Star,
  X, CheckCircle2, Hash, Banknote, RefreshCw, Moon, Sun,
} from "lucide-react";
import { useTheme } from "../theme";

// ── Employer directory ────────────────────────────────────────────────────────
const ALL_EMPLOYERS_DIR = [
  { code: "BIST01", name: "Bistro Noir",          type: "Restaurant", location: "Brussels, BE",    employees: 12,  rating: 4.8 },
  { code: "GRAN02", name: "Grand Café",            type: "Café",       location: "Brussels, BE",    employees: 8,   rating: 4.6 },
  { code: "LUXH03", name: "The Lux Hotel",         type: "Hotel",      location: "Brussels, BE",    employees: 45,  rating: 4.9 },
  { code: "FREN04", name: "French Quarter",        type: "Restaurant", location: "Bruges, BE",      employees: 20,  rating: 4.7 },
  { code: "PRIM05", name: "Prima Coffee",          type: "Café",       location: "Ghent, BE",       employees: 6,   rating: 4.5 },
  { code: "BELV06", name: "Belvedere",             type: "Restaurant", location: "Antwerp, BE",     employees: 28,  rating: 4.8 },
  { code: "MARG07", name: "Margaux Lounge",        type: "Bar",        location: "Brussels, BE",    employees: 15,  rating: 4.3 },
  { code: "ROOF08", name: "Rooftop Bar & Grill",   type: "Bar",        location: "Brussels, BE",    employees: 22,  rating: 4.6 },
  { code: "BAKE09", name: "The Bakery Corner",     type: "Bakery",     location: "Leuven, BE",      employees: 9,   rating: 4.7 },
  { code: "SOUR10", name: "Sourdough & Co",        type: "Bakery",     location: "Ghent, BE",       employees: 7,   rating: 4.9 },
  { code: "NOIR11", name: "Noir Cocktail Bar",     type: "Bar",        location: "Antwerp, BE",     employees: 11,  rating: 4.5 },
  { code: "VINE12", name: "Vine & Dine",           type: "Restaurant", location: "Brussels, BE",    employees: 30,  rating: 4.7 },
  { code: "LARE13", name: "La Réserve",            type: "Restaurant", location: "Brussels, BE",    employees: 18,  rating: 4.9 },
  { code: "TERR14", name: "Terrazza Italiana",     type: "Restaurant", location: "Ghent, BE",       employees: 14,  rating: 4.6 },
  { code: "BREW15", name: "The Brew House",        type: "Bar",        location: "Brussels, BE",    employees: 9,   rating: 4.4 },
  { code: "111111", name: "La Belle Époque",       type: "Restaurant", location: "Brussels, BE",    employees: 18,  rating: 4.7 },
];

type Employer = typeof ALL_EMPLOYERS_DIR[0] & { active: boolean };

type ProfileView =
  | "main" | "personal" | "contact" | "security"
  | "notifications" | "language" | "support"
  | "employer" | "joinEmployer"
  | "bankDetails" | "legalInfo" | "switchEmployer";

interface UserData {
  firstName: string;
  lastName:  string;
  email:     string;
  role?:     string;
  employer?: string;
}

interface Props {
  user:      UserData;
  setUser:   (u: UserData) => void;
  onSignOut: () => void;
}

/* ── Main component ──────────────────────────────────────────────────────────── */
export function Profile({ user, setUser, onSignOut }: Props) {
  const { colors, theme, toggleTheme } = useTheme();
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

  /* ── Helper Components ─────────────────────────────────────────────────────── */
  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange} style={{ width: "51px", height: "31px", borderRadius: "15.5px", background: value ? GREEN : (theme === "dark" ? "#38383A" : "#E5E5EA"), position: "relative", flexShrink: 0, transition: "background 0.22s ease" }}>
      <div style={{ position: "absolute", top: "2px", left: value ? "22px" : "2px", width: "27px", height: "27px", borderRadius: "50%", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.18)", transition: "left 0.22s ease" }} />
    </button>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ padding: "0 16px", marginBottom: "24px" }}>
      <div style={{ fontSize: "12px", fontWeight: 500, color: TEXT3, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", paddingLeft: "4px" }}>{title}</div>
      <div style={{ background: CARD, borderRadius: "16px", overflow: "hidden", boxShadow: SHADOW }}>{children}</div>
    </div>
  );

  const Row = ({ icon: Icon, label, value, badge, destructive = false, last = false, onPress, rightEl }: {
    icon: ElementType; label: string; value?: string; badge?: string;
    destructive?: boolean; last?: boolean; onPress?: () => void; rightEl?: React.ReactNode;
  }) => (
    <>
      <button onClick={onPress} style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", background: "none", textAlign: "left" }}>
        <Icon size={17} style={{ color: destructive ? RED : TEXT2, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "15px", color: destructive ? RED : TEXT1, fontWeight: 400 }}>{label}</div>
          {value && <div style={{ fontSize: "13px", color: TEXT3, marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>}
          {badge && <span style={{ display: "inline-block", marginTop: "3px", padding: "2px 7px", background: theme === "dark" ? "rgba(10,132,255,0.15)" : "rgba(0,122,255,0.08)", color: ACCENT, fontSize: "11px", fontWeight: 500, borderRadius: "20px" }}>{badge}</span>}
        </div>
        {rightEl ?? <ChevronRight size={14} style={{ color: TEXT3, flexShrink: 0 }} />}
      </button>
      {!last && <div style={{ height: "0.5px", background: SEP, marginLeft: "45px" }} />}
    </>
  );

  const SubHeader = ({ title, onBack, action }: { title: string; onBack: () => void; action?: { label: string; onPress: () => void } }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", borderBottom: `0.5px solid ${SEP}`, background: CARD }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "4px", color: ACCENT, fontSize: "15px", fontWeight: 400 }}>
        <ChevronLeft size={18} style={{ marginLeft: "-4px" }} /> Back
      </button>
      <span style={{ fontSize: "16px", fontWeight: 600, color: TEXT1, letterSpacing: "-0.3px" }}>{title}</span>
      {action
        ? <button onClick={action.onPress} style={{ color: ACCENT, fontSize: "15px", fontWeight: 500 }}>{action.label}</button>
        : <div style={{ width: "50px" }} />}
    </div>
  );

  const EditField = ({ label, value, onChange, type = "text", placeholder }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
  }) => (
    <div style={{ padding: "12px 16px", borderBottom: `0.5px solid ${SEP}` }}>
      <div style={{ fontSize: "11px", color: TEXT3, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "4px" }}>{label}</div>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", fontSize: "15px", color: TEXT1, background: "none", border: "none", outline: "none", padding: "0", fontFamily: "inherit" }} />
    </div>
  );

  const ConfirmDialog = ({ title, message, destructiveLabel, onConfirm, onCancel }: {
    title: string; message: string; destructiveLabel: string; onConfirm: () => void; onCancel: () => void;
  }) => (
    <div style={{ position: "absolute", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "bdIn 0.15s ease" }}>
      <div onClick={onCancel} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div style={{ position: "relative", background: CARD, borderRadius: "20px", padding: "24px 20px", width: "100%", maxWidth: "310px", animation: "pop 0.25s ease", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: theme === "dark" ? "rgba(255,69,58,0.2)" : "rgba(255,59,48,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle size={22} style={{ color: RED }} />
          </div>
          <div style={{ fontSize: "17px", fontWeight: 700, color: TEXT1, textAlign: "center" }}>{title}</div>
          <div style={{ fontSize: "14px", color: TEXT2, textAlign: "center", lineHeight: 1.5 }}>{message}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button onClick={onConfirm} style={{ width: "100%", background: RED, borderRadius: "12px", padding: "13px", color: "#fff", fontSize: "15px", fontWeight: 600 }}>{destructiveLabel}</button>
          <button onClick={onCancel}  style={{ width: "100%", background: BG,  borderRadius: "12px", padding: "13px", color: TEXT1, fontSize: "15px", fontWeight: 500 }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  const CodeInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const ref = useRef<HTMLInputElement>(null);
    return (
      <div style={{ position: "relative" }}>
        <input ref={ref} value={value} onChange={(e) => onChange(e.target.value.replace(/[^A-Z0-9a-z]/g, "").slice(0, 6))}
          style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", top: 0, left: 0, zIndex: 1 }} autoCapitalize="characters" />
        <div onClick={() => ref.current?.focus()} style={{ display: "flex", gap: "7px", justifyContent: "center", cursor: "text" }}>
          {Array.from({ length: 6 }).map((_, i) => {
            const active = i === value.length && value.length < 6;
            const filled = i < value.length;
            return (
              <div key={i} style={{ width: "42px", height: "50px", borderRadius: "10px", border: active ? `2px solid ${ACCENT}` : `1.5px solid ${filled ? TEXT1 : SEP}`, background: filled ? (theme === "dark" ? "rgba(10,132,255,0.12)" : "rgba(0,122,255,0.04)") : BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 700, color: TEXT1, transition: "border-color 0.15s", boxShadow: active ? (theme === "dark" ? `0 0 0 3px rgba(10,132,255,0.2)` : `0 0 0 3px rgba(0,122,255,0.12)`) : "none" }}>
                {value[i] || ""}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const [view,          setView]          = useState<ProfileView>("main");
  const [showSignOut,   setShowSignOut]   = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Personal
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName,  setLastName]  = useState(user.lastName);
  const [dob,       setDob]       = useState("Jan 15, 1995");
  const [national,  setNational]  = useState("Belgian");
  const [email,     setEmail]     = useState(user.email);
  const [phone,     setPhone]     = useState("+32 490 12 34 56");

  // Bank details
  const [iban,          setIban]          = useState("BE68 5390 0754 7034");
  const [bic,           setBic]           = useState("NICA BE BB");
  const [bankName,      setBankName]      = useState("ING Belgium");
  const [accountHolder, setAccountHolder] = useState("Sofia Fischer");
  const [bankSaved,     setBankSaved]     = useState(false);

  // Legal info
  const [nationalReg, setNationalReg] = useState("95.01.15-123.45");
  const [taxId,       setTaxId]       = useState("BE 0123.456.789");
  const [ssNumber,    setSsNumber]    = useState("SN-495-22-7840");
  const [legalSaved,  setLegalSaved]  = useState(false);

  // Security
  const [faceId,     setFaceId]     = useState(true);
  const [showPwForm, setShowPwForm] = useState(false);
  const [showPw,     setShowPw]     = useState(false);
  const [oldPw,      setOldPw]      = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [pwSaved,    setPwSaved]    = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({ shifts: true, schedule: true, timeoff: true, swaps: true, payslips: true, payments: true, updates: false, reminders: true });
  const toggleNotif = (key: keyof typeof notifs) => setNotifs((p) => ({ ...p, [key]: !p[key] }));

  // Language
  const LANGUAGES = ["English (UK)", "French (Français)", "Dutch (Nederlands)", "German (Deutsch)", "Spanish (Español)"];
  const [lang, setLang] = useState("English (UK)");

  // Employers
  const [employers,   setEmployers]   = useState<Employer[]>([{ ...ALL_EMPLOYERS_DIR[0], active: true }]);
  const [activeCode,  setActiveCode]  = useState("BIST01");
  const [joinCode,    setJoinCode]    = useState("");
  const [joinSearch,  setJoinSearch]  = useState("");
  const [joinMode,    setJoinMode]    = useState<"code" | "search">("code");
  const [foundEmp,    setFoundEmp]    = useState<typeof ALL_EMPLOYERS_DIR[0] | null>(null);
  const [joining,     setJoining]     = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<string | null>(null);
  const [switchConfirm, setSwitchConfirm] = useState<string | null>(null);

  const searchResults = joinSearch.length > 1
    ? ALL_EMPLOYERS_DIR.filter((e) =>
        !employers.find((x) => x.code === e.code) &&
        (e.name.toLowerCase().includes(joinSearch.toLowerCase()) ||
         e.type.toLowerCase().includes(joinSearch.toLowerCase()) ||
         e.location.toLowerCase().includes(joinSearch.toLowerCase()))
      )
    : [];

  const handleCodeChange = (v: string) => {
    setJoinCode(v.toUpperCase()); setFoundEmp(null);
    if (v.length === 6) {
      const found = ALL_EMPLOYERS_DIR.find((e) => e.code.toUpperCase() === v.toUpperCase());
      if (found) setTimeout(() => setFoundEmp(found), 200);
    }
  };

  const handleJoin = () => {
    if (!foundEmp) return;
    setJoining(true);
    setTimeout(() => {
      setJoining(false); setJoinSuccess(true);
      setEmployers((prev) => [...prev, { ...foundEmp, active: false }]);
      setJoinCode(""); setJoinSearch(""); setFoundEmp(null);
      setTimeout(() => { setJoinSuccess(false); setView("employer"); }, 1800);
    }, 1200);
  };

  const handleLeave = (code: string) => {
    setEmployers((prev) => prev.filter((e) => e.code !== code));
    if (activeCode === code) setActiveCode(employers.find((e) => e.code !== code)?.code || "");
    setLeaveTarget(null);
  };

  const handleSwitchEmployer = (code: string) => {
    setActiveCode(code);
    setEmployers((prev) => prev.map((e) => ({ ...e, active: e.code === code })));
    setSwitchConfirm(null);
    setUser({ ...user, employer: employers.find((e) => e.code === code)?.name });
    setTimeout(() => setView("employer"), 300);
  };

  const handleSave = () => {
    setSavedFeedback(true);
    setUser({ ...user, firstName, lastName, email });
    setTimeout(() => { setSavedFeedback(false); setView("main"); }, 1200);
  };

  const handleBankSave = () => {
    setBankSaved(true);
    setTimeout(() => { setBankSaved(false); setView("main"); }, 1200);
  };

  const handleLegalSave = () => {
    setLegalSaved(true);
    setTimeout(() => { setLegalSaved(false); setView("main"); }, 1200);
  };

  const handlePwSave = () => {
    setPwSaved(true);
    setTimeout(() => { setPwSaved(false); setShowPwForm(false); setOldPw(""); setNewPw(""); }, 1400);
  };

  const activeEmployer = employers.find((e) => e.code === activeCode);
  const completeness   = 95;

  // ─── Sub-views ────────────────────────────────────────────────────────────

  if (view === "personal") return (
    <div style={{ background: BG, minHeight: "100%" }}>
      <SubHeader title="Personal details" onBack={() => setView("main")} action={{ label: savedFeedback ? "Saved ✓" : "Save", onPress: handleSave }} />
      <div style={{ background: CARD, margin: "16px", borderRadius: "16px", boxShadow: SHADOW, overflow: "hidden" }}>
        <EditField label="First name"    value={firstName} onChange={setFirstName} />
        <EditField label="Last name"     value={lastName}  onChange={setLastName} />
        <EditField label="Date of birth" value={dob}       onChange={setDob} placeholder="e.g. Jan 15, 1995" />
        <div style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: "11px", color: TEXT3, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "4px" }}>Nationality</div>
          <input value={national} onChange={(e) => setNational(e.target.value)} style={{ width: "100%", fontSize: "15px", color: TEXT1, background: "none", border: "none", outline: "none", fontFamily: "inherit" }} />
        </div>
      </div>
      <div style={{ padding: "0 20px" }}><div style={{ fontSize: "12px", color: TEXT3, lineHeight: 1.5 }}>Legal name changes must be verified. Contact your manager.</div></div>
    </div>
  );

  if (view === "contact") return (
    <div style={{ background: BG, minHeight: "100%" }}>
      <SubHeader title="Contact details" onBack={() => setView("main")} action={{ label: savedFeedback ? "Saved ✓" : "Save", onPress: handleSave }} />
      <div style={{ background: CARD, margin: "16px", borderRadius: "16px", boxShadow: SHADOW, overflow: "hidden" }}>
        <EditField label="Email"        value={email} onChange={setEmail} type="email" />
        <div style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: "11px", color: TEXT3, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "4px" }}>Phone number</div>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%", fontSize: "15px", color: TEXT1, background: "none", border: "none", outline: "none", fontFamily: "inherit" }} />
        </div>
      </div>
    </div>
  );

  // ── Bank Details ──────────────────────────────────────────────────────────
  if (view === "bankDetails") return (
    <div style={{ background: BG, minHeight: "100%" }}>
      <SubHeader title="Bank details" onBack={() => setView("main")} action={{ label: bankSaved ? "Saved ✓" : "Save", onPress: handleBankSave }} />

      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ background: "rgba(0,122,255,0.05)", border: "1px solid rgba(0,122,255,0.12)", borderRadius: "12px", padding: "10px 14px", marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", color: ACCENT }}>Your bank details are used for payroll processing by your employer. Changes take effect from next pay period.</div>
        </div>
      </div>

      <div style={{ background: CARD, margin: "0 16px 16px", borderRadius: "16px", boxShadow: SHADOW, overflow: "hidden" }}>
        <EditField label="Account holder" value={accountHolder} onChange={setAccountHolder} />
        <EditField label="IBAN"           value={iban}          onChange={setIban} placeholder="BE68 •••• •••• ••••" />
        <EditField label="BIC / SWIFT"    value={bic}           onChange={setBic} placeholder="NICA BE BB" />
        <div style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: "11px", color: TEXT3, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "4px" }}>Bank name</div>
          <input value={bankName} onChange={(e) => setBankName(e.target.value)} style={{ width: "100%", fontSize: "15px", color: TEXT1, background: "none", border: "none", outline: "none", fontFamily: "inherit" }} />
        </div>
      </div>

      {/* IBAN preview card */}
      <div style={{ margin: "0 16px" }}>
        <div style={{ background: TEXT1, borderRadius: "16px", padding: "18px 20px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "140px", height: "140px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)" }} />
          <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.7px", textTransform: "uppercase", marginBottom: "12px" }}>Bank card preview</div>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "#fff", letterSpacing: "0.5px", fontVariantNumeric: "tabular-nums", marginBottom: "6px" }}>{iban || "BE•• •••• •••• ••••"}</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{accountHolder}</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>{bankName}</div>
          </div>
        </div>
      </div>

      {bankSaved && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "16px 16px 0", background: "rgba(52,199,89,0.08)", border: "1px solid rgba(52,199,89,0.15)", borderRadius: "12px", padding: "10px 14px", animation: "pop 0.3s ease" }}>
          <CheckCircle2 size={15} style={{ color: GREEN }} />
          <span style={{ fontSize: "13px", color: GREEN, fontWeight: 500 }}>Bank details saved successfully</span>
        </div>
      )}
    </div>
  );

  // ── Legal Information ─────────────────────────────────────────────────────
  if (view === "legalInfo") return (
    <div style={{ background: BG, minHeight: "100%" }}>
      <SubHeader title="Legal information" onBack={() => setView("main")} action={{ label: legalSaved ? "Saved ✓" : "Save", onPress: handleLegalSave }} />

      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ background: "rgba(255,159,10,0.06)", border: "1px solid rgba(255,159,10,0.12)", borderRadius: "12px", padding: "10px 14px", marginBottom: "16px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <Shield size={14} style={{ color: AMBER, flexShrink: 0, marginTop: "1px" }} />
          <div style={{ fontSize: "12px", color: AMBER }}>This information is confidential and used only for legal and payroll compliance. It is encrypted and never shared without your consent.</div>
        </div>
      </div>

      <div style={{ background: CARD, margin: "0 16px 16px", borderRadius: "16px", boxShadow: SHADOW, overflow: "hidden" }}>
        <EditField label="National register number" value={nationalReg} onChange={setNationalReg} placeholder="YY.MM.DD-NNN.CC" />
        <EditField label="Tax identification number" value={taxId} onChange={setTaxId} placeholder="BE 0•••.•••.•••" />
        <div style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: "11px", color: TEXT3, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "4px" }}>Social security number</div>
          <input value={ssNumber} onChange={(e) => setSsNumber(e.target.value)} placeholder="SN-•••-••-••••" style={{ width: "100%", fontSize: "15px", color: TEXT1, background: "none", border: "none", outline: "none", fontFamily: "inherit" }} />
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        <div style={{ background: CARD, borderRadius: "16px", boxShadow: SHADOW, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: `0.5px solid ${SEP}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Shield size={15} style={{ color: TEXT3, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>Data encrypted at rest</div>
                <div style={{ fontSize: "12px", color: TEXT3, marginTop: "1px" }}>AES-256 · GDPR compliant</div>
              </div>
              <CheckCircle2 size={15} style={{ color: GREEN }} />
            </div>
          </div>
          <div style={{ padding: "13px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Lock size={15} style={{ color: TEXT3, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>Employer access</div>
                <div style={{ fontSize: "12px", color: TEXT3, marginTop: "1px" }}>Limited to HR admin only</div>
              </div>
              <CheckCircle2 size={15} style={{ color: GREEN }} />
            </div>
          </div>
        </div>
      </div>

      {legalSaved && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "16px 16px 0", background: "rgba(52,199,89,0.08)", border: "1px solid rgba(52,199,89,0.15)", borderRadius: "12px", padding: "10px 14px", animation: "pop 0.3s ease" }}>
          <CheckCircle2 size={15} style={{ color: GREEN }} />
          <span style={{ fontSize: "13px", color: GREEN, fontWeight: 500 }}>Legal information saved securely</span>
        </div>
      )}
    </div>
  );

  if (view === "security") return (
    <div style={{ background: BG, minHeight: "100%" }}>
      <SubHeader title="Security" onBack={() => setView("main")} />
      <Section title="Authentication">
        <Row icon={Lock} label="Change password" value="Last changed 3 months ago" onPress={() => setShowPwForm(!showPwForm)} />
        {showPwForm && (
          <div style={{ padding: "0 16px 16px", animation: "fadeUp 0.15s ease" }}>
            <div style={{ position: "relative", marginBottom: "8px" }}>
              <input type={showPw ? "text" : "password"} placeholder="Current password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} style={{ width: "100%", background: BG, border: `1px solid ${SEP}`, borderRadius: "10px", padding: "10px 14px", fontSize: "14px", color: TEXT1, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
            <div style={{ position: "relative", marginBottom: "8px" }}>
              <input type={showPw ? "text" : "password"} placeholder="New password" value={newPw} onChange={(e) => setNewPw(e.target.value)} style={{ width: "100%", background: BG, border: `1px solid ${SEP}`, borderRadius: "10px", padding: "10px 36px 10px 14px", fontSize: "14px", color: TEXT1, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: TEXT3 }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {pwSaved
              ? <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 14px", background: "rgba(52,199,89,0.06)", borderRadius: "10px", animation: "pop 0.3s ease" }}>
                  <CheckCircle2 size={14} style={{ color: GREEN }} />
                  <span style={{ fontSize: "13px", color: GREEN, fontWeight: 500 }}>Password updated successfully</span>
                </div>
              : <button onClick={handlePwSave} style={{ width: "100%", background: ACCENT, borderRadius: "10px", padding: "11px", color: "#fff", fontSize: "14px", fontWeight: 600 }}>Update password</button>
            }
          </div>
        )}
        <Row icon={Smartphone} label="Face ID / Touch ID" last rightEl={<Toggle value={faceId} onChange={() => setFaceId(!faceId)} />} onPress={() => setFaceId(!faceId)} />
      </Section>
      <Section title="Active sessions">
        <div style={{ padding: "12px 16px", borderBottom: `0.5px solid ${SEP}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Smartphone size={16} style={{ color: TEXT2 }} />
            <div style={{ flex: 1 }}><div style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>iPhone 15 Pro</div><div style={{ fontSize: "12px", color: TEXT2 }}>Brussels · Now</div></div>
            <span style={{ fontSize: "12px", fontWeight: 500, color: GREEN }}>This device</span>
          </div>
        </div>
        <div style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Monitor size={16} style={{ color: TEXT2 }} />
            <div style={{ flex: 1 }}><div style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>MacBook Pro</div><div style={{ fontSize: "12px", color: TEXT2 }}>Brussels · 2 days ago</div></div>
            <button style={{ fontSize: "12px", color: RED, fontWeight: 500 }}>Sign out</button>
          </div>
        </div>
      </Section>
    </div>
  );

  if (view === "notifications") return (
    <div style={{ background: BG, minHeight: "100%" }}>
      <SubHeader title="Notifications" onBack={() => setView("main")} />
      {[
        { title: "Shifts",   items: [{ key: "shifts" as const, label: "Upcoming shifts", desc: "Before your shift starts" }, { key: "schedule" as const, label: "Schedule changes", desc: "When your schedule is updated" }] },
        { title: "Requests", items: [{ key: "timeoff" as const, label: "Time off updates", desc: "Request status changes" }, { key: "swaps" as const, label: "Shift swap updates", desc: "Swap request responses" }] },
        { title: "Payments", items: [{ key: "payslips" as const, label: "New payslip", desc: "When payslip is available" }, { key: "payments" as const, label: "Payment processed", desc: "Bank transfer confirmed" }] },
        { title: "General",  items: [{ key: "updates" as const, label: "App updates", desc: "New features & improvements" }, { key: "reminders" as const, label: "Reminders", desc: "Availability & task reminders" }] },
      ].map((group) => (
        <Section key={group.title} title={group.title}>
          {group.items.map((item, i, arr) => (
            <div key={item.key}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", color: TEXT1 }}>{item.label}</div>
                  <div style={{ fontSize: "12px", color: TEXT3, marginTop: "1px" }}>{item.desc}</div>
                </div>
                <Toggle value={notifs[item.key]} onChange={() => toggleNotif(item.key)} />
              </div>
              {i < arr.length - 1 && <div style={{ height: "0.5px", background: SEP, marginLeft: "16px" }} />}
            </div>
          ))}
        </Section>
      ))}
    </div>
  );

  if (view === "language") return (
    <div style={{ background: BG, minHeight: "100%" }}>
      <SubHeader title="Language" onBack={() => setView("main")} />
      <div style={{ padding: "0 16px" }}>
        <div style={{ background: CARD, borderRadius: "16px", overflow: "hidden", boxShadow: SHADOW }}>
          {LANGUAGES.map((l, i) => (
            <button key={l} onClick={() => { setLang(l); setTimeout(() => setView("main"), 300); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderBottom: i < LANGUAGES.length - 1 ? `0.5px solid ${SEP}` : "none", background: "none", textAlign: "left" }}>
              <span style={{ flex: 1, fontSize: "15px", color: TEXT1 }}>{l}</span>
              {lang === l && <Check size={16} style={{ color: ACCENT }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (view === "support") return (
    <div style={{ background: BG, minHeight: "100%" }}>
      <SubHeader title="Help & Support" onBack={() => setView("main")} />
      <Section title="Get help">
        <Row icon={HelpCircle} label="FAQs" value="Frequently asked questions" onPress={() => {}} />
        <Row icon={Mail} label="Contact support" value="support@vestahr.com" onPress={() => {}} />
        <Row icon={FileText} label="Privacy policy" value="How we handle your data" onPress={() => {}} last />
      </Section>
      <Section title="App info">
        <Row icon={Globe} label="Version" value="Vesta Employee · v1.0.0" rightEl={<span style={{ fontSize: "12px", color: GREEN, fontWeight: 500 }}>Up to date</span>} last />
      </Section>
    </div>
  );

  // ── Switch employer ───────────────────────────────────────────────────────
  if (view === "switchEmployer") return (
    <div style={{ background: BG, minHeight: "100%" }}>
      <SubHeader title="Switch employer" onBack={() => setView("employer")} />
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ fontSize: "13px", color: TEXT2, marginBottom: "14px", paddingLeft: "2px" }}>
          Select your active employer. Only one employer can be active at a time.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {employers.map((emp) => {
            const isActive = emp.code === activeCode;
            return (
              <button
                key={emp.code}
                onClick={() => isActive ? null : setSwitchConfirm(emp.code)}
                style={{ display: "flex", alignItems: "center", gap: "13px", background: CARD, borderRadius: "16px", padding: "14px 16px", boxShadow: isActive ? `0 0 0 1.5px ${ACCENT}` : "none", textAlign: "left" }}
              >
                <div style={{ width: "46px", height: "46px", borderRadius: "13px", background: isActive ? ACCENT : TEXT1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>{emp.name[0]}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: TEXT1 }}>{emp.name}</div>
                  <div style={{ fontSize: "12px", color: TEXT2, marginTop: "2px" }}>{emp.type} · {emp.location}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "4px" }}>
                    <Star size={10} style={{ color: AMBER, fill: AMBER }} />
                    <span style={{ fontSize: "11px", color: TEXT2 }}>{emp.rating}</span>
                  </div>
                </div>
                {isActive
                  ? <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: GREEN }} />
                      <span style={{ fontSize: "12px", fontWeight: 600, color: GREEN }}>Active</span>
                    </div>
                  : <div style={{ padding: "5px 12px", background: BG, border: `1px solid ${SEP}`, borderRadius: "20px", fontSize: "12px", fontWeight: 500, color: TEXT2, flexShrink: 0 }}>
                      Switch
                    </div>
                }
              </button>
            );
          })}
        </div>
      </div>

      {switchConfirm && (
        <div style={{ position: "absolute", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "bdIn 0.15s ease" }}>
          <div onClick={() => setSwitchConfirm(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
          <div style={{ position: "relative", background: CARD, borderRadius: "20px", padding: "24px 20px", width: "100%", maxWidth: "310px", animation: "pop 0.25s ease", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(0,122,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <RefreshCw size={22} style={{ color: ACCENT }} />
              </div>
              <div style={{ fontSize: "17px", fontWeight: 700, color: TEXT1 }}>Switch employer?</div>
              <div style={{ fontSize: "14px", color: TEXT2, marginTop: "6px", lineHeight: 1.5 }}>
                Switch to <strong>{employers.find((e) => e.code === switchConfirm)?.name}</strong>? Your schedule and time tracking will update accordingly.
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button onClick={() => handleSwitchEmployer(switchConfirm!)} style={{ width: "100%", background: ACCENT, borderRadius: "12px", padding: "13px", color: "#fff", fontSize: "15px", fontWeight: 600 }}>Switch</button>
              <button onClick={() => setSwitchConfirm(null)} style={{ width: "100%", background: BG, borderRadius: "12px", padding: "13px", color: TEXT1, fontSize: "15px", fontWeight: 500 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Employer management ───────────────────────────────────────────────────
  if (view === "employer") return (
    <div style={{ background: BG, minHeight: "100%" }}>
      <SubHeader title="Employers" onBack={() => setView("main")} />
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <button
            onClick={() => { setJoinCode(""); setJoinSearch(""); setFoundEmp(null); setJoinSuccess(false); setView("joinEmployer"); }}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: ACCENT, borderRadius: "14px", padding: "13px", color: "#fff", fontSize: "14px", fontWeight: 600 }}
          >
            <Plus size={16} strokeWidth={2.5} /> Join employer
          </button>
          {employers.length > 1 && (
            <button
              onClick={() => setView("switchEmployer")}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: CARD, boxShadow: SHADOW, borderRadius: "14px", padding: "13px 16px", fontSize: "14px", fontWeight: 500, color: TEXT1 }}
            >
              <RefreshCw size={15} style={{ color: TEXT2 }} /> Switch
            </button>
          )}
        </div>

        {employers.length === 0 ? (
          <div style={{ background: CARD, borderRadius: "16px", boxShadow: SHADOW, padding: "32px 20px", textAlign: "center" }}>
            <Building2 size={32} style={{ color: TEXT3, margin: "0 auto 12px" }} />
            <div style={{ fontSize: "16px", fontWeight: 500, color: TEXT1 }}>No employers yet</div>
            <div style={{ fontSize: "14px", color: TEXT2, marginTop: "4px" }}>Join an employer to get started</div>
          </div>
        ) : employers.map((emp) => (
          <div key={emp.code} style={{ background: CARD, borderRadius: "16px", boxShadow: emp.code === activeCode ? `0 0 0 1.5px ${ACCENT}` : "none", padding: "16px", marginBottom: "10px", animation: "fadeUp 0.2s ease" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: emp.code === activeCode ? ACCENT : TEXT1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>{emp.name[0]}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "17px", fontWeight: 600, color: TEXT1 }}>{emp.name}</div>
                <div style={{ fontSize: "13px", color: TEXT2 }}>{emp.type} · {emp.location}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                  {emp.code === activeCode
                    ? <span style={{ fontSize: "11px", fontWeight: 600, color: GREEN, background: "rgba(52,199,89,0.1)", padding: "2px 8px", borderRadius: "20px" }}>Active</span>
                    : <span style={{ fontSize: "11px", fontWeight: 500, color: TEXT3, background: BG, padding: "2px 8px", borderRadius: "20px" }}>Inactive</span>
                  }
                  <span style={{ fontSize: "11px", color: TEXT3 }}>ID: {emp.code}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    <Star size={11} style={{ color: AMBER, fill: AMBER }} />
                    <span style={{ fontSize: "11px", color: TEXT2 }}>{emp.rating}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
              {[
                { label: "Role",     val: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Waiter" },
                { label: "Since",    val: "Aug 2025" },
                { label: "Contract", val: "Part-time" },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: BG, borderRadius: "10px", padding: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: TEXT3, marginBottom: "2px" }}>{label}</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: TEXT1 }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {emp.code !== activeCode && (
                <button
                  onClick={() => setSwitchConfirm(emp.code)}
                  style={{ flex: 1, background: "rgba(0,122,255,0.06)", border: "1px solid rgba(0,122,255,0.12)", borderRadius: "10px", padding: "10px", color: ACCENT, fontSize: "13px", fontWeight: 500 }}
                >
                  Set active
                </button>
              )}
              <button
                onClick={() => setLeaveTarget(emp.code)}
                style={{ flex: 1, background: "rgba(255,59,48,0.06)", border: "1px solid rgba(255,59,48,0.12)", borderRadius: "10px", padding: "10px", color: RED, fontSize: "13px", fontWeight: 500 }}
              >
                Leave
              </button>
            </div>
          </div>
        ))}
      </div>

      {leaveTarget && (
        <ConfirmDialog
          title="Leave employer?"
          message={`You'll lose access to shifts and documents from ${employers.find((e) => e.code === leaveTarget)?.name}.`}
          destructiveLabel="Leave"
          onConfirm={() => handleLeave(leaveTarget!)}
          onCancel={() => setLeaveTarget(null)}
        />
      )}

      {switchConfirm && (
        <div style={{ position: "absolute", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "bdIn 0.15s ease" }}>
          <div onClick={() => setSwitchConfirm(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
          <div style={{ position: "relative", background: CARD, borderRadius: "20px", padding: "24px 20px", width: "100%", maxWidth: "310px", animation: "pop 0.25s ease" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(0,122,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <RefreshCw size={22} style={{ color: ACCENT }} />
              </div>
              <div style={{ fontSize: "17px", fontWeight: 700, color: TEXT1 }}>Switch to {employers.find((e) => e.code === switchConfirm)?.name}?</div>
              <div style={{ fontSize: "14px", color: TEXT2, marginTop: "6px", lineHeight: 1.5 }}>Your schedule and time tracking will update accordingly.</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button onClick={() => handleSwitchEmployer(switchConfirm!)} style={{ width: "100%", background: ACCENT, borderRadius: "12px", padding: "13px", color: "#fff", fontSize: "15px", fontWeight: 600 }}>Switch</button>
              <button onClick={() => setSwitchConfirm(null)} style={{ width: "100%", background: BG, borderRadius: "12px", padding: "13px", color: TEXT1, fontSize: "15px", fontWeight: 500 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Join employer ─────────────────────────────────────────────────────────
  if (view === "joinEmployer") return (
    <div style={{ background: BG, minHeight: "100%" }}>
      <SubHeader title="Join employer" onBack={() => setView("employer")} />
      <div style={{ padding: "20px 16px" }}>
        {/* Mode toggle */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "rgba(116,116,128,0.1)", borderRadius: "10px", padding: "2px", marginBottom: "20px" }}>
          {(["code", "search"] as const).map((m) => (
            <button key={m} onClick={() => { setJoinMode(m); setJoinCode(""); setJoinSearch(""); setFoundEmp(null); setJoinSuccess(false); }}
              style={{ padding: "7px", borderRadius: "8px", background: joinMode === m ? CARD : "transparent", boxShadow: joinMode === m ? "0 1px 3px rgba(0,0,0,0.1)" : "none", fontSize: "13px", fontWeight: joinMode === m ? 600 : 400, color: joinMode === m ? TEXT1 : TEXT2, transition: "all 0.15s" }}>
              {m === "code" ? "Invite code" : "Search"}
            </button>
          ))}
        </div>

        {joinMode === "code" ? (
          <>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "15px", fontWeight: 500, color: TEXT1, marginBottom: "4px" }}>Enter invite code</div>
              <div style={{ fontSize: "13px", color: TEXT2 }}>Ask your manager for the 6-character code</div>
              <div style={{ fontSize: "12px", color: TEXT3, marginTop: "6px", background: "rgba(0,122,255,0.06)", borderRadius: "8px", padding: "4px 10px", display: "inline-block" }}>
                💡 Try code: <strong>111111</strong>
              </div>
            </div>
            <CodeInput value={joinCode} onChange={handleCodeChange} />
            <div style={{ textAlign: "center", marginTop: "10px", fontSize: "12px", color: foundEmp ? GREEN : TEXT3 }}>
              {joinCode.length === 0        ? "Tap boxes to enter code"          :
               joinCode.length < 6         ? `${6 - joinCode.length} more…`     :
               foundEmp                    ? `✓ Found: ${foundEmp.name}`         :
               "No employer found for this code"}
            </div>
          </>
        ) : (
          <>
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: TEXT3 }} />
              <input value={joinSearch} onChange={(e) => { setJoinSearch(e.target.value); setFoundEmp(null); }}
                placeholder="Search by name, type or city…"
                style={{ width: "100%", background: CARD, border: `1px solid ${SEP}`, borderRadius: "14px", padding: "13px 14px 13px 40px", fontSize: "15px", color: TEXT1, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>

            {/* Category filters */}
            {joinSearch.length === 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                {["Restaurant", "Café", "Bar", "Hotel", "Bakery"].map((cat) => (
                  <button key={cat} onClick={() => setJoinSearch(cat)}
                    style={{ padding: "5px 12px", borderRadius: "20px", background: CARD, border: `1px solid ${SEP}`, fontSize: "12px", fontWeight: 500, color: TEXT2 }}>
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {joinSearch.length > 0 && searchResults.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: "14px", color: TEXT2 }}>No results for "{joinSearch}"</div>
                <div style={{ fontSize: "12px", color: TEXT3, marginTop: "4px" }}>Try a different search term</div>
              </div>
            )}
          </>
        )}

        {/* Search results */}
        {joinMode === "search" && searchResults.length > 0 && !joinSuccess && (
          <div style={{ background: CARD, borderRadius: "14px", boxShadow: SHADOW, overflow: "hidden" }}>
            {searchResults.map((emp, i) => (
              <button key={emp.code} onClick={() => setFoundEmp(emp)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderBottom: i < searchResults.length - 1 ? `0.5px solid ${SEP}` : "none", background: foundEmp?.code === emp.code ? "rgba(0,122,255,0.04)" : "none", textAlign: "left" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: foundEmp?.code === emp.code ? ACCENT : TEXT1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{emp.name[0]}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>{emp.name}</div>
                  <div style={{ fontSize: "12px", color: TEXT2 }}>{emp.type} · {emp.location}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    <Star size={11} style={{ color: AMBER, fill: AMBER }} />
                    <span style={{ fontSize: "12px", color: TEXT2 }}>{emp.rating}</span>
                  </div>
                  <span style={{ fontSize: "11px", color: TEXT3 }}>{emp.employees} staff</span>
                </div>
                {foundEmp?.code === emp.code && <Check size={16} style={{ color: ACCENT, flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        )}

        {/* Employer preview */}
        {foundEmp && !joinSuccess && (
          <div style={{ background: CARD, borderRadius: "16px", boxShadow: `0 0 0 1.5px ${ACCENT}`, padding: "16px", marginTop: "16px", animation: "fadeUp 0.2s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>{foundEmp.name[0]}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "17px", fontWeight: 600, color: TEXT1 }}>{foundEmp.name}</div>
                <div style={{ fontSize: "13px", color: TEXT2 }}>{foundEmp.type} · {foundEmp.location}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <Star size={13} style={{ color: AMBER, fill: AMBER }} />
                <span style={{ fontSize: "13px", fontWeight: 500, color: TEXT1 }}>{foundEmp.rating}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
              {[{ label: "Employees", val: String(foundEmp.employees) }, { label: "Status", val: "Hiring" }, { label: "Type", val: foundEmp.type }].map(({ label, val }) => (
                <div key={label} style={{ flex: 1, background: BG, borderRadius: "10px", padding: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: TEXT1 }}>{val}</div>
                  <div style={{ fontSize: "11px", color: TEXT2 }}>{label}</div>
                </div>
              ))}
            </div>
            <button onClick={handleJoin} disabled={joining}
              style={{ width: "100%", background: joining ? "#B0C9F0" : ACCENT, borderRadius: "12px", padding: "13px", color: "#fff", fontSize: "15px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              {joining
                ? <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                : "Request to join"
              }
            </button>
          </div>
        )}

        {/* Success */}
        {joinSuccess && (
          <div style={{ background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.15)", borderRadius: "16px", padding: "24px", marginTop: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", animation: "pop 0.3s ease" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(52,199,89,0.1)", display: "flex", alignItems: "center", justifyContent: "center", animation: "bounceIn 0.45s ease" }}>
              <CheckCircle2 size={30} style={{ color: GREEN }} />
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: TEXT1 }}>Request sent!</div>
            <div style={{ fontSize: "13px", color: TEXT2, textAlign: "center" }}>You'll be notified when your manager approves your request.</div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <div style={{ background: BG, minHeight: "100%", overflowY: "auto", paddingBottom: "28px" }}>
      {/* Avatar */}
      <div style={{ padding: "28px 20px 20px", textAlign: "center" }}>
        <div style={{ position: "relative", display: "inline-block", marginBottom: "14px" }}>
          <div style={{ position: "absolute", inset: "-3px", borderRadius: "50%", background: `conic-gradient(${ACCENT} 0deg 342deg, ${SEP} 342deg)`, zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1, width: "80px", height: "80px", borderRadius: "50%", background: TEXT1, margin: "3px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "26px", fontWeight: 600, color: "#fff", letterSpacing: "-0.5px" }}>{user.firstName[0]}{user.lastName[0]}</span>
          </div>
          <button style={{ position: "absolute", bottom: "2px", right: "2px", zIndex: 2, width: "24px", height: "24px", borderRadius: "50%", background: CARD, border: `1.5px solid ${SEP}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Camera size={11} style={{ color: TEXT1 }} />
          </button>
        </div>
        <div style={{ fontSize: "22px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.5px" }}>{user.firstName} {user.lastName}</div>
        <div style={{ fontSize: "14px", color: TEXT2, marginTop: "3px" }}>{user.email}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "10px", padding: "4px 12px", background: "rgba(0,122,255,0.08)", borderRadius: "20px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: GREEN }} />
          <span style={{ fontSize: "13px", fontWeight: 500, color: ACCENT }}>
            {activeEmployer?.name || "No employer"} · {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Waiter"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "0 16px 20px" }}>
        <div style={{ background: CARD, borderRadius: "16px", boxShadow: SHADOW, display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[{ val: "52", label: "Shifts" }, { val: "312h", label: "Worked" }, { val: "8mo", label: "Tenure" }].map(({ val, label }, i, arr) => (
            <div key={label} style={{ padding: "14px 8px", textAlign: "center", borderRight: i < arr.length - 1 ? `0.5px solid ${SEP}` : "none" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.4px" }}>{val}</div>
              <div style={{ fontSize: "12px", color: TEXT2, marginTop: "2px" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Completeness */}
      <div style={{ padding: "0 16px 20px" }}>
        <div style={{ background: CARD, borderRadius: "16px", padding: "14px 16px", boxShadow: SHADOW }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>Profile complete</span>
            <span style={{ fontSize: "14px", fontWeight: 600, color: ACCENT }}>{completeness}%</span>
          </div>
          <div style={{ height: "4px", background: BG, borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${completeness}%`, background: ACCENT, borderRadius: "99px" }} />
          </div>
          <div style={{ fontSize: "12px", color: TEXT3, marginTop: "6px" }}>Add an emergency contact to complete your profile.</div>
        </div>
      </div>

      <Section title="Personal">
        <Row icon={User}       label="Personal details"  value={`${user.firstName} ${user.lastName}`}   onPress={() => setView("personal")}    />
        <Row icon={Mail}       label="Contact details"    value={user.email}                              onPress={() => setView("contact")}     />
        <Row icon={MapPin}     label="Address"            value="Brussels, Belgium"                       onPress={() => {}}                     />
        <Row icon={CreditCard} label="Bank details"       value={`${iban.slice(0, 7)}•••`}               onPress={() => setView("bankDetails")} />
        <Row icon={FileText}   label="Legal information"  value="National reg. · Tax ID"                  onPress={() => setView("legalInfo")} last />
      </Section>

      <Section title="Employment">
        <Row icon={Building2} label={`${employers.length} employer${employers.length !== 1 ? "s" : ""}`}
          value={employers.map((e) => e.name).join(", ") || "None"}
          badge={employers.length > 0 ? "Active" : undefined}
          onPress={() => setView("employer")} />
        {employers.length > 1 && (
          <Row icon={RefreshCw} label="Switch employer" value={`Currently: ${activeEmployer?.name}`} onPress={() => setView("switchEmployer")} last />
        )}
        {employers.length <= 1 && (
          <Row icon={RefreshCw} label="Switch employer" value="Manage your active employer" onPress={() => setView("employer")} last />
        )}
      </Section>

      <Section title="Settings">
        <Row icon={theme === "dark" ? Moon : Sun} label="Appearance" value={theme === "light" ? "Light" : "Dark"} onPress={toggleTheme} rightEl={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: TEXT2 }}>{theme === "light" ? "Light" : "Dark"}</span>
            {theme === "dark" ? <Moon size={16} style={{ color: TEXT2 }} /> : <Sun size={16} style={{ color: TEXT2 }} />}
          </div>
        } />
        <Row icon={Bell}   label="Notifications" value={Object.values(notifs).filter(Boolean).length + " enabled"} onPress={() => setView("notifications")} />
        <Row icon={Globe}  label="Language"       value={lang}                                                       onPress={() => setView("language")}      />
        <Row icon={Shield} label="Security"       value="Password, Face ID"                                          onPress={() => setView("security")}      />
        <Row icon={Lock}   label="Privacy"        value="Data & permissions"                                          onPress={() => {}} last                  />
      </Section>

      <Section title="Support">
        <Row icon={HelpCircle} label="Help & support" value="FAQs, contact Vesta" onPress={() => setView("support")} last />
      </Section>

      <div style={{ padding: "0 16px" }}>
        <div style={{ background: CARD, borderRadius: "16px", boxShadow: SHADOW, overflow: "hidden" }}>
          <button onClick={() => setShowSignOut(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "14px", color: RED, fontSize: "15px", fontWeight: 500, background: "none" }}>
            <LogOut size={16} style={{ color: RED }} /> Sign out
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <div style={{ fontSize: "12px", color: TEXT3 }}>Vesta Employee · v1.0.0</div>
      </div>

      {showSignOut && (
        <ConfirmDialog
          title="Sign out?"
          message="You'll need to sign in again to access your account."
          destructiveLabel="Sign out"
          onConfirm={() => { setShowSignOut(false); onSignOut(); }}
          onCancel={() => setShowSignOut(false)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
