import { useState, useMemo } from "react";
import { ArrowLeftRight, CheckCircle2, XCircle, MinusCircle, Car, Bus, MapPin } from "lucide-react";
import { useTheme } from "../theme.js";
import { Card, PageHeader, Field, Button, useInputStyle, formatCurrency } from "../components/ui.jsx";

function n(v) { const x = Number(v); return Number.isFinite(x) ? x : 0; }

function ScenarioForm({ title, subtitle, data, setData, inputStyle, t }) {
  return (
    <Card style={{ flex: "1 1 300px" }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 16 }}>{subtitle}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Ganho médio por dia (R$)">
          <input type="number" min="0" step="0.01" style={inputStyle} value={data.ganho} onChange={e => setData({ ...data, ganho: e.target.value })} placeholder="400" />
        </Field>
        <Field label="Endereço da clínica" hint="Para estimativa de transporte">
          <input style={inputStyle} value={data.endereco} onChange={e => setData({ ...data, endereco: e.target.value })} placeholder="Rua, número — bairro, cidade" />
        </Field>
        <Field label="Distância estimada da sua casa (km)">
          <input type="number" min="0" step="0.1" style={inputStyle} value={data.distancia} onChange={e => setData({ ...data, distancia: e.target.value })} placeholder="12" />
        </Field>
        <Field label="Como você vai?">
          <div style={{ display: "flex", gap: 8 }}>
            {[{ id: "carro", icon: Car, label: "Carro" }, { id: "onibus", icon: Bus, label: "Ônibus" }].map(opt => (
              <button key={opt.id} type="button" onClick={() => setData({ ...data, transporte: opt.id })} style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "10px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: data.transporte === opt.id ? t.primarySoft : "transparent",
                border: `1.5px solid ${data.transporte === opt.id ? t.primary : t.border}`,
                color: data.transporte === opt.id ? t.primary : t.textMuted,
                transition: "all .15s ease",
              }}>
                <opt.icon size={16} /> {opt.label}
              </button>
            ))}
          </div>
        </Field>
        {data.transporte === "carro" && (
          <div style={{ background: t.surfaceAlt, padding: "12px 14px", borderRadius: 10, fontSize: 12, color: t.textMuted }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: t.text }}>Estimativa de custo</div>
            {n(data.distancia) > 0 ? (
              <div>~{formatCurrency(n(data.distancia) * 2 * 5.50 / 10)} por dia <span style={{ opacity: 0.7 }}>(ida e volta, {n(data.distancia) * 2}km, média R$5,50/L, 10km/L)</span></div>
            ) : "Informe a distância para calcular."}
          </div>
        )}
        {data.transporte === "onibus" && (
          <Field label="Custo do transporte por dia (R$)" hint="Ida e volta">
            <input type="number" min="0" step="0.01" style={inputStyle} value={data.custoOnibus} onChange={e => setData({ ...data, custoOnibus: e.target.value })} placeholder="11.60" />
          </Field>
        )}
        <Field label="Leva o próprio material?">
          <div style={{ display: "flex", gap: 8 }}>
            {[{ id: false, label: "Não" }, { id: true, label: "Sim" }].map(opt => (
              <button key={String(opt.id)} type="button" onClick={() => setData({ ...data, levaMaterial: opt.id })} style={{
                flex: 1, padding: "8px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: data.levaMaterial === opt.id ? t.primarySoft : "transparent",
                border: `1.5px solid ${data.levaMaterial === opt.id ? t.primary : t.border}`,
                color: data.levaMaterial === opt.id ? t.primary : t.textMuted, transition: "all .15s ease",
              }}>{opt.label}</button>
            ))}
          </div>
        </Field>
        {data.levaMaterial && <Field label="Custo do material por dia (R$)"><input type="number" min="0" step="0.01" style={inputStyle} value={data.material} onChange={e => setData({ ...data, material: e.target.value })} placeholder="25" /></Field>}
      </div>
    </Card>
  );
}

