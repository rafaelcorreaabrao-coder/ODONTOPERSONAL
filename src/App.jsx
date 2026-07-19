import { useEffect, useState, useCallback } from "react";
import { LayoutDashboard, Building2, Receipt, LogOut, BarChart3, ArrowLeftRight, ShieldCheck, Menu, X } from "lucide-react";
import { supabase } from "./supabaseClient.js";
import { PALETTES, ThemeCtx } from "./theme.js";
import { Toast } from "./components/ui.jsx";
import Landing from "./pages/Landing.jsx";
import Auth from "./pages/Auth.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Clinicas from "./pages/Clinicas.jsx";
import Lancamentos from "./pages/Lancamentos.jsx";
import Comparativos from "./pages/Comparativos.jsx";
import Calculadora from "./pages/Calculadora.jsx";
import Admin from "./pages/Admin.jsx";

function Logo({ size = 26, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 4.5C12.6 4.5 6.8 9.7 6.8 16.1c0 3.5 1.3 5.4 2.1 8 1 3.4.4 8.5 2.7 11.3 1.4 1.7 3 -.8 4.5-4.2 1.1-2.4 2.2-4.2 3.9-4.2s2.8 1.8 3.9 4.2c1.5 3.4 3.1 5.9 4.5 4.2 2.3-2.8 1.7-7.9 2.7-11.3.8-2.6 2.1-4.5 2.1-8C33.2 9.7 27.4 4.5 20 4.5z" fill={color}/>
      <ellipse cx="14.5" cy="12.5" rx="3" ry="4.6" fill="rgba(255,255,255,0.35)" transform="rotate(-22 14.5 12.5)"/>
    </svg>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [view, setView] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    const s = localStorage.getItem("op-theme");
    return Object.keys(PALETTES).includes(s) ? s : "neutro";
  });
  const [clinicas, setClinicas] = useState([]);
  const [lancamentos, setLancamentos] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [publicView, setPublicView] = useState("landing");
  const [authInitialMode, setAuthInitialMode] = useState("login");
  const [toastMsg, setToastMsg] = useState(null);

  function toast(msg) { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2500); }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoadingSession(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); setProfileChecked(false); return; }
    setProfileChecked(false);
    supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle().then(({ data }) => { setProfile(data); setProfileChecked(true); });
    supabase.from("subscriptions").select("*").eq("user_id", session.user.id).maybeSingle().then(({ data }) => setSubscription(data));
  }, [session]);

  const refetch = useCallback(async () => {
    if (!session) return;
    const [{ data: c }, { data: l }] = await Promise.all([supabase.from("clinicas").select("*").order("nome"), supabase.from("lancamentos").select("*")]);
    setClinicas(c || []); setLancamentos(l || []);
  }, [session]);

  useEffect(() => { refetch(); }, [refetch]);

  function setTheme(name) { setThemeMode(name); localStorage.setItem("op-theme", name); }
  async function handleLogout() { await supabase.auth.signOut(); setSession(null); setProfile(null); setSubscription(null); setClinicas([]); setLancamentos([]); }

  const t = PALETTES[themeMode];
  if (loadingSession) return null;

  if (!session) {
    return (
      <ThemeCtx.Provider value={t}>
        {publicView === "landing"
          ? <Landing onGoLogin={() => { setAuthInitialMode("login"); setPublicView("auth"); }} onGoSignup={() => { setAuthInitialMode("signup"); setPublicView("auth"); }} />
          : <Auth initialMode={authInitialMode} onBack={() => setPublicView("landing")} />}
      </ThemeCtx.Provider>
    );
  }
  if (!profileChecked) return null;
  if (!profile) return <ThemeCtx.Provider value={t}><Onboarding userId={session.user.id} onDone={(n) => setProfile({ id: session.user.id, nickname: n })} /></ThemeCtx.Provider>;

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "clinicas", label: "Clínicas", icon: Building2 },
    { id: "lancamentos", label: "Lançamentos", icon: Receipt },
    { id: "comparativos", label: "Comparativos", icon: BarChart3 },
    { id: "calculadora", label: "Simulador de troca", icon: ArrowLeftRight },
  ];
  if (profile?.is_admin) NAV.push({ id: "admin", label: "Painel CEO", icon: ShieldCheck });

  const blocked = !profile?.is_admin && subscription && (subscription.status === "inactive" || subscription.status === "overdue");

  function navigate(id) { setView(id); setMobileMenuOpen(false); }

  return (
    <ThemeCtx.Provider value={t}>
      <style>{`
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin:0; font-family: 'Plus Jakarta Sans', 'IBM Plex Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        input:focus, select:focus, textarea:focus { border-color: ${t.primary} !important; box-shadow: 0 0 0 3px ${t.primary}22 !important; }
        button { font-family: inherit; }
        .op-sidebar { width: 240px; background: ${t.sidebar}; border-right: 1px solid ${t.sidebarBorder}; padding: 20px 12px; display: flex; flex-direction: column; gap: 20px; flex-shrink: 0; height: 100vh; position: sticky; top: 0; overflow-y: auto; }
        .op-main { flex: 1; padding: 24px 32px; min-width: 0; max-width: 1100px; }
        @media (max-width: 768px) {
          .op-sidebar { position: fixed; top: 0; left: 0; bottom: 0; z-index: 50; width: 260px; transform: translateX(-100%); transition: transform .2s ease; }
          .op-sidebar.open { transform: translateX(0); }
          .op-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 49; }
          .op-overlay.open { display: block; }
          .op-mobile-bar { display: flex; }
          .op-main { padding: 16px; }
        }
        @media (min-width: 769px) {
          .op-mobile-bar { display: none !important; }
          .op-overlay { display: none !important; }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: t.page, color: t.text }}>
        {/* Mobile top bar */}
        <div className="op-mobile-bar" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 48, background: t.surface, borderBottom: `1px solid ${t.border}`, padding: "10px 16px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setMobileMenuOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: t.text }}><Menu size={22} /></button>
            <Logo size={22} color={t.primary} />
            <span style={{ fontWeight: 700, fontSize: 15 }}>OdontoPersonal</span>
          </div>
        </div>
        <div style={{ height: 52, display: "none" }} className="op-mobile-bar" />

        {/* Overlay */}
        <div className={`op-overlay ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)} />

        {/* Sidebar */}
        <aside className={`op-sidebar ${mobileMenuOpen ? "open" : ""}`}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 4 }}>
              <Logo color={t.sidebarIcon} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: t.sidebarActiveText }}>OdontoPersonal</div>
                <div style={{ fontSize: 12, color: t.sidebarTextDim }}>{profile?.nickname || "..."}</div>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: t.sidebarText, display: "none" }} className="op-mobile-bar"><X size={20} /></button>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map(item => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button key={item.id} onClick={() => navigate(item.id)} style={{
                  display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                  padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 600, transition: "all .15s ease",
                  background: active ? t.sidebarSoft : "transparent",
                  color: active ? t.sidebarActiveText : t.sidebarText,
                }}>
                  <Icon size={16} strokeWidth={2} style={{ opacity: active ? 1 : 0.7 }} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 4, padding: "6px 8px", borderRadius: 10, border: `1px solid ${t.sidebarBorder}`, background: t.sidebarPanelBg }}>
              {Object.entries(PALETTES).map(([id, p]) => {
                const active = themeMode === id;
                return (
                  <button key={id} onClick={() => setTheme(id)} title={id.charAt(0).toUpperCase() + id.slice(1)} style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "5px 0", borderRadius: 6, border: active ? `2px solid ${p.primary}` : "2px solid transparent",
                    background: "transparent", cursor: "pointer",
                  }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: p.swatch, display: "block" }} />
                  </button>
                );
              })}
            </div>
            <button onClick={handleLogout} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8,
              border: "none", background: "transparent", cursor: "pointer", fontSize: 13,
              fontWeight: 600, color: t.sidebarTextDim, transition: "color .15s ease",
            }}>
              <LogOut size={15} /> Sair
            </button>
          </div>
        </aside>

        <main className="op-main" style={{ marginTop: typeof window !== "undefined" && window.innerWidth < 769 ? 52 : 0 }}>
          {blocked ? (
            <div style={{ maxWidth: 420, padding: "60px 0" }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Assinatura {subscription.status === "overdue" ? "atrasada" : "inativa"}</div>
              <p style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.6 }}>Seus dados continuam guardados, mas o acesso está pausado. Entre em contato para reativar.</p>
            </div>
          ) : (
            <>
              {view === "dashboard" && <Dashboard clinicas={clinicas} lancamentos={lancamentos} nickname={profile?.nickname} />}
              {view === "clinicas" && <Clinicas userId={session.user.id} clinicas={clinicas} lancamentos={lancamentos} onChanged={refetch} toast={toast} />}
              {view === "lancamentos" && <Lancamentos userId={session.user.id} clinicas={clinicas} lancamentos={lancamentos} onChanged={refetch} toast={toast} />}
              {view === "comparativos" && <Comparativos lancamentos={lancamentos} />}
              {view === "calculadora" && <Calculadora />}
              {view === "admin" && profile?.is_admin && <Admin />}
            </>
          )}
        </main>
      </div>
      <Toast message={toastMsg} />
    </ThemeCtx.Provider>
  );
}
