import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Wallet, AlertTriangle, ListChecks } from "lucide-react";
import { useTheme } from "../theme.js";
import { Card, ClinicAvatar, clinicColor, greetingNow, formatCurrency, formatDate, effectiveStatus } from "../components/ui.jsx";

function Tip({ active, payload, t }) {
  if (!active || !payload?.[0]) return null;
  const p = payload[0];
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 12px", boxShadow: t.shadow }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: p.payload.fill }}>{formatCurrency(p.value)}</div>
    </div>
  );
}

export default function Dashboard({ clinicas, lancamentos, nickname }) {
  const t = useTheme();

  const m = useMemo(() => {
    let recebido = 0, aReceber = 0, atrasado = 0, nAtrasado = 0;
    for (const l of lancamentos) {
      const st = effectiveStatus(l); const v = Number(l.valor) || 0;
      if (st === "Pago") recebido += v;
      else if (st === "A receber") aReceber += v;
      else { atrasado += v; nAtrasado++; }
    }
    return { recebido, aReceber, atrasado, nAtrasado };
  }, [lancamentos]);

  const porClinica = useMemo(() => clinicas.map((c, i) => {
    const items = lancamentos.filter(l => l.clinica_id === c.id);
    const total = items.reduce((s, l) => s + (Number(l.valor) || 0), 0);
    const recebido = items.filter(l => effectiveStatus(l) === "Pago").reduce((s, l) => s + (Number(l.valor) || 0), 0);
    const aReceber = items.filter(l => effectiveStatus(l) === "A receber").reduce((s, l) => s + (Number(l.valor) || 0), 0);
    const atrasado = items.filter(l => effectiveStatus(l) === "Atrasado").reduce((s, l) => s + (Number(l.valor) || 0), 0);
    return { clinica: c, total, recebido, aReceber, atrasado, count: items.length, color: clinicColor(i) };
  }), [clinicas, lancamentos]);

  const donut = useMemo(() => porClinica.filter(p => p.total > 0).map(p => ({ name: p.clinica.nome, value: p.total, fill: p.color })), [porClinica]);
  const atrasados = lancamentos.filter(l => effectiveStatus(l) === "Atrasado").sort((a, b) => (a.data_prevista < b.data_prevista ? -1 : 1));
  const totals = porClinica.reduce((a, p) => ({ recebido: a.recebido + p.recebido, aReceber: a.aReceber + p.aReceber, atrasado: a.atrasado + p.atrasado }), { recebido: 0, aReceber: 0, atrasado: 0 });

  return (
    <div>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.primary}CC)`, borderRadius: 20, padding: "24px 28px", color: "#fff", marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 2 }}>{greetingNow()}{nickname ? "," : ""}</div>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>{nickname || "Dashboard"}</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Total a receber</div>
          <div style={{ fontWeight: 800, fontSize: 34, marginBottom: 16 }}>{formatCurrency(m.aReceber + m.atrasado)}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { icon: Wallet, label: "Recebido", val: formatCurrency(m.recebido) },
              { icon: AlertTriangle, label: "Atrasado", val: formatCurrency(m.atrasado), iconColor: "#FECACA" },
              { icon: ListChecks, label: "Em atraso", val: m.nAtrasado },
            ].map((chip, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <chip.icon size={14} color={chip.iconColor || "#fff"} />
                <div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>{chip.label}</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{chip.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Distribuição por clínica</div>
          {porClinica.length === 0 ? <div style={{ fontSize: 13, color: t.textMuted }}>Cadastre uma clínica para ver o comparativo.</div> : (
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ width: 120, height: 120, flexShrink: 0 }}>
                <ResponsiveContainer><PieChart><Pie data={donut} dataKey="value" nameKey="name" innerRadius={36} outerRadius={56} paddingAngle={donut.length > 1 ? 3 : 0} strokeWidth={0}>{donut.map((d, i) => <Cell key={i} fill={d.fill} />)}</Pie><Tooltip content={<Tip t={t} />} /></PieChart></ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {porClinica.map(p => (
                  <div key={p.clinica.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ClinicAvatar nome={p.clinica.nome} color={p.color} size={24} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.clinica.nome}</span>
                    <span style={{ fontSize: 13, color: t.textMuted, fontWeight: 600 }}>{formatCurrency(p.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Pagamentos em atraso</div>
          {atrasados.length === 0 ? <div style={{ fontSize: 13, color: t.textMuted }}>Nenhum atraso no momento.</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {atrasados.slice(0, 5).map(l => {
                const idx = clinicas.findIndex(c => c.id === l.clinica_id);
                const c = clinicas[idx];
                return (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${t.border}` }}>
                    <ClinicAvatar nome={c?.nome || "?"} color={idx >= 0 ? clinicColor(idx) : t.textMuted} size={28} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{c?.nome || "Removida"}</div>
                      <div style={{ fontSize: 12, color: t.textMuted }}>previsto {formatDate(l.data_prevista)}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: t.danger }}>{formatCurrency(l.valor)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Resumo gerencial */}
      <Card>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Resumo por clínica</div>
        <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 16 }}>Quanto você recebeu, tem a receber e está atrasado.</div>
        {porClinica.length === 0 ? <div style={{ fontSize: 13, color: t.textMuted }}>Nenhuma clínica cadastrada.</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {porClinica.map(p => (
              <div key={p.clinica.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: t.surfaceAlt, flexWrap: "wrap" }}>
                <ClinicAvatar nome={p.clinica.nome} color={p.color} size={32} />
                <div style={{ flex: "1 1 120px" }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.clinica.nome}</div>
                  <div style={{ fontSize: 12, color: t.textMuted }}>{p.count} lançamento{p.count !== 1 ? "s" : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <div><div style={{ fontSize: 12, color: t.textMuted }}>Recebido</div><div style={{ fontWeight: 600, fontSize: 14, color: t.success }}>{formatCurrency(p.recebido)}</div></div>
                  <div><div style={{ fontSize: 12, color: t.textMuted }}>A receber</div><div style={{ fontWeight: 600, fontSize: 14, color: t.gold }}>{formatCurrency(p.aReceber)}</div></div>
                  <div><div style={{ fontSize: 12, color: t.textMuted }}>Atrasado</div><div style={{ fontWeight: 600, fontSize: 14, color: p.atrasado > 0 ? t.danger : t.textMuted }}>{formatCurrency(p.atrasado)}</div></div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, border: `1px solid ${t.border}`, marginTop: 4 }}>
              <div style={{ flex: "1 1 120px", fontWeight: 600, fontSize: 13 }}>Total geral</div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <div><div style={{ fontSize: 12, color: t.textMuted }}>Recebido</div><div style={{ fontWeight: 600, fontSize: 14, color: t.success }}>{formatCurrency(totals.recebido)}</div></div>
                <div><div style={{ fontSize: 12, color: t.textMuted }}>A receber</div><div style={{ fontWeight: 600, fontSize: 14, color: t.gold }}>{formatCurrency(totals.aReceber)}</div></div>
                <div><div style={{ fontSize: 12, color: t.textMuted }}>Atrasado</div><div style={{ fontWeight: 600, fontSize: 14, color: totals.atrasado > 0 ? t.danger : t.textMuted }}>{formatCurrency(totals.atrasado)}</div></div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
