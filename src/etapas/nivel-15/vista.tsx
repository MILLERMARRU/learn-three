// ══ Escena de una pregunta o demostración del nivel 15: la barra, la placa con el termómetro o el calorímetro (examen y hero) ───────
import type { EscenaCalor } from "@/contenido/nivel-15/examen";
import { fmtC, METALES, SUSTANCIAS, type CuerpoMezcla } from "@/contenido/nivel-15/modelo";
import { EscenaCalentador } from "@/three/calor/EscenaCalentador";
import { EscenaDilatacion } from "@/three/calor/EscenaDilatacion";
import { EscenaMezcla } from "@/three/calor/EscenaMezcla";

const cuerpo = (k: CuerpoMezcla) => `${SUSTANCIAS[k.sustancia].nombre} · ${k.m} g · ${fmtC(k.T)} °C`;
const miles = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/** La escena con la respuesta correcta. `limpia` quita las etiquetas (hero: no chocan con la leyenda). */
export function VistaCalor({ escena: e, id, corre, limpia = false }: { escena: EscenaCalor; id: string | number; corre: boolean; limpia?: boolean }) {
  const previa = limpia ? "" : undefined;
  const corrida = corre ? { id: 1 } : null;
  const verValor = corre && !limpia;
  if (e.tipo === "dilatacion") {
    const p = e.p;
    const met = METALES[p.metal];
    const textoTemp = p.conTemps ? `${fmtC(p.T0)} °C → ${fmtC(p.T1)} °C` : `ΔT = ${p.T1 - p.T0} °C`;
    return <EscenaDilatacion key={id} previa={previa} colorMetal={met.color} dL={p.respuesta} dLpropuesto={null} enfria={p.T1 < p.T0} textoBarra={`${met.nombre} · L₀ = ${fmtC(p.L0)} m`} textoTemp={textoTemp} verValor={verValor} corrida={corrida} />;
  }
  if (e.tipo === "calentador") {
    const p = e.p;
    const s = SUSTANCIAS[p.sustancia];
    const masa = p.enKilo ? `${fmtC(p.m / 1000)} kg` : `${p.m} g`;
    const Q = p.enKilo ? `${fmtC(p.Q / 1000)} kcal` : `${miles(p.Q)} cal`;
    return <EscenaCalentador key={id} previa={previa} color={s.color} liquida={s.liquida} T0={p.T0} T={p.respuesta} Tpropuesta={null} textoSustancia={`${s.nombre} · ${masa}`} textoQ={`Q = ${Q}`} verValor={verValor} corrida={corrida} />;
  }
  const p = e.p;
  const a = SUSTANCIAS[p.a.sustancia];
  return (
    <EscenaMezcla
      key={id}
      previa={previa}
      colorA={a.color}
      liquidoA={a.liquida}
      fraccionA={p.a.m / (p.a.m + p.b.m)}
      colorB={SUSTANCIAS[p.b.sustancia].color}
      Tb={p.b.T}
      Te={p.respuesta}
      Tpropuesta={null}
      textoA={cuerpo(p.a)}
      textoB={cuerpo(p.b)}
      verValor={verValor}
      corrida={corrida}
    />
  );
}
