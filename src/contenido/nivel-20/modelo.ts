// ══ Nivel 20 · Electromagnetismo: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { fuerzaConductor, SENO } from "@/lib/magnetismo";

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
