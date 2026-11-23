// ══ Nivel 7 · Estática: contenido de la etapa 7.2, poleas fijas y móviles (aparejo potencial, problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sup, V } from "@/ui/Formula";
import { crearAparejo, type ProblemaAparejo } from "./modelo";

export { crearAparejo } from "./modelo";
export type { ProblemaAparejo } from "./modelo";

export const RONDAS_APAREJO: RondaDef<ProblemaAparejo>[] = [
  {
    ronda: "guiado",
    items: [
      crearAparejo("g1", 0, 60, 0, ["La polea fija solo cambia la dirección de la fuerza.", "F = W = 60 N."]),
      crearAparejo("g2", 1, 80, 0, ["La polea móvil cuelga de dos tramos de cuerda: cada uno sostiene la mitad.", "F = W / 2 = 80 / 2 = 40 N."]),
      crearAparejo("g3", 1, 120, 0, ["Dos tramos sostienen la carga.", "F = 120 / 2 = 60 N."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearAparejo("p1", 2, 200, 0, ["Cada polea móvil divide la fuerza entre dos.", "F = 200 / 2² = 200 / 4 = 50 N."]),
      crearAparejo("p2", 0, 45, 0, ["Con una sola polea fija no se ahorra fuerza.", "F = W = 45 N."]),
      crearAparejo("p3", 1, 150, 0, ["F = W / 2.", "F = 150 / 2 = 75 N."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearAparejo("s1", 1, 80, 20, ["La polea móvil también pesa: los dos tramos sostienen W + P.", "F = (80 + 20) / 2 = 50 N."]),
      crearAparejo("s2", 3, 160, 0, ["Tres poleas móviles: la fuerza se divide entre 2³.", "F = 160 / 8 = 20 N."]),
      crearAparejo("s3", 2, 180, 0, ["Dos poleas móviles: entre 2².", "F = 180 / 4 = 45 N."]),
      crearAparejo("s4", 1, 130, 10, ["Suma el peso de la polea a la carga.", "F = (130 + 10) / 2 = 70 N."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_APAREJO = (
  <>
    <V>F</V>
    <Op>=</Op>
    <Frac
      n={<V>W</V>}
      d={
        <>
          2
          <Sup>
            <V>n</V>
          </Sup>
        </>
      }
    />
  </>
);

export const F_APAREJO_PESO = (
  <>
    <V>F</V>
    <Op>=</Op>
    <Frac
      n={
        <>
          <V>W</V>
          <Op>+</Op>
          <V>P</V>
        </>
      }
      d="2"
    />
  </>
);
