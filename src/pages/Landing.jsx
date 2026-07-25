import { useEffect, useRef, useState } from "react";
import { CalendarClock, Building2, BarChart3, Scale, ShieldCheck, TrendingUp, Bell, ArrowRight, CalendarDays } from "lucide-react";
import { useTheme } from "../theme.js";
import { Button, formatCurrency } from "../components/ui.jsx";

function ArcoLogo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path
        d="M20 4.5C12.6 4.5 6.8 9.7 6.8 16.1c0 3.5 1.3 5.4 2.1 8 1 3.4.4 8.5 2.7 11.3 1.4 1.7 3-.8 4.5-4.2 1.1-2.4 2.2-4.2 3.9-4.2s2.8 1.8 3.9 4.2c1.5 3.4 3.1 5.9 4.5 4.2 2.3-2.8 1.7-7.9 2.7-11.3.8-2.6 2.1-4.5 2.1-8C33.2 9.7 27.4 4.5 20 4.5z"
        fill="#FFFFFF"
        stroke="#D1D5DB"
        strokeWidth="1"
      />
      <ellipse cx="15.5" cy="14.5" rx="1.6" ry="2" fill="#111827" />
      <ellipse cx="24.5" cy="14.5" rx="1.6" ry="2" fill="#111827" />
      <path d="M14.5 19 Q20 23.5 25.5 19" stroke="#111827" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="29.5" cy="27" r="7.5" fill="#059669" stroke="#fff" strokeWidth="1.8" />
      <text x="29.5" y="30.3" fontSize="8.5" fontWeight="800" fill="#fff" textAnchor="middle" fontFamily="Arial">$</text>
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
@media (max-width: 720px) { .op-nav-link { display: none !important; } .op-mobile-qr-banner { display: none !important; } }
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
  const [showMobileBanner, setShowMobileBanner] = useState(true);
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const qrCodeSrc = pageUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(pageUrl)}` : "";

  return (
    <div style={{ minHeight: "100vh", background: t.page, color: t.text, overflowX: "hidden" }}>
      <style>{ANIM_CSS}</style>

      {/* Top nav — clara, com mais links */}
      <header style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", maxWidth: 1200, margin: "0 auto", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ArcoLogo size={28} />
            <span style={{ fontWeight: 800, fontSize: 17 }}>Dent<span style={{ color: t.gold }}>Control</span></span>
          </div>
          <nav className="op-nav-links" style={{ display: "flex", alignItems: "center", gap: 24, flex: 1, justifyContent: "center" }}>
            <a href="#funcionalidades" className="op-nav-link" style={{ color: t.textMuted, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Funcionalidades</a>
            <a href="#sobre" className="op-nav-link" style={{ color: t.textMuted, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Sobre</a>
          </nav>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={onGoLogin} style={{ background: "transparent", border: "none", color: t.textMuted, fontSize: 13.5, fontWeight: 600, padding: "8px 10px", cursor: "pointer" }}>
              Entrar
            </button>
            <button onClick={onGoSignup} style={{ background: t.primary, border: "none", color: "#fff", fontSize: 13.5, fontWeight: 700, padding: "9px 18px", borderRadius: 8, cursor: "pointer" }}>
              Começar agora
            </button>
          </div>
        </div>
      </header>

      {/* Banner — link para abrir no celular via QR code */}
      {showMobileBanner && (
        <div className="op-mobile-qr-banner" style={{ background: t.primarySoft, borderBottom: `1px solid ${t.border}` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {qrCodeSrc && (
              <img src={qrCodeSrc} alt="QR code para abrir no celular" width={56} height={56} style={{ borderRadius: 8, background: "#fff", flexShrink: 0 }} />
            )}
            <div style={{ flex: "1 1 260px" }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>Prefere continuar pelo celular?</div>
              <div style={{ fontSize: 12.5, color: t.textMuted }}>Aponte a câmera do seu celular pro QR code ao lado para abrir este link direto no seu telefone.</div>
            </div>
            <button onClick={() => setShowMobileBanner(false)} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", padding: 4, display: "flex" }}>✕</button>
          </div>
        </div>
      )}

      {/* Hero — fundo escuro sólido, centralizado */}
      <section style={{ background: `linear-gradient(160deg, #0B1917, ${t.primary})`, padding: "56px 24px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          <div className="op-fade-up" style={{ background: t.surface, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, textAlign: "left", marginBottom: 28, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", animationDelay: "0s" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: t.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CalendarDays size={18} color={t.primary} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ background: t.primary, color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 5, letterSpacing: "0.03em" }}>NOVO</span>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>Calendário de faturamento</span>
              </div>
              <div style={{ fontSize: 12.5, color: t.textMuted }}>Veja quanto você recebeu em cada dia do mês, com destaque pro dia de hoje.</div>
            </div>
            <ArrowRight size={18} color={t.textMuted} style={{ flexShrink: 0 }} />
          </div>

          <div className="op-fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: 12, fontWeight: 700, marginBottom: 20, letterSpacing: "0.03em", animationDelay: "0.08s" }}>
            <TrendingUp size={13} /> GESTÃO FINANCEIRA PARA DENTISTAS
          </div>

          <h1 className="op-fade-up" style={{ fontWeight: 800, fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.12, margin: "0 0 20px", letterSpacing: "-0.02em", color: "#fff", animationDelay: "0.16s" }}>
            Transforme a rotina em várias clínicas em <span style={{ color: "#6EE7B7" }}>controle total do seu dinheiro</span>
          </h1>

          <p className="op-fade-up" style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: 30, animationDelay: "0.24s" }}>
            Cálculo automático de pagamento, comparativos visuais, simulador de troca de clínica e calendário de faturamento — tudo numa única plataforma pensada para a dentista autônoma brasileira.
          </p>

          <div className="op-fade-up" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", animationDelay: "0.32s" }}>
            <button onClick={onGoSignup} style={{ background: "#fff", border: "none", color: t.primary, fontSize: 14.5, fontWeight: 800, padding: "13px 26px", borderRadius: 10, cursor: "pointer" }}>
              Começar agora, é grátis
            </button>
            <button onClick={onGoLogin} style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.4)", color: "#fff", fontSize: 14.5, fontWeight: 700, padding: "13px 26px", borderRadius: 10, cursor: "pointer" }}>
              Já tenho conta
            </button>
          </div>
        </div>
      </section>

      {/* Mockup flutuante do produto */}
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "70px 24px 40px", display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", height: 340, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 460 }}>
          <div style={{ width: "100%", maxWidth: 380, height: 300, borderRadius: 20, background: t.primary, boxShadow: `0 24px 60px ${t.primary}44`, position: "relative", overflow: "hidden" }} className="op-fade-in">
            <div style={{ padding: "20px 22px" }}>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 4 }}>RECEBIDO ESTE MÊS</div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 30 }}>{formatCurrency(4820)}</div>
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
        <section id="sobre" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 70px" }}>
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
              <h2 style={{ fontWeight: 800, fontSize: 24, margin: "0 0 12px" }}>
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
      <section id="funcionalidades" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 70px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: t.primary, letterSpacing: "0.04em", marginBottom: 8 }}>COMO O ODONTOPERSONAL AJUDA</div>
            <h2 style={{ fontWeight: 800, fontSize: 28, margin: 0 }}>Tudo o que você precisa pra nunca mais perder o controle</h2>
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
            <h2 style={{ fontWeight: 800, fontSize: 25, margin: "0 0 10px" }}>Comece a organizar suas finanças hoje</h2>
            <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 24 }}>Grátis para começar. Sem cartão de crédito.</p>
            <Button onClick={onGoSignup} style={{ background: "#fff", color: t.primary, padding: "13px 26px", fontSize: 14.5, borderRadius: 10 }}>Criar minha conta →</Button>
          </div>
        </section>
      </Reveal>

      <footer style={{ background: "#0E1C19", color: "rgba(255,255,255,0.7)", padding: "48px 24px 26px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 40, marginBottom: 32 }}>
            <div style={{ flex: "1 1 220px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <ArcoLogo />
                <span style={{ fontWeight: 800, fontSize: 17, color: "#fff" }}>Dent<span style={{ color: "#6EE7B7" }}>Control</span></span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 240 }}>
                Controle financeiro para dentistas autônomas que atendem em várias clínicas.
              </p>
            </div>

            <div style={{ flex: "1 1 160px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Produto</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5 }}>
                <a href="#sobre" style={{ color: "inherit", textDecoration: "none" }}>Como funciona</a>
                <a href="#funcionalidades" style={{ color: "inherit", textDecoration: "none" }}>Funcionalidades</a>
              </div>
            </div>

            <div style={{ flex: "1 1 160px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Comece agora</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5 }}>
                <button onClick={onGoSignup} style={{ background: "none", border: "none", padding: 0, color: "inherit", textAlign: "left", cursor: "pointer", fontSize: 13.5 }}>Criar conta grátis</button>
                <button onClick={onGoLogin} style={{ background: "none", border: "none", padding: 0, color: "inherit", textAlign: "left", cursor: "pointer", fontSize: 13.5 }}>Entrar</button>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 20, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>© {new Date().getFullYear()} DentControl</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 5 }}>
              <ShieldCheck size={13} />
              Seus dados ficam protegidos e visíveis só para você
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
