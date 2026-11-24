// ══ Nivel 14 · Hidrostática: contenido de la etapa 14.2, principio de Pascal y prensa hidráulica (problemas propios, g = 10) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, V } from "@/ui/Formula";
import { crearPrensa, type ProblemaPrensa } from "./modelo";

export { crearPrensa, F_MAX, F_MIN, F_PASO } from "./modelo";
export type { ProblemaPrensa } from "./modelo";

export const RONDAS_PRENSA: RondaDef<ProblemaPrensa>[] = [
  {
    ronda: "guiado",
    items: [
      crearPrensa("g1", 1000, "m2", 0.01, 0.5, ["La presión es la misma en los dos émbolos: F₁/A₁ = F₂/A₂.", "F₂ = 10 000 N → F₁ = 10 000 · 0,01 / 0,5 = 200 N."]),
      crearPrensa("g2", 800, "m2", 0.02, 0.4, ["F₁ = F₂ · A₁ / A₂.", "F₂ = 8000 N → F₁ = 8000 · 0,02 / 0,4 = 400 N."]),
      crearPrensa("g3", 1200, "m2", 0.01, 0.4, ["El émbolo grande es 40 veces mayor: la fuerza se reduce 40 veces.", "F₁ = 12 000 / 40 = 300 N."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearPrensa("p1", 1500, "cm2", 10, 600, ["Solo importa el cociente de áreas: puedes dejarlas en cm².", "F₁ = 15 000 · 10 / 600 = 250 N."]),
      crearPrensa("p2", 2000, "cm2", 4, 160, ["160 / 4 = 40 veces.", "F₁ = 20 000 / 40 = 500 N."]),
      crearPrensa("p3", 900, "cm2", 6, 300, ["300 / 6 = 50 veces.", "F₁ = 9000 / 50 = 180 N."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearPrensa("s1", 1500, "radio", 2, 20, ["El área va con el radio al cuadrado: un radio 10 veces mayor da un área 100 veces mayor.", "F₁ = 15 000 / 100 = 150 N."]),
      crearPrensa("s2", 2500, "radio", 5, 25, ["(25/5)² = 25.", "F₁ = 25 000 / 25 = 1000 N."]),
      crearPrensa("s3", 1200, "radio", 3, 30, ["(30/3)² = 100.", "F₁ = 12 000 / 100 = 120 N."]),
      crearPrensa("s4", 1000, "radio", 4, 20, ["(20/4)² = 25.", "F₁ = 10 000 / 25 = 400 N."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_PRENSA = (
  <>
    <Frac
      n={
        <>
          <V>F</V>
          <Sub>1</Sub>
        </>
      }
      d={
        <>
          <V>A</V>
          <Sub>1</Sub>
        </>
      }
    />
    <Op>=</Op>
    <Frac
      n={
        <>
          <V>F</V>
          <Sub>2</Sub>
        </>
      }
      d={
        <>
          <V>A</V>
          <Sub>2</Sub>
        </>
      }
    />
  </>
);
