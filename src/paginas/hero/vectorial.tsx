// ══ Hero del Nivel 2: vectores que se encadenan (método del polígono) y su resultante ───────
import { COLOR } from "@/contenido/nivel-02/vectores";
import { fmtVec, modulo, suma, type Vec } from "@/lib/vec";
import { PlanoVectorial, type VectorFijo } from "@/three/vectores/PlanoVectorial";
import { V } from "@/ui/Formula";
import type { Hero } from "./tipos";

const EJEMPLOS: { A: Vec; B: Vec }[] = [
  { A: [3, 1], B: [1, 2] },
  { A: [-1, 3], B: [4, 1] },
  { A: [-3, 1], B: [1, 2] },
  { A: [2, -2], B: [-4, 1] },
];
const DUR = 32; // ≈ 5,4 s por ejemplo: A → A + B → R

export const heroVectorial: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const { A, B } = EJEMPLOS[ciclo % EJEMPLOS.length];
  const k = tick % DUR;
  const fase = k < 8 ? 0 : k < 16 ? 1 : 2;
  const R = suma(A, B);
  const m = modulo(R);

  const fijos: VectorFijo[] = [{ v: A, color: COLOR.A, etiqueta: <V>A</V> }];
  // la punta de B coincide con la de R: al aparecer R, B se queda sin rótulo para no encimarse
  if (fase >= 1) fijos.push({ desde: A, v: B, color: COLOR.B, etiqueta: fase === 1 ? <V>B</V> : undefined });
  if (fase >= 2) fijos.push({ v: R, color: COLOR.R, etiqueta: <V>R</V> });
  const guias = fase >= 2 ? [{ desde: [R[0], 0] as Vec, hasta: R }, { desde: [0, R[1]] as Vec, hasta: R }] : [];

  return {
    escena: <PlanoVectorial rx={5} ry={4} fijos={fijos} guias={guias} />,
    pie: (
      <>
        <span className="hero-mag">Suma de vectores</span>
        <span className="hero-eq">
          <V>R</V> =
          <span style={{ color: COLOR.A }}>
            <V>A</V>
          </span>
          {fase >= 1 && (
            <>
              +
              <span style={{ color: COLOR.B }}>
                <V>B</V>
              </span>
            </>
          )}
          {fase >= 2 && (
            <span className="hero-res">
              = {fmtVec(R)}
              {Number.isInteger(Math.round(m * 1e6) / 1e6) && <small> · |R| = {Math.round(m)}</small>}
            </span>
          )}
        </span>
      </>
    ),
    encuadre: { w: 13, h: 12.6 },
    centro: [0, -1.5],
    balanceo: 0.12,
  };
};
