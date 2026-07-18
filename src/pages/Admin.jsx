import { useEffect, useState, useCallback } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "../supabaseClient.js";
import { useTheme } from "../theme.js";
import { Card, PageHeader, Badge, useInputStyle, formatDate } from "../components/ui.jsx";

const STATUS_LABELS = {
  trial: "Teste",
  active: "Ativa",
  inactive: "Inativa",
  overdue: "Atrasada",
};

const STATUS_TONE = {
  trial: "A receber",
  active: "Pago",
  inactive: "Atrasado",
  overdue: "Atrasado",
};

export default function Admin() {
  const t = useTheme();
  const inputStyle = useInputStyle();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setError("");
    const { data: profiles, error: pError } = await supabase.from("profiles").select("id, nickname, created_at");
    if (pError) return setError(pError.message);

    const { data: subs, error: sError } = await supabase.from("subscriptions").select("*");
    if (sError) return setError(sError.message);

    const merged = (profiles || []).map((p) => {
      const sub = (subs || []).find((s) => s.user_id === p.id) || { status: "trial", valid_until: null, notes: "" };
      return { ...p, ...sub };
    });
    merged.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    setRows(merged);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateSub(userId, patch) {
    setSavingId(userId);
    setError("");
    const { error: updError } = await supabase
      .from("subscriptions")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    setSavingId(null);
    if (updError) setError(updError.message);
    else load();
  }

  const totals = rows
    ? {
        total: rows.length,
        active: rows.filter((r) => r.status === "active").length,
        trial: rows.filter((r) => r.status === "trial").length,
        inactive: rows.filter((r) => r.status === "inactive" || r.status === "overdue").length,
      }
    : null;

  return (
    <div>
      <PageHeader title="Painel CEO" subtitle="Gerencie o status de assinatura de cada usuária." />

      {error && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ color: t.danger, fontSize: 13 }}>{error}</div>
        </Card>
      )}

      {totals && (
        <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
          <Card style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, marginBottom: 6 }}>Total de contas</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20 }}>{totals.total}</div>
          </Card>
          <Card style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, marginBottom: 6 }}>Ativas</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, color: t.success }}>{totals.active}</div>
          </Card>
          <Card style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, marginBottom: 6 }}>Em teste</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, color: t.gold }}>{totals.trial}</div>
          </Card>
          <Card style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, marginBottom: 6 }}>Inativas/atrasadas</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, color: t.danger }}>{totals.inactive}</div>
          </Card>
        </div>
      )}

      {rows === null ? (
        <Card><div style={{ fontSize: 13.5, color: t.textMuted }}>Carregando...</div></Card>
      ) : rows.length === 0 ? (
        <Card><div style={{ fontSize: 13.5, color: t.textMuted }}>Nenhuma usuária cadastrada ainda.</div></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((r) => (
            <Card key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                <Badge status={STATUS_TONE[r.status]} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {r.nickname} {r.is_admin && <ShieldCheck size={13} style={{ display: "inline", verticalAlign: "-2px", marginLeft: 4, color: t.gold }} />}
                  </div>
                  <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>
                    desde {formatDate(r.created_at?.slice(0, 10))} {r.valid_until && `· válida até ${formatDate(r.valid_until)}`}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <select
                  style={{ ...inputStyle, width: 130 }}
                  value={r.status}
                  disabled={savingId === r.id}
                  onChange={(e) => updateSub(r.id, { status: e.target.value })}
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <input
                  type="date"
                  style={{ ...inputStyle, width: 150 }}
                  value={r.valid_until || ""}
                  disabled={savingId === r.id}
                  onChange={(e) => updateSub(r.id, { valid_until: e.target.value || null })}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
