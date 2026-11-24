// ══ Nivel 18 · Electrodinámica: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { corriente, paralelo, potenciaIR, potenciaVI, potenciaVR, resistencia, serie, voltaje } from "@/lib/circuitos";

/** Valida que la respuesta sea un entero dentro de (min, max]. */
function enAjuste(r: number, min: number, max: number, etapa: string, id: string): number {
  if (Math.abs(r - Math.round(r)) > 1e-9 || r <= min || r > max) throw new Error(`${etapa} ${id}: ${r} fuera del ajuste`);
  return Math.round(r);
}

/** Número con coma decimal: «0,25». */
export const fmtE = (n: number) => String(n).replace(".", ",");

// ══ 18.1 Ley de Ohm ───────
export type Magnitud = "I" | "V" | "R";

/** Unidad, nombre del medidor y fondo de escala (fijo por magnitud, para no dar pistas). */
export const MEDIDORES: Record<Magnitud, { unidad: string; medidor: string; escala: number }> = {
  I: { unidad: "A", medidor: "amperímetro", escala: 10 },
  V: { unidad: "V", medidor: "voltímetro", escala: 30 },
  R: { unidad: "Ω", medidor: "óhmetro", escala: 60 },
};

/** Rango del ajuste. */
export const O_MIN = 0;
export const O_MAX = 60;

export interface ProblemaOhm {
  id: string;
  pide: Magnitud;
  V: number;
  I: number;
  R: number;
  respuesta: number;
  pistas: [string, string];
}

/** pide I: (V, R) · pide V: (I, R) · pide R: (V, I). */
export function crearOhm(id: string, pide: Magnitud, a: number, b: number, pistas: [string, string]): ProblemaOhm {
  const [V, I, R] = pide === "I" ? [a, corriente(a, b), b] : pide === "V" ? [voltaje(a, b), a, b] : [a, b, resistencia(a, b)];
  const r = pide === "I" ? I : pide === "V" ? V : R;
  return { id, pide, V, I, R, respuesta: enAjuste(r, O_MIN, MEDIDORES[pide].escala, "18.1", id), pistas };
}

// ══ 18.2 Resistencias en serie y en paralelo ───────
/** Fondo de escala del óhmetro (Ω). */
export const RED_ESCALA = 60;

export type TipoRed = "serie" | "paralelo" | "mixta";

export interface ProblemaRed {
  id: string;
  tipo: TipoRed;
  /** Resistencias (Ω). En la mixta: R₁ en serie con el paralelo de R₂ y R₃. */
  rs: number[];
  /** Resistencia equivalente (Ω). */
  respuesta: number;
  pistas: [string, string];
}

export function crearRed(id: string, tipo: TipoRed, rs: number[], pistas: [string, string]): ProblemaRed {
  if (tipo === "mixta" && rs.length !== 3) throw new Error(`18.2 ${id}: la mixta lleva tres resistencias`);
  const R = tipo === "serie" ? serie(rs) : tipo === "paralelo" ? paralelo(rs) : serie([rs[0], paralelo(rs.slice(1))]);
  return { id, tipo, rs, respuesta: enAjuste(R, O_MIN, RED_ESCALA, "18.2", id), pistas };
}

// ══ 18.3 Potencia eléctrica ───────
/** Fondo de escala del vatímetro (W). */
export const P_ESCALA = 200;

/** Qué da el enunciado: V e I, I y R, V y R, o los datos nominales de un foco (P y V) y el voltaje aplicado. */
export type DatoPotencia = "VI" | "IR" | "VR" | "nominal";

export interface ProblemaPotenciaE {
  id: string;
  dato: DatoPotencia;
  /** VI: (V, I) · IR: (I, R) · VR: (V, R) · nominal: (P nominal, V nominal, V aplicado). */
  a: number;
  b: number;
  c: number | null;
  /** Voltaje, corriente y resistencia del foco en el circuito (para la escena). */
  V: number;
  I: number;
  R: number;
  /** Potencia (W). */
  respuesta: number;
  pistas: [string, string];
}

export function crearPotenciaE(id: string, dato: DatoPotencia, a: number, b: number, c: number | null, pistas: [string, string]): ProblemaPotenciaE {
  let V: number, I: number, R: number, P: number;
  if (dato === "VI") [V, I, R, P] = [a, b, resistencia(a, b), potenciaVI(a, b)];
  else if (dato === "IR") [V, I, R, P] = [voltaje(a, b), a, b, potenciaIR(a, b)];
  else if (dato === "VR") [V, I, R, P] = [a, corriente(a, b), b, potenciaVR(a, b)];
  else {
    // la resistencia del foco sale de sus datos nominales; luego la potencia con el voltaje aplicado
    if (c === null) throw new Error(`18.3 ${id}: falta el voltaje aplicado`);
    R = (b * b) / a;
    V = c;
    I = corriente(c, R);
    P = potenciaVR(c, R);
  }
  return { id, dato, a, b, c, V, I, R, respuesta: enAjuste(P, O_MIN, P_ESCALA, "18.3", id), pistas };
}
