// ══ Nivel 13 · Ondas mecánicas: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { frecuenciaOnda, longitudOnda, velocidadOnda } from "@/lib/ondas";

/** Rango del ajuste (m, Hz o m/s): ↑ ↓ de 1 en 1, ← → de 10 en 10. */
export const O_MIN = 0;
export const O_MAX = 60;

// ══ 13.1 Longitud de onda, frecuencia y velocidad ───────
export interface ProblemaOnda {
  id: string;
  /** Qué se pide: la longitud de onda, la velocidad o la frecuencia. */
  tipo: "lambda" | "v" | "f";
  lambda: number;
  f: number;
  v: number;
  /** El enunciado da el período T = 1/f en lugar de la frecuencia. */
  conT: boolean;
  respuesta: number;
  pistas: [string, string];
}

/** Crea el problema a partir de los dos datos conocidos: el tercero es la respuesta. */
export function crearOnda(id: string, tipo: ProblemaOnda["tipo"], datos: { lambda?: number; f?: number; v?: number }, pistas: [string, string], conT = false): ProblemaOnda {
  const lambda = tipo === "lambda" ? longitudOnda(datos.v ?? 0, datos.f ?? 1) : (datos.lambda ?? 0);
  const f = tipo === "f" ? frecuenciaOnda(datos.v ?? 0, datos.lambda ?? 1) : (datos.f ?? 0);
  const v = tipo === "v" ? velocidadOnda(datos.lambda ?? 0, datos.f ?? 0) : (datos.v ?? 0);
  const r = tipo === "lambda" ? lambda : tipo === "f" ? f : v;
  // la respuesta es un entero positivo dentro del ajuste: si no, falla al cargar
  if (!Number.isInteger(r) || r <= O_MIN || r > O_MAX) throw new Error(`13.1 ${id}: ${tipo} = ${r} fuera del ajuste`);
  return { id, tipo, lambda, f, v, conT, respuesta: r, pistas };
}

/** Número con coma decimal: «0,5». */
export const fmtO = (n: number) => String(n).replace(".", ",");
