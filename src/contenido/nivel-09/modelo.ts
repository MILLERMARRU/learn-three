// ══ Nivel 9 · Gravitación universal: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { fuerzaProporcional, gravedad } from "@/lib/gravitacion";

// ══ 9.1 Ley de gravitación universal ───────
/** Rango del ajuste de fuerza (N): ↑ ↓ de 1 en 1, ← → de 10 en 10. */
export const F_MIN = 1;
export const F_MAX = 200;

export interface ProblemaAtraccion {
  id: string;
  /** Fuerza de la situación inicial (N). */
  F0: number;
  /** Factores por los que se multiplican m₁, m₂ y la distancia. */
  k1: number;
  k2: number;
  kd: number;
  /** Nueva fuerza de atracción (N). */
  respuesta: number;
  pistas: [string, string];
}

export function crearAtraccion(id: string, F0: number, k1: number, k2: number, kd: number, pistas: [string, string]): ProblemaAtraccion {
  const F = fuerzaProporcional(F0, k1, k2, kd);
  // la fuerza es un entero dentro del ajuste: si no, falla al cargar
  if (!Number.isInteger(F) || F < F_MIN || F > F_MAX) throw new Error(`9.1 ${id}: F = ${F} fuera del ajuste`);
  return { id, F0, k1, k2, kd, respuesta: F, pistas };
}

/** Un factor como prefijo de su símbolo: 2 → «2m₁», ½ → «m₁/2», 3/2 → «3d/2». */
export function conFactor(k: number, simbolo: string): string {
  if (k === 1) return simbolo;
  if (Number.isInteger(k)) return `${k}${simbolo}`;
  if (Number.isInteger(1 / k)) return `${simbolo}/${1 / k}`;
  return `${k * 2}${simbolo}/2`;
}

// ══ 9.2 Gravedad en la altura y en otros planetas ───────
/** Rango del ajuste de gravedad en décimas de m/s² (↑ ↓ de 0,1 en 0,1; ← → de 1 en 1). */
export const G10_MIN = 1;
export const G10_MAX = 400;

export interface ProblemaGravedad {
  id: string;
  /** Masa y radio del planeta relativos a la Tierra (1 y 1 = la Tierra). */
  kM: number;
  kR: number;
  /** Altura sobre la superficie, en radios del propio planeta (0 = en la superficie). */
  hR: number;
  /** Gravedad allí (m/s²). */
  respuesta: number;
  pistas: [string, string];
}

export function crearGravedad(id: string, kM: number, kR: number, hR: number, pistas: [string, string]): ProblemaGravedad {
  const g = gravedad(kM, kR, hR);
  const decimas = g * 10;
  // la gravedad cae en el ajuste de 0,1 m/s²: si no, falla al cargar
  if (Math.abs(decimas - Math.round(decimas)) > 1e-9 || decimas < G10_MIN || decimas > G10_MAX) throw new Error(`9.2 ${id}: g = ${g} fuera del ajuste`);
  return { id, kM, kR, hR, respuesta: Math.round(decimas) / 10, pistas };
}
