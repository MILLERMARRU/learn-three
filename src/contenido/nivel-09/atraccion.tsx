// ══ Nivel 9 · Gravitación universal: contenido de la etapa 9.1, ley de gravitación por proporciones (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, Sup, V } from "@/ui/Formula";
import { crearAtraccion, type ProblemaAtraccion } from "./modelo";

export { conFactor, crearAtraccion, F_MAX, F_MIN } from "./modelo";
export type { ProblemaAtraccion } from "./modelo";

export const RONDAS_ATRACCION: RondaDef<ProblemaAtraccion>[] = [
  {
    ronda: "guiado",
    items: [
      crearAtraccion("g1", 36, 1, 1, 3, ["La fuerza va con 1/d²: si la distancia se triplica, la fuerza se divide entre 3².", "F = 36 / 9 = 4 N."]),
      crearAtraccion("g2", 12, 3, 1, 1, ["La fuerza es proporcional a cada masa.", "Triple masa, triple fuerza: F = 3 · 12 = 36 N."]),
      crearAtraccion("g3", 5, 1, 1, 0.5, ["Más cerca, más fuerza: con la mitad de distancia, d² se divide entre 4.", "F = 5 · 4 = 20 N."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearAtraccion("p1", 18, 2, 1, 3, ["Multiplica por el cambio de las masas y divide entre el cuadrado del de la distancia.", "F = 18 · 2 / 3² = 36 / 9 = 4 N."]),
      crearAtraccion("p2", 10, 2, 3, 1, ["Cada masa multiplica la fuerza por su factor.", "F = 10 · 2 · 3 = 60 N."]),
      crearAtraccion("p3", 40, 2, 2, 2, ["Las masas multiplican por 2 · 2 = 4 y la distancia divide entre 2² = 4.", "Se compensan: F = 40 N."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearAtraccion("s1", 48, 0.5, 1, 2, ["Multiplica F₀ por el cambio de cada masa y divide entre el cuadrado del cambio de distancia.", "F = 48 · ½ / 4 = 6 N."]),
      crearAtraccion("s2", 9, 4, 1, 1.5, ["(3/2)² = 9/4.", "F = 9 · 4 / (9/4) = 16 N."]),
      crearAtraccion("s3", 27, 2, 2, 3, ["Masas: × 4; distancia: ÷ 9.", "F = 27 · 4 / 9 = 12 N."]),
      crearAtraccion("s4", 2, 3, 3, 0.5, ["Masas: × 9; la mitad de distancia: × 4.", "F = 2 · 9 · 4 = 72 N."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_GRAVITACION = (
  <>
    <V>F</V>
    <Op>=</Op>
    <V>G</V>
    <Frac
      n={
        <>
          <V>m</V>
          <Sub>1</Sub>
          <V>m</V>
          <Sub>2</Sub>
        </>
      }
      d={
        <>
          <V>d</V>
          <Sup>2</Sup>
        </>
      }
    />
  </>
);
