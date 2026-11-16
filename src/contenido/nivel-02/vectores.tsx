// ══ Nivel 2 · Análisis vectorial: contenido de las etapas 2.1, 2.2 y 2.3 (problemas propios) ───────
import type { ReactNode } from "react";
import type { RondaDef } from "@/motor/etapa";
import { suma, escalar, type Vec } from "@/lib/vec";
import { Frac, Op, Sup, Sub, V } from "@/ui/Formula";

export const COLOR = { A: "#86b2ff", B: "#ff8a5c", C: "#6fd6a8", R: "#f0b44c" };

// ══ 2.1 Arma el vector ───────
export interface ProblemaComp {
  id: string;
  nombre: string;
  /** Cómo se da el dato: componentes o módulo + ángulo. */
  dato: ReactNode;
  objetivo: Vec;
  pistas: [string, string];
}

const comp = (id: string, nombre: string, objetivo: Vec, dato: ReactNode, pistas: [string, string]): ProblemaComp => ({ id, nombre, objetivo, dato, pistas });
const vt = (n: string, v: Vec) => (
  <>
    <V>{n}</V>
    <Op>=</Op>({v[0]}, {v[1]})
  </>
);

export const RONDAS_COMP: RondaDef<ProblemaComp>[] = [
  {
    ronda: "guiado",
    items: [
      comp("g1", "A", [3, 2], vt("A", [3, 2]), ["La primera componente es x (horizontal), la segunda es y (vertical).", "3 a la derecha y 2 hacia arriba."]),
      comp("g2", "B", [-2, 4], vt("B", [-2, 4]), ["Una x negativa va a la izquierda.", "2 a la izquierda y 4 hacia arriba."]),
      comp("g3", "C", [4, -3], vt("C", [4, -3]), ["Una y negativa va hacia abajo.", "4 a la derecha y 3 hacia abajo."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      comp("p1", "D", [-5, -1], vt("D", [-5, -1]), ["Las dos componentes son negativas: tercer cuadrante.", "5 a la izquierda y 1 hacia abajo."]),
      comp("p2", "E", [0, 4], vt("E", [0, 4]), ["Si x = 0 el vector queda sobre el eje y.", "Solo sube 4."]),
      comp("p3", "F", [6, 2], vt("F", [6, 2]), ["Cuenta las casillas desde el origen.", "6 a la derecha y 2 hacia arriba."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      comp("s1", "A", [4, 3], <>|<V>A</V>| = 5 a 37° sobre el eje +x</>, ["Triángulo 37°–53°: los lados son 3k, 4k y 5k.", "Con 37°: x = 4k, y = 3k. Aquí k = 1."]),
      comp("s2", "B", [-3, 4], <>|<V>B</V>| = 5 a 53° sobre el eje −x</>, ["Está en el segundo cuadrante: x negativa, y positiva.", "Con 53° respecto al eje x: x = 3k, y = 4k."]),
      comp("s3", "C", [4, -4], <>|<V>C</V>| = 4√2 a 45° bajo el eje +x</>, ["Con 45° las dos componentes miden igual.", "|C| = k√2 → k = 4: x = 4, y = −4."]),
      comp("s4", "D", [0, -5], <>|<V>D</V>| = 5 apuntando hacia −y</>, ["Si apunta a −y, no tiene componente x.", "D = (0, −5)."]),
    ],
  },
];

// ══ 2.2 Suma de vectores ───────
export interface ProblemaSuma {
  id: string;
  vectores: { n: "A" | "B" | "C"; v: Vec; signo: 1 | -1 }[];
  objetivo: Vec;
  operacion: string;
  pistas: [string, string];
}

function sumaP(id: string, vs: ProblemaSuma["vectores"], pistas: [string, string]): ProblemaSuma {
  const objetivo = vs.reduce<Vec>((acc, x) => suma(acc, escalar(x.v, x.signo)), [0, 0]);
  const operacion = vs.map((x, i) => (i === 0 ? x.n : `${x.signo > 0 ? " + " : " − "}${x.n}`)).join("");
  return { id, vectores: vs, objetivo, operacion, pistas };
}

export const RONDAS_SUMA: RondaDef<ProblemaSuma>[] = [
  {
    ronda: "guiado",
    items: [
      sumaP("g1", [{ n: "A", v: [3, 1], signo: 1 }, { n: "B", v: [1, 3], signo: 1 }], ["Método del polígono: pon B a continuación de A.", "Suma componente a componente: (3 + 1, 1 + 3)."]),
      sumaP("g2", [{ n: "A", v: [4, -1], signo: 1 }, { n: "B", v: [-1, 3], signo: 1 }], ["La resultante va del origen a la punta del último vector.", "(4 − 1, −1 + 3)."]),
      sumaP("g3", [{ n: "A", v: [2, 3], signo: 1 }, { n: "B", v: [3, -5], signo: 1 }], ["Suma las x por un lado y las y por otro.", "(2 + 3, 3 − 5)."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      sumaP("p1", [{ n: "A", v: [-4, 2], signo: 1 }, { n: "B", v: [1, 2], signo: 1 }], ["x: −4 + 1. y: 2 + 2.", "R = (−3, 4)."]),
      sumaP("p2", [{ n: "A", v: [5, 1], signo: 1 }, { n: "B", v: [2, 3], signo: -1 }], ["Restar B es sumar −B: el vector al revés.", "(5 − 2, 1 − 3)."]),
      sumaP("p3", [{ n: "A", v: [1, 2], signo: 1 }, { n: "B", v: [2, -1], signo: 1 }, { n: "C", v: [-4, 1], signo: 1 }], ["Con tres vectores, encadénalos uno tras otro.", "(1 + 2 − 4, 2 − 1 + 1)."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      sumaP("s1", [{ n: "A", v: [3, -2], signo: 1 }, { n: "B", v: [-5, -1], signo: 1 }], ["Suma componente a componente.", "(3 − 5, −2 − 1)."]),
      sumaP("s2", [{ n: "A", v: [6, 0], signo: 1 }, { n: "B", v: [2, 4], signo: -1 }], ["A − B = A + (−B).", "(6 − 2, 0 − 4)."]),
      sumaP("s3", [{ n: "A", v: [2, 2], signo: 1 }, { n: "B", v: [-3, 1], signo: 1 }, { n: "C", v: [1, -3], signo: 1 }], ["Si los vectores forman un polígono cerrado, la resultante es…", "…cero: la punta vuelve al origen."]),
    ],
  },
];

// ══ 2.3 Regla del paralelogramo ───────
export interface ProblemaParalelo {
  id: string;
  a: number;
  b: number;
  angulo: number;
  respuesta: number;
  caso?: string;
  pistas: [string, string];
}

const R = (a: number, b: number, ang: number) => Math.sqrt(a * a + b * b + 2 * a * b * Math.cos((ang * Math.PI) / 180));
const par = (id: string, a: number, b: number, angulo: number, pistas: [string, string], caso?: string): ProblemaParalelo => ({
  id, a, b, angulo, respuesta: Math.round(R(a, b, angulo) * 100) / 100, pistas, caso,
});

export const RONDAS_PARALELO: RondaDef<ProblemaParalelo>[] = [
  {
    ronda: "guiado",
    items: [
      par("g1", 3, 4, 90, ["A 90° el paralelogramo es un rectángulo: usa Pitágoras.", "R = √(3² + 4²) = √25."], "perpendiculares"),
      par("g2", 3, 5, 60, ["cos 60° = ½.", "R² = 9 + 25 + 2·3·5·½ = 49."]),
      par("g3", 5, 3, 0, ["Con 0° los vectores apuntan igual: se suman.", "Es la resultante máxima: A + B."], "resultante máxima"),
    ],
  },
  {
    ronda: "pista",
    items: [
      par("p1", 6, 8, 90, ["Perpendiculares: Pitágoras.", "R² = 36 + 64 = 100."], "perpendiculares"),
      par("p2", 5, 8, 120, ["cos 120° = −½.", "R² = 25 + 64 − 40 = 49."]),
      par("p3", 7, 3, 180, ["Con 180° apuntan en sentidos opuestos: se restan.", "Es la resultante mínima: A − B."], "resultante mínima"),
    ],
  },
  {
    ronda: "solo",
    items: [
      par("s1", 7, 8, 60, ["cos 60° = ½.", "R² = 49 + 64 + 56 = 169."]),
      par("s2", 3, 8, 120, ["cos 120° = −½.", "R² = 9 + 64 − 24 = 49."]),
      par("s3", 10, 10, 120, ["Dos vectores iguales a 120°: un caso famoso.", "R² = 100 + 100 − 100: R vale lo mismo que cada vector."], "iguales a 120°"),
      par("s4", 5, 12, 90, ["Perpendiculares: Pitágoras.", "R² = 25 + 144."], "perpendiculares"),
    ],
  },
];

/** Fórmula de la ley de cosenos para la resultante. */
export const FORMULA_R = (
  <>
    <V>R</V>
    <Sup>2</Sup>
    <Op>=</Op>
    <V>A</V>
    <Sup>2</Sup>
    <Op>+</Op>
    <V>B</V>
    <Sup>2</Sup>
    <Op>+</Op>2<V>A</V>
    <V>B</V> cos <V>θ</V>
  </>
);

export const VECTOR_UNITARIO = (
  <>
    <V>u</V>
    <Sub>A</Sub>
    <Op>=</Op>
    <Frac n={<V>A</V>} d={<>|<V>A</V>|</>} />
  </>
);
