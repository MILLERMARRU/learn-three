// ══ Escena de una pregunta o demostración del nivel 11: el golpe, un choque plástico o explosión, o un choque con restitución ───────
import type { EscenaMomento } from "@/contenido/nivel-11/examen";
import { conSigno } from "@/contenido/nivel-11/modelo";
import { EscenaGolpe } from "@/three/momento/EscenaGolpe";
import { EscenaRiel } from "@/three/momento/EscenaRiel";

/** La escena con la respuesta correcta. `limpia` quita las etiquetas (hero: no chocan con la leyenda). */
export function VistaMomento({ escena: e, id, corre, limpia = false }: { escena: EscenaMomento; id: string | number; corre: boolean; limpia?: boolean }) {
  const previa = limpia ? "" : undefined;
  const corrida = corre ? { id: 1 } : null;
  const verValor = corre && !limpia;
  if (e.tipo === "golpe") {
    const p = e.p;
    return <EscenaGolpe key={id} previa={previa} m={p.m} F={p.F} v0={p.v0} forma={p.forma} vReal={p.respuesta} vFantasma={null} verValor={verValor} corrida={corrida} />;
  }
  if (e.tipo === "conservacion") {
    const p = e.p;
    const plastico = p.tipo === "plastico";
    return (
      <EscenaRiel
        key={id}
        previa={previa}
        m1={p.m1}
        m2={p.m2}
        modo={plastico ? "choque" : "explosion"}
        u1={p.u1}
        u2={p.u2}
        w1={plastico ? p.respuesta : p.w1}
        w2={p.respuesta}
        fantasmaDe={plastico ? "juntos" : 2}
        propuesta={null}
        rotulo={verValor ? `v = ${conSigno(p.respuesta)} m/s` : null}
        corrida={corrida}
      />
    );
  }
  const p = e.p;
  return (
    <EscenaRiel
      key={id}
      previa={previa}
      m1={p.m1}
      m2={p.m2}
      modo="choque"
      u1={p.u1}
      u2={p.u2}
      w1={p.w1}
      w2={p.w2}
      fantasmaDe={p.pedido}
      propuesta={null}
      rotulo={verValor ? `v₁′ = ${conSigno(p.w1)} · v₂′ = ${conSigno(p.w2)} m/s` : null}
      corrida={corrida}
    />
  );
}
