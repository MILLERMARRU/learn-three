// ══ Nivel 18 · Electrodinámica: contenido de la etapa 18.3, potencia eléctrica y efecto Joule (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Op, V } from "@/ui/Formula";
import { crearPotenciaE, type ProblemaPotenciaE } from "./modelo";

export { crearPotenciaE, P_ESCALA } from "./modelo";
export type { DatoPotencia, ProblemaPotenciaE } from "./modelo";

export const RONDAS_POTENCIA_E: RondaDef<ProblemaPotenciaE>[] = [
  {
    ronda: "guiado",
    items: [
      crearPotenciaE("g1", "VI", 12, 2, null, ["La potencia es la energía por segundo que entrega la corriente: P = V·I.", "P = 12 V · 2 A = 24 W."]),
      crearPotenciaE("g2", "VI", 220, 0.5, null, ["P = V·I.", "P = 220 · 0,5 = 110 W."]),
      crearPotenciaE("g3", "VI", 6, 3, null, ["Voltios por amperes dan watts.", "P = 6 · 3 = 18 W."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearPotenciaE("p1", "IR", 3, 4, null, ["Con V = I·R, la potencia también es P = I²·R (efecto Joule).", "P = 3² · 4 = 36 W."]),
      crearPotenciaE("p2", "VR", 12, 3, null, ["Si conoces V y R: P = V²/R.", "P = 12² / 3 = 144 / 3 = 48 W."]),
      crearPotenciaE("p3", "IR", 2, 25, null, ["P = I²·R.", "P = 2² · 25 = 100 W."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearPotenciaE("s1", "nominal", 100, 220, 110, ["Un foco «100 W · 220 V» tiene una resistencia fija: R = V²/P. Con otro voltaje, P = V²/R.", "R = 220²/100 = 484 Ω → P = 110²/484 = 25 W (con la mitad de voltaje, la cuarta parte de potencia)."]),
      crearPotenciaE("s2", "nominal", 60, 120, 60, ["La potencia va con el cuadrado del voltaje.", "Mitad de voltaje: P = 60 / 4 = 15 W."]),
      crearPotenciaE("s3", "nominal", 40, 220, 110, ["R = 220²/40 = 1210 Ω.", "P = 110²/1210 = 10 W."]),
      crearPotenciaE("s4", "nominal", 200, 100, 50, ["R = 100²/200 = 50 Ω.", "P = 50²/50 = 50 W."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_POTENCIA_E = (
  <>
    <V>P</V>
    <Op>=</Op>
    <V>V</V>
    <V>I</V>
    <Op>=</Op>
    <V>I</V>
    <sup>2</sup>
    <V>R</V>
    <Op>=</Op>
    <V>V</V>
    <sup>2</sup>
    <Op>/</Op>
    <V>R</V>
  </>
);
