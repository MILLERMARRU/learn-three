// ══ Escena de una pregunta o demostración del nivel 10: el empujón, la pista o la grúa (examen y hero) ───────
import type { EscenaEnergiaExamen } from "@/contenido/nivel-10/examen";
import { EscenaEmpujon } from "@/three/energia/EscenaEmpujon";
import { EscenaGrua } from "@/three/energia/EscenaGrua";
import { EscenaPista } from "@/three/energia/EscenaPista";

/** La escena con la respuesta correcta. `limpia` quita las etiquetas (hero: no chocan con la leyenda). */
export function VistaEnergia({ escena: e, id, corre, limpia = false }: { escena: EscenaEnergiaExamen; id: string | number; corre: boolean; limpia?: boolean }) {
  const previa = limpia ? "" : undefined;
  const corrida = corre ? { id: 1 } : null;
  const verValor = corre && !limpia;
  if (e.tipo === "trabajo") {
    const p = e.p;
    return <EscenaEmpujon key={id} previa={previa} m={p.m} F={p.F} theta={p.theta} d={p.d} mu={p.mu} v0={p.v0} vReal={p.respuesta} vFantasma={null} verValor={verValor} corrida={corrida} />;
  }
  if (e.tipo === "pista") {
    const p = e.p;
    return <EscenaPista key={id} previa={previa} tipo={p.tipo} h1={p.h1} v0={p.v0} h2={p.h2} real={p.respuesta} propuesta={null} verValor={verValor} corrida={corrida} />;
  }
  const p = e.p;
  return <EscenaGrua key={id} previa={previa} m={p.m} h={p.h} t={p.t} eta={p.eta} P={p.respuesta} corrida={corrida} />;
}
