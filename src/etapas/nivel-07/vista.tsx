// ══ Escena de una pregunta o demostración del nivel 7: fuerzas, poleas o palanca (examen y hero) ───────
import type { EscenaEstatica } from "@/contenido/nivel-07/examen";
import { cargasBarra, direccionLibre, escalaBarra, escalaFuerzas, fuerzasDe, MEDIA_BARRA } from "@/contenido/nivel-07/modelo";
import { EscenaAparejo } from "@/three/estatica/EscenaAparejo";
import { EscenaFuerzas } from "@/three/estatica/EscenaFuerzas";
import { EscenaPalanca } from "@/three/estatica/EscenaPalanca";

/** La escena en equilibrio con la respuesta correcta. `limpia` quita las etiquetas (hero: no chocan con la leyenda). */
export function VistaEstatica({ escena: e, id, corre, limpia = false }: { escena: EscenaEstatica; id: string | number; corre: boolean; limpia?: boolean }) {
  const previa = limpia ? "" : undefined;
  const corrida = corre ? { id: 1 } : null;
  if (e.tipo === "fuerzas") {
    const p = e.p;
    return <EscenaFuerzas key={id} previa={previa} tipo={p.tipo} angulo={p.angulo} angulo2={p.angulo2} fuerzas={fuerzasDe(p, p.respuesta)} libre={direccionLibre(p)} escala={escalaFuerzas(p)} corrida={corrida} />;
  }
  if (e.tipo === "poleas") {
    const p = e.p;
    return <EscenaAparejo key={id} previa={previa} moviles={p.moviles} W={p.W} P={p.P} F={p.respuesta} corrida={corrida} />;
  }
  const p = e.p;
  return <EscenaPalanca key={id} previa={previa} pivote={p.pivote} cargas={cargasBarra(p, p.respuesta)} media={MEDIA_BARRA} escala={escalaBarra(p)} medios={p.unidad === "m"} verMomento={corre} corrida={corrida} />;
}
