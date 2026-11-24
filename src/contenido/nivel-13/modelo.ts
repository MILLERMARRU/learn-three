// ══ Nivel 13 · Ondas mecánicas: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { frecuenciaArmonico, frecuenciaOnda, longitudArmonico, longitudOnda, velocidadCuerda, velocidadOnda } from "@/lib/ondas";

/** Rango del ajuste (m, Hz o m/s): ↑ ↓ de 1 en 1, ← → de 10 en 10. */
export const O_MIN = 0;
export const O_MAX = 60;

/** Valida que la respuesta sea un entero positivo dentro del ajuste. */
function enAjuste(r: number, etapa: string, id: string): number {
  if (!Number.isInteger(r) || r <= O_MIN || r > O_MAX) throw new Error(`${etapa} ${id}: ${r} fuera del ajuste`);
  return r;
}

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
  return { id, tipo, lambda, f, v, conT, respuesta: enAjuste(r, "13.1", id), pistas };
}

// ══ 13.2 Velocidad de una onda en una cuerda ───────
export interface ProblemaPulso {
  id: string;
  /** Tensión (N) y densidad lineal (kg/m) de la cuerda. */
  T: number;
  mu: number;
  /** Si la tensión la da una pesa colgante: su masa (kg); T = m·g con g = 10. */
  masa?: number;
  respuesta: number;
  pistas: [string, string];
}

export function crearPulso(id: string, T: number, mu: number, pistas: [string, string], masa?: number): ProblemaPulso {
  return { id, T, mu, masa, respuesta: enAjuste(velocidadCuerda(T, mu), "13.2", id), pistas };
}

// ══ 13.3 Ondas estacionarias ───────
export interface ProblemaEstacionaria {
  id: string;
  /** f: frecuencia del armónico n · lambda: su longitud de onda. */
  tipo: "f" | "lambda";
  /** Armónico (número de vientres), largo de la cuerda (m) y velocidad de las ondas en ella (m/s). */
  n: number;
  L: number;
  v: number;
  /** El enunciado da la frecuencia fundamental en lugar de L y v. */
  conF1: boolean;
  respuesta: number;
  pistas: [string, string];
}

export function crearEstacionaria(id: string, tipo: ProblemaEstacionaria["tipo"], n: number, L: number, v: number, pistas: [string, string], conF1 = false): ProblemaEstacionaria {
  const r = tipo === "f" ? frecuenciaArmonico(n, v, L) : longitudArmonico(n, L);
  return { id, tipo, n, L, v, conF1, respuesta: enAjuste(r, "13.3", id), pistas };
}

/** Número de vientres que tendría la cuerda con el valor propuesto (no entero si no encaja). */
export function vientresPropuestos(p: Pick<ProblemaEstacionaria, "tipo" | "L" | "v">, valor: number): number {
  return p.tipo === "f" ? (valor * 2 * p.L) / p.v : valor > 0 ? (2 * p.L) / valor : 0;
}

/** Número con coma decimal: «0,5». */
export const fmtO = (n: number) => String(n).replace(".", ",");
