// ══ Escena de una pregunta o demostración del nivel 20: el cable entre los polos, el campo de un cable o la inducción (examen y hero) ───────
import type { EscenaMagnetismo } from "@/contenido/nivel-20/examen";
import { B_ESCALA, E_ESCALA, F_ESCALA, fmtM, type ProblemaInduccion } from "@/contenido/nivel-20/modelo";
import { EscenaCampoRecto } from "@/three/magnetismo/EscenaCampoRecto";
import { EscenaConductor } from "@/three/magnetismo/EscenaConductor";
import { EscenaInduccion } from "@/three/magnetismo/EscenaInduccion";

function textosInduccion(p: ProblemaInduccion) {
  if (p.modo === "barra") return { textoArriba: `B = ${fmtM(p.B)} T ⊗`, textoAbajo: `v = ${p.v} m/s`, textoLado: `L = ${p.enCm ? `${Math.round(p.L * 100)} cm` : `${fmtM(p.L)} m`}` };
  return { textoArriba: `N = ${p.N} · A = ${fmtM(p.A)} m²`, textoAbajo: `ΔB = ${fmtM(p.dB)} T en ${fmtM(p.dt)} s`, textoLado: "" };
}

/** La escena con la respuesta correcta. `limpia` quita las etiquetas (hero: no chocan con la leyenda). */
export function VistaMagnetismo({ escena: e, id, corre, limpia = false }: { escena: EscenaMagnetismo; id: string | number; corre: boolean; limpia?: boolean }) {
  const previa = limpia ? "" : undefined;
  const corrida = corre ? { id: 1 } : null;
  const verValor = corre && !limpia;
  if (e.tipo === "conductor") {
    const p = e.p;
    const textoB = `B = ${p.enMili ? `${Math.round(p.B * 1000)} mT` : `${fmtM(p.B)} T`}`;
    const textoL = `L = ${p.enMili ? `${Math.round(p.L * 100)} cm` : `${fmtM(p.L)} m`}${p.theta !== 90 ? ` · θ = ${p.theta}°` : ""}`;
    return <EscenaConductor key={id} previa={previa} F={p.respuesta} propuesta={null} escala={F_ESCALA} textoB={textoB} textoI={`I = ${fmtM(p.I)} A`} textoL={textoL} verValor={verValor} corrida={corrida} />;
  }
  if (e.tipo === "campo") {
    const p = e.p;
    const textos = p.cables.map((c, i) => `${p.cables.length === 2 ? `I${i === 0 ? "₁" : "₂"}` : "I"} = ${c.I} A ${c.sentido > 0 ? "⊙" : "⊗"}`);
    return <EscenaCampoRecto key={id} previa={previa} cables={p.cables} d={p.d} B={p.respuesta} sentidoB={p.sentidoB} propuesta={null} escala={B_ESCALA} textos={textos} verValor={verValor} corrida={corrida} />;
  }
  return <EscenaInduccion key={id} previa={previa} modo={e.p.modo} E={e.p.respuesta} propuesta={null} escala={E_ESCALA} {...textosInduccion(e.p)} verValor={verValor} corrida={corrida} />;
}
