// ══ Nivel 8 · Dinámica: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { fuerzaPara } from "@/lib/dinamica";

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
