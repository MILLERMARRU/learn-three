// ══ Escena de una pregunta o demostración del nivel 21: la onda sobre el espectro, los polarizadores o el radar (examen y hero) ───────
import type { EscenaOndasEM } from "@/contenido/nivel-21/examen";
import { fmtO, I_ESCALA, MAGNITUDES, MAGNITUDES_RADAR, type ProblemaEspectro, type ProblemaRadar } from "@/contenido/nivel-21/modelo";
import { EscenaEspectro } from "@/three/ondasEM/EscenaEspectro";
import { EscenaPolarizacion } from "@/three/ondasEM/EscenaPolarizacion";
import { EscenaRadar } from "@/three/ondasEM/EscenaRadar";

const r6 = (x: number) => Math.round(x * 1e6) / 1e6;
const nombreRegion = (r: string) => (r === "visible" ? "luz visible" : r);

function datoEspectro(p: ProblemaEspectro): string {
  if (p.pide === "fMHz") return `λ = ${fmtO(p.lambda)} m`;
  if (p.pide === "lambdaM") return `f = ${p.f / 1e6} MHz`;
  return `f = ${fmtO(p.f / 1e14)} × 10¹⁴ Hz`;
}

function datoRadar(p: ProblemaRadar): string {
  if (p.pide === "tUs") return `d = ${r6(p.d / 1000)} km`;
  return p.unidadT === "ms" ? `t = ${fmtO(r6(p.t * 1e3))} ms` : `t = ${r6(p.t * 1e6)} µs`;
}

/** La escena con la respuesta correcta. `limpia` quita las etiquetas (hero: no chocan con la leyenda). */
export function VistaOndasEM({ escena: e, id, corre, limpia = false }: { escena: EscenaOndasEM; id: string | number; corre: boolean; limpia?: boolean }) {
  const previa = limpia ? "" : undefined;
  const corrida = corre ? { id: 1 } : null;
  const verValor = corre && !limpia;
  if (e.tipo === "espectro") {
    const p = e.p;
    const m = MAGNITUDES[p.pide];
    return <EscenaEspectro key={id} previa={previa} region={p.region} valor={p.respuesta} propuesta={null} escala={m.escala} textoDato={datoEspectro(p)} textoValor={`${m.simbolo} = ${p.respuesta} ${m.unidad} · ${nombreRegion(p.region)}`} verValor={verValor} corrida={corrida} />;
  }
  if (e.tipo === "polarizacion") {
    const p = e.p;
    return <EscenaPolarizacion key={id} previa={previa} I0={p.I0} theta={p.theta} noPolarizada={p.noPolarizada} I={p.respuesta} propuesta={null} escala={I_ESCALA} textoI0={`I₀ = ${p.I0} W/m² · ${p.noPolarizada ? "sin polarizar" : "polarizada"}`} textoTheta={`θ = ${p.theta}°`} verValor={verValor} corrida={corrida} />;
  }
  const p = e.p;
  const m = MAGNITUDES_RADAR[p.pide];
  return <EscenaRadar key={id} previa={previa} valor={p.respuesta} propuesta={null} escala={m.escala} textoDato={datoRadar(p)} textoValor={`${m.simbolo} = ${p.respuesta} ${m.unidad}`} textoMedidor={p.pide === "dKm" ? "distancia" : "tiempo del eco"} verValor={verValor} corrida={corrida} />;
}
