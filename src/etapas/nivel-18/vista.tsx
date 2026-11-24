// ══ Escena de una pregunta o demostración del nivel 18: el circuito, la red de resistencias o el foco (examen y hero) ───────
import type { EscenaCircuitos } from "@/contenido/nivel-18/examen";
import { fmtE, MEDIDORES, P_ESCALA, RED_ESCALA, type ProblemaOhm, type ProblemaPotenciaE } from "@/contenido/nivel-18/modelo";
import { EscenaOhm } from "@/three/circuitos/EscenaOhm";
import { EscenaPotencia } from "@/three/circuitos/EscenaPotencia";
import { EscenaRed } from "@/three/circuitos/EscenaRed";

const valOhm = (p: ProblemaOhm, m: "I" | "V" | "R") => (p.pide === m ? "?" : `${fmtE(p[m])} ${MEDIDORES[m].unidad}`);

function textosPotencia(p: ProblemaPotenciaE) {
  if (p.dato === "nominal") return { textoFuente: `V = ${fmtE(p.c ?? 0)} V`, textoFoco: `foco ${p.a} W · ${p.b} V`, textoI: "I = ?" };
  if (p.dato === "VI") return { textoFuente: `V = ${fmtE(p.a)} V`, textoFoco: "foco", textoI: `I = ${fmtE(p.b)} A` };
  if (p.dato === "IR") return { textoFuente: "fuente", textoFoco: `R = ${fmtE(p.b)} Ω`, textoI: `I = ${fmtE(p.a)} A` };
  return { textoFuente: `V = ${fmtE(p.a)} V`, textoFoco: `R = ${fmtE(p.b)} Ω`, textoI: "I = ?" };
}

/** La escena con la respuesta correcta. `limpia` quita las etiquetas (hero: no chocan con la leyenda). */
export function VistaCircuitos({ escena: e, id, corre, limpia = false }: { escena: EscenaCircuitos; id: string | number; corre: boolean; limpia?: boolean }) {
  const previa = limpia ? "" : undefined;
  const corrida = corre ? { id: 1 } : null;
  const verValor = corre && !limpia;
  if (e.tipo === "ohm") {
    const p = e.p;
    return (
      <EscenaOhm
        key={id}
        previa={previa}
        pide={p.pide}
        escala={MEDIDORES[p.pide].escala}
        valor={p.respuesta}
        propuesta={null}
        I={p.I}
        textoPila={`V = ${valOhm(p, "V")}`}
        textoR={`R = ${valOhm(p, "R")}`}
        textoI={`I = ${valOhm(p, "I")}`}
        textoMedidor={MEDIDORES[p.pide].medidor}
        verValor={verValor}
        corrida={corrida}
      />
    );
  }
  if (e.tipo === "red") {
    const p = e.p;
    return <EscenaRed key={id} previa={previa} tipo={p.tipo} rs={p.rs} R={p.respuesta} propuesta={null} escala={RED_ESCALA} verValor={verValor} corrida={corrida} />;
  }
  return <EscenaPotencia key={id} previa={previa} P={e.p.respuesta} propuesta={null} escala={P_ESCALA} {...textosPotencia(e.p)} verValor={verValor} corrida={corrida} />;
}
