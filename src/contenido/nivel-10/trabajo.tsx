// ══ Nivel 10 · Trabajo, energía y potencia: contenido de la etapa 10.1, trabajo y energía cinética (problemas propios, g = 10 m/s²) ───────
import type { RondaDef } from "@/motor/etapa";
import { Op, Sub, Sup, V } from "@/ui/Formula";
import { crearTrabajo, type ProblemaTrabajo } from "./modelo";

export { crearTrabajo, V_MAX, V_MIN } from "./modelo";
export type { ProblemaTrabajo } from "./modelo";

export const RONDAS_TRABAJO: RondaDef<ProblemaTrabajo>[] = [
  {
    ronda: "guiado",
    items: [
      crearTrabajo("g1", 2, 20, 0, 5, 0, 0, ["El trabajo de la fuerza se convierte en energía cinética: F·d = ½mv².", "W = 20 · 5 = 100 J = ½ · 2 · v² → v² = 100 → v = 10 m/s."]),
      crearTrabajo("g2", 4, 8, 0, 4, 0, 0, ["Primero el trabajo: W = F · d.", "W = 32 J = ½ · 4 · v² → v² = 16 → v = 4 m/s."]),
      crearTrabajo("g3", 1, 18, 0, 4, 0, 0, ["Con 1 kg, v² = 2W.", "W = 72 J → v² = 144 → v = 12 m/s."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearTrabajo("p1", 4, 25, 37, 10, 0, 0, ["Solo trabaja la componente a lo largo del desplazamiento: F cos θ.", "W = 25 · 0,8 · 10 = 200 J = ½ · 4 · v² → v = 10 m/s."]),
      crearTrabajo("p2", 5, 20, 60, 9, 0, 0, ["cos 60° = ½.", "W = 20 · ½ · 9 = 90 J = ½ · 5 · v² → v² = 36 → v = 6 m/s."]),
      crearTrabajo("p3", 30, 50, 53, 8, 0, 0, ["cos 53° = 0,6.", "W = 50 · 0,6 · 8 = 240 J = ½ · 30 · v² → v² = 16 → v = 4 m/s."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearTrabajo("s1", 2, 30, 0, 5, 0.5, 0, ["El rozamiento hace trabajo negativo: el trabajo neto es (F − μmg)·d.", "f = 0,5 · 20 = 10 N; W = 20 · 5 = 100 J → v = 10 m/s."]),
      crearTrabajo("s2", 4, 40, 0, 15, 0.25, 0, ["Resta el rozamiento antes de multiplicar por d.", "f = 10 N; W = 30 · 15 = 450 J = ½ · 4 · v² → v² = 225 → v = 15 m/s."]),
      crearTrabajo("s3", 1, 5, 0, 2, 0, 4, ["Ya entra con energía cinética: ½mv² = ½mv₀² + W.", "W = 10 J; ½v² = 8 + 10 = 18 → v² = 36 → v = 6 m/s."]),
      crearTrabajo("s4", 2, 0, 0, 4.5, 0.4, 10, ["Sin fuerza, solo el rozamiento la frena: W = −μmg·d.", "W = −0,4 · 20 · 4,5 = −36 J; ½ · 2 · v² = 100 − 36 = 64 → v = 8 m/s."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_TRABAJO = (
  <>
    <V>W</V>
    <Sub>neto</Sub>
    <Op>=</Op>½<V>m</V>
    <V>v</V>
    <Sup>2</Sup>
    <Op>−</Op>½<V>m</V>
    <V>v</V>
    <Sub>0</Sub>
    <Sup>2</Sup>
  </>
);
