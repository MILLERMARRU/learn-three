// ══ Escena de una pregunta o demostración del nivel 8: bloque, plano inclinado o sistema de bloques (examen y hero) ───────
import type { EscenaDinamica } from "@/contenido/nivel-08/examen";
import { LARGO_PLANO } from "@/contenido/nivel-08/modelo";
import { EscenaBloque } from "@/three/dinamica/EscenaBloque";
import { EscenaPlanoD } from "@/three/dinamica/EscenaPlanoD";
import { EscenaSistema } from "@/three/dinamica/EscenaSistema";

/** La escena con la respuesta correcta. `limpia` quita las etiquetas (hero: no chocan con la leyenda). */
export function VistaDinamica({ escena: e, id, corre, limpia = false }: { escena: EscenaDinamica; id: string | number; corre: boolean; limpia?: boolean }) {
  const previa = limpia ? "" : undefined;
  const corrida = corre ? { id: 1 } : null;
  if (e.tipo === "bloque") {
    const p = e.p;
    return <EscenaBloque key={id} previa={previa} m={p.m} d={p.d} t={p.t} mu={p.mu} F={p.respuesta} corrida={corrida} />;
  }
  if (e.tipo === "plano") {
    const p = e.p;
    return <EscenaPlanoD key={id} previa={previa} theta={p.theta} mu={p.mu} largo={LARGO_PLANO} aFantasma={p.respuesta} conFantasma={false} corrida={corrida} />;
  }
  const p = e.p;
  return <EscenaSistema key={id} previa={previa} tipo={p.tipo} m1={p.m1} m2={p.m2} mu={p.mu} aReal={p.sistema.a} aFantasma={null} tension={corre && !limpia ? p.sistema.T : null} corrida={corrida} />;
}
