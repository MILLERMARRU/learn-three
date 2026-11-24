// ══ Nivel 10 · Trabajo, energía y potencia: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { alturaMaxima, G, potenciaElevar, potenciaEntregada, rapidezEnergia, rapidezTrasTrabajo, trabajoNeto } from "@/lib/energia";

// ══ 10.1 Trabajo y energía cinética ───────
/** Rango del ajuste de rapidez (m/s, de 1 en 1). */
export const V_MIN = 0;
export const V_MAX = 30;

export interface ProblemaTrabajo {
  id: string;
  /** Masa (kg), fuerza (N) y su ángulo sobre la horizontal (°), largo de la zona (m), rozamiento y rapidez de entrada (m/s). */
  m: number;
  F: number;
  theta: number;
  d: number;
  mu: number;
  v0: number;
  /** Trabajo neto en la zona (J) y rapidez con que sale (m/s). */
  W: number;
  respuesta: number;
  pistas: [string, string];
}

export function crearTrabajo(id: string, m: number, F: number, theta: number, d: number, mu: number, v0: number, pistas: [string, string]): ProblemaTrabajo {
  const W = trabajoNeto(F, theta, d, m, mu);
  const v = rapidezTrasTrabajo(W, m, v0);
  // la rapidez es un entero positivo dentro del ajuste: si no, falla al cargar
  if (!Number.isInteger(v) || v <= V_MIN || v > V_MAX) throw new Error(`10.1 ${id}: v = ${v} fuera del ajuste`);
  return { id, m, F, theta, d, mu, v0, W, respuesta: v, pistas };
}

// ══ 10.2 Conservación de la energía mecánica ───────
/** Rango del ajuste (rapidez en m/s o altura en m, de 1 en 1). */
export const E_MIN = 0;
export const E_MAX = 30;

export interface ProblemaEnergia {
  id: string;
  /** v: rapidez al pasar por la altura h₂ · h: altura máxima que alcanza en la subida. */
  tipo: "v" | "h";
  /** Altura de partida (m) y rapidez inicial (m/s). */
  h1: number;
  v0: number;
  /** Altura donde se mide la rapidez (tipo v; 0 = abajo). */
  h2: number;
  respuesta: number;
  pistas: [string, string];
}

/** Altura «de energía»: hasta donde subiría con toda su energía (m). */
export const alturaEnergia = (p: Pick<ProblemaEnergia, "h1" | "v0">) => p.h1 + (p.v0 * p.v0) / (2 * G);

export function crearEnergia(id: string, tipo: ProblemaEnergia["tipo"], h1: number, v0: number, h2: number, pistas: [string, string]): ProblemaEnergia {
  const r = tipo === "v" ? rapidezEnergia(v0, h1 - h2) : h1 + alturaMaxima(v0);
  // la respuesta es un entero positivo dentro del ajuste: si no, falla al cargar
  if (Math.abs(r - Math.round(r)) > 1e-9 || r <= E_MIN || r > E_MAX) throw new Error(`10.2 ${id}: ${tipo} = ${r} fuera del ajuste`);
  return { id, tipo, h1, v0, h2, respuesta: Math.round(r), pistas };
}

// ══ 10.3 Potencia ───────
/** Paso y rango del ajuste de potencia (W): ↑ ↓ de 50 en 50, ← → de 500 en 500. */
export const P_PASO = 50;
export const P_MIN = 50;
export const P_MAX = 5000;

export interface ProblemaPotencia {
  id: string;
  /** Masa de la carga (kg), altura de la bandera (m) y tiempo en que debe llegar (s). */
  m: number;
  h: number;
  t: number;
  /** Rendimiento del motor (1 = 100 %). */
  eta: number;
  /** El enunciado da la velocidad de subida (v = h/t) en lugar del tiempo. */
  conV: boolean;
  /** Potencia que debe entregar el motor (W). */
  respuesta: number;
  pistas: [string, string];
}

export function crearPotencia(id: string, m: number, h: number, t: number, eta: number, conV: boolean, pistas: [string, string]): ProblemaPotencia {
  const P = potenciaEntregada(potenciaElevar(m, h, t), eta);
  // la potencia es exacta y cae en el ajuste (múltiplo de 50 W): si no, falla al cargar
  if (Math.abs(P - Math.round(P)) > 1e-9 || Math.round(P) % P_PASO !== 0 || P < P_MIN || P > P_MAX) throw new Error(`10.3 ${id}: P = ${P} fuera del ajuste`);
  return { id, m, h, t, eta, conV, respuesta: Math.round(P), pistas };
}
