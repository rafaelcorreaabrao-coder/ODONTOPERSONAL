import { useState } from "react";
import { Eye, EyeOff, Stethoscope } from "lucide-react";
import { supabase } from "../supabaseClient.js";
import { useTheme } from "../theme.js";
import { Button, Field, useInputStyle } from "../components/ui.jsx";

function Logo({ color }) {
  return (
    <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
      <path
        d="M20 4.5C12.6 4.5 6.8 9.7 6.8 16.1c0 3.5 1.3 5.4 2.1 8 1 3.4.4 8.5 2.7 11.3 1.4 1.7 3-.8 4.5-4.2 1.1-2.4 2.2-4.2 3.9-4.2s2.8 1.8 3.9 4.2c1.5 3.4 3.1 5.9 4.5 4.2 2.3-2.8 1.7-7.9 2.7-11.3.8-2.6 2.1-4.5 2.1-8C33.2 9.7 27.4 4.5 20 4.5z"
        fill={color}
      />
      <ellipse cx="15.5" cy="14.5" rx="1.6" ry="2" fill="#fff" />
      <ellipse cx="24.5" cy="14.5" rx="1.6" ry="2" fill="#fff" />
      <path d="M14.5 19 Q20 23.5 25.5 19" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="29.5" cy="27" r="7.5" fill="#059669" stroke="#fff" strokeWidth="1.8" />
      <text x="29.5" y="30.3" fontSize="8.5" fontWeight="800" fill="#fff" textAnchor="middle" fontFamily="Arial">$</text>
    </svg>
  );
}

export default function Auth({ initialMode = "login", onBack }) {
  const t = useTheme();
  const [mode, setMode] = useState(initialMode); // "login" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const inputStyle = useInputStyle();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (mode === "forgot") {
      if (!email.trim()) return setError("Preencha o e-mail.");
      setLoading(true);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
      setLoading(false);
      if (resetError) return setError(resetError.message);
      setInfo("Se esse e-mail estiver cadastrado, você vai receber um link para redefinir a senha.");
      return;
    }

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

  const titles = {
    login: { h: "Acesse sua conta", s: "Faça login para acessar sua conta." },
    signup: { h: "Criar sua conta", s: "Leva menos de um minuto para começar." },
    forgot: { h: "Recuperar senha", s: "Enviaremos um link de redefinição para o seu e-mail." },
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: t.page }}>
      {/* Lado esquerdo — foto (escondido em telas pequenas) */}
      <div className="op-auth-photo" style={{ flex: "1 1 50%", position: "relative", overflow: "hidden", background: `linear-gradient(160deg, ${t.primary}, #0B1917)` }}>
        <img
          src="/dentista-hero.jpg"
          alt="Profissionais de odontologia"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", padding: 40, background: "linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 50%)" }}>
          <div style={{ color: "#fff" }}>
            <Stethoscope size={28} style={{ marginBottom: 10, opacity: 0.9 }} />
            <div style={{ fontWeight: 800, fontSize: 22, lineHeight: 1.3, maxWidth: 340 }}>
              Feito para quem cuida de sorrisos em mais de uma clínica.
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div style={{ flex: "1 1 50%", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          {onBack && (
            <button onClick={onBack} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 12.5, cursor: "pointer", marginBottom: 20, padding: 0 }}>
              ← Voltar
            </button>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <Logo color={t.primary} />
            <span style={{ fontWeight: 800, fontSize: 20 }}>Dent<span style={{ color: t.gold }}>Control</span></span>
          </div>

          <h1 style={{ fontWeight: 800, fontSize: 26, margin: "0 0 6px" }}>{titles[mode].h}</h1>
          <p style={{ fontSize: 13.5, color: t.textMuted, margin: "0 0 26px" }}>{titles[mode].s}</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="E-mail">
              <input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu e-mail" autoFocus />
            </Field>

            {mode !== "forgot" && (
              <Field label={
                <span style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  Senha
                  {mode === "login" && (
                    <button type="button" onClick={() => { setMode("forgot"); setError(""); setInfo(""); }} style={{ background: "none", border: "none", color: t.primary, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                      Esqueci minha senha
                    </button>
                  )}
                </span>
              }>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    style={{ ...inputStyle, paddingRight: 38 }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                  />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: t.textMuted, cursor: "pointer", display: "flex", padding: 0 }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
            )}

            {error && <div style={{ fontSize: 12.5, color: t.danger }}>{error}</div>}
            {info && <div style={{ fontSize: 12.5, color: t.success }}>{info}</div>}

            <Button type="submit" loading={loading} style={{ justifyContent: "center", padding: "11px 0", fontSize: 14, marginTop: 4 }}>
              {mode === "forgot" ? "Enviar link" : mode === "signup" ? "Criar conta" : "Entrar"}
            </Button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
            <div style={{ flex: 1, height: 1, background: t.border }} />
            <span style={{ fontSize: 12, color: t.textMuted }}>ou</span>
            <div style={{ flex: 1, height: 1, background: t.border }} />
          </div>

          <div style={{ textAlign: "center", fontSize: 13.5, color: t.textMuted }}>
            {mode === "signup" ? (
              <>Já tem uma conta?{" "}
                <button onClick={() => { setMode("login"); setError(""); setInfo(""); }} style={{ background: "none", border: "none", color: t.primary, fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "underline" }}>Entrar</button>
              </>
            ) : (
              <>Ainda não tem uma conta?{" "}
                <button onClick={() => { setMode("signup"); setError(""); setInfo(""); }} style={{ background: "none", border: "none", color: t.primary, fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "underline" }}>Cadastre-se agora</button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .op-auth-photo { display: none; }
        }
      `}</style>
    </div>
  );
}
