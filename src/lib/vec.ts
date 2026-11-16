// ══ Vectores 2D (componentes enteras en la cuadrícula) ───────
export type Vec = [number, number];

export const suma = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
export const resta = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];
export const escalar = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k];
export const modulo = (a: Vec) => Math.hypot(a[0], a[1]);
export const igualV = (a: Vec, b: Vec) => a[0] === b[0] && a[1] === b[1];

const n = (x: number) => (x < 0 ? `−${Math.abs(x)}` : `${x}`);

/** "(−3, 4)" */
export const fmtVec = (a: Vec) => `(${n(a[0])}, ${n(a[1])})`;

/** Módulo legible: 5, 4√2, √13 … */
export function fmtModulo(a: Vec): string {
  const m2 = a[0] * a[0] + a[1] * a[1];
  const r = Math.sqrt(m2);
  if (Number.isInteger(r)) return `${r}`;
  // saca el mayor cuadrado perfecto
  for (let k = Math.floor(r); k > 1; k--) {
    if (m2 % (k * k) === 0) return `${k}√${m2 / (k * k)}`;
  }
  return `√${m2}`;
}

/** Ángulo con el eje +x en grados (0–360). */
export const anguloDe = (a: Vec) => ((Math.atan2(a[1], a[0]) * 180) / Math.PI + 360) % 360;
