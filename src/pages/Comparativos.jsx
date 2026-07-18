import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { useTheme } from "../theme.js";
import { Card, PageHeader, formatCurrency } from "../components/ui.jsx";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DIAS_SEMANA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function CustomTooltip({ active, payload, label, t }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 12px", boxShadow: t.shadow, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", color: t.primary }}>{formatCurrency(payload[0].value)}</div>
    </div>
  );
}

export default function Comparativos({ lancamentos }) {
  const t = useTheme();

  const pagos = useMemo(() => lancamentos.filter((l) => l.pago && l.data_pagamento), [lancamentos]);

  const porMes = useMemo(() => {
    const map = {};
    for (const l of pagos) {
      const [y, m] = l.data_pagamento.split("-");
      const key = `${y}-${m}`;
      map[key] = (map[key] || 0) + (Number(l.valor) || 0);
    }
    return Object.entries(map)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-12)
      .map(([key, valor]) => {
        const [y, m] = key.split("-");
        return { mes: `${MESES[Number(m) - 1]}/${y.slice(2)}`, valor };
      });
  }, [pagos]);

  const porDiaSemana = useMemo(() => {
    const totals = [0, 0, 0, 0, 0, 0, 0];
    for (const l of pagos) {
      const d = new Date(l.data_atendimento + "T00:00:00");
      totals[d.getDay()] += Number(l.valor) || 0;
    }
    return DIAS_SEMANA_CURTO.map((label, i) => ({ dia: label, valor: totals[i] }));
  }, [pagos]);

  const melhorDia = useMemo(() => {
    if (porDiaSemana.every((d) => d.valor === 0)) return null;
    return porDiaSemana.reduce((best, cur) => (cur.valor > best.valor ? cur : best));
  }, [porDiaSemana]);

  if (pagos.length === 0) {
    return (
      <div>
        <PageHeader title="Comparativos" subtitle="Receita mês a mês e por dia da semana." />
        <Card>
          <div style={{ fontSize: 14, color: t.textMuted }}>
            Ainda não há lançamentos marcados como pagos. Assim que você marcar alguns pagamentos como recebidos, os gráficos aparecem aqui.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Comparativos" subtitle="Receita mês a mês e por dia da semana (só considera lançamentos já pagos)." />

      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14.5 }}>Receita por mês</div>
        <div style={{ fontSize: 12.5, color: t.textMuted, marginBottom: 14 }}>Últimos 12 meses com pagamento registrado.</div>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={porMes} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: t.textMuted, fontFamily: "'IBM Plex Sans', sans-serif" }} axisLine={{ stroke: t.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: t.textMuted, fontFamily: "'Plus Jakarta Sans', sans-serif" }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => `${(v / 1000).toFixed(v >= 1000 ? 0 : 1)}k`} />
              <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: t.surfaceSunken }} />
              <Bar dataKey="valor" fill={t.primary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14.5 }}>Receita por dia da semana</div>
        <div style={{ fontSize: 12.5, color: t.textMuted, marginBottom: 14 }}>
          {melhorDia ? (
            <>Seu dia mais forte é <strong style={{ color: t.text }}>{melhorDia.dia}</strong>, com {formatCurrency(melhorDia.valor)} acumulados.</>
          ) : (
            "Ainda sem dados suficientes."
          )}
        </div>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={porDiaSemana} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: t.textMuted, fontFamily: "'IBM Plex Sans', sans-serif" }} axisLine={{ stroke: t.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: t.textMuted, fontFamily: "'Plus Jakarta Sans', sans-serif" }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => `${(v / 1000).toFixed(v >= 1000 ? 0 : 1)}k`} />
              <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: t.surfaceSunken }} />
              <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                {porDiaSemana.map((entry, i) => (
                  <Cell key={i} fill={melhorDia && entry.dia === melhorDia.dia ? t.gold : t.primary} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
