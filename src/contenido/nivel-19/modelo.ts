// ══ Nivel 19 · Condensadores: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { capParalelo, capSerie, carga, energiaCV, energiaQC, energiaQV } from "@/lib/condensadores";

/** Valida que la respuesta sea un entero dentro de (min, max]. */
function enAjuste(r: number, min: number, max: number, etapa: string, id: string): number {
  if (Math.abs(r - Math.round(r)) > 1e-9 || r <= min || r > max) throw new Error(`${etapa} ${id}: ${r} fuera del ajuste`);
  return Math.round(r);
}

/** Número con coma decimal: «0,5». */
export const fmtC = (n: number) => String(n).replace(".", ",");

// ══ 19.1 Carga de un condensador ───────
/** Rango del ajuste y fondo de escala del medidor de carga (μC). */
export const Q_MIN = 0;
export const Q_ESCALA = 120;

export interface ProblemaCarga {
  id: string;
  /** Capacidad (μF), voltaje de la pila (V) y constante del dieléctrico (1 = sin dieléctrico). */
  C: number;
  V: number;
  kappa: number;
  /** Carga (μC). */
  respuesta: number;
  pistas: [string, string];
}

export function crearCarga(id: string, C: number, V: number, kappa: number, pistas: [string, string]): ProblemaCarga {
  return { id, C, V, kappa, respuesta: enAjuste(carga(C, V, kappa), Q_MIN, Q_ESCALA, "19.1", id), pistas };
}

// ══ 19.2 Asociación de condensadores ───────
/** Fondo de escala del medidor de capacidad (μF). */
export const C_ESCALA = 60;

export type TipoAsociacion = "serie" | "paralelo" | "mixta";

export interface ProblemaAsociacion {
  id: string;
  tipo: TipoAsociacion;
  /** Capacidades (μF). En la mixta: C₁ en serie con el paralelo de C₂ y C₃. */
  cs: number[];
  /** Capacidad equivalente (μF). */
  respuesta: number;
  pistas: [string, string];
}

export function crearAsociacion(id: string, tipo: TipoAsociacion, cs: number[], pistas: [string, string]): ProblemaAsociacion {
  if (tipo === "mixta" && cs.length !== 3) throw new Error(`19.2 ${id}: la mixta lleva tres condensadores`);
  const C = tipo === "paralelo" ? capParalelo(cs) : tipo === "serie" ? capSerie(cs) : capSerie([cs[0], capParalelo(cs.slice(1))]);
  return { id, tipo, cs, respuesta: enAjuste(C, Q_MIN, C_ESCALA, "19.2", id), pistas };
}

// ══ 19.3 Energía almacenada ───────
/** Fondo de escala del medidor de energía (mJ). */
export const U_ESCALA = 60;

/** Qué da el enunciado: C y V, Q y C, Q y V, o una asociación (serie o paralelo) conectada a V. */
export type DatoEnergia = "CV" | "QC" | "QV" | "serie" | "paralelo";

export interface ProblemaEnergiaC {
  id: string;
  dato: DatoEnergia;
  /** CV: (C μF, V) · QC: (Q μC, C μF) · QV: (Q μC, V) · serie/paralelo: capacidades (μF) y V. */
  a: number;
  b: number;
  cs: number[] | null;
  /** Capacidad (equivalente) en μF, para la escena. */
  C: number;
  /** Energía (mJ). */
  respuesta: number;
  pistas: [string, string];
}

/** Con μF, μC y V, las fórmulas dan μJ: se pasa a mJ. */
const aMJ = (uJ: number) => Math.round((uJ / 1000) * 1e9) / 1e9;

export function crearEnergiaC(id: string, dato: DatoEnergia, a: number, b: number, pistas: [string, string], cs: number[] | null = null): ProblemaEnergiaC {
  let C: number, U: number;
  if (dato === "CV") [C, U] = [a, energiaCV(a, b)];
  else if (dato === "QC") [C, U] = [b, energiaQC(a, b)];
  else if (dato === "QV") [C, U] = [a / b, energiaQV(a, b)];
  else {
    if (!cs) throw new Error(`19.3 ${id}: faltan las capacidades`);
    C = dato === "serie" ? capSerie(cs) : capParalelo(cs);
    U = energiaCV(C, b);
  }
  return { id, dato, a, b, cs, C, respuesta: enAjuste(aMJ(U), Q_MIN, U_ESCALA, "19.3", id), pistas };
}
