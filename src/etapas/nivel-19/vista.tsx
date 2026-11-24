// ══ Escena de una pregunta o demostración del nivel 19: el condensador, la asociación o la descarga (examen y hero) ───────
import type { EscenaCondensadores } from "@/contenido/nivel-19/examen";
import { C_ESCALA, fmtC, Q_ESCALA, U_ESCALA, type ProblemaEnergiaC } from "@/contenido/nivel-19/modelo";
import { EscenaRed } from "@/three/circuitos/EscenaRed";
import { EscenaCarga } from "@/three/condensadores/EscenaCarga";
import { EscenaEnergia } from "@/three/condensadores/EscenaEnergia";

function textosEnergia(p: ProblemaEnergiaC): { textoArriba: string; textoAbajo: string } {
  if (p.dato === "CV") return { textoArriba: `C = ${fmtC(p.a)} μF`, textoAbajo: `V = ${p.b} V` };
  if (p.dato === "QC") return { textoArriba: `Q = ${p.a} μC`, textoAbajo: `C = ${fmtC(p.b)} μF` };
  if (p.dato === "QV") return { textoArriba: `Q = ${p.a} μC`, textoAbajo: `V = ${p.b} V` };
  return { textoArriba: `${(p.cs ?? []).join(" y ")} μF en ${p.dato}`, textoAbajo: `V = ${p.b} V` };
}

/** La escena con la respuesta correcta. `limpia` quita las etiquetas (hero: no chocan con la leyenda). */
export function VistaCondensadores({ escena: e, id, corre, limpia = false }: { escena: EscenaCondensadores; id: string | number; corre: boolean; limpia?: boolean }) {
  const previa = limpia ? "" : undefined;
  const corrida = corre ? { id: 1 } : null;
  const verValor = corre && !limpia;
  if (e.tipo === "carga") {
    const p = e.p;
    return <EscenaCarga key={id} previa={previa} Q={p.respuesta} propuesta={null} escala={Q_ESCALA} dielectrico={p.kappa > 1} textoC={`C = ${fmtC(p.C)} μF${p.kappa > 1 ? ` · κ = ${p.kappa}` : ""}`} textoV={`V = ${p.V} V`} verValor={verValor} corrida={corrida} />;
  }
  if (e.tipo === "asociacion") {
    const p = e.p;
    return <EscenaRed key={id} previa={previa} tipo={p.tipo} rs={p.cs} componente="condensador" unidad="μF" simbolo="C" textoMedidor="capacímetro" R={p.respuesta} propuesta={null} escala={C_ESCALA} verValor={verValor} corrida={corrida} />;
  }
  return <EscenaEnergia key={id} previa={previa} U={e.p.respuesta} propuesta={null} escala={U_ESCALA} {...textosEnergia(e.p)} verValor={verValor} corrida={corrida} />;
}
