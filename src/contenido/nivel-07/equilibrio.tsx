// ══ Nivel 7 · Estática: contenido de la etapa 7.1, primera condición de equilibrio (problemas propios, g = 10 m/s²) ───────
import { dosCuerdas, enPlano, fuerza, G, senCos, type Vec2 } from "@/lib/estatica";
import type { RondaDef } from "@/motor/etapa";
import { Op, Sub, V } from "@/ui/Formula";

/** Paso y rango del ajuste de la fuerza desconocida (N). */
export const F_PASO = 5;
export const F_MIN = 5;
export const F_MAX = 200;

// ══ 7.1 Primera condición de equilibrio ───────
export type TipoEquilibrio = "colgado" | "piso" | "plano" | "cuerdas";
export type Incognita = "T" | "f" | "N" | "T1" | "T2";

export interface ProblemaEquilibrio {
  id: string;
  tipo: TipoEquilibrio;
  /** Peso del cuerpo (N). */
  W: number;
  /** Masa (kg), si el dato viene así (W = mg). */
  m: number | null;
  /** Piso: fuerza aplicada y su ángulo sobre la horizontal. Plano: inclinación. Cuerdas: ángulos de las cuerdas con la horizontal. */
  F: number;
  angulo: number;
  angulo2: number;
  incognita: Incognita;
  respuesta: number;
  pistas: [string, string];
}

/** Una fuerza para dibujar: nombre, vector (N) y si es la que ajusta el alumno. */
export interface FuerzaDib {
  nombre: string;
  vec: Vec2;
  color: string;
  incognita: boolean;
}

export const COLORES_FUERZA: Record<string, string> = { W: "#ff8a5c", T: "#86b2ff", T1: "#86b2ff", T2: "#b49cff", N: "#6fd6a8", f: "#f0b44c", F: "#ff9ecd" };

/** Valor de equilibrio de cada fuerza del problema (la incógnita incluida). */
function equilibrioDe(p: Omit<ProblemaEquilibrio, "respuesta" | "pistas" | "id">): Record<string, number> {
  if (p.tipo === "colgado") return { T: p.W };
  if (p.tipo === "plano") {
    const { paralela, normal } = enPlano(p.W, p.angulo);
    return { T: paralela, N: normal };
  }
  if (p.tipo === "cuerdas") {
    const [t1, t2] = dosCuerdas(p.W, p.angulo, p.angulo2);
    return { T1: t1, T2: t2 };
  }
  const [s, c] = senCos(p.angulo);
  return { f: p.F * c, N: p.W - p.F * s };
}

/** Fuerzas que actúan sobre el cuerpo cuando la incógnita vale `valor` (las demás, en su valor de equilibrio). */
export function fuerzasDe(p: ProblemaEquilibrio, valor: number): FuerzaDib[] {
  const eq = equilibrioDe(p);
  const v = (n: string) => (n === p.incognita ? valor : eq[n]);
  const f = (nombre: string, vec: Vec2): FuerzaDib => ({ nombre, vec, color: COLORES_FUERZA[nombre], incognita: nombre === p.incognita });
  const peso = f("W", [0, -p.W]);
  if (p.tipo === "colgado") return [f("T", [0, v("T")]), peso];
  if (p.tipo === "plano") return [f("T", fuerza(v("T"), p.angulo)), f("N", fuerza(v("N"), p.angulo + 90)), peso];
  if (p.tipo === "cuerdas") return [f("T1", fuerza(v("T1"), 180 - p.angulo)), f("T2", fuerza(v("T2"), p.angulo2)), peso];
  return [f("F", fuerza(p.F, p.angulo)), f("f", [-v("f"), 0]), f("N", [0, v("N")]), peso];
}

/** Dirección en la que puede moverse el cuerpo si no hay equilibrio (null = en la dirección de la resultante). */
export function direccionLibre(p: ProblemaEquilibrio): Vec2 | null {
  if (p.tipo === "colgado") return [0, 1];
  if (p.tipo === "plano") return fuerza(1, p.angulo);
  if (p.tipo === "cuerdas") return null;
  return p.incognita === "N" ? [0, 1] : [1, 0];
}

