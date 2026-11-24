// ══ Nivel 21 · Ondas electromagnéticas: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { C, COS2, distanciaRadar, frecuenciaEM, longitudEM, malus, regionEspectro } from "@/lib/ondasEM";

/** Valida que la respuesta sea un entero dentro de (min, max]. */
function enAjuste(r: number, min: number, max: number, etapa: string, id: string): number {
  if (Math.abs(r - Math.round(r)) > 1e-6 || r <= min || r > max) throw new Error(`${etapa} ${id}: ${r} fuera del ajuste`);
  return Math.round(r);
}

/** Número con coma decimal: «1,5». */
export const fmtO = (n: number) => String(n).replace(".", ",");

// ══ 21.1 Espectro electromagnético ───────
/** Qué se pide: λ en metros (radio), λ en nanómetros (luz) o f en MHz. */
export type PideEspectro = "lambdaM" | "lambdaNm" | "fMHz";

/** Unidad, fondo de escala del medidor y pasos del ajuste de cada magnitud. */
export const MAGNITUDES: Record<PideEspectro, { simbolo: string; unidad: string; escala: number; paso: number; salto: number }> = {
  lambdaM: { simbolo: "λ", unidad: "m", escala: 60, paso: 1, salto: 10 },
  lambdaNm: { simbolo: "λ", unidad: "nm", escala: 800, paso: 10, salto: 100 },
  fMHz: { simbolo: "f", unidad: "MHz", escala: 300, paso: 10, salto: 100 },
};

export type Region = ReturnType<typeof regionEspectro>;

export interface ProblemaEspectro {
  id: string;
  pide: PideEspectro;
  /** Frecuencia (Hz) y longitud de onda (m) de la onda. */
  f: number;
  lambda: number;
  region: Region;
  respuesta: number;
  pistas: [string, string];
}

/** pide λ: se da f (Hz) · pide f: se da λ (m). */
export function crearEspectro(id: string, pide: PideEspectro, dato: number, pistas: [string, string]): ProblemaEspectro {
  const [f, lambda] = pide === "fMHz" ? [frecuenciaEM(dato), dato] : [dato, longitudEM(dato)];
  const r = pide === "lambdaM" ? lambda : pide === "lambdaNm" ? lambda * 1e9 : f / 1e6;
  const m = MAGNITUDES[pide];
  const res = enAjuste(Math.round(r * 1e6) / 1e6, 0, m.escala, "21.1", id);
  if (res % m.paso !== 0) throw new Error(`21.1 ${id}: la respuesta no cae en un paso del ajuste`);
  return { id, pide, f, lambda, region: regionEspectro(lambda), respuesta: res, pistas };
}

// ══ 21.2 Polarización ───────
/** Fondo de escala del luxómetro (W/m²). */
export const I_ESCALA = 100;

export interface ProblemaPolarizacion {
  id: string;
  /** Intensidad que llega (W/m²), ángulo del analizador (°) y si la luz llega sin polarizar (el primer polarizador deja la mitad). */
  I0: number;
  theta: number;
  noPolarizada: boolean;
  /** Intensidad transmitida (W/m²). */
  respuesta: number;
  pistas: [string, string];
}

export function crearPolarizacion(id: string, I0: number, theta: number, noPolarizada: boolean, pistas: [string, string]): ProblemaPolarizacion {
  if (COS2[theta] === undefined) throw new Error(`21.2 ${id}: ángulo sin cos² exacto`);
  const I = malus(noPolarizada ? I0 / 2 : I0, theta);
  return { id, I0, theta, noPolarizada, respuesta: enAjuste(I, 0, I_ESCALA, "21.2", id), pistas };
}

// ══ 21.3 Radar ───────
/** Qué se pide: la distancia (km) a partir del tiempo del eco, o el tiempo del eco (µs) a partir de la distancia. */
export type PideRadar = "dKm" | "tUs";

export const MAGNITUDES_RADAR: Record<PideRadar, { simbolo: string; unidad: string; escala: number; paso: number; salto: number }> = {
  dKm: { simbolo: "d", unidad: "km", escala: 100, paso: 1, salto: 10 },
  tUs: { simbolo: "t", unidad: "µs", escala: 1000, paso: 10, salto: 100 },
};

export interface ProblemaRadar {
  id: string;
  pide: PideRadar;
  /** Tiempo de ida y vuelta del eco (s) y distancia al objeto (m). */
  t: number;
  d: number;
  /** Unidad en que se da el tiempo del eco en el enunciado. */
  unidadT: "µs" | "ms";
  respuesta: number;
  pistas: [string, string];
}

/** pide d: se da t (s) · pide t: se da d (m). */
export function crearRadar(id: string, pide: PideRadar, dato: number, pistas: [string, string], unidadT: "µs" | "ms" = "µs"): ProblemaRadar {
  const [t, d] = pide === "dKm" ? [dato, distanciaRadar(dato)] : [(2 * dato) / C, dato];
  const r = pide === "dKm" ? d / 1000 : t * 1e6;
  const m = MAGNITUDES_RADAR[pide];
  const res = enAjuste(Math.round(r * 1e6) / 1e6, 0, m.escala, "21.3", id);
  if (res % m.paso !== 0) throw new Error(`21.3 ${id}: la respuesta no cae en un paso del ajuste`);
  return { id, pide, t, d, unidadT, respuesta: res, pistas };
}
