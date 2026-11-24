// ══ Nivel 21 · Ondas electromagnéticas: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { frecuenciaEM, longitudEM, regionEspectro } from "@/lib/ondasEM";

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
