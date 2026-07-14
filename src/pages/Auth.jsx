import { useState } from "react";
import { supabase } from "../supabaseClient.js";
import { useTheme } from "../theme.js";
import { Button, Field, Card, useInputStyle } from "../components/ui.jsx";

export default function Auth() {
  const t = useTheme();
  const [mode, setMode] = useState("login"); // "login" | "signup"
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: t.page, fontFamily: "'IBM Plex Sans', sans-serif", padding: 16 }}>
      <Card style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <svg width="38" height="38" viewBox="0 0 40 40" fill="none" style={{ margin: "0 auto 6px" }}>
            <path
              d="M20 4.5 C12.6 4.5 6.8 9.7 6.8 16.1 C6.8 19.6 8.1 21.5 8.9 24.1 C9.9 27.5 9.3 32.6 11.6 35.4 C13 37.1 14.6 34.6 16.1 31.2 C17.2 28.8 18.3 27 20 27 C21.7 27 22.8 28.8 23.9 31.2 C25.4 34.6 27 37.1 28.4 35.4 C30.7 32.6 30.1 27.5 31.1 24.1 C31.9 21.5 33.2 19.6 33.2 16.1 C33.2 9.7 27.4 4.5 20 4.5 Z"
              fill={t.primary}
            />
            <ellipse cx="14.5" cy="12.5" rx="3" ry="4.6" fill="rgba(255,255,255,0.4)" transform="rotate(-22 14.5 12.5)" />
          </svg>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 22, color: t.text }}>OdontoPersonal</div>
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
