// ══ Escena de una pregunta o demostración del nivel 17: las esferas, el campo en un punto o el potencial (examen y hero) ───────
import type { EscenaElectro } from "@/contenido/nivel-17/examen";
import { fmtQ } from "@/contenido/nivel-17/modelo";
import { EscenaCampo } from "@/three/electro/EscenaCampo";
import { EscenaCoulomb } from "@/three/electro/EscenaCoulomb";
import { EscenaPotencial } from "@/three/electro/EscenaPotencial";

const dm = (d: number) => String(d).replace(".", ",");

/** La escena con la respuesta correcta. `limpia` quita las etiquetas (hero: no chocan con la leyenda). */
export function VistaElectro({ escena: e, id, corre, limpia = false }: { escena: EscenaElectro; id: string | number; corre: boolean; limpia?: boolean }) {
  const previa = limpia ? "" : undefined;
  const corrida = corre ? { id: 1 } : null;
  const verValor = corre && !limpia;
  if (e.tipo === "coulomb") {
    const p = e.p;
    return <EscenaCoulomb key={id} previa={previa} q1={p.q1} q2={p.q2} d={p.d} F={p.respuesta} Fpropuesta={null} textoQ1={`q₁ = ${fmtQ(p.q1)}`} textoQ2={`q₂ = ${fmtQ(p.q2)}`} verValor={verValor} corrida={corrida} />;
  }
  if (e.tipo === "campo") {
    const p = e.p;
    const textos = p.cargas.map((c, i) => `${p.cargas.length === 2 ? `q${i === 0 ? "₁" : "₂"} = ` : "Q = "}${fmtQ(c.q)}`);
    return <EscenaCampo key={id} previa={previa} cargas={p.cargas} E={p.respuesta} sentido={p.sentido} Epropuesto={null} textos={textos} verValor={verValor} corrida={corrida} />;
  }
  const p = e.p;
  return (
    <EscenaPotencial
      key={id}
      previa={previa}
      Q={p.Q}
      dA={p.dA}
      dB={p.dB}
      valor={p.respuesta}
      propuesta={null}
      unidad={p.tipo === "V" ? "kV" : "mJ"}
      textoQ={`Q = ${fmtQ(p.Q)}`}
      textoA={`${p.tipo === "V" ? "P" : "A"} · ${dm(p.dA)} m`}
      textoB={p.dB === null ? "" : `B · ${dm(p.dB)} m`}
      verValor={verValor}
      corrida={corrida}
    />
  );
}
