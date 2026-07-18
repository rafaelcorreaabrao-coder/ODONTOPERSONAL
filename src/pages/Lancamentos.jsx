import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { supabase } from "../supabaseClient.js";
import { useTheme } from "../theme.js";
import { Card, PageHeader, Field, Button, Badge, useInputStyle, formatCurrency, formatDate, todayISO, effectiveStatus, nextPaymentDate, ClinicAvatar, clinicColor } from "../components/ui.jsx";

export default function Lancamentos({ userId, clinicas, lancamentos, onChanged }) {
  const t = useTheme();
  const inputStyle = useInputStyle();
  const [form, setForm] = useState(null);
  const [filtro, setFiltro] = useState("Todos");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function blank() {
    const clinic = clinicas[0];
    const atendimento = todayISO();
    return {
      id: null,
      data_atendimento: atendimento,
      clinica_id: clinic?.id || "",
      procedimento: "",
      valor: "",
      data_prevista: clinic ? nextPaymentDate(clinic, atendimento) : atendimento,
      pago: false,
      data_pagamento: "",
      obs: "",
    };
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.clinica_id || !form.valor) return;
    setSaving(true);
    setError("");
    const payload = {
      clinica_id: form.clinica_id,
      data_atendimento: form.data_atendimento,
      procedimento: form.procedimento,
      valor: Number(form.valor) || 0,
      data_prevista: form.data_prevista,
      pago: form.pago,
      data_pagamento: form.pago ? (form.data_pagamento || todayISO()) : null,
      obs: form.obs,
    };

    if (form.id) {
      const { error: updError } = await supabase.from("lancamentos").update(payload).eq("id", form.id);
      if (updError) setError(updError.message);
    } else {
      const { error: insError } = await supabase.from("lancamentos").insert({ ...payload, user_id: userId });
      if (insError) setError(insError.message);
    }

    setSaving(false);
    if (!error) {
      setForm(null);
      onChanged();
    }
  }

  async function remove(id) {
    if (!window.confirm("Remover este lançamento?")) return;
    const { error: delError } = await supabase.from("lancamentos").delete().eq("id", id);
    if (delError) setError(delError.message);
    else onChanged();
  }

  async function togglePago(l) {
    const nextPago = !l.pago;
    const { error: updError } = await supabase
      .from("lancamentos")
      .update({ pago: nextPago, data_pagamento: nextPago ? todayISO() : null })
      .eq("id", l.id);
    if (updError) setError(updError.message);
    else onChanged();
  }

  const visiveis = lancamentos
    .filter((l) => (filtro === "Todos" ? true : effectiveStatus(l) === filtro))
    .sort((a, b) => (a.data_prevista < b.data_prevista ? 1 : -1));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
        <PageHeader title="Lançamentos" subtitle="Cada atendimento e o que falta receber por ele." />
        {!form && (
          <Button onClick={() => setForm(blank())} disabled={clinicas.length === 0} icon={<Plus size={15} />}>Novo lançamento</Button>
        )}
      </div>

      {error && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ color: t.danger, fontSize: 13 }}>{error}</div>
        </Card>
      )}

      {clinicas.length === 0 && (
        <Card style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 14, color: t.textMuted }}>Cadastre uma clínica primeiro na aba "Clínicas" para poder lançar atendimentos.</div>
        </Card>
      )}

      {form && (
        <Card style={{ marginBottom: 22 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 160px" }}>
                <Field label="Clínica">
                  <select
                    style={inputStyle}
                    value={form.clinica_id}
                    onChange={(e) => {
                      const clinic = clinicas.find((c) => c.id === e.target.value);
                      setForm({
                        ...form,
                        clinica_id: e.target.value,
                        data_prevista: clinic ? nextPaymentDate(clinic, form.data_atendimento) : form.data_prevista,
                      });
                    }}
                  >
                    {clinicas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </Field>
              </div>
              <div style={{ flex: "1 1 200px" }}>
                <Field label="Paciente / procedimento">
                  <input style={inputStyle} value={form.procedimento} onChange={(e) => setForm({ ...form, procedimento: e.target.value })} placeholder="ex: Restauração" />
                </Field>
              </div>
              <div style={{ flex: "1 1 120px" }}>
                <Field label="Valor (R$)">
                  <input type="number" min="0" step="0.01" style={inputStyle} value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="0,00" />
                </Field>
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 160px" }}>
                <Field label="Data do atendimento">
                  <input
                    type="date"
                    style={inputStyle}
                    value={form.data_atendimento}
                    onChange={(e) => {
                      const clinic = clinicas.find((c) => c.id === form.clinica_id);
                      setForm({
                        ...form,
                        data_atendimento: e.target.value,
                        data_prevista: clinic ? nextPaymentDate(clinic, e.target.value) : form.data_prevista,
                      });
                    }}
                  />
                </Field>
              </div>
              <div style={{ flex: "1 1 160px" }}>
                <Field label="Data prevista de pagamento">
                  <input type="date" style={inputStyle} value={form.data_prevista} onChange={(e) => setForm({ ...form, data_prevista: e.target.value })} />
                </Field>
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>calculada pelo cadastro da clínica · edite se houver mudança</div>
              </div>
              <div style={{ flex: "1 1 160px" }}>
                <Field label="Já foi pago?">
                  <select
                    style={inputStyle}
                    value={form.pago ? "sim" : "nao"}
                    onChange={(e) => setForm({ ...form, pago: e.target.value === "sim", data_pagamento: e.target.value === "sim" ? (form.data_pagamento || todayISO()) : "" })}
                  >
                    <option value="nao">Ainda não</option>
                    <option value="sim">Sim, já recebi</option>
                  </select>
                </Field>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Button type="submit" disabled={saving} icon={<Check size={15} />}>{saving ? "Salvando..." : form.id ? "Salvar alterações" : "Adicionar lançamento"}</Button>
              <Button variant="ghost" onClick={() => setForm(null)} icon={<X size={15} />}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["Todos", "A receber", "Pago", "Atrasado"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 999,
              border: `1px solid ${filtro === f ? t.primary : t.border}`,
              background: filtro === f ? t.primary : "transparent",
              color: filtro === f ? "#fff" : t.textMuted,
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <Card><div style={{ fontSize: 14, color: t.textMuted }}>Nenhum lançamento aqui ainda.</div></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {visiveis.map((l) => {
            const idx = clinicas.findIndex((c) => c.id === l.clinica_id);
            const c = clinicas[idx];
            const st = effectiveStatus(l);
            return (
              <Card key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                  <ClinicAvatar nome={c ? c.nome : "?"} color={idx >= 0 ? clinicColor(idx) : t.textMuted} size={32} />
                  <Badge status={st} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c ? c.nome : "Clínica removida"} {l.procedimento && `· ${l.procedimento}`}</div>
                    <div style={{ fontSize: 12.5, color: t.textMuted, marginTop: 2 }}>
                      atendido {formatDate(l.data_atendimento)} · previsto {formatDate(l.data_prevista)}
                      {l.pago && ` · pago em ${formatDate(l.data_pagamento)}`}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 500 }}>{formatCurrency(l.valor)}</div>
                  <Button variant="ghost" onClick={() => togglePago(l)}>{l.pago ? "Marcar não pago" : "Marcar como pago"}</Button>
                  <Button variant="ghost" onClick={() => setForm({ ...l, valor: String(l.valor) })} icon={<Pencil size={14} />}>Editar</Button>
                  <Button variant="danger" onClick={() => remove(l.id)} icon={<Trash2 size={14} />}>Remover</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
