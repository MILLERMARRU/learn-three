// ══ Nivel 20 · Electromagnetismo: contenido de la etapa 20.3, inducción electromagnética (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Op, V } from "@/ui/Formula";
import { crearBarra, crearBobina, type ProblemaInduccion } from "./modelo";

export { crearBarra, crearBobina, E_ESCALA } from "./modelo";
export type { ProblemaInduccion } from "./modelo";

export const RONDAS_INDUCCION: RondaDef<ProblemaInduccion>[] = [
  {
    ronda: "guiado",
    items: [
      crearBarra("g1", 0.5, 2, 10, false, ["Una barra que corta las líneas de un campo genera una fem: ε = B·L·v.", "ε = 0,5 T · 2 m · 10 m/s = 10 V."]),
      crearBarra("g2", 0.4, 1.5, 5, false, ["ε = B·L·v.", "ε = 0,4 · 1,5 · 5 = 3 V."]),
      crearBarra("g3", 0.8, 0.5, 20, false, ["Más rápido, más fem.", "ε = 0,8 · 0,5 · 20 = 8 V."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearBarra("p1", 0.5, 0.4, 30, true, ["Pasa la longitud a metros: 40 cm = 0,4 m.", "ε = 0,5 · 0,4 · 30 = 6 V."]),
      crearBarra("p2", 0.2, 0.5, 40, true, ["50 cm = 0,5 m.", "ε = 0,2 · 0,5 · 40 = 4 V."]),
      crearBarra("p3", 1.5, 0.2, 50, true, ["20 cm = 0,2 m.", "ε = 1,5 · 0,2 · 50 = 15 V."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearBobina("s1", 100, 0.02, 0.5, 0.1, ["Ley de Faraday: ε = N·ΔΦ/Δt, con ΔΦ = ΔB·A.", "ΔΦ = 0,5 · 0,02 = 0,01 Wb → ε = 100 · 0,01 / 0,1 = 10 V."]),
      crearBobina("s2", 200, 0.01, 0.3, 0.05, ["ΔΦ = 0,3 · 0,01 = 0,003 Wb.", "ε = 200 · 0,003 / 0,05 = 12 V."]),
      crearBobina("s3", 50, 0.04, 0.8, 0.2, ["ΔΦ = 0,8 · 0,04 = 0,032 Wb.", "ε = 50 · 0,032 / 0,2 = 8 V."]),
      crearBobina("s4", 400, 0.01, 0.5, 0.1, ["ΔΦ = 0,5 · 0,01 = 0,005 Wb.", "ε = 400 · 0,005 / 0,1 = 20 V."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_BARRA = (
  <>
    <V>ε</V>
    <Op>=</Op>
    <V>B</V>
    <V>L</V>
    <V>v</V>
  </>
);

export const F_BOBINA = (
  <>
    <V>ε</V>
    <Op>=</Op>
    <V>N</V>
    <Op>·</Op>
    <V>ΔΦ</V>
    <Op>/</Op>
    <V>Δt</V>
  </>
);
