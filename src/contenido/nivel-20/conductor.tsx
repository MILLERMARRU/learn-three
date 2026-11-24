// ══ Nivel 20 · Electromagnetismo: contenido de la etapa 20.1, fuerza magnética sobre un conductor (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Op, V } from "@/ui/Formula";
import { crearConductor, type ProblemaConductor } from "./modelo";

export { crearConductor, F_ESCALA, F_MIN, fmtM } from "./modelo";
export type { ProblemaConductor } from "./modelo";

export const RONDAS_CONDUCTOR: RondaDef<ProblemaConductor>[] = [
  {
    ronda: "guiado",
    items: [
      crearConductor("g1", 0.2, 3, 0.05, 90, false, ["Un cable con corriente dentro de un campo recibe una fuerza F = B·I·L (si es perpendicular al campo).", "F = 0,2 T · 3 A · 0,05 m = 0,03 N = 30 mN."]),
      crearConductor("g2", 0.5, 1, 0.04, 90, false, ["F = B·I·L, en newtons; por 1000 da mN.", "F = 0,5 · 1 · 0,04 = 0,02 N = 20 mN."]),
      crearConductor("g3", 0.4, 2.5, 0.05, 90, false, ["F = B·I·L.", "F = 0,4 · 2,5 · 0,05 = 0,05 N = 50 mN."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearConductor("p1", 0.08, 5, 0.1, 90, true, ["Pasa a unidades del SI: 80 mT = 0,08 T y 10 cm = 0,1 m.", "F = 0,08 · 5 · 0,1 = 0,04 N = 40 mN."]),
      crearConductor("p2", 0.15, 2, 0.2, 90, true, ["150 mT = 0,15 T y 20 cm = 0,2 m.", "F = 0,15 · 2 · 0,2 = 0,06 N = 60 mN."]),
      crearConductor("p3", 0.25, 4, 0.01, 90, true, ["250 mT = 0,25 T y 1 cm = 0,01 m.", "F = 0,25 · 4 · 0,01 = 0,01 N = 10 mN."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearConductor("s1", 0.5, 2, 0.08, 30, false, ["Si el cable forma un ángulo θ con el campo, F = B·I·L·sen θ.", "F = 0,5 · 2 · 0,08 · 0,5 = 0,04 N = 40 mN."]),
      crearConductor("s2", 0.2, 5, 0.05, 30, false, ["sen 30° = 0,5.", "F = 0,2 · 5 · 0,05 · 0,5 = 0,025 N = 25 mN."]),
      crearConductor("s3", 0.4, 3, 0.1, 30, false, ["F = B·I·L·sen θ.", "F = 0,4 · 3 · 0,1 · 0,5 = 0,06 N = 60 mN."]),
      crearConductor("s4", 0.25, 4, 0.1, 53, false, ["sen 53° = 0,8.", "F = 0,25 · 4 · 0,1 · 0,8 = 0,08 N = 80 mN."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_CONDUCTOR = (
  <>
    <V>F</V>
    <Op>=</Op>
    <V>B</V>
    <V>I</V>
    <V>L</V>
    <Op>·</Op>sen <V>θ</V>
  </>
);
