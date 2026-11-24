// ══ Nivel 12 · Oscilaciones (MAS): modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { periodoPendulo, periodoResorte } from "@/lib/oscilaciones";

/** Rango del ajuste de período en décimas de segundo (↑ ↓ de 0,1 en 0,1; ← → de 1 en 1). */
export const T10_MIN = 1;
export const T10_MAX = 200;

/** Valida que un período caiga en el ajuste de décimas y lo devuelve redondeado. */
function enDecimas(T: number, etapa: string, id: string): number {
  const d = T * 10;
  if (Math.abs(d - Math.round(d)) > 1e-9 || d < T10_MIN || d > T10_MAX) throw new Error(`${etapa} ${id}: T = ${T} fuera del ajuste`);
  return Math.round(d) / 10;
}

// ══ 12.1 Sistema masa-resorte ───────
export interface ProblemaResorte {
  id: string;
  /** Masa (kg) y constante del resorte (N/m). */
  m: number;
  k: number;
  /** Si el enunciado parte de otro resorte o masa conocidos: el período cambia en proporción. */
  base?: { m: number; k: number };
  respuesta: number;
  pistas: [string, string];
}

export function crearResorte(id: string, m: number, k: number, pistas: [string, string], base?: { m: number; k: number }): ProblemaResorte {
  return { id, m, k, base, respuesta: enDecimas(periodoResorte(m, k), "12.1", id), pistas };
}

/** Período con coma decimal: «1,2». */
export const fmtT = (T: number) => String(T).replace(".", ",");

// ══ 12.2 Péndulo simple ───────
export interface ProblemaPendulo {
  id: string;
  /** Largo del hilo (m) y gravedad del lugar (m/s²; 10 = π² en la Tierra). */
  L: number;
  g: number;
  /** Si el enunciado parte de otro péndulo conocido (mismo lugar): el período cambia en proporción. */
  base?: { L: number };
  respuesta: number;
  pistas: [string, string];
}

export function crearPendulo(id: string, L: number, g: number, pistas: [string, string], base?: { L: number }): ProblemaPendulo {
  return { id, L, g, base, respuesta: enDecimas(periodoPendulo(L, g), "12.2", id), pistas };
}
