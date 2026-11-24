// ══ Nivel 17 · Electrostática: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { campo, coulomb, MICRO, potencial } from "@/lib/electro";

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

// ══ 17.2 Campo eléctrico ───────
/** Rango del ajuste del campo, en unidades de 10⁵ N/C. */
export const E_MIN = 0;
export const E_MAX = 60;

export interface CargaCampo {
  /** Carga (μC, con signo) y su distancia al punto P (cm). La primera está a la izquierda de P; la segunda, a la derecha. */
  q: number;
  d: number;
}

export interface ProblemaCampo {
  id: string;
  cargas: [CargaCampo] | [CargaCampo, CargaCampo];
  /** Campo de cada carga en P (×10⁵ N/C) con signo según el eje x, y el campo total. */
  componentes: number[];
  /** Módulo del campo total (×10⁵ N/C) y su sentido (+1 hacia la derecha). */
  respuesta: number;
  sentido: 1 | -1;
  pistas: [string, string];
}

export function crearCampo(id: string, cargas: ProblemaCampo["cargas"], pistas: [string, string]): ProblemaCampo {
  // cada campo se aleja de su carga si es positiva: la de la izquierda empuja a +x y la de la derecha a −x
  const componentes = cargas.map((c, i) => Math.round((Math.sign(c.q) * (i === 0 ? 1 : -1) * campo(c.q * MICRO, c.d / 100)) / 1e5 * 1e9) / 1e9);
  const total = componentes.reduce((a, b) => a + b, 0);
  if (total === 0) throw new Error(`17.2 ${id}: el campo total es nulo`);
  return { id, cargas, componentes, respuesta: enAjuste(Math.abs(total), E_MIN, E_MAX, "17.2", id), sentido: total > 0 ? 1 : -1, pistas };
}

// ══ 17.3 Potencial eléctrico y trabajo ───────
/** Rango del ajuste: potencial en kV o trabajo en mJ (μC · kV = mJ), con signo. */
export const V_MIN = -90;
export const V_MAX = 90;

export interface ProblemaPotencial {
  id: string;
  /** Qué se pide: el potencial en un punto (kV) o el trabajo del campo al llevar q de A a B (mJ). */
  tipo: "V" | "W";
  /** Carga fuente (μC) y distancias (m) del punto A (o P) y del punto B. */
  Q: number;
  dA: number;
  dB: number | null;
  /** Carga de prueba (μC) cuando se pide el trabajo. */
  q: number | null;
  /** Potenciales en A y B (kV). */
  VA: number;
  VB: number | null;
  respuesta: number;
  pistas: [string, string];
}

const kV = (Q: number, d: number) => Math.round((potencial(Q * MICRO, d) / 1000) * 1e9) / 1e9;

/** Potencial de Q (μC) a la distancia d (m): V = kQ/d, en kV. */
export function crearPotencial(id: string, Q: number, d: number, pistas: [string, string]): ProblemaPotencial {
  const VA = kV(Q, d);
  return { id, tipo: "V", Q, dA: d, dB: null, q: null, VA, VB: null, respuesta: enAjuste(VA, V_MIN - 1, V_MAX, "17.3", id), pistas };
}

/** Trabajo del campo de Q al llevar q (μC) de A a B: W = q·(V_A − V_B), en mJ. */
export function crearTrabajoElectrico(id: string, Q: number, dA: number, dB: number, q: number, pistas: [string, string]): ProblemaPotencial {
  const VA = kV(Q, dA);
  const VB = kV(Q, dB);
  const W = Math.round(q * (VA - VB) * 1e9) / 1e9;
  if (W === 0) throw new Error(`17.3 ${id}: trabajo nulo`);
  return { id, tipo: "W", Q, dA, dB, q, VA, VB, respuesta: enAjuste(W, V_MIN - 1, V_MAX, "17.3", id), pistas };
}
