// ══ Nivel 20 · Electromagnetismo: contenido de la etapa 20.2, campo de un conductor recto (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, V } from "@/ui/Formula";
import { crearCampoRecto, type ProblemaCampoRecto } from "./modelo";

export { B_ESCALA, crearCampoRecto } from "./modelo";
export type { CableRecto, ProblemaCampoRecto } from "./modelo";

const sale = (I: number) => ({ I, sentido: 1 as const });
const entra = (I: number) => ({ I, sentido: -1 as const });

export const RONDAS_CAMPO_RECTO: RondaDef<ProblemaCampoRecto>[] = [
  {
    ronda: "guiado",
    items: [
      crearCampoRecto("g1", [sale(10)], 10, ["El campo de un cable recto forma círculos a su alrededor y vale B = μ₀·I/(2π·d) = 2×10⁻⁷·I/d.", "B = 2×10⁻⁷ · 10 / 0,1 = 2×10⁻⁵ T = 20 μT."]),
      crearCampoRecto("g2", [sale(15)], 10, ["Con d en metros: B (μT) = 0,2 · I / d.", "B = 0,2 · 15 / 0,1 = 30 μT."]),
      crearCampoRecto("g3", [entra(5)], 2, ["Más cerca del cable, más campo: es inverso a la distancia.", "B = 0,2 · 5 / 0,02 = 50 μT."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearCampoRecto("p1", [sale(20)], 10, ["Pasa los cm a m: 10 cm = 0,1 m.", "B = 0,2 · 20 / 0,1 = 40 μT."]),
      crearCampoRecto("p2", [entra(3)], 1, ["1 cm = 0,01 m.", "B = 0,2 · 3 / 0,01 = 60 μT."]),
      crearCampoRecto("p3", [sale(25)], 5, ["5 cm = 0,05 m.", "B = 0,2 · 25 / 0,05 = 100 μT."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearCampoRecto("s1", [sale(10), entra(10)], 10, ["En el punto medio, corrientes opuestas dan campos en el mismo sentido: se suman.", "B₁ = B₂ = 20 μT → B = 40 μT."]),
      crearCampoRecto("s2", [sale(15), sale(5)], 10, ["Corrientes en el mismo sentido: en el punto medio sus campos se oponen y se restan.", "B₁ = 30 y B₂ = 10 → B = 20 μT."]),
      crearCampoRecto("s3", [sale(20), entra(10)], 10, ["Opuestas: se suman.", "B₁ = 40 y B₂ = 20 → B = 60 μT."]),
      crearCampoRecto("s4", [entra(25), entra(5)], 5, ["Mismo sentido: se restan. d = 0,05 m.", "B₁ = 100 y B₂ = 20 → B = 80 μT."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_CAMPO_RECTO = (
  <>
    <V>B</V>
    <Op>=</Op>
    <Frac
      n={
        <>
          <V>μ</V>
          <Sub>0</Sub>
          <V>I</V>
        </>
      }
      d={
        <>
          2π<V>d</V>
        </>
      }
    />
  </>
);
