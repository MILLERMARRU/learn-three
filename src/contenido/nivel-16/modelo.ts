// ══ Nivel 16 · Termodinámica: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { carnot, eficiencia, kelvin, trabajoIsobarico, volumenFinal } from "@/lib/termo";

/** Valida que la respuesta sea un entero dentro de (min, max]. */
function enAjuste(r: number, min: number, max: number, etapa: string, id: string): number {
  if (Math.abs(r - Math.round(r)) > 1e-9 || r <= min || r > max) throw new Error(`${etapa} ${id}: ${r} fuera del ajuste`);
  return Math.round(r);
}

/** Número con coma decimal y signo menos tipográfico: «−73». */
export const fmtT = (n: number) => String(n).replace(".", ",").replace("-", "−");

// ══ 16.1 Gases ideales ───────
/** Rango del ajuste del volumen final (L) y la capacidad del cilindro. */
export const V_MIN = 1;
export const V_MAX = 40;

export type Proceso = "isotermico" | "isobarico" | "general";

export interface ProblemaGas {
  id: string;
  proceso: Proceso;
  /** Estado inicial y final: presión (atm), volumen (L) y temperatura (°C). */
  P1: number;
  V1: number;
  t1: number;
  P2: number;
  t2: number;
  /** Volumen final (L). */
  respuesta: number;
  pistas: [string, string];
}

export function crearGas(id: string, proceso: Proceso, P1: number, V1: number, t1: number, P2: number, t2: number, pistas: [string, string]): ProblemaGas {
  if ((proceso === "isotermico" && t1 !== t2) || (proceso === "isobarico" && P1 !== P2)) throw new Error(`16.1 ${id}: el proceso no coincide con los datos`);
  if (P1 < 1 || P2 > 5 || P2 < 1 || P1 > 5) throw new Error(`16.1 ${id}: las pesas van de 1 a 5 atm`);
  const V2 = volumenFinal(P1, V1, kelvin(t1), P2, kelvin(t2));
  if (V2 === V1) throw new Error(`16.1 ${id}: el pistón no se movería`);
  return { id, proceso, P1, V1, t1, P2, t2, respuesta: enAjuste(V2, V_MIN - 1, V_MAX, "16.1", id), pistas };
}

// ══ 16.2 Trabajo de un gas ───────
/** Rango del ajuste del trabajo (kJ): negativo si el gas se comprime (el trabajo lo hacen sobre él). */
export const W_MIN = -30;
export const W_MAX = 30;

/** Cómo da los datos el enunciado: kPa y m³, kPa y litros, o atm y litros (1 atm = 100 kPa). */
export type UnidadesTrabajo = "kPa-m3" | "kPa-L" | "atm-L";

export interface ProblemaTrabajo {
  id: string;
  unidades: UnidadesTrabajo;
  /** Presión y volúmenes como los da el enunciado. */
  P: number;
  V1: number;
  V2: number;
  /** Los mismos en kPa y m³ (para la escena y la cuenta). */
  Pk: number;
  V1m: number;
  V2m: number;
  /** Trabajo del gas (kJ). */
  respuesta: number;
  pistas: [string, string];
}

export function crearTrabajo(id: string, unidades: UnidadesTrabajo, P: number, V1: number, V2: number, pistas: [string, string]): ProblemaTrabajo {
  const Pk = unidades === "atm-L" ? P * 100 : P;
  const [V1m, V2m] = unidades === "kPa-m3" ? [V1, V2] : [V1 / 1000, V2 / 1000];
  const W = trabajoIsobarico(Pk, V1m, V2m);
  if (Math.abs(W - Math.round(W)) > 1e-9 || W === 0 || W < W_MIN || W > W_MAX) throw new Error(`16.2 ${id}: W = ${W} fuera del ajuste`);
  return { id, unidades, P, V1, V2, Pk, V1m, V2m, respuesta: Math.round(W), pistas };
}

// ══ 16.3 Máquinas térmicas ───────
/** Rango del ajuste de la eficiencia (%). */
export const E_MIN = 0;
export const E_MAX = 100;

/** Qué da el enunciado: el trabajo y Q₁, los dos calores, o las temperaturas de los focos (Carnot, en °C). */
export type DatoMaquina = "trabajo" | "calores" | "carnot";

export interface ProblemaMaquina {
  id: string;
  dato: DatoMaquina;
  /** Calor tomado del foco caliente y trabajo o calor cedido (J), o temperaturas de los focos (°C). */
  a: number;
  b: number;
  /** Eficiencia (%). */
  respuesta: number;
  pistas: [string, string];
}

export function crearMaquina(id: string, dato: DatoMaquina, a: number, b: number, pistas: [string, string]): ProblemaMaquina {
  // trabajo: a = Q₁, b = W · calores: a = Q₁, b = Q₂ · carnot: a = t₁, b = t₂ (°C)
  const eta = dato === "trabajo" ? b / a : dato === "calores" ? eficiencia(a, b) : carnot(kelvin(a), kelvin(b));
  return { id, dato, a, b, respuesta: enAjuste(Math.round(eta * 1e9) / 1e7, E_MIN, E_MAX - 1, "16.3", id), pistas };
}
