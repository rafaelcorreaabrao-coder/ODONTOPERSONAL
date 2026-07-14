import { useState } from "react";
import { supabase } from "../supabaseClient.js";
import { useTheme } from "../theme.js";
import { Button, Field, Card, useInputStyle } from "../components/ui.jsx";

export default function Onboarding({ userId, onDone }) {
  const t = useTheme();
  const inputStyle = useInputStyle();
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!nickname.trim()) return setError("Dê um nome para sua loja.");
    setLoading(true);

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", nickname.trim())
      .maybeSingle();

    if (existing) {
      setLoading(false);
      return setError("Esse nome já está em uso. Tente outra variação.");
    }

    const { error: insError } = await supabase.from("profiles").insert({ id: userId, nickname: nickname.trim() });
    setLoading(false);
    if (insError) return setError(insError.message);
    onDone(nickname.trim());
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: t.page, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <Card style={{ width: 380 }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 20, color: t.text }}>
            Vamos criar sua loja
          </div>
          <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
            Esse é o nome que identifica você dentro do Arco. Precisa ser exclusivo — algo como o nome da sua clínica pessoal ou como você é conhecida profissionalmente.
          </div>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Nome da sua loja / consultório">
            <input style={inputStyle} value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Dra. Ana Silva Odontologia" autoFocus />
          </Field>
          {error && <div style={{ fontSize: 12.5, color: t.danger }}>{error}</div>}
          <Button type="submit" disabled={loading} style={{ justifyContent: "center" }}>
            {loading ? "Criando..." : "Continuar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
