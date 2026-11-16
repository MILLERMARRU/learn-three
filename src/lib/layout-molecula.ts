// ══ Distribución 3D de una molécula dimensional ───────
// Numerador (exponentes +) arriba de la barra, denominador (exponentes −) abajo.
// Las copias de una base se apilan: en columna (L³ = tres reglas) o en fila (θ², I²) según el objeto.
import { BASES, type Base, type Dim } from "./dim";

export type Vec3 = [number, number, number];

export const ANCHO: Record<Base, number> = { M: 0.8, L: 1.3, T: 0.76, θ: 0.42, I: 0.55, J: 0.62, N: 0.74 };
export const ALTO: Record<Base, number> = { M: 0.84, L: 0.22, T: 0.86, θ: 0.94, I: 0.98, J: 0.88, N: 0.68 };
const APILA: Record<Base, number> = { M: 0.86, L: 0.33, T: 0.86, θ: 0.36, I: 0.42, J: 0.66, N: 0.72 };
// objetos altos: sus copias van lado a lado (T² = dos relojes de arena juntos)
const EN_FILA = new Set<Base>(["T", "θ", "I", "J"]);
const HUECO_X = 0.24;
const HUECO_Y = 0.24;
export const MAX_COPIAS = 4;

export interface LayoutMolecula {
  pos: Map<string, Vec3>; // clave `${base}${k}`
  barra: number; // ancho de la barra de fracción (0 = sin barra)
  barraY: number;
  alto: number;
  ancho: number;
}

interface Columna {
  base: Base;
  n: number;
  signo: 1 | -1;
}

const anchoCol = (c: Columna) => (EN_FILA.has(c.base) ? ANCHO[c.base] + (c.n - 1) * APILA[c.base] : ANCHO[c.base]);
const altoCol = (c: Columna) => (EN_FILA.has(c.base) ? ALTO[c.base] : ALTO[c.base] + (c.n - 1) * APILA[c.base]);

function fila(cols: Columna[]) {
  const ancho = cols.reduce((s, c) => s + anchoCol(c), 0) + HUECO_X * Math.max(0, cols.length - 1);
  return { cols, ancho };
}

export function layoutMolecula(d: Dim): LayoutMolecula {
  const num: Columna[] = [];
  const den: Columna[] = [];
  for (const b of BASES) {
    const e = d[b] ?? 0;
    if (!e) continue;
    const n = Math.min(MAX_COPIAS, Math.max(1, Math.round(Math.abs(e))));
    (e > 0 ? num : den).push({ base: b, n, signo: e > 0 ? 1 : -1 });
  }
  const fN = fila(num);
  const fD = fila(den);
  const pos = new Map<string, Vec3>();
  const hayDen = den.length > 0;

  const extension = (c: Columna) => HUECO_Y + altoCol(c);
  const arriba = num.length ? Math.max(...num.map(extension)) : 0;
  const abajo = den.length ? Math.max(...den.map(extension)) : 0;
  // centrado vertical del conjunto
  const off = hayDen ? -(arriba - abajo) / 2 : -(arriba + HUECO_Y) / 2;

  const colocar = (f: ReturnType<typeof fila>) => {
    let x = -f.ancho / 2;
    for (const c of f.cols) {
      const wCol = anchoCol(c);
      for (let k = 0; k < c.n; k++) {
        if (EN_FILA.has(c.base)) {
          const px = x + ANCHO[c.base] / 2 + k * APILA[c.base];
          pos.set(`${c.base}${k}`, [px, c.signo * (HUECO_Y + ALTO[c.base] / 2) + off, 0]);
        } else {
          const y = c.signo * (HUECO_Y + ALTO[c.base] / 2 + k * APILA[c.base]);
          // un leve desfase en z al apilar da volumen
          pos.set(`${c.base}${k}`, [x + wCol / 2, y + off, k * 0.06]);
        }
      }
      x += wCol + HUECO_X;
    }
  };
  colocar(fN);
  colocar(fD);

  return {
    pos,
    barra: hayDen ? Math.max(fN.ancho, fD.ancho, 0.9) + 0.4 : 0,
    barraY: off,
    alto: arriba + abajo,
    ancho: Math.max(fN.ancho, fD.ancho),
  };
}
