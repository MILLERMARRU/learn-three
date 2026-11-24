// ══ Nivel 16 · Termodinámica: contenido de la etapa 16.2, trabajo de un gas a presión constante (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Op, V } from "@/ui/Formula";
import { crearTrabajo, type ProblemaTrabajo } from "./modelo";

export { crearTrabajo, W_MAX, W_MIN } from "./modelo";
export type { ProblemaTrabajo, UnidadesTrabajo } from "./modelo";

export const RONDAS_TRABAJO: RondaDef<ProblemaTrabajo>[] = [
  {
    ronda: "guiado",
    items: [
      crearTrabajo("g1", "kPa-m3", 200, 0.01, 0.03, ["A presión constante, el trabajo del gas es W = P·ΔV: el área del rectángulo bajo la línea del diagrama P–V.", "W = 200 kPa · 0,02 m³ = 4 kJ."]),
      crearTrabajo("g2", "kPa-m3", 100, 0.02, 0.08, ["ΔV = V₂ − V₁.", "W = 100 · 0,06 = 6 kJ."]),
      crearTrabajo("g3", "kPa-m3", 300, 0.01, 0.04, ["kPa por m³ da kJ.", "W = 300 · 0,03 = 9 kJ."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearTrabajo("p1", "kPa-L", 250, 10, 50, ["Pasa los litros a m³: 1 L = 0,001 m³.", "ΔV = 40 L = 0,04 m³ → W = 250 · 0,04 = 10 kJ."]),
      crearTrabajo("p2", "kPa-L", 400, 15, 45, ["ΔV = 30 L = 0,03 m³.", "W = 400 · 0,03 = 12 kJ."]),
      crearTrabajo("p3", "kPa-L", 80, 50, 300, ["ΔV = 250 L = 0,25 m³.", "W = 80 · 0,25 = 20 kJ."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearTrabajo("s1", "atm-L", 2, 10, 40, ["1 atm = 100 kPa y 1 L = 0,001 m³.", "W = 200 kPa · 0,03 m³ = 6 kJ."]),
      crearTrabajo("s2", "atm-L", 3, 50, 20, ["Si el gas se comprime, ΔV es negativo: el trabajo del gas es negativo (lo hacen sobre él).", "W = 300 · (−0,03) = −9 kJ."]),
      crearTrabajo("s3", "atm-L", 1, 80, 30, ["ΔV = 30 − 80 = −50 L.", "W = 100 · (−0,05) = −5 kJ."]),
      crearTrabajo("s4", "atm-L", 5, 12, 40, ["ΔV = 28 L = 0,028 m³.", "W = 500 · 0,028 = 14 kJ."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_TRABAJO = (
  <>
    <V>W</V>
    <Op>=</Op>
    <V>P</V>
    <Op>·</Op>
    <V>ΔV</V>
  </>
);
