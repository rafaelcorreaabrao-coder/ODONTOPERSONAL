import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Wallet, Clock, AlertTriangle, ListChecks } from "lucide-react";
import { useTheme } from "../theme.js";
import { Card, PageHeader, MetricCard, ClinicAvatar, clinicColor, greetingNow, formatCurrency, formatDate, effectiveStatus } from "../components/ui.jsx";

function DonutTooltip({ active, payload, t }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 12px", boxShadow: t.shadow }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
      <div style={{ fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", color: p.payload.fill }}>{formatCurrency(p.value)}</div>
    </div>
  );
}

export default function Dashboard({ clinicas, lancamentos, nickname }) {
  const t = useTheme();

  const metrics = useMemo(() => {
    let recebido = 0, aReceber = 0, atrasado = 0, nAtrasado = 0;
    for (const l of lancamentos) {
      const st = effectiveStatus(l);
      const v = Number(l.valor) || 0;
      if (st === "Pago") recebido += v;
      else if (st === "A receber") aReceber += v;
      else { atrasado += v; nAtrasado += 1; }
    }
    return { recebido, aReceber, atrasado, nAtrasado };
  }, [lancamentos]);

  const porClinica = useMemo(() => {
    return clinicas.map((c, i) => {
      const items = lancamentos.filter((l) => l.clinica_id === c.id);
      const total = items.reduce((s, l) => s + (Number(l.valor) || 0), 0);
      const recebido = items.filter((l) => effectiveStatus(l) === "Pago").reduce((s, l) => s + (Number(l.valor) || 0), 0);
      const aReceber = items.filter((l) => effectiveStatus(l) === "A receber").reduce((s, l) => s + (Number(l.valor) || 0), 0);
      const atrasado = items.filter((l) => effectiveStatus(l) === "Atrasado").reduce((s, l) => s + (Number(l.valor) || 0), 0);
      return { clinica: c, total, recebido, aReceber, atrasado, count: items.length, color: clinicColor(i) };
    });
  }, [clinicas, lancamentos]);

  const donutData = useMemo(
    () => porClinica.filter((p) => p.total > 0).map((p) => ({ name: p.clinica.nome, value: p.total, fill: p.color })),
    [porClinica]
  );

  const atrasados = lancamentos
    .filter((l) => effectiveStatus(l) === "Atrasado")
    .sort((a, b) => (a.data_prevista < b.data_prevista ? -1 : 1));

  const totals = porClinica.reduce(
    (acc, p) => ({
      recebido: acc.recebido + p.recebido,
      aReceber: acc.aReceber + p.aReceber,
      atrasado: acc.atrasado + p.atrasado,
      total: acc.total + p.total,
    }),
    { recebido: 0, aReceber: 0, atrasado: 0, total: 0 }
  );

  const th = { textAlign: "right", fontSize: 11.5, fontWeight: 600, color: t.textMuted, padding: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.03em" };
  const td = { textAlign: "right", fontSize: 13.5, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "10px 0" };

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 13.5, color: t.textMuted, marginBottom: 2 }}>{greetingNow()}{nickname ? "," : ""}</div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 25, margin: 0, color: t.text }}>
          {nickname || "Dashboard"} 👋
        </h1>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
        <MetricCard label="Recebido" value={formatCurrency(metrics.recebido)} tone="success" icon={Wallet} />
        <MetricCard label="A receber" value={formatCurrency(metrics.aReceber)} tone="accent" icon={Clock} />
        <MetricCard label="Atrasado" value={formatCurrency(metrics.atrasado)} tone="danger" icon={AlertTriangle} />
        <MetricCard label="Lançamentos atrasados" value={String(metrics.nAtrasado)} tone="danger" icon={ListChecks} />
      </div>

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
        <Card style={{ flex: "1 1 340px" }}>
          <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 14.5 }}>Por clínica</div>
          {porClinica.length === 0 ? (
            <div style={{ fontSize: 13.5, color: t.textMuted }}>Cadastre uma clínica para ver o comparativo aqui.</div>
          ) : (
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ width: 140, height: 140, flexShrink: 0 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={64} paddingAngle={donutData.length > 1 ? 3 : 0} strokeWidth={0}>
                      {donutData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip content={<DonutTooltip t={t} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: "1 1 160px", display: "flex", flexDirection: "column", gap: 10 }}>
                {porClinica.map((p) => (
                  <div key={p.clinica.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <ClinicAvatar nome={p.clinica.nome} color={p.color} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.clinica.nome}</div>
                    </div>
                    <div style={{ fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", color: t.textMuted, whiteSpace: "nowrap" }}>{formatCurrency(p.total)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card style={{ flex: "1 1 300px" }}>
          <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 14.5 }}>Atenção: pagamentos em atraso</div>
          {atrasados.length === 0 && <div style={{ fontSize: 13.5, color: t.textMuted }}>Nada atrasado por aqui.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {atrasados.slice(0, 6).map((l) => {
              const idx = clinicas.findIndex((c) => c.id === l.clinica_id);
              const c = clinicas[idx];
              return (
                <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${t.border}`, paddingBottom: 8 }}>
                  <ClinicAvatar nome={c ? c.nome : "?"} color={idx >= 0 ? clinicColor(idx) : t.textMuted} size={26} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c ? c.nome : "Clínica removida"}</div>
                    <div style={{ color: t.textMuted, fontSize: 11.5 }}>previsto {formatDate(l.data_prevista)}</div>
                  </div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: t.danger, fontWeight: 700, fontSize: 13.5 }}>{formatCurrency(l.valor)}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 18 }}>
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14.5 }}>Resumo gerencial por clínica</div>
          <div style={{ fontSize: 12.5, color: t.textMuted, marginBottom: 14 }}>
            Quanto você recebeu, tem a receber e está atrasado, clínica por clínica.
          </div>
          {porClinica.length === 0 ? (
            <div style={{ fontSize: 13.5, color: t.textMuted }}>Cadastre uma clínica para ver o resumo aqui.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                    <th style={{ textAlign: "left", fontSize: 11.5, fontWeight: 600, color: t.textMuted, padding: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Clínica</th>
                    <th style={th}>Recebido</th>
                    <th style={th}>A receber</th>
                    <th style={th}>Atrasado</th>
                    <th style={th}>Total previsto</th>
                  </tr>
                </thead>
                <tbody>
                  {porClinica.map((p) => (
                    <tr key={p.clinica.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                      <td style={{ padding: "10px 0", fontSize: 13.5, fontWeight: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <ClinicAvatar nome={p.clinica.nome} color={p.color} size={22} />
                          {p.clinica.nome}
                          <span style={{ fontWeight: 400, color: t.textMuted, fontSize: 12 }}>{p.count} lançamento{p.count === 1 ? "" : "s"}</span>
                        </div>
                      </td>
                      <td style={{ ...td, color: t.success }}>{formatCurrency(p.recebido)}</td>
                      <td style={{ ...td, color: t.gold }}>{formatCurrency(p.aReceber)}</td>
                      <td style={{ ...td, color: p.atrasado > 0 ? t.danger : t.textMuted }}>{formatCurrency(p.atrasado)}</td>
                      <td style={{ ...td, fontWeight: 500 }}>{formatCurrency(p.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ padding: "12px 0 0", fontSize: 13.5, fontWeight: 600 }}>Total geral</td>
                    <td style={{ ...td, padding: "12px 0 0", color: t.success, fontWeight: 600 }}>{formatCurrency(totals.recebido)}</td>
                    <td style={{ ...td, padding: "12px 0 0", color: t.gold, fontWeight: 600 }}>{formatCurrency(totals.aReceber)}</td>
                    <td style={{ ...td, padding: "12px 0 0", color: totals.atrasado > 0 ? t.danger : t.textMuted, fontWeight: 600 }}>{formatCurrency(totals.atrasado)}</td>
                    <td style={{ ...td, padding: "12px 0 0", fontWeight: 600 }}>{formatCurrency(totals.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