export default function Calculadora() {
  const t = useTheme();
  const inputStyle = useInputStyle();
  const blank = { ganho: "", endereco: "", distancia: "", transporte: "carro", custoOnibus: "", levaMaterial: false, material: "" };
  const [atual, setAtual] = useState(blank);
  const [nova, setNova] = useState(blank);
  const [diasPorMes, setDiasPorMes] = useState("4");

  function custoTransporte(d) {
    if (d.transporte === "carro") return n(d.distancia) * 2 * 5.50 / 10;
    return n(d.custoOnibus);
  }

  const resultado = useMemo(() => {
    const liqA = n(atual.ganho) - custoTransporte(atual) - (atual.levaMaterial ? n(atual.material) : 0);
    const liqN = n(nova.ganho) - custoTransporte(nova) - (nova.levaMaterial ? n(nova.material) : 0);
    const diff = liqN - liqA;
    return { liqA, liqN, diff, diffMes: diff * n(diasPorMes) };
  }, [atual, nova, diasPorMes]);

  const temDados = atual.ganho !== "" && nova.ganho !== "";
  let veredito = null;
  if (temDados) {
    if (resultado.diff > 0.5) veredito = { texto: "Compensa trocar", cor: t.success, icon: CheckCircle2 };
    else if (resultado.diff < -0.5) veredito = { texto: "Não compensa trocar", cor: t.danger, icon: XCircle };
    else veredito = { texto: "Empate técnico", cor: t.gold, icon: MinusCircle };
  }

  return (
    <div>
      <PageHeader title="Simulador de troca" subtitle="Compare sua clínica atual com uma nova proposta, considerando transporte e material." icon={ArrowLeftRight} />

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <ScenarioForm title="Clínica atual" subtitle="Onde você trabalha hoje" data={atual} setData={setAtual} inputStyle={inputStyle} t={t} />
        <ScenarioForm title="Nova proposta" subtitle="A oferta que você está avaliando" data={nova} setData={setNova} inputStyle={inputStyle} t={t} />
      </div>

      <Card variant="flat" style={{ marginBottom: 16 }}>
        <Field label="Dias por mês nesse dia da semana">
          <input type="number" min="1" max="5" style={{ ...inputStyle, maxWidth: 120 }} value={diasPorMes} onChange={e => setDiasPorMes(e.target.value)} />
        </Field>
      </Card>

      {temDados && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
              <div /><div style={{ textAlign: "right", fontSize: 12, fontWeight: 600, color: t.textMuted, padding: "0 0 8px" }}>Atual</div><div style={{ textAlign: "right", fontSize: 12, fontWeight: 600, color: t.textMuted, padding: "0 0 8px" }}>Nova</div>
              {[
                { label: "Ganho bruto / dia", a: formatCurrency(atual.ganho), b: formatCurrency(nova.ganho) },
                { label: "Transporte / dia", a: `−${formatCurrency(custoTransporte(atual))}`, b: `−${formatCurrency(custoTransporte(nova))}`, isDanger: true },
                { label: "Material / dia", a: `−${formatCurrency(atual.levaMaterial ? atual.material : 0)}`, b: `−${formatCurrency(nova.levaMaterial ? nova.material : 0)}`, isDanger: true },
              ].map((row, i) => (
                <div key={i} style={{ display: "contents" }}>
                  <div style={{ padding: "10px 0", fontWeight: 500, borderTop: `1px solid ${t.border}`, fontSize: 13 }}>{row.label}</div>
                  <div style={{ padding: "10px 0", textAlign: "right", borderTop: `1px solid ${t.border}`, fontSize: 13, fontWeight: 600, color: row.isDanger ? t.danger : t.text }}>{row.a}</div>
                  <div style={{ padding: "10px 0", textAlign: "right", borderTop: `1px solid ${t.border}`, fontSize: 13, fontWeight: 600, color: row.isDanger ? t.danger : t.text }}>{row.b}</div>
                </div>
              ))}
              <div style={{ padding: "12px 0 0", fontWeight: 700, borderTop: `2px solid ${t.border}`, fontSize: 14 }}>Líquido / dia</div>
              <div style={{ padding: "12px 0 0", textAlign: "right", borderTop: `2px solid ${t.border}`, fontSize: 14, fontWeight: 700 }}>{formatCurrency(resultado.liqA)}</div>
              <div style={{ padding: "12px 0 0", textAlign: "right", borderTop: `2px solid ${t.border}`, fontSize: 14, fontWeight: 700 }}>{formatCurrency(resultado.liqN)}</div>
            </div>
          </Card>
          <Card style={{ background: veredito.cor + "14", border: `1.5px solid ${veredito.cor}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <veredito.icon size={28} color={veredito.cor} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: veredito.cor }}>{veredito.texto}</div>
                <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>
                  Diferença de {formatCurrency(Math.abs(resultado.diff))} por dia · {formatCurrency(Math.abs(resultado.diffMes))} por mês ({diasPorMes || 0} dias)
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
      {!temDados && <Card variant="muted"><div style={{ fontSize: 13, color: t.textMuted, textAlign: "center", padding: "20px 0" }}>Preencha o ganho por dia dos dois lados para ver a comparação.</div></Card>}
    </div>
  );
}
