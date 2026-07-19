import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../theme.js";

// ── Formatação ──
export function formatCurrency(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export function formatDate(iso) {
  if (!iso) return "\u2014";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ── Clínicas ──
export const CLINIC_COLORS = ["#6366F1", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899"];
export const DIAS_SEMANA = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
export function clinicColor(i) { return CLINIC_COLORS[i % CLINIC_COLORS.length]; }

export function ClinicAvatar({ nome, color, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3, background: color + "18", color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.4, flexShrink: 0,
    }}>
      {(nome || "?").trim().charAt(0).toUpperCase()}
    </div>
  );
}

export function greetingNow() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

// ── Pagamento ──
export function nextPaymentDate(clinic, atendimentoISO) {
  if (!clinic || !atendimentoISO) return atendimentoISO;
  const atend = new Date(atendimentoISO + "T00:00:00");
  if (clinic.regime === "Por procedimento") {
    const d = new Date(atend); d.setDate(d.getDate() + (Number(clinic.prazo_dias) || 0));
    return d.toISOString().slice(0, 10);
  }
  if (clinic.regime === "Semanal") {
    const dow = Number(clinic.dia_semana);
    if (Number.isNaN(dow)) return atendimentoISO;
    const d = new Date(atend); d.setDate(d.getDate() + ((dow - atend.getDay() + 7) % 7));
    return d.toISOString().slice(0, 10);
  }
  if (clinic.regime === "Quinzenal" || clinic.regime === "Mensal") {
    const days = (clinic.regime === "Mensal" ? [clinic.dia_mes_1] : [clinic.dia_mes_1, clinic.dia_mes_2])
      .map(Number).filter(n => !Number.isNaN(n) && n >= 1 && n <= 31);
    if (!days.length) return atendimentoISO;
    let best = null;
    for (let off = 0; off <= 2; off++) for (const day of days) {
      const d = new Date(atend.getFullYear(), atend.getMonth() + off, day);
      if (d >= atend && (!best || d < best)) best = d;
    }
    return best ? best.toISOString().slice(0, 10) : atendimentoISO;
  }
  return atendimentoISO;
}

export function describePagamento(c) {
  if (c.regime === "Semanal") { const i = Number(c.dia_semana); return Number.isNaN(i) ? "dia não definido" : `toda ${DIAS_SEMANA[i].toLowerCase()}`; }
  if (c.regime === "Mensal") return c.dia_mes_1 ? `dia ${c.dia_mes_1} de cada mês` : "dia não definido";
  if (c.regime === "Quinzenal") { const d = [c.dia_mes_1, c.dia_mes_2].filter(Boolean); return d.length ? `dias ${d.join(" e ")} de cada mês` : "dia não definido"; }
  if (c.regime === "Por procedimento") return c.prazo_dias ? `${c.prazo_dias} dia(s) após o atendimento` : "prazo não definido";
  return c.dia_pagamento || "dia não definido";
}

export function effectiveStatus(l) {
  if (l.pago) return "Pago";
  if (l.data_prevista && l.data_prevista < todayISO()) return "Atrasado";
  return "A receber";
}

// ── Componentes visuais ──
export function Badge({ status }) {
  const t = useTheme();
  const map = { Pago: { bg: t.successSoft, fg: t.success }, Atrasado: { bg: t.dangerSoft, fg: t.danger }, "A receber": { bg: t.goldSoft, fg: t.gold } };
  const s = map[status] || map["A receber"];
  return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: s.bg, color: s.fg, whiteSpace: "nowrap" }}>{status}</span>;
}

