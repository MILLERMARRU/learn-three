// ══ Escena de una pregunta o demostración del nivel 6: rueda, tren de poleas o curva (examen y hero) ───────
import type { EscenaExamen } from "@/contenido/nivel-06/examen";
import { EscenaCurva } from "@/three/circular/EscenaCurva";
import { EscenaRuedas } from "@/three/circular/EscenaRuedas";
import { RADIO_RUEDA } from "./comun";
import { fajasDe, ruedasDe } from "./disposicion";

/** La escena de cada pregunta: rueda, tren de poleas o curva. `limpia` quita las etiquetas (hero: no chocan con la leyenda). */
export function VistaCircular({ escena: e, id, corre, limpia = false }: { escena: EscenaExamen; id: string | number; corre: boolean; limpia?: boolean }) {
  const previa = limpia ? "" : undefined;
  if (e.tipo === "rueda") {
    return <EscenaRuedas key={id} previa={previa} medirGiro ruedas={[{ x: 0, y: 0, r: RADIO_RUEDA, k: e.k, objetivo: e.objetivo ?? null }]} corrida={corre ? { id: 1, tFin: e.tFin } : null} />;
  }
  if (e.tipo === "poleas") {
    const p = { id: String(id), radios: e.radios, uniones: e.uniones, ks: e.ks, respuesta: Math.abs(e.ks[e.ks.length - 1]), pistas: ["", ""] as [string, string] };
    return <EscenaRuedas key={id} previa={previa} ruedas={ruedasDe(p, p.respuesta, null)} fajas={fajasDe(p)} corrida={corre ? { id: 1, tFin: e.tFin } : null} />;
  }
  return <EscenaCurva key={id} previa={previa} R={e.R} aMax={e.aMax} v={e.v} corrida={corre ? { id: 1 } : null} />;
}
