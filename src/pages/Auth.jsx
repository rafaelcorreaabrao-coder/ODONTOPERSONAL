import { useState } from "react";
import { supabase } from "../supabaseClient.js";
import { useTheme } from "../theme.js";
import { Button, Field, Card, useInputStyle } from "../components/ui.jsx";

export default function Auth({ initialMode = "login", onBack }) {
  const t = useTheme();
  const [mode, setMode] = useState(initialMode); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const inputStyle = useInputStyle();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email.trim() || !password.trim()) return setError("Preencha e-mail e senha.");
    if (password.length < 6) return setError("A senha precisa ter pelo menos 6 caracteres.");

    setLoading(true);

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password });
      setLoading(false);
      if (signUpError) return setError(signUpError.message);
      setInfo("Conta criada. Se pedimos confirmação por e-mail, verifique sua caixa de entrada antes de entrar.");
      setMode("login");
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (loginError) return setError(loginError.message);
    // sessão atualiza sozinha via onAuthStateChange no App
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: t.page,  padding: 16 }}>
      <Card style={{ width: "100%", maxWidth: 360 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 12.5, cursor: "pointer", marginBottom: 14, padding: 0 }}>
            ← Voltar
          </button>
        )}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <svg width="42" height="42" viewBox="0 0 40 40" fill="none" style={{ margin: "0 auto 6px" }}>
            <path
              d="M20 4.5C12.6 4.5 6.8 9.7 6.8 16.1c0 3.5 1.3 5.4 2.1 8 1 3.4.4 8.5 2.7 11.3 1.4 1.7 3-.8 4.5-4.2 1.1-2.4 2.2-4.2 3.9-4.2s2.8 1.8 3.9 4.2c1.5 3.4 3.1 5.9 4.5 4.2 2.3-2.8 1.7-7.9 2.7-11.3.8-2.6 2.1-4.5 2.1-8C33.2 9.7 27.4 4.5 20 4.5z"
              fill={t.primary}
            />
            <ellipse cx="15.5" cy="14.5" rx="1.6" ry="2" fill="#fff" />
            <ellipse cx="24.5" cy="14.5" rx="1.6" ry="2" fill="#fff" />
            <path d="M14.5 19 Q20 23.5 25.5 19" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <circle cx="29.5" cy="27" r="7.5" fill="#059669" stroke="#fff" strokeWidth="1.8" />
            <text x="29.5" y="30.3" fontSize="8.5" fontWeight="800" fill="#fff" textAnchor="middle" fontFamily="Arial">$</text>
          </svg>
          <div style={{ fontWeight: 700, fontSize: 22, color: t.text }}>ODONTOCASH</div>
          <div style={{ fontSize: 12.5, color: t.textMuted, marginTop: 2 }}>controle financeiro para dentistas autônomas</div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          <button
            onClick={() => { setMode("login"); setError(""); setInfo(""); }}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 8, border: `1px solid ${t.border}`,
              background: mode === "login" ? t.primary : "transparent",
              color: mode === "login" ? "#fff" : t.textMuted,
              fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >
            Entrar
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); setInfo(""); }}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 8, border: `1px solid ${t.border}`,
              background: mode === "signup" ? t.primary : "transparent",
              color: mode === "signup" ? "#fff" : t.textMuted,
              fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="E-mail">
            <input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" autoFocus />
          </Field>
          <Field label="Senha">
            <input type="password" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 6 caracteres" />
          </Field>
          {error && <div style={{ fontSize: 12.5, color: t.danger }}>{error}</div>}
          {info && <div style={{ fontSize: 12.5, color: t.success }}>{info}</div>}
          <Button type="submit" disabled={loading} style={{ justifyContent: "center" }}>
            {loading ? "Aguarde..." : mode === "signup" ? "Criar conta" : "Entrar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
