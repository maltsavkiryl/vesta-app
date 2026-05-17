import { useState, useRef, useCallback } from "react";
import { Eye, EyeOff, ArrowRight, ChevronLeft } from "lucide-react";
import { useTheme } from "../theme";

type Mode = "login" | "register" | "forgot";

interface Props {
  onLogin:    (user: { firstName: string; lastName: string; email: string }) => void;
  onRegister: (user: { firstName: string; lastName: string; email: string }) => void;
}

// ── Demo logo mark ────────────────────────────────────────────────────────
function VestaLogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="14" fill="white" fillOpacity="0.12" />
      <path d="M12 14L24 34L36 14" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 14L24 26L30 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5"/>
    </svg>
  );
}

export function AuthScreen({ onLogin, onRegister }: Props) {
  const { colors } = useTheme();
  const ACCENT = colors.accent;
  const BG = colors.bg;
  const CARD = colors.card;
  const TEXT1 = colors.text1;
  const TEXT2 = colors.text2;
  const TEXT3 = colors.text3;
  const SEP = colors.sep;
  const RED = colors.red;

  // ── Input field ───────────────────────────────────────────────────────────
  const Field = useCallback(({ label, value, onChange, type = "text", placeholder, rightEl, autoCapitalize }: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; rightEl?: React.ReactNode; autoCapitalize?: string;
  }) => {
    return (
      <div style={{ background: CARD, borderRadius: "14px", padding: "12px 16px", position: "relative" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: TEXT3, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
          {label}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoCapitalize={autoCapitalize}
            style={{
              flex: 1, minWidth: 0, fontSize: "16px", color: TEXT1, background: "none",
              border: "none", outline: "none", padding: 0, fontFamily: "inherit",
            }}
          />
          {rightEl}
        </div>
      </div>
    );
  }, [CARD, TEXT1, TEXT3]);

  const [mode,       setMode]       = useState<Mode>("login");
  const [firstName,  setFirstName]  = useState("");
  const [lastName,   setLastName]   = useState("");
  const [email,      setEmail]      = useState("sofia.fischer@email.com");
  const [password,   setPassword]   = useState("password123");
  const [confirm,    setConfirm]    = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const eyeBtn = (
    <button onClick={() => setShowPw(!showPw)} style={{ color: TEXT3, flexShrink: 0 }}>
      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleLogin = () => {
    setError("");
    if (!email)    { setError("Please enter your email address."); return; }
    if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }
    if (!password) { setError("Please enter your password."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Demo: extract name from email or use default
      const name = email.split("@")[0].split(".").map((s) => s.charAt(0).toUpperCase() + s.slice(1));
      onLogin({ firstName: name[0] || "Sofia", lastName: name[1] || "Fischer", email });
    }, 1100);
  };

  const handleRegister = () => {
    setError("");
    if (!firstName || !lastName) { setError("Please enter your full name."); return; }
    if (!email)    { setError("Please enter your email address."); return; }
    if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }
    if (!password) { setError("Please choose a password."); return; }
    if (password.length < 8)   { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm)  { setError("Passwords don't match."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onRegister({ firstName, lastName, email });
    }, 1100);
  };

  const handleForgot = () => {
    if (!email || !validateEmail(email)) { setError("Enter your email to reset your password."); return; }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); setForgotSent(true); }, 1000);
  };

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: "#0D0D0F", overflowY: "auto", scrollbarWidth: "none" }}>

      {/* ── Hero area ── */}
      <div
        style={{
          flexShrink: 0,
          padding: mode === "register" ? "72px 28px 32px" : "80px 28px 40px",
          display: "flex", flexDirection: "column",
          transition: "padding 0.3s ease",
        }}
      >
        {/* Decorative rings */}
        <div style={{ position: "absolute", top: "20px", right: "20px", width: "200px", height: "200px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "0px", right: "50px", width: "280px", height: "280px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.03)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "-60px", right: "20px", width: "340px", height: "340px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.02)", pointerEvents: "none" }} />

        {mode === "forgot" ? (
          <button onClick={() => { setMode("login"); setError(""); setForgotSent(false); }} style={{ display: "flex", alignItems: "center", gap: "4px", color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "28px", background: "none" }}>
            <ChevronLeft size={16} /> Back
          </button>
        ) : null}

        <VestaLogo size={52} />
        <div style={{ marginTop: "20px" }}>
          <div style={{ fontSize: "34px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.8px", lineHeight: 1.15 }}>
            {mode === "login"    ? "Welcome\nback." :
             mode === "register" ? "Create your\naccount." :
             "Reset your\npassword."}
          </div>
          <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)", marginTop: "8px" }}>
            {mode === "login"    ? "Sign in to manage your work life." :
             mode === "register" ? "Join thousands of employees on Vesta." :
             "We'll send a reset link to your email."}
          </div>
        </div>
      </div>

      {/* ── Form card ── */}
      <div
        style={{
          flex: 1, background: CARD,
          borderRadius: "28px 28px 0 0",
          padding: "28px 24px 40px",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
        }}
      >
        {/* Forgot password sent */}
        {mode === "forgot" && forgotSent ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "32px 0", animation: "pop 0.3s ease" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(0,122,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 14L11 21L24 7" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: TEXT1, textAlign: "center" }}>Check your inbox</div>
            <div style={{ fontSize: "14px", color: TEXT2, textAlign: "center", lineHeight: 1.5 }}>
              We sent a reset link to<br/><strong style={{ color: TEXT1 }}>{email}</strong>
            </div>
            <button onClick={() => { setMode("login"); setForgotSent(false); }}
              style={{ marginTop: "8px", color: ACCENT, fontSize: "15px", fontWeight: 500 }}>
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            {/* Error */}
            {error && (
              <div style={{ background: "rgba(255,59,48,0.06)", border: "1px solid rgba(255,59,48,0.12)", borderRadius: "12px", padding: "10px 14px", marginBottom: "16px", animation: "fadeUp 0.2s ease" }}>
                <span style={{ fontSize: "13px", color: RED }}>{error}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Register: Name fields */}
              {mode === "register" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", animation: "fadeUp 0.2s ease" }}>
                  <Field label="First name" value={firstName} onChange={setFirstName} autoCapitalize="words" placeholder="Sofia" />
                  <Field label="Last name"  value={lastName}  onChange={setLastName}  autoCapitalize="words" placeholder="Fischer" />
                </div>
              )}

              {/* Email */}
              <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="you@email.com" autoCapitalize="none" />

              {/* Password */}
              {mode !== "forgot" && (
                <Field label="Password" value={password} onChange={setPassword}
                  type={showPw ? "text" : "password"} placeholder="••••••••"
                  rightEl={eyeBtn}
                />
              )}

              {/* Confirm password */}
              {mode === "register" && (
                <Field label="Confirm password" value={confirm} onChange={setConfirm}
                  type={showPw ? "text" : "password"} placeholder="••••••••"
                  rightEl={eyeBtn}
                />
              )}
            </div>

            {/* Forgot password link */}
            {mode === "login" && (
              <button onClick={() => { setMode("forgot"); setError(""); }}
                style={{ display: "block", textAlign: "right", marginTop: "10px", color: ACCENT, fontSize: "13px", fontWeight: 500, background: "none" }}>
                Forgot password?
              </button>
            )}

            {/* Primary CTA */}
            <button
              onClick={mode === "login" ? handleLogin : mode === "register" ? handleRegister : handleForgot}
              disabled={loading}
              style={{
                width: "100%", marginTop: "24px",
                background: loading ? "#B0C9F0" : ACCENT,
                borderRadius: "16px", padding: "16px",
                color: "#fff", fontSize: "17px", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "background 0.2s",
              }}
            >
              {loading ? (
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
              ) : (
                <>
                  {mode === "login"    ? "Sign in"         :
                   mode === "register" ? "Create account"  :
                   "Send reset link"}
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            {/* Face ID (login only) */}
            {mode === "login" && !loading && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
                  <div style={{ flex: 1, height: "0.5px", background: SEP }} />
                  <span style={{ fontSize: "12px", color: TEXT3 }}>or continue with</span>
                  <div style={{ flex: 1, height: "0.5px", background: SEP }} />
                </div>
                <button
                  onClick={handleLogin}
                  style={{
                    width: "100%", background: BG, border: `1px solid ${SEP}`,
                    borderRadius: "16px", padding: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                    fontSize: "15px", fontWeight: 500, color: TEXT1,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="10.25" stroke={TEXT3} strokeWidth="1.5"/>
                    <path d="M7 11C7 8.79 8.79 7 11 7S15 8.79 15 11V13" stroke={TEXT1} strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="11" cy="15" r="1.5" fill={TEXT1}/>
                  </svg>
                  Face ID / Touch ID
                </button>
              </>
            )}

            {/* Toggle mode */}
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              {mode === "login" ? (
                <span style={{ fontSize: "14px", color: TEXT2 }}>
                  Don't have an account?{" "}
                  <button onClick={() => { setMode("register"); setError(""); }} style={{ color: ACCENT, fontWeight: 600, background: "none" }}>
                    Create one
                  </button>
                </span>
              ) : mode === "register" ? (
                <span style={{ fontSize: "14px", color: TEXT2 }}>
                  Already have an account?{" "}
                  <button onClick={() => { setMode("login"); setError(""); }} style={{ color: ACCENT, fontWeight: 600, background: "none" }}>
                    Sign in
                  </button>
                </span>
              ) : null}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
