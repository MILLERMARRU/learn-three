// ══ Nivel 8 · Dinámica: contenido de la etapa 8.2, plano inclinado con rozamiento (problemas propios, g = 10 m/s²) ───────
import type { RondaDef } from "@/motor/etapa";
import { Op, V } from "@/ui/Formula";
import { crearPlanoD, type ProblemaPlanoD } from "./modelo";

export { A_MAX, A_MIN, crearPlanoD, LARGO_PLANO } from "./modelo";
export type { ProblemaPlanoD } from "./modelo";

export const RONDAS_PLANO_D: RondaDef<ProblemaPlanoD>[] = [
  {
    ronda: "guiado",
    items: [
      crearPlanoD("g1", 37, 0, 4, ["Sin rozamiento, solo la componente del peso a lo largo del plano lo acelera: a = g sen θ.", "a = 10 · 0,6 = 6 m/s²."]),
      crearPlanoD("g2", 53, 0, 10, ["Más inclinado, más aceleración (y la masa no importa).", "a = 10 · sen 53° = 10 · 0,8 = 8 m/s²."]),
      crearPlanoD("g3", 30, 0, 6, ["sen 30° = 1/2.", "a = 10 · 0,5 = 5 m/s²."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearPlanoD("p1", 37, 0.25, 5, ["El rozamiento frena: a = g (sen θ − μ cos θ).", "a = 10 (0,6 − 0,25 · 0,8) = 10 · 0,4 = 4 m/s²."]),
      crearPlanoD("p2", 53, 0.5, 8, ["a = g (sen θ − μ cos θ).", "a = 10 (0,8 − 0,5 · 0,6) = 10 · 0,5 = 5 m/s²."]),
      crearPlanoD("p3", 37, 0.5, 3, ["Mucho rozamiento: baja despacio.", "a = 10 (0,6 − 0,4) = 2 m/s²."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearPlanoD("s1", 37, 0.125, 12, ["a = g (sen θ − μ cos θ).", "a = 10 (0,6 − 0,1) = 5 m/s²."]),
      crearPlanoD("s2", 37, 0.75, 7, ["Compara μ con tan θ = 0,75: si μ alcanza, el rozamiento lo sostiene.", "a = 10 (0,6 − 0,75 · 0,8) = 0: no baja."]),
      crearPlanoD("s3", 37, 0.375, 9, ["μ cos 37° = 0,375 · 0,8 = 0,3.", "a = 10 (0,6 − 0,3) = 3 m/s²."]),
      crearPlanoD("s4", 53, 0.5, 2, ["La masa no cambia el resultado.", "a = 10 (0,8 − 0,3) = 5 m/s²."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_PLANO_D = (
  <>
    <V>a</V>
    <Op>=</Op>
    <V>g</V>(sen <V>θ</V>
    <Op>−</Op>
    <V>μ</V> cos <V>θ</V>)
  </>
);
