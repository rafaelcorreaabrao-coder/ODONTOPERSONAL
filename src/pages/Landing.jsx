import { CalendarClock, Building2, BarChart3, Scale, ShieldCheck, TrendingUp, Bell } from "lucide-react";
import { useTheme } from "../theme.js";
import { Button, formatCurrency } from "../components/ui.jsx";

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

const ANIM_CSS = `
@keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes floatCard { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
.op-fade-up { opacity: 0; animation: fadeUp .6s cubic-bezier(.16,1,.3,1) forwards; }
.op-fade-in { opacity: 0; animation: fadeIn .8s ease forwards; }
.op-float { animation: floatCard 5.5s ease-in-out infinite; }
`;

function Feature({ icon: Icon, title, text, t, delay }) {
  return (
    <div className="op-fade-up" style={{ display: "flex", gap: 14, alignItems: "flex-start", animationDelay: `${delay}s` }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: t.successSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} color={t.primary} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 3, fontFamily: "'Space Grotesk', sans-serif" }}>{title}</div>
        <div style={{ fontSize: 13.5, color: t.textMuted, lineHeight: 1.55 }}>{text}</div>
      </div>
    </div>
  );
}

function FloatingCard({ style, delay, children }) {
  return (
    <div
      className="op-fade-in op-float"
      style={{
        position: "absolute",
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 12px 32px rgba(16,40,36,0.16)",
        padding: "12px 16px",
        animationDelay: `${delay}s, ${delay + 0.8}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function Landing({ onGoLogin, onGoSignup }) {
  const t = useTheme();

  return (
    <div style={{ minHeight: "100vh", background: t.page, color: t.text, overflowX: "hidden" }}>
      <style>{ANIM_CSS}</style>

      {/* Top nav */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ArcoLogo color={t.primary} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18 }}>OdontoPersonal</span>
        </div>
        <button onClick={onGoLogin} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
          Entrar →
        </button>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "48px 24px 90px", display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 420px", minWidth: 300 }}>
          <div className="op-fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: t.goldSoft, color: t.gold, fontSize: 12, fontWeight: 700, marginBottom: 22, letterSpacing: "0.03em", animationDelay: "0s" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.gold, display: "inline-block" }} />
            GRÁTIS PARA TESTAR · SEM CARTÃO
          </div>
          <h1
            className="op-fade-up"
            style={{
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(34px, 5vw, 50px)",
              lineHeight: 1.08, margin: "0 0 20px", letterSpacing: "-0.02em", animationDelay: "0.08s",
            }}
          >
            Menos planilha.<br />Mais controle.
          </h1>
          <p className="op-fade-up" style={{ fontSize: 16.5, color: t.textMuted, lineHeight: 1.6, marginBottom: 30, maxWidth: 440, animationDelay: "0.16s" }}>
            O sistema feito para dentistas autônomas que atendem em várias clínicas. Cada uma com o próprio prazo de pagamento — tudo organizado numa tela só.
          </p>
          <div className="op-fade-up" style={{ display: "flex", gap: 12, flexWrap: "wrap", animationDelay: "0.24s" }}>
            <Button onClick={onGoSignup} style={{ padding: "13px 24px", fontSize: 14.5, borderRadius: 10 }}>Criar conta grátis →</Button>
            <Button variant="ghost" onClick={onGoLogin} style={{ padding: "13px 24px", fontSize: 14.5, borderRadius: 10 }}>Já tenho conta</Button>
          </div>
          <div className="op-fade-up" style={{ fontSize: 12.5, color: t.textFaint || t.textMuted, marginTop: 14, animationDelay: "0.3s" }}>
            Leva menos de 2 minutos para cadastrar sua primeira clínica.
          </div>
        </div>

        {/* Mockup flutuante */}
        <div style={{ flex: "1 1 380px", minWidth: 300, position: "relative", height: 380, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 380, height: 320, borderRadius: 20, background: t.primary, boxShadow: "0 24px 60px rgba(14,110,104,0.28)", position: "relative", overflow: "hidden" }} className="op-fade-in" >
            <div style={{ padding: "20px 22px" }}>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 4 }}>RECEBIDO ESTE MÊS</div>
              <div style={{ color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30 }}>{formatCurrency(4820)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, color: "#8FE0C9", fontSize: 12.5, fontWeight: 600 }}>
                <TrendingUp size={13} /> 18% vs mês anterior
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 7, padding: "0 22px", height: 90 }}>
              {[38, 55, 42, 70, 60, 88, 65].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "5px 5px 0 0", background: i === 5 ? t.gold : "rgba(255,255,255,0.28)" }} />
              ))}
            </div>
          </div>

          <FloatingCard style={{ top: -6, left: -8 }} delay={0.5}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: t.textMuted, letterSpacing: "0.03em" }}>PRÓXIMO PAGAMENTO</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginTop: 2 }}>{formatCurrency(680)}</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>Clínica Sorriso · sexta</div>
          </FloatingCard>

          <FloatingCard style={{ bottom: 6, right: -10 }} delay={0.75}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: t.successSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={13} color={t.success} />
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>Pagamento confirmado</div>
                <div style={{ fontSize: 11, color: t.textMuted }}>{formatCurrency(320)} · hoje</div>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard style={{ top: "42%", right: -26 }} delay={1}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: t.danger, letterSpacing: "0.03em" }}>VALE A PENA TROCAR?</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: t.success, marginTop: 2 }}>Compensa trocar ✅</div>
          </FloatingCard>
        </div>
      </section>

      {/* Origem / problema */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18, padding: "36px 32px", boxShadow: t.shadow, display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: t.gold, letterSpacing: "0.04em", marginBottom: 8 }}>DE ONDE VEIO A IDEIA</div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, margin: "0 0 12px" }}>
              Um problema específico, de quem vive na rotina de várias clínicas
            </h2>
            <p style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.65 }}>
              Dentista autônoma raramente trabalha num só lugar. É comum atender numa clínica às terças, em outra às quintas, cada uma com um jeito diferente de pagar. Sem controle centralizado, é fácil perder o fio da meada — ou só perceber um atraso quando ele já está grande.
            </p>
          </div>
          <div style={{ flex: "1 1 300px", display: "flex", alignItems: "center" }}>
            <div style={{ background: t.surfaceSunken, borderRadius: 14, padding: "20px 22px", borderLeft: `3px solid ${t.danger}`, width: "100%" }}>
              <div style={{ fontSize: 14, fontStyle: "italic", color: t.text, lineHeight: 1.5 }}>
                "Nunca sei ao certo se aquele pagamento de duas semanas atrás já caiu ou não."
              </div>
              <div style={{ fontSize: 12, color: t.textMuted, marginTop: 8 }}>— o que toda dentista autônoma já pensou</div>
            </div>
          </div>
        </div>
      </section>

      {/* Como ajuda */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: t.primary, letterSpacing: "0.04em", marginBottom: 8 }}>COMO O ODONTOPERSONAL AJUDA</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 27, margin: 0 }}>Tudo o que você precisa pra nunca mais perder o controle</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 30 }}>
          <Feature t={t} delay={0} icon={Building2} title="Cadastro por clínica" text="Cada clínica com o próprio regime de pagamento — semanal, quinzenal, mensal ou por procedimento." />
          <Feature t={t} delay={0.08} icon={CalendarClock} title="Data de pagamento automática" text="Ao lançar um atendimento, o sistema já calcula sozinho quando o pagamento deve cair." />
          <Feature t={t} delay={0.16} icon={BarChart3} title="Comparativos visuais" text="Veja sua receita mês a mês e descubra em qual dia da semana você ganha mais." />
          <Feature t={t} delay={0.24} icon={Scale} title="Vale a pena trocar?" text="Compare uma proposta nova com sua clínica atual e receba um veredito claro." />
        </div>
      </section>

      {/* CTA final */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 72px", textAlign: "center" }}>
        <div style={{ background: t.primary, borderRadius: 20, padding: "44px 32px", color: "#fff" }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 25, margin: "0 0 10px" }}>Comece a organizar suas finanças hoje</h2>
          <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 24 }}>Grátis para começar. Sem cartão de crédito.</p>
          <Button onClick={onGoSignup} style={{ background: "#fff", color: t.primary, padding: "13px 26px", fontSize: 14.5, borderRadius: 10 }}>Criar minha conta →</Button>
        </div>
      </section>

      <footer style={{ textAlign: "center", padding: "24px", fontSize: 12.5, color: t.textMuted }}>
        <ShieldCheck size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
        Seus dados ficam protegidos e visíveis só para você.
      </footer>
    </div>
  );
}
