// ══ Nivel 10 · Trabajo, energía y potencia: contenido de la etapa 10.2, conservación de la energía mecánica (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Op, Sup, V } from "@/ui/Formula";
import { crearEnergia, type ProblemaEnergia } from "./modelo";

export { alturaEnergia, crearEnergia, E_MAX, E_MIN } from "./modelo";
export type { ProblemaEnergia } from "./modelo";

export const RONDAS_ENERGIA: RondaDef<ProblemaEnergia>[] = [
  {
    ronda: "guiado",
    items: [
      crearEnergia("g1", "v", 5, 0, 0, ["La energía potencial de arriba se vuelve cinética abajo: mgh = ½mv².", "v² = 2gh = 2 · 10 · 5 = 100 → v = 10 m/s."]),
      crearEnergia("g2", "v", 20, 0, 0, ["La masa se simplifica: v = √(2gh).", "v² = 2 · 10 · 20 = 400 → v = 20 m/s."]),
      crearEnergia("g3", "v", 1.8, 0, 0, ["Aunque la altura sea pequeña, la cuenta es la misma.", "v² = 2 · 10 · 1,8 = 36 → v = 6 m/s."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearEnergia("p1", "h", 0, 10, 0, ["Ahora al revés: la energía cinética se vuelve potencial: ½mv² = mgh.", "h = v² / 2g = 100 / 20 = 5 m."]),
      crearEnergia("p2", "h", 0, 20, 0, ["El doble de rapidez sube cuatro veces más alto.", "h = 400 / 20 = 20 m."]),
      crearEnergia("p3", "h", 3, 10, 0, ["Ya parte a 3 m de altura: súmale lo que sube con su rapidez.", "h = 3 + 100 / 20 = 3 + 5 = 8 m."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearEnergia("s1", "v", 3.2, 6, 0, ["Arriba ya tiene energía cinética: ½v² = ½v₀² + gh.", "v² = 36 + 2 · 10 · 3,2 = 36 + 64 = 100 → v = 10 m/s."]),
      crearEnergia("s2", "v", 9, 0, 1.8, ["Solo cuenta lo que baja: de 9 m a 1,8 m.", "v² = 2 · 10 · (9 − 1,8) = 144 → v = 12 m/s."]),
      crearEnergia("s3", "h", 1.8, 8, 0, ["Altura máxima = altura inicial + v₀² / 2g.", "h = 1,8 + 64 / 20 = 1,8 + 3,2 = 5 m."]),
      crearEnergia("s4", "v", 12.8, 12, 0, ["Suma la energía cinética inicial y la potencial que pierde.", "v² = 144 + 2 · 10 · 12,8 = 144 + 256 = 400 → v = 20 m/s."]),
    ],
  },
];

// ══ Fórmulas ───────
/** Energía mecánica constante (corta: la versión «A = B» desbordaba en móvil). */
export const F_ENERGIA = (
  <>
    ½<V>m</V>
    <V>v</V>
    <Sup>2</Sup>
    <Op>+</Op>
    <V>m</V>
    <V>g</V>
    <V>h</V>
    <Op>=</Op>
    cte
  </>
);
