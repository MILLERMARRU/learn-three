// ══ Escena de una pregunta o demostración del nivel 13: la onda, el pulso o la onda estacionaria (examen y hero) ───────
import type { EscenaOndas } from "@/contenido/nivel-13/examen";
import { fmtO } from "@/contenido/nivel-13/modelo";
import { EscenaEstacionaria } from "@/three/ondas/EscenaEstacionaria";
import { EscenaOnda } from "@/three/ondas/EscenaOnda";
import { EscenaPulso } from "@/three/ondas/EscenaPulso";

const SUB = "₀₁₂₃₄₅₆₇₈₉";
const sub = (n: number) => String(n).replace(/\d/g, (d) => SUB[+d]);

/** La escena con la respuesta correcta. `limpia` quita las etiquetas (hero: no chocan con la leyenda). */
export function VistaOndas({ escena: e, id, corre, limpia = false }: { escena: EscenaOndas; id: string | number; corre: boolean; limpia?: boolean }) {
  const previa = limpia ? "" : undefined;
  const corrida = corre ? { id: 1 } : null;
  const verValor = corre && !limpia;
  if (e.tipo === "onda") {
    const p = e.p;
    return <EscenaOnda key={id} previa={previa} tipo={p.tipo} lambda={p.lambda} f={p.f} v={p.v} conT={p.conT} propuesta={null} verValor={verValor} corrida={corrida} />;
  }
  if (e.tipo === "pulso") {
    const p = e.p;
    return <EscenaPulso key={id} previa={previa} T={p.T} mu={p.mu} masa={p.masa} v={p.respuesta} vFantasma={null} verValor={verValor} corrida={corrida} />;
  }
  const p = e.p;
  const datoIzq = p.conF1 ? `f₁ = ${fmtO(p.v / (2 * p.L))} Hz` : `v = ${fmtO(p.v)} m/s`;
  const rotulo = verValor ? `${p.tipo === "f" ? "f" : "λ"}${sub(p.n)} = ${p.respuesta} ${p.tipo === "f" ? "Hz" : "m"}` : null;
  return <EscenaEstacionaria key={id} previa={previa} n={p.n} nFantasma={null} L={p.L} v={p.v} datoIzq={datoIzq} datoDer={`n = ${p.n}`} rotulo={rotulo} corrida={corrida} />;
}
