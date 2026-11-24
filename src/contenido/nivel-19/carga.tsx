// ══ Nivel 19 · Condensadores: contenido de la etapa 19.1, carga de un condensador (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Op, V } from "@/ui/Formula";
import { crearCarga, type ProblemaCarga } from "./modelo";

export { crearCarga, fmtC, Q_ESCALA, Q_MIN } from "./modelo";
export type { ProblemaCarga } from "./modelo";

export const RONDAS_CARGA: RondaDef<ProblemaCarga>[] = [
  {
    ronda: "guiado",
    items: [
      crearCarga("g1", 2, 12, 1, ["La carga que guarda un condensador es proporcional al voltaje: Q = C·V.", "Q = 2 μF · 12 V = 24 μC."]),
      crearCarga("g2", 5, 6, 1, ["Microfaradios por voltios dan microcoulombs.", "Q = 5 · 6 = 30 μC."]),
      crearCarga("g3", 10, 9, 1, ["Q = C·V.", "Q = 10 · 9 = 90 μC."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearCarga("p1", 4, 15, 1, ["Q = C·V.", "Q = 4 · 15 = 60 μC."]),
      crearCarga("p2", 0.5, 100, 1, ["Una capacidad pequeña necesita mucho voltaje para guardar carga.", "Q = 0,5 · 100 = 50 μC."]),
      crearCarga("p3", 20, 4, 1, ["Una capacidad grande guarda mucha carga con poco voltaje.", "Q = 20 · 4 = 80 μC."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearCarga("s1", 2, 12, 3, ["Un dieléctrico entre las placas multiplica la capacidad por κ: Q = κ·C·V.", "Q = 3 · 2 · 12 = 72 μC."]),
      crearCarga("s2", 5, 10, 2, ["Con κ = 2, la capacidad se duplica.", "Q = 2 · 5 · 10 = 100 μC."]),
      crearCarga("s3", 1.5, 20, 4, ["Q = κ·C·V.", "Q = 4 · 1,5 · 20 = 120 μC."]),
      crearCarga("s4", 3, 4, 5, ["κ = 5: cinco veces más carga.", "Q = 5 · 3 · 4 = 60 μC."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_CARGA = (
  <>
    <V>Q</V>
    <Op>=</Op>
    <V>κ</V>
    <V>C</V>
    <V>V</V>
  </>
);
