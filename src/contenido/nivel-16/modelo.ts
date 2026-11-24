// ══ Nivel 16 · Termodinámica: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { kelvin, volumenFinal } from "@/lib/termo";

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
