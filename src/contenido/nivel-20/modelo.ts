// ══ Nivel 20 · Electromagnetismo: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { campoRecto, femFaraday, femMovimiento, fuerzaConductor, SENO } from "@/lib/magnetismo";

/** Valida que la respuesta sea un entero dentro de (min, max]. */
function enAjuste(r: number, min: number, max: number, etapa: string, id: string): number {
  if (Math.abs(r - Math.round(r)) > 1e-9 || r <= min || r > max) throw new Error(`${etapa} ${id}: ${r} fuera del ajuste`);
  return Math.round(r);
}

/** Número con coma decimal: «0,25». */
export const fmtM = (n: number) => String(n).replace(".", ",");

// ══ 20.1 Fuerza magnética sobre un conductor ───────
/** Rango del ajuste y fondo de escala del dinamómetro (mN). */
export const F_MIN = 0;
export const F_ESCALA = 100;

export interface ProblemaConductor {
  id: string;
  /** Campo (T), corriente (A), longitud dentro del campo (m) y ángulo entre el cable y el campo (°). */
  B: number;
  I: number;
  L: number;
  theta: number;
  /** Si el enunciado da el campo en mT y la longitud en cm. */
  enMili: boolean;
  /** Fuerza (mN). */
  respuesta: number;
  pistas: [string, string];
}

export function crearConductor(id: string, B: number, I: number, L: number, theta: number, enMili: boolean, pistas: [string, string]): ProblemaConductor {
  if (SENO[theta] === undefined) throw new Error(`20.1 ${id}: ángulo sin seno exacto`);
  const mN = Math.round(fuerzaConductor(B, I, L, theta) * 1000 * 1e9) / 1e9;
  return { id, B, I, L, theta, enMili, respuesta: enAjuste(mN, F_MIN, F_ESCALA, "20.1", id), pistas };
}

// ══ 20.2 Campo de un conductor recto ───────
/** Fondo de escala del teslámetro (μT). */
export const B_ESCALA = 100;

export interface CableRecto {
  /** Corriente (A) y su sentido: +1 saliendo de la mesa (⊙), −1 entrando (⊗). */
  I: number;
  sentido: 1 | -1;
}

export interface ProblemaCampoRecto {
  id: string;
  /** Uno o dos cables; con dos, P está en el punto medio, a la distancia d de cada uno. */
  cables: [CableRecto] | [CableRecto, CableRecto];
  /** Distancia de cada cable a P (cm). */
  d: number;
  /** Campo de cada cable en P (μT, con signo según el eje y de la mesa). */
  componentes: number[];
  /** Módulo del campo total (μT) y su sentido (+1 hacia arriba en la mesa). */
  respuesta: number;
  sentidoB: 1 | -1;
  pistas: [string, string];
}

export function crearCampoRecto(id: string, cables: ProblemaCampoRecto["cables"], d: number, pistas: [string, string]): ProblemaCampoRecto {
  // regla de la mano derecha: un cable a la izquierda de P con corriente saliente da campo hacia +y en P; uno a la derecha, hacia −y
  const componentes = cables.map((c, i) => Math.round(c.sentido * (i === 0 ? 1 : -1) * campoRecto(c.I, d / 100) * 1e6 * 1e9) / 1e9);
  const total = componentes.reduce((a, b) => a + b, 0);
  if (total === 0) throw new Error(`20.2 ${id}: el campo total es nulo`);
  return { id, cables, d, componentes, respuesta: enAjuste(Math.abs(total), F_MIN, B_ESCALA, "20.2", id), sentidoB: total > 0 ? 1 : -1, pistas };
}

// ══ 20.3 Inducción electromagnética ───────
/** Fondo de escala del voltímetro (V). */
export const E_ESCALA = 30;

export interface ProblemaInduccion {
  id: string;
  /** Una barra que se desliza sobre rieles (ε = B·L·v) o una bobina con flujo variable (ε = N·ΔB·A/Δt). */
  modo: "barra" | "bobina";
  /** Barra: campo (T), longitud (m), rapidez (m/s) y si la longitud se da en cm. */
  B: number;
  L: number;
  v: number;
  enCm: boolean;
  /** Bobina: espiras, área (m²), cambio del campo (T) y tiempo (s). */
  N: number;
  A: number;
  dB: number;
  dt: number;
  /** Fem inducida (V). */
  respuesta: number;
  pistas: [string, string];
}

export function crearBarra(id: string, B: number, L: number, v: number, enCm: boolean, pistas: [string, string]): ProblemaInduccion {
  return { id, modo: "barra", B, L, v, enCm, N: 0, A: 0, dB: 0, dt: 0, respuesta: enAjuste(femMovimiento(B, L, v), F_MIN, E_ESCALA, "20.3", id), pistas };
}

export function crearBobina(id: string, N: number, A: number, dB: number, dt: number, pistas: [string, string]): ProblemaInduccion {
  const dPhi = Math.round(dB * A * 1e12) / 1e12;
  return { id, modo: "bobina", B: 0, L: 0, v: 0, enCm: false, N, A, dB, dt, respuesta: enAjuste(femFaraday(N, dPhi, dt), F_MIN, E_ESCALA, "20.3", id), pistas };
}
