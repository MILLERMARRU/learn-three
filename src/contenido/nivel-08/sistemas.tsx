// ══ Nivel 8 · Dinámica: contenido de la etapa 8.3, sistemas de bloques (problemas propios, g = 10 m/s²) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, V } from "@/ui/Formula";
import { crearSistema, type ProblemaSistema } from "./modelo";

export { crearSistema, sistemaDe } from "./modelo";
export type { ProblemaSistema } from "./modelo";

export const RONDAS_SISTEMAS: RondaDef<ProblemaSistema>[] = [
  {
    ronda: "guiado",
    items: [
      crearSistema("g1", "atwood", 6, 4, 0, "a", ["Trata a los dos bloques como uno: la fuerza que los mueve es la diferencia de pesos.", "a = (60 − 40) / (6 + 4) = 2 m/s²."]),
      crearSistema("g2", "mesa", 3, 2, 0, "a", ["En la mesa lisa, solo el peso del bloque que cuelga mueve a los dos.", "a = 20 / (3 + 2) = 4 m/s²."]),
      crearSistema("g3", "atwood", 9, 1, 0, "a", ["Mucha diferencia de masas: casi caída libre.", "a = (90 − 10) / 10 = 8 m/s²."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearSistema("p1", "mesa", 4, 6, 0, "a", ["a = m₂g / (m₁ + m₂).", "a = 60 / 10 = 6 m/s²."]),
      crearSistema("p2", "mesa", 5, 5, 0.2, "a", ["El rozamiento sobre el bloque de la mesa (μm₁g) resta.", "a = (50 − 0,2 · 50) / 10 = 4 m/s²."]),
      crearSistema("p3", "atwood", 8, 2, 0, "a", ["a = (m₁ − m₂)g / (m₁ + m₂).", "a = 60 / 10 = 6 m/s²."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearSistema("s1", "atwood", 6, 2, 0, "T", ["Primero la aceleración; luego aplica ΣF = m·a al bloque liviano: T − m₂g = m₂a.", "a = 40 / 8 = 5 m/s²; T = 2 · (10 + 5) = 30 N."]),
      crearSistema("s2", "mesa", 5, 5, 0, "T", ["Para el bloque que cuelga: m₂g − T = m₂a.", "a = 50 / 10 = 5 m/s²; T = 5 · (10 − 5) = 25 N."]),
      crearSistema("s3", "mesa", 2, 3, 0.5, "a", ["Resta el rozamiento: μm₁g = 0,5 · 20 = 10 N.", "a = (30 − 10) / 5 = 4 m/s²."]),
      crearSistema("s4", "mesa", 10, 2, 0.3, "a", ["¿Alcanza el peso colgado a vencer el rozamiento? Compara m₂g con μm₁g.", "20 N < 0,3 · 100 = 30 N: no se mueve, a = 0."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_ATWOOD = (
  <>
    <V>a</V>
    <Op>=</Op>
    <Frac
      n={
        <>
          (<V>m</V>
          <Sub>1</Sub>
          <Op>−</Op>
          <V>m</V>
          <Sub>2</Sub>)<V>g</V>
        </>
      }
      d={
        <>
          <V>m</V>
          <Sub>1</Sub>
          <Op>+</Op>
          <V>m</V>
          <Sub>2</Sub>
        </>
      }
    />
  </>
);

export const F_MESA = (
  <>
    <V>a</V>
    <Op>=</Op>
    <Frac
      n={
        <>
          <V>m</V>
          <Sub>2</Sub>
          <V>g</V>
          <Op>−</Op>
          <V>μ</V>
          <V>m</V>
          <Sub>1</Sub>
          <V>g</V>
        </>
      }
      d={
        <>
          <V>m</V>
          <Sub>1</Sub>
          <Op>+</Op>
          <V>m</V>
          <Sub>2</Sub>
        </>
      }
    />
  </>
);
