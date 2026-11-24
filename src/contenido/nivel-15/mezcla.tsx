// ══ Nivel 15 · Calor: contenido de la etapa 15.3, equilibrio térmico en un calorímetro (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, V } from "@/ui/Formula";
import { crearMezcla, type ProblemaMezcla } from "./modelo";

export { crearMezcla, SUSTANCIAS, T_MAX, T_MIN } from "./modelo";
export type { CuerpoMezcla, ProblemaMezcla } from "./modelo";

export const RONDAS_MEZCLA: RondaDef<ProblemaMezcla>[] = [
  {
    ronda: "guiado",
    items: [
      crearMezcla("g1", { sustancia: "agua", m: 100, T: 80 }, { sustancia: "agua", m: 100, T: 20 }, ["El calor que cede el agua caliente lo gana la fría. Con masas iguales, el equilibrio queda en el medio.", "Tₑ = (80 + 20) / 2 = 50 °C."]),
      crearMezcla("g2", { sustancia: "agua", m: 100, T: 70 }, { sustancia: "agua", m: 200, T: 10 }, ["Es un promedio ponderado por las masas: Tₑ = (m₁T₁ + m₂T₂)/(m₁ + m₂).", "Tₑ = (100·70 + 200·10) / 300 = 9000 / 300 = 30 °C."]),
      crearMezcla("g3", { sustancia: "agua", m: 300, T: 90 }, { sustancia: "agua", m: 100, T: 10 }, ["Hay más agua caliente: el equilibrio queda más cerca de 90 °C.", "Tₑ = (300·90 + 100·10) / 400 = 28 000 / 400 = 70 °C."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearMezcla("p1", { sustancia: "agua", m: 100, T: 95 }, { sustancia: "agua", m: 400, T: 20 }, ["Mucha agua fría y poca caliente.", "Tₑ = (100·95 + 400·20) / 500 = 17 500 / 500 = 35 °C."]),
      crearMezcla("p2", { sustancia: "aceite", m: 200, T: 80 }, { sustancia: "agua", m: 200, T: 20 }, ["Con sustancias distintas, cada masa se multiplica por su calor específico: pesa m·c.", "Tₑ = (200·0,5·80 + 200·1·20) / (100 + 200) = 12 000 / 300 = 40 °C."]),
      crearMezcla("p3", { sustancia: "agua", m: 250, T: 84 }, { sustancia: "agua", m: 500, T: 12 }, ["Tₑ = (m₁T₁ + m₂T₂)/(m₁ + m₂).", "Tₑ = (250·84 + 500·12) / 750 = 27 000 / 750 = 36 °C."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearMezcla("s1", { sustancia: "aluminio", m: 500, T: 100 }, { sustancia: "agua", m: 440, T: 20 }, ["El metal cede calor: pesa m·c = 500 · 0,22 = 110.", "Tₑ = (110·100 + 440·20) / (110 + 440) = 19 800 / 550 = 36 °C."]),
      crearMezcla("s2", { sustancia: "hierro", m: 1000, T: 100 }, { sustancia: "agua", m: 440, T: 25 }, ["m·c del hierro = 1000 · 0,11 = 110.", "Tₑ = (110·100 + 440·25) / 550 = 22 000 / 550 = 40 °C."]),
      crearMezcla("s3", { sustancia: "aluminio", m: 250, T: 200 }, { sustancia: "agua", m: 220, T: 15 }, ["m·c del aluminio = 250 · 0,22 = 55.", "Tₑ = (55·200 + 220·15) / 275 = 14 300 / 275 = 52 °C."]),
      crearMezcla("s4", { sustancia: "hierro", m: 500, T: 150 }, { sustancia: "agua", m: 495, T: 20 }, ["m·c del hierro = 500 · 0,11 = 55.", "Tₑ = (55·150 + 495·20) / 550 = 18 150 / 550 = 33 °C."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_MEZCLA = (
  <>
    <V>T</V>
    <Sub>e</Sub>
    <Op>=</Op>
    <Frac
      n={
        <>
          <V>m</V>
          <Sub>1</Sub>
          <V>c</V>
          <Sub>1</Sub>
          <V>T</V>
          <Sub>1</Sub> + <V>m</V>
          <Sub>2</Sub>
          <V>c</V>
          <Sub>2</Sub>
          <V>T</V>
          <Sub>2</Sub>
        </>
      }
      d={
        <>
          <V>m</V>
          <Sub>1</Sub>
          <V>c</V>
          <Sub>1</Sub> + <V>m</V>
          <Sub>2</Sub>
          <V>c</V>
          <Sub>2</Sub>
        </>
      }
    />
  </>
);
