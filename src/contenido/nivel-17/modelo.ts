// ══ Nivel 17 · Electrostática: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { coulomb, MICRO } from "@/lib/electro";

/** Valida que la respuesta sea un entero dentro de (min, max]. */
function enAjuste(r: number, min: number, max: number, etapa: string, id: string): number {
  if (Math.abs(r - Math.round(r)) > 1e-9 || r <= min || r > max) throw new Error(`${etapa} ${id}: ${r} fuera del ajuste`);
  return Math.round(r);
}

/** Carga con signo y coma decimal: «+2 μC», «−4 μC». */
export const fmtQ = (q: number) => `${q > 0 ? "+" : "−"}${String(Math.abs(q)).replace(".", ",")} μC`;

// ══ 17.1 Ley de Coulomb ───────
/** Rango del ajuste de la fuerza (N). */
export const F_MIN = 0;
export const F_MAX = 40;

export interface ProblemaCoulomb {
  id: string;
  /** Cargas (μC, con signo) y distancia (cm). */
  q1: number;
  q2: number;
  d: number;
  /** Fuerza entre ellas (N). */
  respuesta: number;
  pistas: [string, string];
}

export function crearCoulomb(id: string, q1: number, q2: number, d: number, pistas: [string, string]): ProblemaCoulomb {
  const F = coulomb(q1 * MICRO, q2 * MICRO, d / 100);
  return { id, q1, q2, d, respuesta: enAjuste(F, F_MIN, F_MAX, "17.1", id), pistas };
}
