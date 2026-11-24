// ══ Nivel 14 · Hidrostática: contenido de la etapa 14.1, presión hidrostática (problemas propios, g = 10 m/s²) ───────
import type { RondaDef } from "@/motor/etapa";
import { Op, V } from "@/ui/Formula";
import { crearPresion, type ProblemaPresion } from "./modelo";

export { crearPresion, fmtF, LIQUIDOS, P_MAX, P_MIN } from "./modelo";
export type { Liquido, ProblemaPresion } from "./modelo";

export const RONDAS_PRESION: RondaDef<ProblemaPresion>[] = [
  {
    ronda: "guiado",
    items: [
      crearPresion("g1", "agua", 3, false, ["La presión del líquido crece con la profundidad: P = ρ·g·h.", "P = 1000 · 10 · 3 = 30 000 Pa = 30 kPa."]),
      crearPresion("g2", "agua", 5, false, ["En agua, cada metro suma 10 kPa.", "P = 1000 · 10 · 5 = 50 kPa."]),
      crearPresion("g3", "agua", 1.2, false, ["P = ρ·g·h.", "P = 1000 · 10 · 1,2 = 12 kPa."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearPresion("p1", "aceite", 5, false, ["Un líquido menos denso hace menos presión a la misma profundidad.", "P = 800 · 10 · 5 = 40 kPa."]),
      crearPresion("p2", "mercurio", 0.25, false, ["El mercurio es 13,6 veces más denso que el agua.", "P = 13 600 · 10 · 0,25 = 34 kPa."]),
      crearPresion("p3", "mar", 10, false, ["El agua de mar es un poco más densa: 1030 kg/m³.", "P = 1030 · 10 · 10 = 103 kPa."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearPresion("s1", "agua", 2, true, ["La presión absoluta suma la del aire sobre el líquido: P = P atm + ρgh.", "P = 100 + 20 = 120 kPa."]),
      crearPresion("s2", "agua", 4.5, true, ["P atm = 100 kPa.", "P = 100 + 45 = 145 kPa."]),
      crearPresion("s3", "aceite", 7.5, true, ["Primero la del aceite; luego suma la atmosférica.", "P = 100 + 800 · 10 · 7,5 / 1000 = 100 + 60 = 160 kPa."]),
      crearPresion("s4", "mercurio", 0.5, true, ["13 600 · 10 · 0,5 = 68 000 Pa.", "P = 100 + 68 = 168 kPa."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_PRESION = (
  <>
    <V>P</V>
    <Op>=</Op>
    <V>ρ</V>
    <V>g</V>
    <V>h</V>
  </>
);
