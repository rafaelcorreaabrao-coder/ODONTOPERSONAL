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
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {porClinica.map((p) => (
                <div
                  key={p.clinica.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                    padding: "14px 16px", borderRadius: 12, background: t.surfaceSunken,
                  }}
                >
                  <ClinicAvatar nome={p.clinica.nome} color={p.color} size={34} />
                  <div style={{ flex: "1 1 140px", minWidth: 120 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{p.clinica.nome}</div>
                    <div style={{ fontSize: 11.5, color: t.textMuted }}>{p.count} lançamento{p.count === 1 ? "" : "s"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 10.5, color: t.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>Recebido</div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14.5, color: t.success }}>{formatCurrency(p.recebido)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10.5, color: t.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>A receber</div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14.5, color: t.gold }}>{formatCurrency(p.aReceber)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10.5, color: t.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>Atrasado</div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14.5, color: p.atrasado > 0 ? t.danger : t.textMuted }}>{formatCurrency(p.atrasado)}</div>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${t.border}`, marginTop: 4 }}>
                <div style={{ flex: "1 1 140px", fontWeight: 700, fontSize: 14 }}>Total geral</div>
                <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 10.5, color: t.textMuted, fontWeight: 600, textTransform: "uppercase" }}>Recebido</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14.5, color: t.success }}>{formatCurrency(totals.recebido)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: t.textMuted, fontWeight: 600, textTransform: "uppercase" }}>A receber</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14.5, color: t.gold }}>{formatCurrency(totals.aReceber)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: t.textMuted, fontWeight: 600, textTransform: "uppercase" }}>Atrasado</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14.5, color: totals.atrasado > 0 ? t.danger : t.textMuted }}>{formatCurrency(totals.atrasado)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
