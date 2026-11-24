// ══ Nivel 11 · Cantidad de movimiento y choques: contenido de la etapa 11.2, conservación (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Op, Sub, V } from "@/ui/Formula";
import { crearConservacion, type ProblemaConservacion } from "./modelo";

export { crearConservacion } from "./modelo";
export type { ProblemaConservacion } from "./modelo";

export const RONDAS_CONSERVACION: RondaDef<ProblemaConservacion>[] = [
  {
    ronda: "guiado",
    items: [
      crearConservacion("g1", "plastico", 2, 1, 6, 0, 0, ["La cantidad de movimiento total se conserva: antes = después.", "2 · 6 + 1 · 0 = (2 + 1) · v → v = 12 / 3 = 4 m/s."]),
      crearConservacion("g2", "plastico", 1, 2, 9, 0, 0, ["Quedan pegados: se mueven como una sola masa de m₁ + m₂.", "1 · 9 = 3 · v → v = 3 m/s."]),
      crearConservacion("g3", "plastico", 3, 1, 8, 0, 0, ["p antes = 3 · 8.", "24 = 4 · v → v = 6 m/s."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearConservacion("p1", "plastico", 2, 2, 7, 3, 0, ["Los dos se movían hacia la derecha: suma ambas cantidades de movimiento.", "2 · 7 + 2 · 3 = 20 = 4 · v → v = 5 m/s."]),
      crearConservacion("p2", "plastico", 3, 1, 4, -8, 0, ["De frente: la del carrito 2 es negativa.", "3 · 4 + 1 · (−8) = 4 = 4 · v → v = 1 m/s."]),
      crearConservacion("p3", "plastico", 1, 2, 6, -6, 0, ["Si gana el que va hacia la izquierda, salen hacia la izquierda.", "1 · 6 + 2 · (−6) = −6 = 3 · v → v = −2 m/s."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearConservacion("s1", "explosion", 2, 1, 0, 0, -3, ["Parten del reposo: la cantidad de movimiento total sigue siendo 0.", "2 · (−3) + 1 · v = 0 → v = 6 m/s."]),
      crearConservacion("s2", "explosion", 1, 4, 0, 0, -8, ["m₁v₁ + m₂v₂ = 0.", "1 · (−8) + 4 · v = 0 → v = 2 m/s."]),
      crearConservacion("s3", "explosion", 3, 2, 0, 0, -4, ["El liviano sale más rápido.", "3 · (−4) + 2 · v = 0 → v = 6 m/s."]),
      crearConservacion("s4", "explosion", 5, 1, 0, 0, -1, ["Cinco veces más masa, cinco veces menos rapidez.", "5 · (−1) + 1 · v = 0 → v = 5 m/s."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_CONSERVACION = (
  <>
    <V>m</V>
    <Sub>1</Sub>
    <V>v</V>
    <Sub>1</Sub>
    <Op>+</Op>
    <V>m</V>
    <Sub>2</Sub>
    <V>v</V>
    <Sub>2</Sub>
    <Op>=</Op>
    <V>p</V>
    <Sub>total</Sub>
  </>
);
