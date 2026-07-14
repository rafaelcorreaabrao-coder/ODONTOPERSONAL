import { useEffect, useState, useCallback } from "react";
import { LayoutDashboard, Building2, Receipt, LogOut } from "lucide-react";
import { supabase } from "./supabaseClient.js";
import { PALETTES, ThemeCtx } from "./theme.js";
import Auth from "./pages/Auth.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Clinicas from "./pages/Clinicas.jsx";
import Lancamentos from "./pages/Lancamentos.jsx";

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

function SmileArc({ color, width = 46 }) {
  return (
    <svg width={width} height="7" viewBox="0 0 46 7" fill="none">
      <path d="M2 1.5 Q23 9 44 1.5" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [view, setView] = useState("dashboard");
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem("arco-theme");
    return ["claro", "azul", "rosa"].includes(saved) ? saved : "claro";
  });
  const [clinicas, setClinicas] = useState([]);
  const [lancamentos, setLancamentos] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setProfileChecked(false);
      return;
    }
    setProfileChecked(false);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data);
        setProfileChecked(true);
      });
  }, [session]);

  const refetch = useCallback(async () => {
    if (!session) return;
    const [{ data: c }, { data: l }] = await Promise.all([
      supabase.from("clinicas").select("*").order("nome"),
      supabase.from("lancamentos").select("*"),
    ]);
    setClinicas(c || []);
    setLancamentos(l || []);
  }, [session]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  function setTheme(name) {
    setThemeMode(name);
    localStorage.setItem("arco-theme", name);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setClinicas([]);
    setLancamentos([]);
  }

  const t = PALETTES[themeMode];

  if (loadingSession) return null;

  if (!session) {
    return (
      <ThemeCtx.Provider value={t}>
        <Auth />
      </ThemeCtx.Provider>
    );
  }

  if (!profileChecked) return null;

  if (!profile) {
    return (
      <ThemeCtx.Provider value={t}>
        <Onboarding userId={session.user.id} onDone={(nickname) => setProfile({ id: session.user.id, nickname })} />
      </ThemeCtx.Provider>
    );
  }

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "clinicas", label: "Clínicas", icon: Building2 },
    { id: "lancamentos", label: "Lançamentos", icon: Receipt },
  ];

  return (
    <ThemeCtx.Provider value={t}>
      <div className="app-shell" style={{ display: "flex", minHeight: "100vh", background: t.page, fontFamily: "'IBM Plex Sans', sans-serif", color: t.text }}>
        <aside className="app-sidebar" style={{ width: 224, background: t.sidebar, borderRight: `1px solid ${t.sidebarBorder}`, padding: "22px 14px", display: "flex", flexDirection: "column", gap: 26, flexShrink: 0 }}>
          <div className="app-sidebar-brand" style={{ paddingLeft: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ArcoLogo color={t.sidebarIcon} />
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: t.sidebarActiveText, letterSpacing: "-0.01em" }}>OdontoPersonal</div>
                <div style={{ fontSize: 10.5, color: t.sidebarTextDim }}>{profile?.nickname || "..."}</div>
              </div>
            </div>
            <div className="app-sidebar-smile" style={{ marginTop: 8, marginLeft: 2 }}>
              <SmileArc color={t.gold} />
            </div>
          </div>

          <nav className="app-sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: "9px 12px", borderRadius: 8,
                    border: "none", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, fontWeight: 600,
                    background: active ? t.sidebarSoft : "transparent", color: active ? t.sidebarActiveText : t.sidebarText,
                  }}
                >
                  <Icon size={16} strokeWidth={2} style={{ flexShrink: 0, opacity: active ? 1 : 0.8 }} />
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="app-sidebar-bottom" style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            <ThemeSwitcher current={themeMode} onSelect={setTheme} t={t} />

            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: "none",
                background: "transparent", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5,
                fontWeight: 600, color: t.sidebarTextDim,
              }}
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </aside>

        <main className="app-main" style={{ flex: 1, padding: "26px 30px", minWidth: 0 }}>
          {view === "dashboard" && <Dashboard clinicas={clinicas} lancamentos={lancamentos} />}
          {view === "clinicas" && <Clinicas userId={session.user.id} clinicas={clinicas} lancamentos={lancamentos} onChanged={refetch} />}
          {view === "lancamentos" && <Lancamentos userId={session.user.id} clinicas={clinicas} lancamentos={lancamentos} onChanged={refetch} />}
        </main>
      </div>
    </ThemeCtx.Provider>
  );
}

function ThemeSwitcher({ current, onSelect, t }) {
  const options = [
    { id: "claro", label: "Claro" },
    { id: "azul", label: "Azul" },
    { id: "rosa", label: "Rosa" },
  ];
  return (
    <div style={{ display: "flex", gap: 6, padding: "8px 10px", borderRadius: 12, border: `1px solid ${t.sidebarBorder}`, background: t.sidebarPanelBg }}>
      {options.map((opt) => {
        const palette = PALETTES[opt.id];
        const active = current === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            aria-label={`Tema ${opt.label}`}
            title={opt.label}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 4px",
              borderRadius: 8, border: active ? `1.5px solid ${palette.primary}` : "1.5px solid transparent",
              background: "transparent", cursor: "pointer",
            }}
          >
            <span style={{ width: 16, height: 16, borderRadius: "50%", background: palette.swatch, display: "block" }} />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: active ? t.sidebarActiveText : t.sidebarTextDim, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
