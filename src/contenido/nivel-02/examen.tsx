// ══ Nivel 2 · Etapa 2.4: examen tipo admisión de vectores (problemas propios) ───────
import type { ReactNode } from "react";
import type { RondaDef } from "@/motor/etapa";
import type { Vec } from "@/lib/vec";
import type { PreguntaBase } from "@/etapas/Examen";
import { Op, Sub, V } from "@/ui/Formula";

export interface PreguntaVec extends PreguntaBase {
  opciones: { texto: ReactNode }[];
  /** Vectores que se dibujan en 3D para la pregunta. */
  vectores?: { n: string; v: Vec; desde?: Vec }[];
  /** Resultante que aparece al responder. */
  resultado?: Vec;
}

const t = (s: string) => ({ texto: s });

export const PREGUNTAS_VEC: PreguntaVec[] = [
  {
    id: "v1",
    enunciado: <>Dos vectores miden 6 y 8. ¿Cuál es su <b>resultante máxima</b>?</>,
    opciones: [t("2"), t("10"), t("14"), t("48"), t("7")],
    correcta: 2,
    explicacion: "La máxima ocurre cuando apuntan en el mismo sentido: 6 + 8 = 14.",
    vectores: [{ n: "A", v: [6, 0] }, { n: "B", v: [8, 0], desde: [6, 0] }],
  },
  {
    id: "v2",
    enunciado: <>Los mismos vectores de 6 y 8: ¿cuál es su <b>resultante mínima</b>?</>,
    opciones: [t("0"), t("2"), t("14"), t("10"), t("4")],
    correcta: 1,
    explicacion: "La mínima ocurre en sentidos opuestos: 8 − 6 = 2.",
  },
  {
    id: "v3",
    enunciado: <>Si los vectores de 6 y 8 son <b>perpendiculares</b>, la resultante mide:</>,
    opciones: [t("14"), t("2"), t("12"), t("10"), t("√48")],
    correcta: 3,
    explicacion: "Pitágoras: √(36 + 64) = √100 = 10.",
    vectores: [{ n: "A", v: [6, 0] }, { n: "B", v: [0, 8] }],
    resultado: [6, 8],
  },
  {
    id: "v4",
    enunciado: <>Un vector de módulo 10 forma 37° con el eje +x. Sus componentes son:</>,
    opciones: [t("(6, 8)"), t("(8, 6)"), t("(5, 5)"), t("(10, 0)"), t("(7, 7)")],
    correcta: 1,
    explicacion: "Triángulo 37°–53° con k = 2: x = 4k = 8, y = 3k = 6.",
    resultado: [8, 6],
  },
  {
    id: "v5",
    enunciado: <>¿Cuál es el módulo de <V>A</V><Op>=</Op>(3, 4)?</>,
    opciones: [t("7"), t("1"), t("5"), t("12"), t("25")],
    correcta: 2,
    explicacion: "|A| = √(3² + 4²) = √25 = 5.",
    resultado: [3, 4],
  },
  {
    id: "v6",
    enunciado: <>Si <V>A</V><Op>=</Op>(2, −1) y <V>B</V><Op>=</Op>(−5, 5), el módulo de <V>A</V><Op>+</Op><V>B</V> es:</>,
    opciones: [t("5"), t("7"), t("√53"), t("3"), t("4")],
    correcta: 0,
    explicacion: "A + B = (−3, 4), y su módulo es √(9 + 16) = 5.",
    vectores: [{ n: "A", v: [2, -1] }, { n: "B", v: [-5, 5] }],
    resultado: [-3, 4],
  },
  {
    id: "v7",
    enunciado: <>Dos vectores de módulo 10 forman 120°. La resultante mide:</>,
    opciones: [t("20"), t("0"), t("10√3"), t("10"), t("5")],
    correcta: 3,
    explicacion: "R² = 100 + 100 + 2·100·(−½) = 100, así que R = 10.",
  },
  {
    id: "v8",
    enunciado: <>El vector unitario de <V>A</V><Op>=</Op>(6, 8) es <V>u</V><Sub>A</Sub><Op>=</Op>:</>,
    opciones: [t("(6, 8)"), t("(0,6; 0,8)"), t("(0,8; 0,6)"), t("(1, 1)"), t("(3, 4)")],
    correcta: 1,
    explicacion: "u = A / |A| = (6, 8) / 10 = (0,6; 0,8). Mide 1.",
  },
  {
    id: "v9",
    enunciado: <>Tres vectores forman un triángulo cerrado, uno a continuación del otro. Su resultante es:</>,
    opciones: [t("La suma de sus módulos"), t("Cero"), t("El mayor de los tres"), t("El perímetro"), t("No se puede saber")],
    correcta: 1,
    explicacion: "En un polígono cerrado la punta del último vector vuelve al origen: R = 0.",
    vectores: [{ n: "A", v: [2, 2] }, { n: "B", v: [-3, 1], desde: [2, 2] }, { n: "C", v: [1, -3], desde: [-1, 3] }],
  },
  {
    id: "v10",
    enunciado: <>Si <V>A</V><Op>=</Op>(2, 3) y <V>B</V><Op>=</Op>(4, −1), el <b>producto escalar</b> <V>A</V>·<V>B</V> es:</>,
    opciones: [t("5"), t("11"), t("(8, −3)"), t("−5"), t("7")],
    correcta: 0,
    explicacion: "A·B = 2·4 + 3·(−1) = 8 − 3 = 5 (es un número, no un vector).",
    vectores: [{ n: "A", v: [2, 3] }, { n: "B", v: [4, -1] }],
  },
];

export const RONDAS_EXAMEN_VEC: RondaDef<PreguntaVec>[] = [{ ronda: "examen", items: PREGUNTAS_VEC }];
