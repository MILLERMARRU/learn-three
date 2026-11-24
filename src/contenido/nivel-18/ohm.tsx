// ══ Nivel 18 · Electrodinámica: contenido de la etapa 18.1, ley de Ohm (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Op, V } from "@/ui/Formula";
import { crearOhm, type ProblemaOhm } from "./modelo";

export { crearOhm, fmtE, MEDIDORES, O_MAX, O_MIN } from "./modelo";
export type { Magnitud, ProblemaOhm } from "./modelo";

export const RONDAS_OHM: RondaDef<ProblemaOhm>[] = [
  {
    ronda: "guiado",
    items: [
      crearOhm("g1", "I", 12, 3, ["La corriente es el voltaje dividido entre la resistencia: I = V/R.", "I = 12 V / 3 Ω = 4 A."]),
      crearOhm("g2", "I", 20, 4, ["I = V/R.", "I = 20 / 4 = 5 A."]),
      crearOhm("g3", "I", 6, 3, ["Más resistencia, menos corriente.", "I = 6 / 3 = 2 A."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearOhm("p1", "V", 2, 6, ["Despeja el voltaje: V = I·R.", "V = 2 A · 6 Ω = 12 V."]),
      crearOhm("p2", "V", 3, 5, ["V = I·R.", "V = 3 · 5 = 15 V."]),
      crearOhm("p3", "V", 0.5, 40, ["Medio ampere por 40 ohm.", "V = 0,5 · 40 = 20 V."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearOhm("s1", "R", 24, 2, ["Despeja la resistencia: R = V/I.", "R = 24 V / 2 A = 12 Ω."]),
      crearOhm("s2", "R", 9, 0.3, ["R = V/I con la corriente en amperes.", "R = 9 / 0,3 = 30 Ω."]),
      crearOhm("s3", "R", 220, 5.5, ["R = V/I.", "R = 220 / 5,5 = 40 Ω."]),
      crearOhm("s4", "R", 12, 0.25, ["Un cuarto de ampere.", "R = 12 / 0,25 = 48 Ω."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_OHM = (
  <>
    <V>V</V>
    <Op>=</Op>
    <V>I</V>
    <Op>·</Op>
    <V>R</V>
  </>
);
