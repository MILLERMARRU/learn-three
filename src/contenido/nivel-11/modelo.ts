// ══ Nivel 11 · Cantidad de movimiento y choques: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { impulso, velocidadTrasImpulso } from "@/lib/momento";

// ══ 11.1 Impulso y cantidad de movimiento ───────
/** Rango del ajuste de velocidad (m/s, con signo: positivo = hacia la derecha). */
export const V_MIN = -30;
export const V_MAX = 30;

export interface ProblemaImpulso {
  id: string;
  /** Masa del disco (kg), fuerza del golpe (N, con signo), duración (s) y velocidad antes del golpe (m/s, con signo). */
  m: number;
  F: number;
  dt: number;
  v0: number;
  /** rect: fuerza constante · tri: sube y baja (el impulso es la mitad de F·Δt). */
  forma: "rect" | "tri";
  /** Impulso (N·s) y velocidad después del golpe (m/s). */
  I: number;
  respuesta: number;
  pistas: [string, string];
}

export function crearImpulso(id: string, m: number, F: number, dt: number, v0: number, forma: ProblemaImpulso["forma"], pistas: [string, string]): ProblemaImpulso {
  const I = impulso(F, dt, forma);
  const v = velocidadTrasImpulso(I, m, v0);
  // la velocidad es un entero no nulo dentro del ajuste: si no, falla al cargar
  if (!Number.isInteger(v) || v === 0 || v < V_MIN || v > V_MAX) throw new Error(`11.1 ${id}: v = ${v} fuera del ajuste`);
  return { id, m, F, dt, v0, forma, I, respuesta: v, pistas };
}

/** Velocidad con signo para mostrar: «−3», «8» (el menos tipográfico). */
export const conSigno = (v: number) => String(v).replace("-", "−").replace(".", ",");
