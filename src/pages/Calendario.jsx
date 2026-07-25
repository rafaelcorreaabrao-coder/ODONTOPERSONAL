import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useTheme } from "../theme.js";
import { Card, PageHeader, formatCurrency } from "../components/ui.jsx";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DIAS_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function toISO(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function Calendario({ lancamentos }) {
  const t = useTheme();
  const hoje = new Date();
  const [cursor, setCursor] = useState({ ano: hoje.getFullYear(), mes: hoje.getMonth() });

  const { ano, mes } = cursor;
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const isMesAtual = ano === hoje.getFullYear() && mes === hoje.getMonth();
  const hojeDia = hoje.getDate();

  const porDia = useMemo(() => {
    const map = {};
    for (const l of lancamentos) {
      if (!l.data_atendimento) continue;
      const [y, m, d] = l.data_atendimento.split("-").map(Number);
      if (y === ano && m - 1 === mes) {
        map[d] = (map[d] || 0) + (Number(l.valor) || 0);
      }
    }
    return map;
  }, [lancamentos, ano, mes]);

  const totalMes = Object.values(porDia).reduce((s, v) => s + v, 0);
  const diasComValor = Object.values(porDia).filter((v) => v > 0).length;
  const mediaDia = diasComValor ? totalMes / diasComValor : 0;
  const valorHoje = isMesAtual ? porDia[hojeDia] || 0 : 0;

  const maxDia = Math.max(1, ...Object.values(porDia));
  function levelFor(v) {
    if (!v) return "zero";
    const r = v / maxDia;
    if (r < 0.34) return "low";
    if (r < 0.67) return "mid";
    return "high";
  }
  const levelBg = {
    zero: t.surfaceAlt,
    low: t.successSoft,
    mid: "#A7F3D0",
    high: t.success + "55",
  };

  function prevMonth() { setCursor((c) => (c.mes === 0 ? { ano: c.ano - 1, mes: 11 } : { ano: c.ano, mes: c.mes - 1 })); }
  function nextMonth() { setCursor((c) => (c.mes === 11 ? { ano: c.ano + 1, mes: 0 } : { ano: c.ano, mes: c.mes + 1 })); }

  const cells = [];
  for (let i = 0; i < primeiroDiaSemana; i++) cells.push(null);
  for (let d = 1; d <= diasNoMes; d++) cells.push(d);

  return (
    <div>
      <PageHeader
        title="Calendário de faturamento"
        subtitle="Quanto entrou em cada dia, considerando todos os lançamentos."
        icon={CalendarDays}
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: "6px 10px" }}>
            <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: t.textMuted, padding: 4, borderRadius: 6 }}><ChevronLeft size={18} /></button>
            <span style={{ fontWeight: 600, fontSize: 13, minWidth: 110, textAlign: "center" }}>{MESES[mes]} {ano}</span>
            <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: t.textMuted, padding: 4, borderRadius: 6 }}><ChevronRight size={18} /></button>
          </div>
        }
      />

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.primary}CC)`, borderRadius: 20, padding: "22px 26px", color: "#fff", marginBottom: 20, display: "flex", gap: 32, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>{isMesAtual ? "Hoje" : "Selecione o mês atual"}</div>
          <div style={{ fontWeight: 800, fontSize: 30 }}>{isMesAtual ? formatCurrency(valorHoje) : "—"}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Total do mês</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}>{formatCurrency(totalMes)}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Média por dia com lançamento</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}>{formatCurrency(mediaDia)}</div>
        </div>
      </div>

      {/* Calendário */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Calendário do mês</div>
        <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 16 }}>Quanto mais escuro o verde, maior o valor lançado naquele dia.</div>

        <div className="op-cal-scroll" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ minWidth: 322 }}>
            <div className="op-cal-weekdays" style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(40px, 1fr))", gap: 6, marginBottom: 6 }}>
              {DIAS_CURTO.map((d) => (
                <span key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: "uppercase" }}>{d}</span>
              ))}
            </div>

            <div className="op-cal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(40px, 1fr))", gap: 6 }}>
              {cells.map((d, i) => {
                if (d === null) return <div key={`e${i}`} />;
                const v = porDia[d] || 0;
                const isToday = isMesAtual && d === hojeDia;
                const lv = levelFor(v);
                return (
                  <div
                    key={d}
                    title={`${d} de ${MESES[mes]} — ${formatCurrency(v)}`}
                    style={{
                      aspectRatio: "1", borderRadius: 10, padding: "5px 6px", display: "flex", flexDirection: "column",
                      justifyContent: "space-between", border: isToday ? `2px solid ${t.primary}` : `1px solid ${t.border}`,
                      background: isToday ? t.primarySoft : levelBg[lv], minWidth: 0,
                    }}
                  >
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: isToday ? t.primary : t.textMuted }}>{d}</span>
                    <span className="op-cal-val" style={{ fontSize: 10, fontWeight: 700, color: v ? t.success : t.border, alignSelf: "flex-end", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "clip" }}>
                      {v ? formatCurrency(v).replace("R$", "").trim() : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, marginTop: 14, fontSize: 11, color: t.textMuted, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: t.surfaceAlt, display: "inline-block" }} /> Sem lançamento</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: t.successSoft, display: "inline-block" }} /> Baixo</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#A7F3D0", display: "inline-block" }} /> Médio</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: t.success + "55", display: "inline-block" }} /> Alto</span>
        </div>
      </Card>

      {/* Lista dia a dia */}
      <Card>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Resumo dia a dia</div>
        <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 12 }}>Todos os dias do mês, com o dia da semana entre parênteses.</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {Array.from({ length: diasNoMes }, (_, i) => i + 1).map((d) => {
            const dow = new Date(ano, mes, d).getDay();
            const v = porDia[d] || 0;
            const isToday = isMesAtual && d === hojeDia;
            return (
              <div key={d} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 10px", borderRadius: isToday ? 8 : 0, background: isToday ? t.primarySoft : "transparent", borderBottom: isToday ? "none" : `1px solid ${t.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, color: t.textMuted, background: t.surfaceAlt, padding: "2px 7px", borderRadius: 6, minWidth: 30, textAlign: "center" }}>{DIAS_CURTO[dow].toLowerCase()}</span>
                  <span style={{ fontSize: 13 }}>{d} de {MESES[mes]}</span>
                  {isToday && <span style={{ fontSize: 10, fontWeight: 700, color: t.primary, background: t.surface, padding: "2px 6px", borderRadius: 5 }}>HOJE</span>}
                </div>
                <span style={{ fontSize: 13, fontWeight: v ? 700 : 500, color: v ? t.text : t.textMuted, opacity: v ? 1 : 0.7 }}>
                  {v ? formatCurrency(v) : "Sem lançamento"}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <style>{`
        .op-cal-scroll::-webkit-scrollbar { height: 6px; }
        .op-cal-scroll::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 999px; }
      `}</style>
    </div>
  );
}
