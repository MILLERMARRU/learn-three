// ══ Nivel 8 · Dinámica: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { aceleracionPlano, fuerzaPara } from "@/lib/dinamica";

/** Paso y rango del ajuste de fuerza (N). */
export const F_PASO = 5;
export const F_MIN = 5;
export const F_MAX = 200;

// ══ 8.1 Segunda ley de Newton ───────
export interface ProblemaNewton {
  id: string;
  /** Masa del bloque (kg), distancia a la bandera (m) y tiempo en que debe llegar (s). */
  m: number;
  d: number;
  t: number;
  /** Coeficiente de rozamiento cinético (0 = piso liso). */
  mu: number;
  /** Fuerza horizontal necesaria (N). */
  respuesta: number;
  pistas: [string, string];
}

export function crearNewton(id: string, m: number, d: number, t: number, mu: number, pistas: [string, string]): ProblemaNewton {
  const F = fuerzaPara(m, d, t, mu);
  // la fuerza es exacta y cae en el ajuste (múltiplo de 5 N): si no, falla al cargar
  if (Math.abs(F - Math.round(F)) > 1e-9 || Math.round(F) % F_PASO !== 0 || F < F_MIN || F > F_MAX) throw new Error(`8.1 ${id}: F = ${F} fuera del ajuste`);
  return { id, m, d, t, mu, respuesta: Math.round(F), pistas };
}

// ══ 8.2 Plano inclinado con rozamiento ───────
/** Rango del ajuste de aceleración (m/s², de 1 en 1) y largo del plano que recorre el bloque (m). */
export const A_MIN = 0;
export const A_MAX = 10;
export const LARGO_PLANO = 8;

export interface ProblemaPlanoD {
  id: string;
  /** Inclinación (°), rozamiento cinético y masa (kg): la masa no cambia la aceleración. */
  theta: number;
  mu: number;
  m: number;
  /** Aceleración con la que baja (m/s²); 0 si el rozamiento no lo deja bajar. */
  respuesta: number;
  pistas: [string, string];
}

export function crearPlanoD(id: string, theta: number, mu: number, m: number, pistas: [string, string]): ProblemaPlanoD {
  const a = aceleracionPlano(theta, mu);
  // la aceleración es un entero dentro del ajuste: si no, falla al cargar
  if (Math.abs(a - Math.round(a)) > 1e-9 || a < A_MIN || a > A_MAX) throw new Error(`8.2 ${id}: a = ${a} fuera del ajuste`);
  return { id, theta, mu, m, respuesta: Math.round(a), pistas };
}
