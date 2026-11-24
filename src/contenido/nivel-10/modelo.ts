// ══ Nivel 10 · Trabajo, energía y potencia: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { rapidezTrasTrabajo, trabajoNeto } from "@/lib/energia";

// ══ 10.1 Trabajo y energía cinética ───────
/** Rango del ajuste de rapidez (m/s, de 1 en 1). */
export const V_MIN = 0;
export const V_MAX = 30;

export interface ProblemaTrabajo {
  id: string;
  /** Masa (kg), fuerza (N) y su ángulo sobre la horizontal (°), largo de la zona (m), rozamiento y rapidez de entrada (m/s). */
  m: number;
  F: number;
  theta: number;
  d: number;
  mu: number;
  v0: number;
  /** Trabajo neto en la zona (J) y rapidez con que sale (m/s). */
  W: number;
  respuesta: number;
  pistas: [string, string];
}

export function crearTrabajo(id: string, m: number, F: number, theta: number, d: number, mu: number, v0: number, pistas: [string, string]): ProblemaTrabajo {
  const W = trabajoNeto(F, theta, d, m, mu);
  const v = rapidezTrasTrabajo(W, m, v0);
  // la rapidez es un entero positivo dentro del ajuste: si no, falla al cargar
  if (!Number.isInteger(v) || v <= V_MIN || v > V_MAX) throw new Error(`10.1 ${id}: v = ${v} fuera del ajuste`);
  return { id, m, F, theta, d, mu, v0, W, respuesta: v, pistas };
}
