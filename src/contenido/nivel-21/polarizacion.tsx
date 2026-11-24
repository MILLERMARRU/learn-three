// ══ Nivel 21 · Ondas electromagnéticas: contenido de la etapa 21.2, polarización y ley de Malus (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Op, Sub, V } from "@/ui/Formula";
import { crearPolarizacion, type ProblemaPolarizacion } from "./modelo";

export { crearPolarizacion, I_ESCALA } from "./modelo";
export type { ProblemaPolarizacion } from "./modelo";

export const RONDAS_POLARIZACION: RondaDef<ProblemaPolarizacion>[] = [
  {
    ronda: "guiado",
    items: [
      crearPolarizacion("g1", 80, 60, false, ["Un analizador girado θ respecto de la polarización deja pasar I = I₀·cos²θ (ley de Malus).", "cos² 60° = 1/4 → I = 80 / 4 = 20 W/m²."]),
      crearPolarizacion("g2", 60, 45, false, ["cos² 45° = 1/2.", "I = 60 · 0,5 = 30 W/m²."]),
      crearPolarizacion("g3", 100, 30, false, ["cos² 30° = 3/4.", "I = 100 · 0,75 = 75 W/m²."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearPolarizacion("p1", 50, 37, false, ["Con los ángulos notables: cos 37° = 0,8, así que cos² 37° = 0,64.", "I = 50 · 0,64 = 32 W/m²."]),
      crearPolarizacion("p2", 100, 53, false, ["cos 53° = 0,6 → cos² 53° = 0,36.", "I = 100 · 0,36 = 36 W/m²."]),
      crearPolarizacion("p3", 25, 37, false, ["cos² 37° = 0,64.", "I = 25 · 0,64 = 16 W/m²."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearPolarizacion("s1", 80, 60, true, ["Si la luz llega sin polarizar, el primer polarizador deja pasar la mitad; luego aplica Malus.", "80 / 2 = 40 → I = 40 · 1/4 = 10 W/m²."]),
      crearPolarizacion("s2", 100, 45, true, ["Primero la mitad: 50 W/m².", "I = 50 · 0,5 = 25 W/m²."]),
      crearPolarizacion("s3", 200, 37, true, ["La mitad: 100 W/m².", "I = 100 · 0,64 = 64 W/m²."]),
      crearPolarizacion("s4", 120, 30, true, ["La mitad: 60 W/m².", "I = 60 · 0,75 = 45 W/m²."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_MALUS = (
  <>
    <V>I</V>
    <Op>=</Op>
    <V>I</V>
    <Sub>0</Sub>
    <Op>·</Op>cos<sup>2</sup> <V>θ</V>
  </>
);