function equilibrio(id: string, tipo: TipoEquilibrio, datos: { W?: number; m?: number; F?: number; angulo?: number; angulo2?: number }, incognita: Incognita, pistas: [string, string]): ProblemaEquilibrio {
  const W = datos.m != null ? datos.m * G : (datos.W ?? 0);
  const base = { tipo, W, m: datos.m ?? null, F: datos.F ?? 0, angulo: datos.angulo ?? 0, angulo2: datos.angulo2 ?? 0, incognita };
  const r = equilibrioDe(base)[incognita];
  // la incógnita es exacta y cae en el ajuste (múltiplo de 5 N): si no, falla al cargar
  if (Math.abs(r - Math.round(r)) > 1e-9 || Math.round(r) % F_PASO !== 0 || r < F_MIN || r > F_MAX) throw new Error(`7.1 ${id}: ${incognita} = ${r} fuera del ajuste`);
  return { id, ...base, respuesta: Math.round(r), pistas };
}

export const RONDAS_EQUILIBRIO: RondaDef<ProblemaEquilibrio>[] = [
  {
    ronda: "guiado",
    items: [
      equilibrio("g1", "colgado", { m: 5 }, "T", ["En reposo, la tensión equilibra al peso: ΣFy = 0.", "T = W = m·g = 5 · 10 = 50 N."]),
      equilibrio("g2", "piso", { W: 100, F: 50, angulo: 37 }, "f", ["Solo la componente horizontal de F intenta moverlo: F cos 37°.", "f = 50 · 0,8 = 40 N."]),
      equilibrio("g3", "plano", { W: 100, angulo: 37 }, "T", ["En el plano, el peso tiene una componente paralela W sen θ que lo hace bajar.", "T = W sen 37° = 100 · 0,6 = 60 N."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      equilibrio("p1", "cuerdas", { W: 50, angulo: 37, angulo2: 53 }, "T1", ["En x: T₁ cos 37° = T₂ cos 53°. En y: T₁ sen 37° + T₂ sen 53° = W.", "Como 37° + 53° = 90°: T₁ = W cos 53° = 50 · 0,6 = 30 N."]),
      equilibrio("p2", "piso", { W: 80, F: 50, angulo: 37 }, "N", ["La componente vertical de F (F sen 37°) ayuda a levantar el bloque.", "N = W − F sen 37° = 80 − 30 = 50 N."]),
      equilibrio("p3", "plano", { W: 50, angulo: 53 }, "T", ["T = W sen θ.", "T = 50 · 0,8 = 40 N."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      equilibrio("s1", "colgado", { m: 12 }, "T", ["Primero el peso: W = m·g.", "T = 12 · 10 = 120 N."]),
      equilibrio("s2", "cuerdas", { W: 100, angulo: 37, angulo2: 53 }, "T2", ["Descompón en x y en y.", "T₂ = W cos 37° / sen 90° = 100 · 0,8 = 80 N."]),
      equilibrio("s3", "piso", { W: 100, F: 50, angulo: 53 }, "f", ["f equilibra a la componente horizontal de F.", "f = 50 · cos 53° = 50 · 0,6 = 30 N."]),
      equilibrio("s4", "plano", { W: 90, angulo: 30 }, "T", ["sen 30° = 1/2.", "T = 90 · 0,5 = 45 N."]),
    ],
  },
];

/** Nombre con subíndice para el texto («T₁», «T₂»). */
export const nombreFuerza = (n: string) => n.replace("1", "₁").replace("2", "₂");

// ══ Fórmulas ───────
export const F_EQUILIBRIO = (
  <>
    Σ<V>F</V>
    <Sub>x</Sub>
    <Op>=</Op>0<Op>·</Op>Σ<V>F</V>
    <Sub>y</Sub>
    <Op>=</Op>0
  </>
);
