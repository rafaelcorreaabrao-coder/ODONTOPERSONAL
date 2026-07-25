import { CalendarClock } from "lucide-react";
import { useTheme } from "../theme.js";
import { Card, PageHeader, ClinicAvatar, clinicColor, describePagamento, EmptyState } from "../components/ui.jsx";

const DIAS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

export default function Agenda({ clinicas }) {
  const t = useTheme();
  const hojeDow = new Date().getDay();

  const porDia = DIAS.map((nome, i) => ({
    dow: i,
    nome,
    clinicas: clinicas
      .map((c, idx) => ({ c, idx }))
      .filter(({ c }) => (c.dias_atendimento || []).includes(i)),
  }));

  const semAgenda = clinicas.filter(c => !(c.dias_atendimento || []).length);
  const temAlgumaAgenda = clinicas.some(c => (c.dias_atendimento || []).length);

  return (
    <div>
      <PageHeader title="Agenda" subtitle="Em quais clínicas você atende, dia a dia da semana." icon={CalendarClock} />

      {clinicas.length === 0 ? (
        <EmptyState icon={CalendarClock} title="Nenhuma clínica cadastrada" description="Cadastre suas clínicas e marque os dias de atendimento para montar sua agenda automaticamente." />
      ) : !temAlgumaAgenda ? (
        <EmptyState icon={CalendarClock} title="Nenhum dia de atendimento definido ainda" description="Edite suas clínicas e marque os dias da semana em que você atende em cada uma." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {porDia.map(({ dow, nome, clinicas: doDia }) => (
            <Card key={dow} variant={dow === hojeDow ? "default" : "flat"} style={dow === hojeDow ? { border: `1.5px solid ${t.primary}`, background: t.primarySoft } : {}}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: doDia.length ? 10 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{nome}</span>
                  {dow === hojeDow && <span style={{ fontSize: 10, fontWeight: 700, color: t.primary, background: t.surface, padding: "2px 7px", borderRadius: 5 }}>HOJE</span>}
                </div>
                <span style={{ fontSize: 12, color: t.textMuted }}>{doDia.length ? `${doDia.length} clínica${doDia.length > 1 ? "s" : ""}` : "sem atendimento"}</span>
              </div>
              {doDia.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {doDia.map(({ c, idx }) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: dow === hojeDow ? "rgba(255,255,255,0.6)" : t.surfaceAlt }}>
                      <ClinicAvatar nome={c.nome} color={clinicColor(idx)} size={30} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.nome}</div>
                        <div style={{ fontSize: 11.5, color: t.textMuted }}>{c.regime} · paga {describePagamento(c)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}

          {semAgenda.length > 0 && (
            <Card variant="muted" style={{ marginTop: 4 }}>
              <div style={{ fontSize: 12.5, color: t.textMuted }}>
                <strong style={{ color: t.text }}>{semAgenda.length} clínica{semAgenda.length > 1 ? "s" : ""}</strong> sem dias de atendimento definidos: {semAgenda.map(c => c.nome).join(", ")}. Edite a clínica para marcar os dias.
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
