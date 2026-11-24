// ══ Escena de una pregunta o demostración del nivel 12: el resorte, el péndulo o el círculo de referencia (examen y hero) ───────
import type { EscenaOscilacion } from "@/contenido/nivel-12/examen";
import { EscenaCirculo } from "@/three/oscilaciones/EscenaCirculo";
import { EscenaPendulo } from "@/three/oscilaciones/EscenaPendulo";
import { EscenaResorte } from "@/three/oscilaciones/EscenaResorte";

/** La escena con la respuesta correcta. `limpia` quita las etiquetas (hero: no chocan con la leyenda). */
export function VistaOscilacion({ escena: e, id, corre, limpia = false }: { escena: EscenaOscilacion; id: string | number; corre: boolean; limpia?: boolean }) {
  const previa = limpia ? "" : undefined;
  const corrida = corre ? { id: 1 } : null;
  const verValor = corre && !limpia;
  if (e.tipo === "resorte") {
    const p = e.p;
    return <EscenaResorte key={id} previa={previa} m={p.m} k={p.k} T={p.respuesta} Tfantasma={null} verValor={verValor} corrida={corrida} />;
  }
  if (e.tipo === "pendulo") {
    const p = e.p;
    return <EscenaPendulo key={id} previa={previa} L={p.L} g={p.g} T={p.respuesta} Tfantasma={null} verValor={verValor} corrida={corrida} />;
  }
  const p = e.p;
  const nombre = p.tipo === "v" ? "v máx" : p.tipo === "a" ? "a máx" : "v";
  const rotulo = verValor ? `${nombre} = ${p.respuesta} ${p.tipo === "a" ? "m/s²" : "m/s"}` : null;
  return <EscenaCirculo key={id} previa={previa} A={p.A} w={p.w} wFantasma={null} x={p.x} rotulo={rotulo} corrida={corrida} />;
}
