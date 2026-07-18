import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { supabase } from "../supabaseClient.js";
import { useTheme } from "../theme.js";
import { Card, PageHeader, Field, Button, useInputStyle, DIAS_SEMANA, describePagamento, ClinicAvatar, clinicColor } from "../components/ui.jsx";

const REGIMES = ["Semanal", "Quinzenal", "Mensal", "Por procedimento", "Outro"];

export default function Clinicas({ userId, clinicas, lancamentos, onChanged }) {
  const t = useTheme();
  const inputStyle = useInputStyle();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startNew() {
    setForm({ id: null, nome: "", regime: REGIMES[0], dia_semana: "5", dia_mes_1: "", dia_mes_2: "", prazo_dias: "", dia_pagamento: "", contato: "", obs: "" });
  }
  function startEdit(c) {
    setForm({ dia_semana: "5", dia_mes_1: "", dia_mes_2: "", prazo_dias: "", dia_pagamento: "", ...c });
  }

  async function remove(id) {
    if (lancamentos.some((l) => l.clinica_id === id)) {
      if (!window.confirm("Essa clínica tem lançamentos associados. Remover mesmo assim? Os lançamentos continuam, mas ficam sem clínica vinculada.")) return;
    }
    const { error: delError } = await supabase.from("clinicas").delete().eq("id", id);
    if (delError) setError(delError.message);
    else onChanged();
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    setSaving(true);
    setError("");

    const payload = {
      nome: form.nome,
      regime: form.regime,
      dia_pagamento: form.dia_pagamento || "",
      dia_semana: form.regime === "Semanal" ? Number(form.dia_semana) : null,
      dia_mes_1: form.regime === "Mensal" || form.regime === "Quinzenal" ? Number(form.dia_mes_1) || null : null,
      dia_mes_2: form.regime === "Quinzenal" ? Number(form.dia_mes_2) || null : null,
      prazo_dias: form.regime === "Por procedimento" ? Number(form.prazo_dias) || null : null,
      contato: form.contato,
      obs: form.obs,
    };

    if (form.id) {
      const { error: updError } = await supabase.from("clinicas").update(payload).eq("id", form.id);
      if (updError) setError(updError.message);
    } else {
      const { error: insError } = await supabase.from("clinicas").insert({ ...payload, user_id: userId });
      if (insError) setError(insError.message);
    }

    setSaving(false);
    if (!error) {
      setForm(null);
      onChanged();
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
        <PageHeader title="Clínicas" subtitle="Onde você atende e como cada uma paga." />
        {!form && <Button onClick={startNew} icon={<Plus size={15} />}>Nova clínica</Button>}
      </div>

      {error && (
        <Card style={{ marginBottom: 16, borderColor: t.danger }}>
          <div style={{ color: t.danger, fontSize: 13 }}>{error}</div>
        </Card>
      )}

      {form && (
        <Card style={{ marginBottom: 22 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 220px" }}>
                <Field label="Nome da clínica">
                  <input style={inputStyle} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Clínica Sorriso" autoFocus />
                </Field>
              </div>
              <div style={{ flex: "1 1 160px" }}>
                <Field label="Regime de pagamento">
                  <select style={inputStyle} value={form.regime} onChange={(e) => setForm({ ...form, regime: e.target.value })}>
                    {REGIMES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>
              </div>

              {form.regime === "Semanal" && (
                <div style={{ flex: "1 1 180px" }}>
                  <Field label="Dia da semana do pagamento">
                    <select style={inputStyle} value={form.dia_semana} onChange={(e) => setForm({ ...form, dia_semana: e.target.value })}>
                      {DIAS_SEMANA.map((d, i) => <option key={d} value={i}>{d}</option>)}
                    </select>
                  </Field>
                </div>
              )}

              {form.regime === "Mensal" && (
                <div style={{ flex: "1 1 140px" }}>
                  <Field label="Dia do mês (1-31)">
                    <input type="number" min="1" max="31" style={inputStyle} value={form.dia_mes_1} onChange={(e) => setForm({ ...form, dia_mes_1: e.target.value })} placeholder="ex: 5" />
                  </Field>
                </div>
              )}

              {form.regime === "Quinzenal" && (
                <>
                  <div style={{ flex: "1 1 120px" }}>
                    <Field label="1º dia do mês">
                      <input type="number" min="1" max="31" style={inputStyle} value={form.dia_mes_1} onChange={(e) => setForm({ ...form, dia_mes_1: e.target.value })} placeholder="ex: 5" />
                    </Field>
                  </div>
                  <div style={{ flex: "1 1 120px" }}>
                    <Field label="2º dia do mês">
                      <input type="number" min="1" max="31" style={inputStyle} value={form.dia_mes_2} onChange={(e) => setForm({ ...form, dia_mes_2: e.target.value })} placeholder="ex: 20" />
                    </Field>
                  </div>
                </>
              )}

              {form.regime === "Por procedimento" && (
                <div style={{ flex: "1 1 180px" }}>
                  <Field label="Dias após o atendimento">
                    <input type="number" min="0" style={inputStyle} value={form.prazo_dias} onChange={(e) => setForm({ ...form, prazo_dias: e.target.value })} placeholder="ex: 7" />
                  </Field>
                </div>
              )}

              {form.regime === "Outro" && (
                <div style={{ flex: "1 1 180px" }}>
                  <Field label="Dia(s) de pagamento (texto livre)">
                    <input style={inputStyle} value={form.dia_pagamento} onChange={(e) => setForm({ ...form, dia_pagamento: e.target.value })} placeholder="ex: combinar a cada mês" />
                  </Field>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 200px" }}>
                <Field label="Contato">
                  <input style={inputStyle} value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} placeholder="telefone ou e-mail" />
                </Field>
              </div>
              <div style={{ flex: "2 1 280px" }}>
                <Field label="Observações">
                  <input style={inputStyle} value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} placeholder="opcional" />
                </Field>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Button type="submit" disabled={saving} icon={<Check size={15} />}>{saving ? "Salvando..." : form.id ? "Salvar alterações" : "Adicionar clínica"}</Button>
              <Button variant="ghost" onClick={() => setForm(null)} icon={<X size={15} />}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}

      {clinicas.length === 0 && !form && (
        <Card><div style={{ fontSize: 14, color: t.textMuted }}>Nenhuma clínica cadastrada ainda. Comece adicionando a primeira.</div></Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {clinicas.map((c, i) => (
          <Card key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ClinicAvatar nome={c.nome} color={clinicColor(i)} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{c.nome}</div>
                <div style={{ fontSize: 12.5, color: t.textMuted, marginTop: 2 }}>
                  {c.regime} · {describePagamento(c)} {c.contato && `· ${c.contato}`}
                </div>
                {c.obs && <div style={{ fontSize: 12.5, color: t.textMuted, marginTop: 2 }}>{c.obs}</div>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="ghost" onClick={() => startEdit(c)} icon={<Pencil size={14} />}>Editar</Button>
              <Button variant="danger" onClick={() => remove(c.id)} icon={<Trash2 size={14} />}>Remover</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
