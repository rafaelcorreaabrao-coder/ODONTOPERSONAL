import { useTheme } from "../theme.js";

export function formatCurrency(v) {
  const n = Number(v) || 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(iso) {
  if (!iso) return "\u2014";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export const CLINIC_COLORS = ["#0E6E68", "#7C5CFC", "#F2994A", "#2F80ED", "#EB5B8C", "#1FAE7A"];
export const DIAS_SEMANA = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

export function clinicColor(index) {
  return CLINIC_COLORS[index % CLINIC_COLORS.length];
}

export function ClinicAvatar({ nome, color, size = 36 }) {
  const initial = (nome || "?").trim().charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", background: color, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
        fontSize: size * 0.42, flexShrink: 0, fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {initial}
    </div>
  );
}

export function greetingNow() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function nextPaymentDate(clinic, atendimentoISO) {
  if (!clinic || !atendimentoISO) return atendimentoISO;
  const atend = new Date(atendimentoISO + "T00:00:00");

  if (clinic.regime === "Por procedimento") {
    const prazo = Number(clinic.prazo_dias) || 0;
    const d = new Date(atend);
    d.setDate(d.getDate() + prazo);
    return d.toISOString().slice(0, 10);
  }

  if (clinic.regime === "Semanal") {
    const targetDow = Number(clinic.dia_semana);
    if (Number.isNaN(targetDow)) return atendimentoISO;
    const diff = (targetDow - atend.getDay() + 7) % 7;
    const d = new Date(atend);
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
  }

  if (clinic.regime === "Quinzenal" || clinic.regime === "Mensal") {
    const days = (clinic.regime === "Mensal" ? [clinic.dia_mes_1] : [clinic.dia_mes_1, clinic.dia_mes_2])
      .map(Number)
      .filter((n) => !Number.isNaN(n) && n >= 1 && n <= 31);
    if (days.length === 0) return atendimentoISO;

    let best = null;
    for (let offset = 0; offset <= 2; offset++) {
      for (const day of days) {
        const d = new Date(atend.getFullYear(), atend.getMonth() + offset, day);
        if (d >= atend && (!best || d < best)) best = d;
      }
      if (best) break;
    }
    return best ? best.toISOString().slice(0, 10) : atendimentoISO;
  }

  return atendimentoISO;
}

export function describePagamento(c) {
  if (c.regime === "Semanal") {
    const idx = Number(c.dia_semana);
    return Number.isNaN(idx) ? "dia não definido" : `toda ${DIAS_SEMANA[idx].toLowerCase()}`;
  }
  if (c.regime === "Mensal") {
    return c.dia_mes_1 ? `dia ${c.dia_mes_1} de cada mês` : "dia não definido";
  }
  if (c.regime === "Quinzenal") {
    const dias = [c.dia_mes_1, c.dia_mes_2].filter(Boolean);
    return dias.length ? `dias ${dias.join(" e ")} de cada mês` : "dia não definido";
  }
  if (c.regime === "Por procedimento") {
    return c.prazo_dias ? `${c.prazo_dias} dia${Number(c.prazo_dias) === 1 ? "" : "s"} após o atendimento` : "prazo não definido";
  }
  return c.dia_pagamento || "dia não definido";
}

export function effectiveStatus(l) {
  if (l.pago) return "Pago";
  if (l.data_prevista && l.data_prevista < todayISO()) return "Atrasado";
  return "A receber";
}

export function Badge({ status }) {
  const t = useTheme();
  const map = {
    Pago: { bg: t.successSoft, fg: t.success },
    Atrasado: { bg: t.dangerSoft, fg: t.danger },
    "A receber": { bg: t.goldSoft, fg: t.gold },
  };
  const s = map[status] || map["A receber"];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: s.bg,
        color: s.fg,
        fontFamily: "'IBM Plex Sans', sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

export function Button({ children, onClick, variant = "primary", type = "button", style = {}, icon, disabled }) {
  const t = useTheme();
  const base = {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: 600,
    fontSize: 13.5,
    padding: "9px 15px",
    borderRadius: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent",
    transition: "opacity .15s ease, background .15s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    opacity: disabled ? 0.55 : 1,
  };
  const variants = {
    primary: { background: t.primary, color: "#fff" },
    ghost: { background: "transparent", color: t.text, border: `1px solid ${t.border}` },
    danger: { background: "transparent", color: t.danger, border: `1px solid ${t.dangerSoft}` },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.opacity = "0.82")}
      onMouseLeave={(e) => !disabled && (e.currentTarget.style.opacity = "1")}
    >
      {icon}
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  const t = useTheme();
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: t.textMuted }}>{label}</span>
      {children}
    </label>
  );
}

export function useInputStyle() {
  const t = useTheme();
  return {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: 14,
    padding: "9px 10px",
    borderRadius: 7,
    border: `1px solid ${t.border}`,
    outline: "none",
    color: t.text,
    background: t.surfaceSunken,
  };
}

export function Card({ children, style = {} }) {
  const t = useTheme();
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 12,
        padding: "18px 20px",
        boxShadow: t.shadow,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle }) {
  const t = useTheme();
  return (
    <div style={{ marginBottom: 22 }}>
      <h1
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: 23,
          margin: 0,
          color: t.text,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h1>
      {subtitle && <p style={{ margin: "5px 0 0", fontSize: 13.5, color: t.textMuted }}>{subtitle}</p>}
    </div>
  );
}

export function MetricCard({ label, value, tone = "default", icon: Icon }) {
  const t = useTheme();
  const toneColor = tone === "danger" ? t.danger : tone === "accent" ? t.gold : tone === "success" ? t.success : t.text;
  const toneSoft = tone === "danger" ? t.dangerSoft : tone === "accent" ? t.goldSoft : tone === "success" ? t.successSoft : t.surfaceSunken;
  return (
    <Card style={{ flex: 1, minWidth: 170 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        {Icon && (
          <div style={{ width: 32, height: 32, borderRadius: 9, background: toneSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={16} color={toneColor} strokeWidth={2.2} />
          </div>
        )}
        <div style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      </div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 23, fontWeight: 700, color: toneColor }}>{value}</div>
    </Card>
  );
}
