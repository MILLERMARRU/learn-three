// ══ Nivel 19 · Condensadores: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { carga } from "@/lib/condensadores";

/** Valida que la respuesta sea un entero dentro de (min, max]. */
function enAjuste(r: number, min: number, max: number, etapa: string, id: string): number {
  if (Math.abs(r - Math.round(r)) > 1e-9 || r <= min || r > max) throw new Error(`${etapa} ${id}: ${r} fuera del ajuste`);
  return Math.round(r);
}

/** Número con coma decimal: «0,5». */
export const fmtC = (n: number) => String(n).replace(".", ",");

// ══ 19.1 Carga de un condensador ───────
/** Rango del ajuste y fondo de escala del medidor de carga (μC). */
export const Q_MIN = 0;
export const Q_ESCALA = 120;

export interface ProblemaCarga {
  id: string;
  /** Capacidad (μF), voltaje de la pila (V) y constante del dieléctrico (1 = sin dieléctrico). */
  C: number;
  V: number;
  kappa: number;
  /** Carga (μC). */
  respuesta: number;
  pistas: [string, string];
}

export function crearCarga(id: string, C: number, V: number, kappa: number, pistas: [string, string]): ProblemaCarga {
  return { id, C, V, kappa, respuesta: enAjuste(carga(C, V, kappa), Q_MIN, Q_ESCALA, "19.1", id), pistas };
}
