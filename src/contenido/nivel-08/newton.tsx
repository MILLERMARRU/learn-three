// ══ Nivel 8 · Dinámica: contenido de la etapa 8.1, segunda ley de Newton (problemas propios, g = 10 m/s²) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sup, V } from "@/ui/Formula";
import { crearNewton, type ProblemaNewton } from "./modelo";

export { crearNewton, F_MAX, F_MIN, F_PASO } from "./modelo";
export type { ProblemaNewton } from "./modelo";

export const RONDAS_NEWTON: RondaDef<ProblemaNewton>[] = [
  {
    ronda: "guiado",
    items: [
      crearNewton("g1", 10, 8, 2, 0, ["Primero la aceleración: desde el reposo, d = ½·a·t² → a = 2d/t².", "a = 2 · 8 / 2² = 4 m/s²; F = m·a = 10 · 4 = 40 N."]),
      crearNewton("g2", 5, 9, 3, 0, ["a = 2d/t².", "a = 18 / 9 = 2 m/s²; F = 5 · 2 = 10 N."]),
      crearNewton("g3", 15, 6, 2, 0, ["Con la aceleración, F = m·a.", "a = 12 / 4 = 3 m/s²; F = 15 · 3 = 45 N."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearNewton("p1", 10, 25, 5, 0, ["a = 2d/t².", "a = 50 / 25 = 2 m/s²; F = 20 N."]),
      crearNewton("p2", 4, 25, 2, 0, ["Mucha distancia en poco tiempo: aceleración grande.", "a = 50 / 4 = 12,5 m/s²; F = 4 · 12,5 = 50 N."]),
      crearNewton("p3", 25, 3, 1, 0, ["Un bloque pesado necesita más fuerza para la misma aceleración.", "a = 6 m/s²; F = 25 · 6 = 150 N."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearNewton("s1", 10, 4, 2, 0.2, ["Ahora hay rozamiento: F − μmg = m·a.", "a = 2 m/s², f = 0,2 · 100 = 20 N; F = 20 + 10 · 2 = 40 N."]),
      crearNewton("s2", 5, 9, 3, 0.4, ["Suma el rozamiento a la fuerza que acelera.", "a = 2 m/s², f = 0,4 · 50 = 20 N; F = 20 + 10 = 30 N."]),
      crearNewton("s3", 20, 8, 4, 0.25, ["f = μ·m·g.", "a = 1 m/s², f = 50 N; F = 50 + 20 = 70 N."]),
      crearNewton("s4", 10, 18, 3, 0.5, ["F = m·a + μ·m·g.", "a = 4 m/s², f = 50 N; F = 50 + 40 = 90 N."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_NEWTON = (
  <>
    <V>F</V>
    <Op>−</Op>
    <V>f</V>
    <Op>=</Op>
    <V>m</V>
    <V>a</V>
    <Op>·</Op>
    <V>a</V>
    <Op>=</Op>
    <Frac
      n={
        <>
          2<V>d</V>
        </>
      }
      d={
        <>
          <V>t</V>
          <Sup>2</Sup>
        </>
      }
    />
  </>
);
