// ══ Escena de una pregunta o demostración del nivel 14: el tanque, la prensa o el bloque que flota (examen y hero) ───────
import type { EscenaFluidos } from "@/contenido/nivel-14/examen";
import { fmtF, LIQUIDOS, MATERIALES } from "@/contenido/nivel-14/modelo";
import { EscenaFlotacion } from "@/three/fluidos/EscenaFlotacion";
import { EscenaPrensa } from "@/three/fluidos/EscenaPrensa";
import { EscenaPresion } from "@/three/fluidos/EscenaPresion";

const liquido = (l: keyof typeof LIQUIDOS) => `${LIQUIDOS[l].nombre} · ρ = ${LIQUIDOS[l].rho} kg/m³`;

/** Los émbolos como los da el enunciado: «A₁ = 0,02 m²» o «r₁ = 3 cm». */
function embolo(dato: "m2" | "cm2" | "radio", val: number, i: 1 | 2): string {
  const sub = i === 1 ? "₁" : "₂";
  if (dato === "radio") return `r${sub} = ${fmtF(val)} cm`;
  return `A${sub} = ${fmtF(val)} ${dato === "m2" ? "m²" : "cm²"}`;
}

/** La escena con la respuesta correcta. `limpia` quita las etiquetas (hero: no chocan con la leyenda). */
export function VistaFluidos({ escena: e, id, corre, limpia = false }: { escena: EscenaFluidos; id: string | number; corre: boolean; limpia?: boolean }) {
  const previa = limpia ? "" : undefined;
  const corrida = corre ? { id: 1 } : null;
  const verValor = corre && !limpia;
  if (e.tipo === "presion") {
    const p = e.p;
    return <EscenaPresion key={id} previa={previa} color={LIQUIDOS[p.liquido].color} h={p.h} absoluta={p.absoluta} P={p.respuesta} Ppropuesta={null} textoLiquido={liquido(p.liquido)} verValor={verValor} corrida={corrida} />;
  }
  if (e.tipo === "prensa") {
    const p = e.p;
    // la mano aparece al responder (antes, su rótulo daría la respuesta), con la fuerza justa: el auto queda en equilibrio
    return <EscenaPrensa key={id} previa={previa} F={p.respuesta} Fpropuesta={corre ? p.respuesta : null} textoA1={embolo(p.dato, p.a1, 1)} textoA2={embolo(p.dato, p.a2, 2)} textoAuto={`${p.masa} kg`} verValor={verValor} corrida={corrida} />;
  }
  const p = e.p;
  const textoBloque = p.masa !== undefined ? `cubo · ${fmtF(p.masa)} kg` : `${MATERIALES[p.material].nombre} · ${p.rhoC} kg/m³`;
  return <EscenaFlotacion key={id} previa={previa} colorLiquido={LIQUIDOS[p.liquido].color} colorBloque={MATERIALES[p.material].color} H={p.H} h={p.respuesta} hPropuesta={null} textoBloque={textoBloque} textoLiquido={liquido(p.liquido)} verValor={verValor} corrida={corrida} />;
}
