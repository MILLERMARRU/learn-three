// ══ Escena de una pregunta o demostración del nivel 9: esferas que se atraen, planeta con tubo de caída u órbitas (examen y hero) ───────
import type { EscenaGravitacion } from "@/contenido/nivel-09/examen";
import { conUnidad, textoPedida, textoRef } from "@/contenido/nivel-09/modelo";
import { EscenaAtraccion } from "@/three/gravitacion/EscenaAtraccion";
import { EscenaGravedad } from "@/three/gravitacion/EscenaGravedad";
import { EscenaOrbitas } from "@/three/gravitacion/EscenaOrbitas";

/** La escena con la respuesta correcta. `limpia` quita las etiquetas (hero: no chocan con la leyenda). */
export function VistaGravitacion({ escena: e, id, corre, limpia = false }: { escena: EscenaGravitacion; id: string | number; corre: boolean; limpia?: boolean }) {
  const previa = limpia ? "" : undefined;
  const corrida = corre ? { id: 1 } : null;
  const verValor = corre && !limpia;
  if (e.tipo === "atraccion") {
    const p = e.p;
    return <EscenaAtraccion key={id} previa={previa} F0={p.F0} k1={p.k1} k2={p.k2} kd={p.kd} F={null} Freal={p.respuesta} verValor={verValor} corrida={corrida} />;
  }
  if (e.tipo === "gravedad") {
    const p = e.p;
    return <EscenaGravedad key={id} previa={previa} kM={p.kM} kR={p.kR} hR={p.hR} gReal={p.respuesta} gFantasma={null} verValor={verValor} corrida={corrida} />;
  }
  const p = e.p;
  const pedida = verValor ? `${textoPedida(p)} · ${p.tipo === "T" ? "T₂" : "v"} = ${conUnidad(p.respuesta, p.unidad)}` : textoPedida(p);
  return <EscenaOrbitas key={id} previa={previa} tipo={p.tipo} q={p.q} dato={p.ref} real={p.respuesta} fantasma={null} rasante={p.rasante} textoRef={textoRef(p)} textoPedida={pedida} corrida={corrida} />;
}
