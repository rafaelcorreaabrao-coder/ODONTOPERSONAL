import { useState, useMemo } from "react";
import { ArrowRight, CheckCircle2, XCircle, MinusCircle, Scale } from "lucide-react";
import { useTheme } from "../theme.js";
import { Card, PageHeader, Field, useInputStyle, formatCurrency } from "../components/ui.jsx";

function numberOrZero(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function ScenarioForm({ title, data, setData, inputStyle }) {
  const t = useTheme();
  return (
    <Card style={{ flex: "1 1 300px" }}>
      <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 14 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Ganho médio por dia trabalhado (R$)">
          <input type="number" min="0" step="0.01" style={inputStyle} value={data.ganho} onChange={(e) => setData({ ...data, ganho: e.target.value })} placeholder="ex: 400" />
        </Field>
        <Field label="Custo de transporte por dia (R$)">
          <input type="number" min="0" step="0.01" style={inputStyle} value={data.transporte} onChange={(e) => setData({ ...data, transporte: e.target.value })} placeholder="ex: 30" />
        </Field>
        <Field label="Ela leva o próprio material?">
          <select style={inputStyle} value={data.levaMaterial ? "sim" : "nao"} onChange={(e) => setData({ ...data, levaMaterial: e.target.value === "sim" })}>
            <option value="nao">Não, a clínica disponibiliza</option>
            <option value="sim">Sim, ela leva o próprio</option>
          </select>
        </Field>
        {data.levaMaterial && (
          <Field label="Custo estimado de material por dia (R$)">
            <input type="number" min="0" step="0.01" style={inputStyle} value={data.material} onChange={(e) => setData({ ...data, material: e.target.value })} placeholder="ex: 25" />
          </Field>
        )}
      </div>
    </Card>
  );
}

export default function Calculadora() {
  const t = useTheme();
  const inputStyle = useInputStyle();

  const [atual, setAtual] = useState({ ganho: "", transporte: "", levaMaterial: false, material: "" });
  const [nova, setNova] = useState({ ganho: "", transporte: "", levaMaterial: false, material: "" });
  const [diasPorMes, setDiasPorMes] = useState("4");

  const resultado = useMemo(() => {
    const liquidoAtual = numberOrZero(atual.ganho) - numberOrZero(atual.transporte) - (atual.levaMaterial ? numberOrZero(atual.material) : 0);
    const liquidoNovo = numberOrZero(nova.ganho) - numberOrZero(nova.transporte) - (nova.levaMaterial ? numberOrZero(nova.material) : 0);
    const diferencaDia = liquidoNovo - liquidoAtual;
    const diferencaMes = diferencaDia * numberOrZero(diasPorMes);
    return { liquidoAtual, liquidoNovo, diferencaDia, diferencaMes };
  }, [atual, nova, diasPorMes]);

  const temDados = atual.ganho !== "" && nova.ganho !== "";

  let veredito = null;
  if (temDados) {
    if (resultado.diferencaDia > 0.5) {
      veredito = { tipo: "compensa", texto: "Compensa trocar", cor: t.success, icon: CheckCircle2 };
    } else if (resultado.diferencaDia < -0.5) {
      veredito = { tipo: "nao_compensa", texto: "Não compensa trocar", cor: t.danger, icon: XCircle };
    } else {
      veredito = { tipo: "empate", texto: "Empate técnico — praticamente igual", cor: t.gold, icon: MinusCircle };
    }
  }

  return (
    <div>
      <PageHeader title="Vale a pena trocar?" subtitle="Compare fria e calculadamente a clínica atual com uma nova proposta." icon={Scale} />

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 18, alignItems: "stretch" }}>
        <ScenarioForm title="Clínica atual" data={atual} setData={setAtual} inputStyle={inputStyle} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
          <ArrowRight size={22} color={t.textMuted} />
        </div>
        <ScenarioForm title="Proposta nova" data={nova} setData={setNova} inputStyle={inputStyle} />
      </div>

      <Card style={{ marginBottom: 18 }}>
        <Field label="Quantos dias por mês ela trabalha nesse dia da semana">
          <input type="number" min="1" max="5" style={{ ...inputStyle, maxWidth: 160 }} value={diasPorMes} onChange={(e) => setDiasPorMes(e.target.value)} />
        </Field>
      </Card>

      {temDados && (
        <>
          <Card style={{ marginBottom: 18 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                    <th style={{ textAlign: "left", fontSize: 12.5, fontWeight: 600, color: t.textMuted, padding: "0 0 10px" }}></th>
                    <th style={{ textAlign: "right", fontSize: 12.5, fontWeight: 600, color: t.textMuted, padding: "0 0 10px" }}>Atual</th>
                    <th style={{ textAlign: "right", fontSize: 12.5, fontWeight: 600, color: t.textMuted, padding: "0 0 10px" }}>Nova</th>
                  </tr>
                </thead>
                <tbody style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13.5 }}>
                  <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: "10px 0", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600 }}>Ganho bruto / dia</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>{formatCurrency(atual.ganho)}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>{formatCurrency(nova.ganho)}</td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: "10px 0", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600 }}>Transporte / dia</td>
                    <td style={{ padding: "10px 0", textAlign: "right", color: t.danger }}>−{formatCurrency(atual.transporte)}</td>
                    <td style={{ padding: "10px 0", textAlign: "right", color: t.danger }}>−{formatCurrency(nova.transporte)}</td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: "10px 0", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600 }}>Material / dia</td>
                    <td style={{ padding: "10px 0", textAlign: "right", color: t.danger }}>−{formatCurrency(atual.levaMaterial ? atual.material : 0)}</td>
                    <td style={{ padding: "10px 0", textAlign: "right", color: t.danger }}>−{formatCurrency(nova.levaMaterial ? nova.material : 0)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 0 0", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700 }}>Líquido / dia</td>
                    <td style={{ padding: "12px 0 0", textAlign: "right", fontWeight: 700 }}>{formatCurrency(resultado.liquidoAtual)}</td>
                    <td style={{ padding: "12px 0 0", textAlign: "right", fontWeight: 700 }}>{formatCurrency(resultado.liquidoNovo)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <Card style={{ background: veredito.cor + "1A", border: `1px solid ${veredito.cor}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <veredito.icon size={28} color={veredito.cor} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: veredito.cor }}>{veredito.texto}</div>
                <div style={{ fontSize: 13, color: t.textMuted, marginTop: 3 }}>
                  Diferença de {formatCurrency(Math.abs(resultado.diferencaDia))} por dia trabalhado
                  {" · "}
                  {formatCurrency(Math.abs(resultado.diferencaMes))} por mês (considerando {diasPorMes || 0} dia(s)/mês)
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {!temDados && (
        <Card>
          <div style={{ fontSize: 13.5, color: t.textMuted }}>Preencha o ganho por dia dos dois lados para ver a comparação.</div>
        </Card>
      )}
    </div>
  );
}
