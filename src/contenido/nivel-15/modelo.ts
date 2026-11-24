// ══ Nivel 15 · Calor: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { dilatacion } from "@/lib/calor";

/** Valida que la respuesta sea un entero dentro de (min, max]. */
function enAjuste(r: number, min: number, max: number, etapa: string, id: string): number {
  if (Math.abs(r - Math.round(r)) > 1e-9 || r <= min || r > max) throw new Error(`${etapa} ${id}: ${r} fuera del ajuste`);
  return Math.round(r);
}

/** Número con coma decimal: «12,5». */
export const fmtC = (n: number) => String(n).replace(".", ",").replace("-", "−");

// ══ 15.1 Dilatación térmica ───────
/** Metales del curso: nombre, coeficiente de dilatación lineal (1/°C), cómo se escribe y color. */
export const METALES = {
  acero: { nombre: "acero", alfa: 12e-6, texto: "12 × 10⁻⁶", color: "#9aa4b1" },
  aluminio: { nombre: "aluminio", alfa: 24e-6, texto: "24 × 10⁻⁶", color: "#cfd6df" },
  cobre: { nombre: "cobre", alfa: 17e-6, texto: "17 × 10⁻⁶", color: "#c8794b" },
  laton: { nombre: "latón", alfa: 19e-6, texto: "19 × 10⁻⁶", color: "#c9a640" },
} as const;
export type Metal = keyof typeof METALES;

/** Rango del ajuste del cambio de longitud (mm): ↑ ↓ de 1 en 1, ← → de 10 en 10. */
export const D_MIN = 1;
export const D_MAX = 60;

export interface ProblemaDilatacion {
  id: string;
  metal: Metal;
  /** Longitud inicial (m) y temperaturas inicial y final (°C). */
  L0: number;
  T0: number;
  T1: number;
  /** Si el enunciado da las temperaturas (si no, da ΔT directamente). */
  conTemps: boolean;
  /** Cuánto cambia la longitud, en mm (siempre positivo: si se enfría, cuánto se acorta). */
  respuesta: number;
  pistas: [string, string];
}

export function crearDilatacion(id: string, metal: Metal, L0: number, T0: number, T1: number, conTemps: boolean, pistas: [string, string]): ProblemaDilatacion {
  const dL = Math.abs(dilatacion(L0 * 1000, METALES[metal].alfa, T1 - T0));
  return { id, metal, L0, T0, T1, conTemps, respuesta: enAjuste(dL, D_MIN - 1, D_MAX, "15.1", id), pistas };
}
