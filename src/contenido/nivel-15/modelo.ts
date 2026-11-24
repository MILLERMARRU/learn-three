// ══ Nivel 15 · Calor: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { dilatacion, equilibrio, temperaturaFinal } from "@/lib/calor";

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

// ══ 15.2 Calor sensible ───────
/** Sustancias del curso: nombre, calor específico (cal/g·°C), si es líquida y color. */
export const SUSTANCIAS = {
  agua: { nombre: "agua", c: 1, liquida: true, color: "#4f8fd1" },
  aceite: { nombre: "aceite", c: 0.5, liquida: true, color: "#d9a441" },
  alcohol: { nombre: "alcohol", c: 0.6, liquida: true, color: "#b8dcef" },
  hierro: { nombre: "hierro", c: 0.11, liquida: false, color: "#8a929d" },
  aluminio: { nombre: "aluminio", c: 0.22, liquida: false, color: "#cfd6df" },
} as const;
export type Sustancia = keyof typeof SUSTANCIAS;

/** Rango del ajuste de la temperatura final (°C) y fondo de escala del termómetro. */
export const T_MIN = 0;
export const T_MAX = 150;

export interface ProblemaCalentador {
  id: string;
  sustancia: Sustancia;
  /** Masa (g), temperatura inicial (°C) y calor entregado (cal). */
  m: number;
  T0: number;
  Q: number;
  /** Si el enunciado da Q y m en kcal y kg. */
  enKilo: boolean;
  /** Temperatura final (°C). */
  respuesta: number;
  pistas: [string, string];
}

export function crearCalentador(id: string, sustancia: Sustancia, m: number, T0: number, Q: number, enKilo: boolean, pistas: [string, string]): ProblemaCalentador {
  const T = temperaturaFinal(T0, Q, m, SUSTANCIAS[sustancia].c);
  return { id, sustancia, m, T0, Q, enKilo, respuesta: enAjuste(T, T_MIN, T_MAX, "15.2", id), pistas };
}

// ══ 15.3 Equilibrio térmico ───────
export interface CuerpoMezcla {
  sustancia: Sustancia;
  /** Masa (g) y temperatura inicial (°C). */
  m: number;
  T: number;
}

export interface ProblemaMezcla {
  id: string;
  /** El cuerpo caliente que se vierte (o se sumerge, si es metal) y el líquido que ya está en el calorímetro. */
  a: CuerpoMezcla;
  b: CuerpoMezcla;
  /** Temperatura de equilibrio (°C). */
  respuesta: number;
  pistas: [string, string];
}

export function crearMezcla(id: string, a: CuerpoMezcla, b: CuerpoMezcla, pistas: [string, string]): ProblemaMezcla {
  if (!SUSTANCIAS[b.sustancia].liquida || a.T <= b.T) throw new Error(`15.3 ${id}: el calorímetro tiene el líquido frío y se le agrega el cuerpo caliente`);
  const Te = equilibrio([
    { m: a.m, c: SUSTANCIAS[a.sustancia].c, T: a.T },
    { m: b.m, c: SUSTANCIAS[b.sustancia].c, T: b.T },
  ]);
  return { id, a, b, respuesta: enAjuste(Te, T_MIN, T_MAX, "15.3", id), pistas };
}
