// ══ Escena de una pregunta o demostración del nivel 16: el cilindro, el diagrama P–V o la máquina térmica (examen y hero) ───────
import type { EscenaTermo } from "@/contenido/nivel-16/examen";
import { fmtT, type ProblemaMaquina } from "@/contenido/nivel-16/modelo";
import { kelvin } from "@/lib/termo";
import { EscenaGas } from "@/three/termo/EscenaGas";
import { EscenaMaquina } from "@/three/termo/EscenaMaquina";
import { EscenaTrabajo } from "@/three/termo/EscenaTrabajo";

/** Rótulos de la máquina: solo los valores que da el enunciado. */
function textosMaquina(p: ProblemaMaquina) {
  if (p.dato === "carnot") return { textoCaliente: `T₁ = ${fmtT(p.a)} °C`, textoFrio: `T₂ = ${fmtT(p.b)} °C`, textoQ1: "Q₁", textoW: "W", textoQ2: "Q₂" };
  if (p.dato === "trabajo") return { textoCaliente: "foco caliente", textoFrio: "foco frío", textoQ1: `Q₁ = ${p.a} J`, textoW: `W = ${p.b} J`, textoQ2: "Q₂" };
  return { textoCaliente: "foco caliente", textoFrio: "foco frío", textoQ1: `Q₁ = ${p.a} J`, textoW: "W", textoQ2: `Q₂ = ${p.b} J` };
}

/** La escena con la respuesta correcta. `limpia` quita las etiquetas (hero: no chocan con la leyenda). */
export function VistaTermo({ escena: e, id, corre, limpia = false }: { escena: EscenaTermo; id: string | number; corre: boolean; limpia?: boolean }) {
  const previa = limpia ? "" : undefined;
  const corrida = corre ? { id: 1 } : null;
  const verValor = corre && !limpia;
  if (e.tipo === "gas") {
    const p = e.p;
    const textoP = p.P1 === p.P2 ? `P = ${p.P1} atm` : `P: ${p.P1} → ${p.P2} atm`;
    const textoT = p.t1 === p.t2 ? `T constante · ${fmtT(p.t1)} °C` : `${fmtT(p.t1)} °C → ${fmtT(p.t2)} °C`;
    return <EscenaGas key={id} previa={previa} P1={p.P1} P2={p.P2} V1={p.V1} V2={p.respuesta} Vpropuesto={null} T1={kelvin(p.t1)} T2={kelvin(p.t2)} textoP={textoP} textoT={textoT} verValor={verValor} corrida={corrida} />;
  }
  if (e.tipo === "trabajo") {
    const p = e.p;
    const uV = p.unidades === "kPa-m3" ? "m³" : "L";
    const uP = p.unidades === "atm-L" ? "atm" : "kPa";
    return <EscenaTrabajo key={id} previa={previa} Pk={p.Pk} V1={p.V1m} V2={p.V2m} Wpropuesto={null} W={p.respuesta} textoP={`P = ${fmtT(p.P)} ${uP}`} textoV1={`V₁ = ${fmtT(p.V1)} ${uV}`} textoV2={`V₂ = ${fmtT(p.V2)} ${uV}`} verValor={verValor} corrida={corrida} />;
  }
  return <EscenaMaquina key={id} previa={previa} eta={e.p.respuesta} etaPropuesta={null} {...textosMaquina(e.p)} verValor={verValor} corrida={corrida} />;
}
