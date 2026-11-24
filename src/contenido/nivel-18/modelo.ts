// ══ Nivel 18 · Electrodinámica: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { corriente, resistencia, voltaje } from "@/lib/circuitos";

/** Valida que la respuesta sea un entero dentro de (min, max]. */
function enAjuste(r: number, min: number, max: number, etapa: string, id: string): number {
  if (Math.abs(r - Math.round(r)) > 1e-9 || r <= min || r > max) throw new Error(`${etapa} ${id}: ${r} fuera del ajuste`);
  return Math.round(r);
}

/** Número con coma decimal: «0,25». */
export const fmtE = (n: number) => String(n).replace(".", ",");

// ══ 18.1 Ley de Ohm ───────
export type Magnitud = "I" | "V" | "R";

/** Unidad, nombre del medidor y fondo de escala (fijo por magnitud, para no dar pistas). */
export const MEDIDORES: Record<Magnitud, { unidad: string; medidor: string; escala: number }> = {
  I: { unidad: "A", medidor: "amperímetro", escala: 10 },
  V: { unidad: "V", medidor: "voltímetro", escala: 30 },
  R: { unidad: "Ω", medidor: "óhmetro", escala: 60 },
};

/** Rango del ajuste. */
export const O_MIN = 0;
export const O_MAX = 60;

export interface ProblemaOhm {
  id: string;
  pide: Magnitud;
  V: number;
  I: number;
  R: number;
  respuesta: number;
  pistas: [string, string];
}

/** pide I: (V, R) · pide V: (I, R) · pide R: (V, I). */
export function crearOhm(id: string, pide: Magnitud, a: number, b: number, pistas: [string, string]): ProblemaOhm {
  const [V, I, R] = pide === "I" ? [a, corriente(a, b), b] : pide === "V" ? [voltaje(a, b), a, b] : [a, b, resistencia(a, b)];
  const r = pide === "I" ? I : pide === "V" ? V : R;
  return { id, pide, V, I, R, respuesta: enAjuste(r, O_MIN, MEDIDORES[pide].escala, "18.1", id), pistas };
}