export function Button({ children, onClick, variant = "primary", type = "button", style = {}, icon, disabled, loading }) {
  const t = useTheme();
  const vars = {
    primary: { background: t.primary, color: "#fff", border: "1px solid transparent", hoverBg: t.primary + "DD" },
    secondary: { background: t.primarySoft, color: t.primary, border: "1px solid transparent", hoverBg: t.primary + "22" },
    ghost: { background: "transparent", color: t.text, border: `1px solid ${t.border}`, hoverBg: t.surfaceAlt },
    danger: { background: "transparent", color: t.danger, border: `1px solid ${t.dangerSoft}`, hoverBg: t.dangerSoft },
  };
  const v = vars[variant] || vars.primary;
  const isDisabled = disabled || loading;
  return (
    <button type={type} disabled={isDisabled} onClick={onClick} style={{
      fontWeight: 600, fontSize: 13, padding: "8px 14px", borderRadius: 8,
      cursor: isDisabled ? "not-allowed" : "pointer", ...v,
      transition: "all .15s ease", display: "inline-flex", alignItems: "center", gap: 6,
      opacity: isDisabled ? 0.5 : 1, ...style,
    }}>
      {icon}{loading ? "Salvando..." : children}
    </button>
  );
}

export function Field({ label, children, hint }) {
  const t = useTheme();
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: t.textMuted }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 12, color: t.textMuted, opacity: 0.7 }}>{hint}</span>}
    </label>
  );
}

export function useInputStyle() {
  const t = useTheme();
  return {
    fontSize: 14, padding: "8px 12px", borderRadius: 8, height: 40, boxSizing: "border-box",
    border: `1px solid ${t.border}`, outline: "none", color: t.text, background: t.inputBg,
    transition: "border-color .15s ease, box-shadow .15s ease",
    width: "100%",
  };
}

export function Card({ children, style = {}, variant = "default" }) {
  const t = useTheme();
  const variants = {
    default: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px", boxShadow: t.shadow },
    flat: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "14px 16px" },
    muted: { background: t.surfaceAlt, border: "none", borderRadius: 12, padding: "14px 16px" },
  };
  return <div style={{ ...variants[variant], ...style }}>{children}</div>;
}

export function PageHeader({ title, subtitle, icon: Icon, action }) {
  const t = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {Icon && (
          <div style={{ width: 40, height: 40, borderRadius: 10, background: t.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={20} color={t.primary} strokeWidth={2} />
          </div>
        )}
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 22, margin: 0, color: t.text }}>{title}</h1>
          {subtitle && <p style={{ margin: "2px 0 0", fontSize: 13, color: t.textMuted }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function MetricCard({ label, value, tone = "default", icon: Icon }) {
  const t = useTheme();
  const c = tone === "danger" ? t.danger : tone === "accent" ? t.gold : tone === "success" ? t.success : t.text;
  const bg = tone === "danger" ? t.dangerSoft : tone === "accent" ? t.goldSoft : tone === "success" ? t.successSoft : t.surfaceAlt;
  return (
    <Card style={{ flex: 1, minWidth: 150 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        {Icon && <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={14} color={c} strokeWidth={2.2} /></div>}
        <span style={{ fontSize: 13, color: t.textMuted }}>{label}</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 22, color: c }}>{value}</div>
    </Card>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  const t = useTheme();
  return (
    <Card style={{ textAlign: "center", padding: "40px 24px" }}>
      {Icon && <div style={{ width: 48, height: 48, borderRadius: 12, background: t.surfaceAlt, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><Icon size={22} color={t.textMuted} /></div>}
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: t.textMuted, marginBottom: action ? 16 : 0, maxWidth: 320, margin: "0 auto" }}>{description}</div>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </Card>
  );
}

export function FilterPills({ options, value, onChange }) {
  const t = useTheme();
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
      {options.map(f => (
        <button key={f} onClick={() => onChange(f)} style={{
          fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 8,
          border: `1px solid ${value === f ? t.primary : t.border}`,
          background: value === f ? t.primarySoft : "transparent",
          color: value === f ? t.primary : t.textMuted,
          cursor: "pointer", transition: "all .15s ease", whiteSpace: "nowrap",
        }}>{f}</button>
      ))}
    </div>
  );
}

// ── Toast ──
export function useToast() {
  const [msg, setMsg] = useState(null);
  const show = useCallback((text) => { setMsg(text); setTimeout(() => setMsg(null), 2500); }, []);
  return { msg, show };
}

export function Toast({ message }) {
  const t = useTheme();
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 999,
      background: t.text, color: t.surface, padding: "10px 20px", borderRadius: 10,
      fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      animation: "toastIn .25s ease",
    }}>
      {message}
    </div>
  );
}
