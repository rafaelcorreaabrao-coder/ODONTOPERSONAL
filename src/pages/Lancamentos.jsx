import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Receipt, MoreHorizontal } from "lucide-react";
import { supabase } from "../supabaseClient.js";
import { useTheme } from "../theme.js";
import { Card, PageHeader, Field, Button, Badge, useInputStyle, formatCurrency, formatDate, todayISO, effectiveStatus, nextPaymentDate, ClinicAvatar, clinicColor, EmptyState, FilterPills } from "../components/ui.jsx";

export default function Lancamentos({ userId, clinicas, lancamentos, onChanged, toast }) {
  const t = useTheme();
  const inputStyle = useInputStyle();
  const [form, setForm] = useState(null);
  const [filtro, setFiltro] = useState("Todos");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  function blank() {
    const clinic = clinicas[0]; const atendimento = todayISO();
    return { id: null, data_atendimento: atendimento, clinica_id: clinic?.id || "", procedimento: "", valor: "", data_prevista: clinic ? nextPaymentDate(clinic, atendimento) : atendimento, pago: false, data_pagamento: "", obs: "" };
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.clinica_id || !form.valor) return;
    setSaving(true); setError("");
    const payload = { clinica_id: form.clinica_id, data_atendimento: form.data_atendimento, procedimento: form.procedimento, valor: Number(form.valor) || 0, data_prevista: form.data_prevista, pago: form.pago, data_pagamento: form.pago ? (form.data_pagamento || todayISO()) : null, obs: form.obs };
    const { error: err } = form.id ? await supabase.from("lancamentos").update(payload).eq("id", form.id) : await supabase.from("lancamentos").insert({ ...payload, user_id: userId });
    setSaving(false);
    if (err) setError(err.message);
    else { setForm(null); onChanged(); toast?.(form.id ? "Lançamento atualizado" : "Lançamento adicionado"); }
  }

  async function remove(id) { if (!window.confirm("Remover este lançamento?")) return; const { error: e } = await supabase.from("lancamentos").delete().eq("id", id); if (e) setError(e.message); else { onChanged(); toast?.("Lançamento removido"); } }
  async function togglePago(l) { const np = !l.pago; const { error: e } = await supabase.from("lancamentos").update({ pago: np, data_pagamento: np ? todayISO() : null }).eq("id", l.id); if (e) setError(e.message); else { onChanged(); toast?.(np ? "Marcado como pago" : "Desmarcado"); } }

  const visiveis = lancamentos.filter(l => filtro === "Todos" || effectiveStatus(l) === filtro).sort((a, b) => (a.data_prevista < b.data_prevista ? 1 : -1));

  return (
    <div>
      <PageHeader title="Lançamentos" subtitle="Cada atendimento e o que falta receber." icon={Receipt}
        action={!form && <Button onClick={() => setForm(blank())} disabled={!clinicas.length} icon={<Plus size={14} />}>Novo lançamento</Button>} />

      {error && <Card variant="flat" style={{ marginBottom: 16 }}><div style={{ color: t.danger, fontSize: 13 }}>{error}</div></Card>}
      {!clinicas.length && <Card variant="flat" style={{ marginBottom: 16 }}><div style={{ fontSize: 13, color: t.textMuted }}>Cadastre uma clínica primeiro.</div></Card>}

      {form && (
        <Card style={{ marginBottom: 20 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 160px" }}><Field label="Clínica"><select style={inputStyle} value={form.clinica_id} onChange={e => { const c = clinicas.find(x => x.id === e.target.value); setForm({ ...form, clinica_id: e.target.value, data_prevista: c ? nextPaymentDate(c, form.data_atendimento) : form.data_prevista }); }}>{clinicas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></Field></div>
              <div style={{ flex: "1 1 180px" }}><Field label="Procedimento"><input style={inputStyle} value={form.procedimento} onChange={e => setForm({ ...form, procedimento: e.target.value })} placeholder="Restauração" /></Field></div>
              <div style={{ flex: "1 1 120px" }}><Field label="Valor (R$)"><input type="number" min="0" step="0.01" style={inputStyle} value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></Field></div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 140px" }}><Field label="Atendimento"><input type="date" style={inputStyle} value={form.data_atendimento} onChange={e => { const c = clinicas.find(x => x.id === form.clinica_id); setForm({ ...form, data_atendimento: e.target.value, data_prevista: c ? nextPaymentDate(c, e.target.value) : form.data_prevista }); }} /></Field></div>
              <div style={{ flex: "1 1 140px" }}><Field label="Pagamento previsto" hint="Calculada automaticamente"><input type="date" style={inputStyle} value={form.data_prevista} onChange={e => setForm({ ...form, data_prevista: e.target.value })} /></Field></div>
              <div style={{ flex: "1 1 140px" }}><Field label="Status"><select style={inputStyle} value={form.pago ? "sim" : "nao"} onChange={e => setForm({ ...form, pago: e.target.value === "sim", data_pagamento: e.target.value === "sim" ? (form.data_pagamento || todayISO()) : "" })}><option value="nao">Ainda não</option><option value="sim">Já recebi</option></select></Field></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button type="submit" loading={saving} icon={<Check size={14} />}>{form.id ? "Salvar" : "Adicionar"}</Button>
              <Button variant="ghost" onClick={() => setForm(null)} icon={<X size={14} />}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}

      <FilterPills options={["Todos", "A receber", "Pago", "Atrasado"]} value={filtro} onChange={setFiltro} />

      {visiveis.length === 0 ? <EmptyState icon={Receipt} title="Nenhum lançamento" description={filtro !== "Todos" ? `Nenhum lançamento com status "${filtro}".` : "Comece lançando seus atendimentos."} /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {visiveis.map(l => {
            const idx = clinicas.findIndex(c => c.id === l.clinica_id); const c = clinicas[idx]; const st = effectiveStatus(l);
            return (
              <Card key={l.id} variant="flat" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flex: "1 1 200px", minWidth: 0, flexWrap: "wrap" }}>
                  <ClinicAvatar nome={c?.nome || "?"} color={idx >= 0 ? clinicColor(idx) : t.textMuted} size={30} />
                  <Badge status={st} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c?.nome || "Removida"} {l.procedimento && `· ${l.procedimento}`}</div>
                    <div style={{ fontSize: 12, color: t.textMuted }}>atendido {formatDate(l.data_atendimento)} · previsto {formatDate(l.data_prevista)}{l.pago && ` · pago ${formatDate(l.data_pagamento)}`}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>{formatCurrency(l.valor)}</div>
                  <Button variant={l.pago ? "ghost" : "secondary"} onClick={() => togglePago(l)} style={{ fontSize: 12, padding: "5px 10px" }}>{l.pago ? "Desfazer" : "Pagar"}</Button>
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setOpenMenu(openMenu === l.id ? null : l.id)} style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 6, padding: "4px 6px", cursor: "pointer", display: "flex", color: t.textMuted }}><MoreHorizontal size={16} /></button>
                    {openMenu === l.id && (
                      <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 10, minWidth: 140, padding: 4 }}>
                        <button onClick={() => { setForm({ ...l, valor: String(l.valor) }); setOpenMenu(null); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, borderRadius: 6, color: t.text }}><Pencil size={13} /> Editar</button>
                        <button onClick={() => { remove(l.id); setOpenMenu(null); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, borderRadius: 6, color: t.danger }}><Trash2 size={13} /> Remover</button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
