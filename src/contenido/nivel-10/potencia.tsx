// ══ Nivel 10 · Trabajo, energía y potencia: contenido de la etapa 10.3, potencia y rendimiento (problemas propios, g = 10 m/s²) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, V } from "@/ui/Formula";
import { crearPotencia, type ProblemaPotencia } from "./modelo";

export { crearPotencia, P_MAX, P_MIN, P_PASO } from "./modelo";
export type { ProblemaPotencia } from "./modelo";

export const RONDAS_POTENCIA: RondaDef<ProblemaPotencia>[] = [
  {
    ronda: "guiado",
    items: [
      crearPotencia("g1", 50, 8, 4, 1, false, ["Potencia = trabajo / tiempo; el trabajo para subir la carga es mgh.", "W = 50 · 10 · 8 = 4000 J; P = 4000 / 4 = 1000 W."]),
      crearPotencia("g2", 20, 10, 5, 1, false, ["P = mgh / t.", "P = 20 · 10 · 10 / 5 = 400 W."]),
      crearPotencia("g3", 100, 6, 3, 1, false, ["Una carga pesada y rápida necesita mucha potencia.", "P = 100 · 10 · 6 / 3 = 2000 W."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearPotencia("p1", 40, 10, 5, 1, true, ["A velocidad constante, la fuerza del cable es el peso: P = F · v = mg · v.", "P = 40 · 10 · 2 = 800 W."]),
      crearPotencia("p2", 60, 10, 4, 1, true, ["P = mg · v.", "P = 600 · 2,5 = 1500 W."]),
      crearPotencia("p3", 30, 12, 3, 1, true, ["El peso es 300 N.", "P = 300 · 4 = 1200 W."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearPotencia("s1", 50, 8, 4, 0.8, false, ["El motor pierde energía: P útil = η · P entregada.", "P útil = 1000 W → P = 1000 / 0,8 = 1250 W."]),
      crearPotencia("s2", 80, 5, 4, 0.5, false, ["Con η = 50 %, el motor entrega el doble de lo útil.", "P útil = 80 · 10 · 5 / 4 = 1000 W → P = 2000 W."]),
      crearPotencia("s3", 60, 12, 8, 0.75, false, ["Primero la potencia útil; luego divide entre η.", "P útil = 60 · 10 · 12 / 8 = 900 W → P = 900 / 0,75 = 1200 W."]),
      crearPotencia("s4", 200, 3, 4, 0.6, false, ["P = mgh / (η · t).", "P útil = 200 · 10 · 3 / 4 = 1500 W → P = 1500 / 0,6 = 2500 W."]),
    ],
  },
];

// ══ Fórmulas ───────
/** Corta a propósito: las fórmulas largas ensanchan la columna en móvil. */
export const F_POTENCIA = (
  <>
    <V>P</V>
    <Sub>útil</Sub>
    <Op>=</Op>
    <Frac
      n={
        <>
          <V>m</V>
          <V>g</V>
          <V>h</V>
        </>
      }
      d={<V>t</V>}
    />
    <Op>=</Op>
    <V>η</V>
    <V>P</V>
  </>
);
