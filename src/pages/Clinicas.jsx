import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Building2 } from "lucide-react";
import { supabase } from "../supabaseClient.js";
import { useTheme } from "../theme.js";
import { Card, PageHeader, Field, Button, useInputStyle, DIAS_SEMANA, describePagamento, ClinicAvatar, clinicColor, EmptyState } from "../components/ui.jsx";

const REGIMES = ["Semanal", "Quinzenal", "Mensal", "Por procedimento", "Outro"];

export default function Clinicas({ userId, clinicas, lancamentos, onChanged, toast }) {
  const t = useTheme();
  const inputStyle = useInputStyle();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startNew() { setForm({ id: null, nome: "", regime: REGIMES[0], dia_semana: "5", dia_mes_1: "", dia_mes_2: "", prazo_dias: "", dia_pagamento: "", contato: "", obs: "" }); }
  function startEdit(c) { setForm({ dia_semana: "5", dia_mes_1: "", dia_mes_2: "", prazo_dias: "", dia_pagamento: "", ...c }); }
  async function remove(id) {
    if (lancamentos.some(l => l.clinica_id === id) && !window.confirm("Essa clínica tem lançamentos. Remover mesmo assim?")) return;
    const { error: e } = await supabase.from("clinicas").delete().eq("id", id);
    if (e) setError(e.message); else { onChanged(); toast?.("Clínica removida"); }
  }
  async function submit(e) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    setSaving(true); setError("");
    const payload = {
      nome: form.nome, regime: form.regime, dia_pagamento: form.dia_pagamento || "",
      dia_semana: form.regime === "Semanal" ? Number(form.dia_semana) : null,
      dia_mes_1: ["Mensal", "Quinzenal"].includes(form.regime) ? Number(form.dia_mes_1) || null : null,
      dia_mes_2: form.regime === "Quinzenal" ? Number(form.dia_mes_2) || null : null,
      prazo_dias: form.regime === "Por procedimento" ? Number(form.prazo_dias) || null : null,
      contato: form.contato, obs: form.obs,
    };
    const { error: err } = form.id
      ? await supabase.from("clinicas").update(payload).eq("id", form.id)
      : await supabase.from("clinicas").insert({ ...payload, user_id: userId });
    setSaving(false);
    if (err) setError(err.message);
    else { setForm(null); onChanged(); toast?.(form.id ? "Clínica atualizada" : "Clínica adicionada"); }
  }

  return (
    <div>
      <PageHeader title="Clínicas" subtitle="Onde você atende e como cada uma paga." icon={Building2}
        action={!form && <Button onClick={startNew} icon={<Plus size={15} />}>Nova clínica</Button>} />

      {error && <Card variant="flat" style={{ marginBottom: 16, borderColor: t.danger }}><div style={{ color: t.danger, fontSize: 13 }}>{error}</div></Card>}

      {form && (
        <Card style={{ marginBottom: 20 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 200px" }}><Field label="Nome da clínica"><input style={inputStyle} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Clínica Sorriso" autoFocus /></Field></div>
              <div style={{ flex: "1 1 160px" }}><Field label="Regime"><select style={inputStyle} value={form.regime} onChange={e => setForm({ ...form, regime: e.target.value })}>{REGIMES.map(r => <option key={r}>{r}</option>)}</select></Field></div>
              {form.regime === "Semanal" && <div style={{ flex: "1 1 160px" }}><Field label="Dia da semana"><select style={inputStyle} value={form.dia_semana} onChange={e => setForm({ ...form, dia_semana: e.target.value })}>{DIAS_SEMANA.map((d, i) => <option key={i} value={i}>{d}</option>)}</select></Field></div>}
              {form.regime === "Mensal" && <div style={{ flex: "1 1 120px" }}><Field label="Dia do mês"><input type="number" min="1" max="31" style={inputStyle} value={form.dia_mes_1} onChange={e => setForm({ ...form, dia_mes_1: e.target.value })} placeholder="5" /></Field></div>}
              {form.regime === "Quinzenal" && <><div style={{ flex: "1 1 100px" }}><Field label="1º dia"><input type="number" min="1" max="31" style={inputStyle} value={form.dia_mes_1} onChange={e => setForm({ ...form, dia_mes_1: e.target.value })} placeholder="5" /></Field></div><div style={{ flex: "1 1 100px" }}><Field label="2º dia"><input type="number" min="1" max="31" style={inputStyle} value={form.dia_mes_2} onChange={e => setForm({ ...form, dia_mes_2: e.target.value })} placeholder="20" /></Field></div></>}
              {form.regime === "Por procedimento" && <div style={{ flex: "1 1 160px" }}><Field label="Dias após atendimento"><input type="number" min="0" style={inputStyle} value={form.prazo_dias} onChange={e => setForm({ ...form, prazo_dias: e.target.value })} placeholder="7" /></Field></div>}
              {form.regime === "Outro" && <div style={{ flex: "1 1 160px" }}><Field label="Dia(s) de pagamento"><input style={inputStyle} value={form.dia_pagamento} onChange={e => setForm({ ...form, dia_pagamento: e.target.value })} /></Field></div>}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 180px" }}><Field label="Contato"><input style={inputStyle} value={form.contato} onChange={e => setForm({ ...form, contato: e.target.value })} /></Field></div>
              <div style={{ flex: "2 1 240px" }}><Field label="Observações"><input style={inputStyle} value={form.obs} onChange={e => setForm({ ...form, obs: e.target.value })} /></Field></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button type="submit" loading={saving} icon={<Check size={14} />}>{form.id ? "Salvar" : "Adicionar"}</Button>
              <Button variant="ghost" onClick={() => setForm(null)} icon={<X size={14} />}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}

      {clinicas.length === 0 && !form && <EmptyState icon={Building2} title="Nenhuma clínica cadastrada" description="Comece adicionando a primeira clínica onde você atende." action={<Button onClick={startNew} icon={<Plus size={14} />}>Nova clínica</Button>} />}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {clinicas.map((c, i) => (
          <Card key={c.id} variant="flat" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ClinicAvatar nome={c.nome} color={clinicColor(i)} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.nome}</div>
                <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{c.regime} · {describePagamento(c)} {c.contato && `· ${c.contato}`}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Button variant="ghost" onClick={() => startEdit(c)} icon={<Pencil size={13} />}>Editar</Button>
              <Button variant="danger" onClick={() => remove(c.id)} icon={<Trash2 size={13} />}>Remover</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
