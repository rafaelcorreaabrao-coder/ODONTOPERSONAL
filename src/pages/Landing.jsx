import { CalendarClock, TrendingDown, Building2, BarChart3, Scale, ShieldCheck } from "lucide-react";
import { useTheme } from "../theme.js";
import { Button } from "../components/ui.jsx";

function ArcoLogo({ size = 30, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path
        d="M20 4.5 C12.6 4.5 6.8 9.7 6.8 16.1 C6.8 19.6 8.1 21.5 8.9 24.1 C9.9 27.5 9.3 32.6 11.6 35.4 C13 37.1 14.6 34.6 16.1 31.2 C17.2 28.8 18.3 27 20 27 C21.7 27 22.8 28.8 23.9 31.2 C25.4 34.6 27 37.1 28.4 35.4 C30.7 32.6 30.1 27.5 31.1 24.1 C31.9 21.5 33.2 19.6 33.2 16.1 C33.2 9.7 27.4 4.5 20 4.5 Z"
        fill={color}
      />
      <ellipse cx="14.5" cy="12.5" rx="3" ry="4.6" fill="rgba(255,255,255,0.4)" transform="rotate(-22 14.5 12.5)" />
    </svg>
  );
}

function Feature({ icon: Icon, title, text, t }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: t.successSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={19} color={t.primary} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 13.5, color: t.textMuted, lineHeight: 1.55 }}>{text}</div>
      </div>
    </div>
  );
}

export default function Landing({ onGoLogin, onGoSignup }) {
  const t = useTheme();

  return (
    <div style={{ minHeight: "100vh", background: t.page, color: t.text }}>
      {/* Top nav */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ArcoLogo color={t.primary} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18 }}>OdontoPersonal</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="ghost" onClick={onGoLogin}>Entrar</Button>
          <Button onClick={onGoSignup}>Cadastre-se</Button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 40px", textAlign: "center" }}>
        <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 999, background: t.goldSoft, color: t.gold, fontSize: 12.5, fontWeight: 700, marginBottom: 20, letterSpacing: "0.02em" }}>
          FEITO PARA DENTISTAS AUTÔNOMAS
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 38, lineHeight: 1.15, margin: "0 0 18px", letterSpacing: "-0.01em" }}>
          Quem trabalha em várias clínicas merece saber, sem esforço, <span style={{ color: t.primary }}>quanto tem a receber de cada uma.</span>
        </h1>
        <p style={{ fontSize: 16, color: t.textMuted, lineHeight: 1.6, marginBottom: 30 }}>
          O OdontoPersonal organiza seus recebíveis por clínica, calcula sozinho quando cada pagamento cai, e mostra na hora o que já entrou, o que está pendente e o que atrasou.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Button onClick={onGoSignup} style={{ padding: "12px 22px", fontSize: 14.5 }}>Criar minha conta grátis</Button>
          <Button variant="ghost" onClick={onGoLogin} style={{ padding: "12px 22px", fontSize: 14.5 }}>Já tenho conta</Button>
        </div>
      </section>

      {/* Origem / problema */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "20px 24px 56px" }}>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18, padding: "36px 32px", boxShadow: t.shadow, display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: t.gold, letterSpacing: "0.04em", marginBottom: 8 }}>DE ONDE VEIO A IDEIA</div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 22, margin: "0 0 12px" }}>
              Um problema bem específico, de quem vive na rotina de várias clínicas
            </h2>
            <p style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.65 }}>
              Dentista autônoma raramente trabalha num só lugar. É comum atender numa clínica às terças, em outra às quintas, cada uma com um jeito diferente de pagar — semanal, quinzenal, por procedimento. Sem um controle centralizado, é fácil perder o fio da meada: não lembrar se aquele pagamento de duas semanas atrás realmente caiu, ou só perceber um atraso quando ele já está grande.
            </p>
          </div>
          <div style={{ flex: "1 1 320px" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: t.danger, letterSpacing: "0.04em", marginBottom: 8 }}>O PROBLEMA NO DIA A DIA</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
              <li style={{ display: "flex", gap: 10, fontSize: 14, color: t.textMuted, lineHeight: 1.5 }}>
                <TrendingDown size={17} color={t.danger} style={{ flexShrink: 0, marginTop: 2 }} />
                Atrasos que só são percebidos quando já viraram um problema de caixa
              </li>
              <li style={{ display: "flex", gap: 10, fontSize: 14, color: t.textMuted, lineHeight: 1.5 }}>
                <Building2 size={17} color={t.danger} style={{ flexShrink: 0, marginTop: 2 }} />
                Cada clínica com uma regra de pagamento diferente, difícil de guardar de cabeça
              </li>
              <li style={{ display: "flex", gap: 10, fontSize: 14, color: t.textMuted, lineHeight: 1.5 }}>
                <CalendarClock size={17} color={t.danger} style={{ flexShrink: 0, marginTop: 2 }} />
                Nenhuma visão clara de quanto realmente entra por mês, até fechar a conta na mão
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Como ajuda */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: t.primary, letterSpacing: "0.04em", marginBottom: 8 }}>COMO O ODONTOPERSONAL AJUDA</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 26, margin: 0 }}>Tudo o que você precisa pra nunca mais perder o controle</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 28 }}>
          <Feature t={t} icon={Building2} title="Cadastro por clínica" text="Cada clínica com o próprio regime de pagamento — semanal, quinzenal, mensal ou por procedimento." />
          <Feature t={t} icon={CalendarClock} title="Data de pagamento automática" text="Ao lançar um atendimento, o sistema já calcula sozinho quando o pagamento deve cair." />
          <Feature t={t} icon={BarChart3} title="Comparativos visuais" text="Veja sua receita mês a mês e descubra em qual dia da semana você ganha mais." />
          <Feature t={t} icon={Scale} title="Vale a pena trocar?" text="Compare uma proposta nova com sua clínica atual, considerando transporte e material, e receba um veredito claro." />
        </div>
      </section>

      {/* CTA final */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 72px", textAlign: "center" }}>
        <div style={{ background: t.primary, borderRadius: 18, padding: "40px 32px", color: "#fff" }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 24, margin: "0 0 10px" }}>Comece a organizar suas finanças hoje</h2>
          <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 22 }}>Grátis para começar. Leva menos de 2 minutos pra cadastrar sua primeira clínica.</p>
          <Button onClick={onGoSignup} style={{ background: "#fff", color: t.primary, padding: "12px 24px", fontSize: 14.5 }}>Criar minha conta</Button>
        </div>
      </section>

      <footer style={{ textAlign: "center", padding: "24px", fontSize: 12.5, color: t.textMuted }}>
        <ShieldCheck size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
        Seus dados ficam protegidos e visíveis só para você.
      </footer>
    </div>
  );
}
