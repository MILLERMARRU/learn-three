// ══ Nivel 3 · Cinemática I (MRU y MRUV): contenido de las etapas 3.1, 3.2 y 3.3 (problemas propios) ───────
import type { ReactNode } from "react";
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, Sup, V } from "@/ui/Formula";

export const COLOR_AUTO = { A: "#86b2ff", B: "#ff8a5c" };

// ══ 3.1 Predice la posición (MRU) ───────
export interface ProblemaMRU {
  id: string;
  v: number; // m/s (negativa: hacia la izquierda)
  x0: number;
  t: number;
  L: number;
  dato?: ReactNode; // cómo se enuncia la rapidez (p. ej. en km/h)
  respuesta: number;
  pistas: [string, string];
}

const mru = (id: string, v: number, t: number, x0: number, L: number, pistas: [string, string], dato?: ReactNode): ProblemaMRU => ({
  id, v, t, x0, L, pistas, dato, respuesta: x0 + v * t,
});

export const RONDAS_MRU: RondaDef<ProblemaMRU>[] = [
  {
    ronda: "guiado",
    items: [
      mru("g1", 5, 6, 0, 60, ["En el MRU la rapidez no cambia: avanza lo mismo cada segundo.", "x = v · t = 5 · 6."]),
      mru("g2", 10, 4, 0, 60, ["Cada segundo avanza 10 m.", "x = 10 · 4."]),
      mru("g3", 4, 5, 10, 60, ["Ojo: no parte de 0, parte de x₀ = 10 m.", "x = 10 + 4 · 5."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      mru("p1", 8, 5, 0, 60, ["Distancia = rapidez × tiempo.", "8 · 5."]),
      mru("p2", 15, 4, 0, 80, ["Cada segundo avanza 15 m.", "15 · 4."]),
      mru("p3", 6, 5, 10, 60, ["Suma la posición inicial.", "10 + 6 · 5."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      mru("s1", 12, 5, 0, 80, ["x = x₀ + v · t.", "12 · 5."]),
      mru("s2", -5, 6, 50, 60, ["Va hacia la izquierda: su velocidad es negativa.", "x = 50 − 5 · 6."]),
      mru("s3", 20, 3, 0, 80, ["Primero pasa los km/h a m/s: multiplica por 5/18.", "72 km/h = 20 m/s; x = 20 · 3."], <>72 km/h</>),
    ],
  },
];

// ══ 3.2 Encuentro y alcance ───────
export interface ProblemaEncuentro {
  id: string;
  tipo: "encuentro" | "alcance";
  d: number; // separación inicial (B empieza en x = d)
  vA: number;
  vB: number;
  L: number;
  t: number; // tiempo de encuentro o alcance
  respuesta: number; // posición donde se encuentran
  pistas: [string, string];
}

function enc(id: string, tipo: ProblemaEncuentro["tipo"], d: number, vA: number, vB: number, pistas: [string, string]): ProblemaEncuentro {
  const t = tipo === "encuentro" ? d / (vA + vB) : d / (vA - vB);
  const respuesta = vA * t;
  const L = Math.ceil((Math.max(d, respuesta) + 10) / 10) * 10;
  return { id, tipo, d, vA, vB, t, respuesta, L, pistas };
}

export const RONDAS_ENCUENTRO: RondaDef<ProblemaEncuentro>[] = [
  {
    ronda: "guiado",
    items: [
      enc("g1", "encuentro", 100, 6, 4, ["Van uno hacia el otro: sus rapideces se suman.", "t = 100 / (6 + 4) = 10 s; A recorre 6 · 10."]),
      enc("g2", "encuentro", 60, 8, 4, ["t = d / (vA + vB).", "t = 60 / 12 = 5 s; A recorre 8 · 5."]),
      enc("g3", "alcance", 30, 8, 5, ["Van en el mismo sentido: sus rapideces se restan.", "t = 30 / (8 − 5) = 10 s; A recorre 8 · 10."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      enc("p1", "encuentro", 90, 10, 5, ["Tiempo de encuentro: d / (vA + vB).", "t = 6 s; A recorre 10 · 6."]),
      enc("p2", "alcance", 40, 12, 4, ["Tiempo de alcance: d / (vA − vB).", "t = 5 s; A recorre 12 · 5."]),
      enc("p3", "encuentro", 120, 7, 5, ["Primero el tiempo, luego cuánto recorre A.", "t = 10 s; A recorre 70 m."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      enc("s1", "alcance", 50, 15, 10, ["Alcance: se restan las rapideces.", "t = 10 s; A recorre 150 m."]),
      enc("s2", "encuentro", 150, 20, 10, ["Encuentro: se suman.", "t = 5 s; A recorre 100 m."]),
      enc("s3", "alcance", 20, 9, 5, ["d / (vA − vB).", "t = 5 s; A recorre 45 m."]),
    ],
  },
];

// ══ 3.3 Frena a tiempo (MRUV) ───────
export interface ProblemaMRUV {
  id: string;
  tipo: "frenar" | "meta" | "distancia";
  v0: number;
  d: number;
  vf?: number; // para "meta"
  t?: number; // para "distancia"
  L: number;
  respuesta: number; // aceleración en m/s²
  dato?: ReactNode;
  pistas: [string, string];
}

const frenar = (id: string, v0: number, d: number, pistas: [string, string], dato?: ReactNode): ProblemaMRUV => ({
  id, tipo: "frenar", v0, d, L: Math.ceil((d + 10) / 10) * 10, respuesta: (v0 * v0) / (2 * d), pistas, dato,
});
const meta = (id: string, v0: number, vf: number, d: number, pistas: [string, string]): ProblemaMRUV => ({
  id, tipo: "meta", v0, vf, d, L: Math.ceil((d + 10) / 10) * 10, respuesta: (vf * vf - v0 * v0) / (2 * d), pistas,
});
const distancia = (id: string, d: number, t: number, pistas: [string, string]): ProblemaMRUV => ({
  id, tipo: "distancia", v0: 0, d, t, L: Math.ceil((d + 10) / 10) * 10, respuesta: (2 * d) / (t * t), pistas,
});

export const RONDAS_MRUV: RondaDef<ProblemaMRUV>[] = [
  {
    ronda: "guiado",
    items: [
      frenar("g1", 10, 25, ["Para frenar justo: v² = v₀² − 2ad con v = 0.", "a = v₀² / (2d) = 100 / 50."]),
      frenar("g2", 20, 40, ["a = v₀² / (2d).", "a = 400 / 80."]),
      distancia("g3", 50, 5, ["Desde el reposo: d = ½ a t².", "a = 2d / t² = 100 / 25."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      meta("p1", 10, 30, 100, ["v² = v₀² + 2ad.", "a = (900 − 100) / 200."]),
      frenar("p2", 30, 90, ["a = v₀² / (2d).", "a = 900 / 180."]),
      distancia("p3", 16, 4, ["d = ½ a t².", "a = 32 / 16."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      frenar("s1", 12, 36, ["Frenar justo: a = v₀² / (2d).", "a = 144 / 72."]),
      meta("s2", 0, 20, 50, ["Desde el reposo hasta 20 m/s.", "a = 400 / 100."]),
      distancia("s3", 75, 5, ["d = ½ a t².", "a = 150 / 25."]),
      frenar("s4", 20, 50, ["72 km/h = 20 m/s.", "a = 400 / 100."], <>72 km/h</>),
    ],
  },
];

// ══ Fórmulas ───────
export const F_MRU = (
  <>
    <V>x</V>
    <Op>=</Op>
    <V>x</V>
    <Sub>0</Sub>
    <Op>+</Op>
    <V>v</V>
    <Op>·</Op>
    <V>t</V>
  </>
);
export const F_ENCUENTRO = (
  <>
    <V>t</V>
    <Sub>e</Sub>
    <Op>=</Op>
    <Frac n={<V>d</V>} d={<><V>v</V><Sub>A</Sub><Op>+</Op><V>v</V><Sub>B</Sub></>} />
  </>
);
export const F_ALCANCE = (
  <>
    <V>t</V>
    <Sub>a</Sub>
    <Op>=</Op>
    <Frac n={<V>d</V>} d={<><V>v</V><Sub>A</Sub><Op>−</Op><V>v</V><Sub>B</Sub></>} />
  </>
);
export const F_TORRICELLI = (
  <>
    <V>v</V>
    <Sup>2</Sup>
    <Op>=</Op>
    <V>v</V>
    <Sub>0</Sub>
    <Sup>2</Sup>
    <Op>±</Op>2<V>a</V>
    <V>d</V>
  </>
);
export const F_DISTANCIA = (
  <>
    <V>d</V>
    <Op>=</Op>
    <V>v</V>
    <Sub>0</Sub>
    <V>t</V>
    <Op>+</Op>
    <Frac n="1" d="2" />
    <V>a</V>
    <V>t</V>
    <Sup>2</Sup>
  </>
);
