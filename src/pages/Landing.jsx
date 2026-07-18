import { useEffect, useRef, useState } from "react";
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

/* Revela o conteúdo com fade + deslize, na primeira vez que entra na tela ao rolar */
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity .7s cubic-bezier(.16,1,.3,1) ${delay}s, transform .7s cubic-bezier(.16,1,.3,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function MiniBarChart({ color, bars }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 34 }}>
      {bars.map((h, i) => (
        <div key={i} style={{ width: 6, height: `${h}%`, borderRadius: 2, background: color, opacity: 0.35 + (h / 100) * 0.65 }} />
      ))}
    </div>
  );
}

function MiniDonut({ color, soft }) {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34">
      <circle cx="17" cy="17" r="13" fill="none" stroke={soft} strokeWidth="6" />
      <circle cx="17" cy="17" r="13" fill="none" stroke={color} strokeWidth="6" strokeDasharray="52 82" strokeLinecap="round" transform="rotate(-90 17 17)" />
    </svg>
  );
}

function FeatureCard({ icon: Icon, title, text, t, visual }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: "24px 22px", boxShadow: t.shadow, display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: t.successSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={20} color={t.primary} strokeWidth={2} />
        </div>
        {visual}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</div>
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
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18 }}>OdontoPersonal</span>
        </div>
        <button onClick={onGoLogin} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
          Entrar →
        </button>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "48px 24px 80px", display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 420px", minWidth: 300 }}>
          <div className="op-fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: t.goldSoft, color: t.gold, fontSize: 12, fontWeight: 700, marginBottom: 22, letterSpacing: "0.03em", animationDelay: "0s" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.gold, display: "inline-block" }} />
            GRÁTIS PARA TESTAR · SEM CARTÃO
          </div>
          <h1
            className="op-fade-up"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(34px, 5vw, 50px)",
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
          <div className="op-fade-up" style={{ fontSize: 12.5, color: t.textMuted, marginTop: 14, animationDelay: "0.3s" }}>
            Leva menos de 2 minutos para cadastrar sua primeira clínica.
          </div>
        </div>

        {/* Mockup flutuante */}
        <div style={{ flex: "1 1 380px", minWidth: 300, position: "relative", height: 380, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 380, height: 320, borderRadius: 20, background: t.primary, boxShadow: `0 24px 60px ${t.primary}44`, position: "relative", overflow: "hidden" }} className="op-fade-in">
            <div style={{ padding: "20px 22px" }}>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 4 }}>RECEBIDO ESTE MÊS</div>
              <div style={{ color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 30 }}>{formatCurrency(4820)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, color: "#B9F5DD", fontSize: 12.5, fontWeight: 600 }}>
                <TrendingUp size={13} /> 18% vs mês anterior
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 7, padding: "0 22px", height: 90 }}>
              {[38, 55, 42, 70, 60, 88, 65].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "5px 5px 0 0", background: i === 5 ? t.gold : "rgba(255,255,255,0.3)" }} />
              ))}
            </div>
          </div>

          <FloatingCard style={{ top: -6, left: -8 }} delay={0.5}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: t.textMuted, letterSpacing: "0.03em" }}>PRÓXIMO PAGAMENTO</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: 2 }}>{formatCurrency(680)}</div>
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

      {/* Foto + história */}
      <Reveal>
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 70px" }}>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 20, boxShadow: t.shadow, display: "flex", flexWrap: "wrap", overflow: "hidden" }}>
            {/*
              ESPAÇO PARA FOTO — troque o conteúdo desta div por:
              <img src="/dentista-hero.jpg" alt="Dentista atendendo paciente" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              Recomendação: baixe uma foto gratuita e de uso comercial liberado em unsplash.com ou pexels.com
              (busque por "dentist", "dental clinic"), salve como dentista-hero.jpg dentro da pasta /public.
            */}
            <div style={{ flex: "1 1 320px", minHeight: 280, position: "relative", overflow: "hidden" }}>
              <img src="/dentista-hero.jpg" alt="Dentista atendendo paciente" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div style={{ flex: "1 1 380px", padding: "36px 32px" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: t.gold, letterSpacing: "0.04em", marginBottom: 8 }}>DE ONDE VEIO A IDEIA</div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 24, margin: "0 0 12px" }}>
                Um problema específico, de quem vive na rotina de várias clínicas
              </h2>
              <p style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.65, marginBottom: 18 }}>
                Dentista autônoma raramente trabalha num só lugar. É comum atender numa clínica às terças, em outra às quintas, cada uma com um jeito diferente de pagar. Sem controle centralizado, é fácil perder o fio da meada.
              </p>
              <div style={{ background: t.surfaceSunken, borderRadius: 12, padding: "16px 18px", borderLeft: `3px solid ${t.danger}` }}>
                <div style={{ fontSize: 13.5, fontStyle: "italic", lineHeight: 1.5 }}>
                  "Nunca sei ao certo se aquele pagamento de duas semanas atrás já caiu ou não."
                </div>
                <div style={{ fontSize: 11.5, color: t.textMuted, marginTop: 6 }}>— o que toda dentista autônoma já pensou</div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Como ajuda — com visual/gráfico em cada card, revelado ao rolar */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 70px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: t.primary, letterSpacing: "0.04em", marginBottom: 8 }}>COMO O ODONTOPERSONAL AJUDA</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 28, margin: 0 }}>Tudo o que você precisa pra nunca mais perder o controle</h2>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 22 }}>
          <Reveal delay={0}>
            <FeatureCard t={t} icon={Building2} title="Cadastro por clínica" text="Cada clínica com o próprio regime de pagamento — semanal, quinzenal, mensal ou por procedimento." visual={<MiniDonut color={t.primary} soft={t.successSoft} />} />
          </Reveal>
          <Reveal delay={0.1}>
            <FeatureCard t={t} icon={CalendarClock} title="Data de pagamento automática" text="Ao lançar um atendimento, o sistema já calcula sozinho quando o pagamento deve cair." visual={<div style={{ fontSize: 20 }}>📅</div>} />
          </Reveal>
          <Reveal delay={0.2}>
            <FeatureCard t={t} icon={BarChart3} title="Comparativos visuais" text="Veja sua receita mês a mês e descubra em qual dia da semana você ganha mais." visual={<MiniBarChart color={t.primary} bars={[40, 65, 50, 80, 60]} />} />
          </Reveal>
          <Reveal delay={0.3}>
            <FeatureCard t={t} icon={Scale} title="Vale a pena trocar?" text="Compare uma proposta nova com sua clínica atual e receba um veredito claro." visual={<div style={{ fontSize: 20 }}>⚖️</div>} />
          </Reveal>
        </div>
      </section>

      {/* CTA final */}
      <Reveal>
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 72px", textAlign: "center" }}>
          <div style={{ background: t.primary, borderRadius: 20, padding: "44px 32px", color: "#fff" }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 25, margin: "0 0 10px" }}>Comece a organizar suas finanças hoje</h2>
            <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 24 }}>Grátis para começar. Sem cartão de crédito.</p>
            <Button onClick={onGoSignup} style={{ background: "#fff", color: t.primary, padding: "13px 26px", fontSize: 14.5, borderRadius: 10 }}>Criar minha conta →</Button>
          </div>
        </section>
      </Reveal>

      <footer style={{ textAlign: "center", padding: "24px", fontSize: 12.5, color: t.textMuted }}>
        <ShieldCheck size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
        Seus dados ficam protegidos e visíveis só para você.
      </footer>
    </div>
  );
}
