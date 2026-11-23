// ══ Nivel 7 · Estática: contenido de la etapa 7.3, momento de una fuerza y segunda condición de equilibrio (ΣM = 0) ───────
import type { RondaDef } from "@/motor/etapa";
import { crearMomento, type ProblemaMomento } from "./modelo";

export { cargasBarra, crearMomento, escalaBarra, fuerzasBarra, MEDIA_BARRA, momentoNeto } from "./modelo";
export type { ProblemaMomento } from "./modelo";
import { Op, Sub, V } from "@/ui/Formula";

export const RONDAS_MOMENTO: RondaDef<ProblemaMomento>[] = [
  {
    ronda: "guiado",
    items: [
      crearMomento("g1", { tipo: "fuerza", pivote: 0, pesas: [{ x: -2, W: 60 }], fuerzaX: 3 }, ["Momento = fuerza × brazo (la distancia al apoyo). En equilibrio, los momentos de un lado igualan a los del otro.", "60 · 2 = F · 3 → F = 40 N."]),
      crearMomento("g2", { tipo: "distancia", pivote: 0, pesas: [{ x: -1.5, W: 80 }], movil: { W: 40, lado: 1 } }, ["La pesa más liviana necesita un brazo mayor.", "80 · 1,5 = 40 · d → d = 3 m."]),
      crearMomento("g3", { tipo: "fuerza", pivote: 0, pesas: [{ x: -3, W: 30 }, { x: -1, W: 20 }], fuerzaX: 2 }, ["Suma los momentos de todas las pesas del mismo lado.", "30 · 3 + 20 · 1 = 110 = F · 2 → F = 55 N."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearMomento("p1", { tipo: "distancia", pivote: 0, pesas: [{ x: -2, W: 50 }], movil: { W: 25, lado: 1 } }, ["M = F · d en cada lado.", "50 · 2 = 25 · d → d = 4 m."]),
      crearMomento("p2", { tipo: "fuerza", pivote: 0, pesas: [{ x: -1, W: 100 }], fuerzaX: 4 }, ["Un brazo largo multiplica la fuerza.", "100 · 1 = F · 4 → F = 25 N."]),
      crearMomento("p3", { tipo: "fuerza", pivote: 0, pesas: [{ x: -2.5, W: 40 }, { x: 1, W: 20 }], fuerzaX: 2 }, ["Las pesas a cada lado del apoyo giran en sentidos opuestos.", "40 · 2,5 = 20 · 1 + F · 2 → F = 40 N."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearMomento("s1", { tipo: "fuerza", pivote: -2, pesas: [{ x: -4, W: 100 }], barra: 40, fuerzaX: 4 }, ["La barra homogénea pesa: su peso actúa en el centro, a 2 m del apoyo.", "100 · 2 = 40 · 2 + F · 6 → F = 20 N."]),
      crearMomento("s2", { tipo: "distancia", pivote: 0, pesas: [{ x: -2, W: 90 }], movil: { W: 60, lado: 1 } }, ["Iguala los momentos.", "90 · 2 = 60 · d → d = 3 m."]),
      crearMomento("s3", { tipo: "fuerza", pivote: 0, pesas: [{ x: -3, W: 50 }, { x: -1, W: 30 }, { x: 2, W: 20 }], fuerzaX: 4 }, ["Tres pesas: suma con signo según el lado.", "50 · 3 + 30 · 1 = 20 · 2 + F · 4 → F = 35 N."]),
      crearMomento("s4", { tipo: "fuerza", pivote: -1, pesas: [{ x: -4, W: 120 }], barra: 60, fuerzaX: 3 }, ["El peso de la barra (en el centro) queda a 1 m del apoyo.", "120 · 3 = 60 · 1 + F · 4 → F = 75 N."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_MOMENTO = (
  <>
    <V>M</V>
    <Op>=</Op>
    <V>F</V>
    <Op>·</Op>
    <V>d</V>
    <Op>·</Op>Σ<V>M</V>
    <Sub>apoyo</Sub>
    <Op>=</Op>0
  </>
);
