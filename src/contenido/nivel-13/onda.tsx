// ══ Nivel 13 · Ondas mecánicas: contenido de la etapa 13.1, longitud de onda, frecuencia y velocidad (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, V } from "@/ui/Formula";
import { crearOnda, type ProblemaOnda } from "./modelo";

export { crearOnda, fmtO, O_MAX, O_MIN } from "./modelo";
export type { ProblemaOnda } from "./modelo";

export const RONDAS_ONDA: RondaDef<ProblemaOnda>[] = [
  {
    ronda: "guiado",
    items: [
      crearOnda("g1", "lambda", { v: 12, f: 3 }, ["En un período la onda avanza una longitud de onda: v = λ·f.", "λ = v / f = 12 / 3 = 4 m."]),
      crearOnda("g2", "lambda", { v: 20, f: 4 }, ["λ = v / f.", "λ = 20 / 4 = 5 m."]),
      crearOnda("g3", "lambda", { v: 6, f: 2 }, ["Una frecuencia baja da ondas largas.", "λ = 6 / 2 = 3 m."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearOnda("p1", "v", { lambda: 2, f: 5 }, ["v = λ·f.", "v = 2 · 5 = 10 m/s."]),
      crearOnda("p2", "v", { lambda: 3, f: 2 }, ["Te dan el período: f = 1/T.", "T = 0,5 s → f = 2 Hz → v = 3 · 2 = 6 m/s."], true),
      crearOnda("p3", "v", { lambda: 0.5, f: 40 }, ["Ondas cortas pero muy frecuentes.", "v = 0,5 · 40 = 20 m/s."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearOnda("s1", "f", { v: 30, lambda: 6 }, ["f = v / λ.", "f = 30 / 6 = 5 Hz."]),
      crearOnda("s2", "f", { v: 340, lambda: 17 }, ["El sonido viaja a 340 m/s en el aire.", "f = 340 / 17 = 20 Hz (el sonido más grave que oímos)."]),
      crearOnda("s3", "f", { v: 12, lambda: 0.5 }, ["Dividir entre 0,5 es multiplicar por 2.", "f = 12 / 0,5 = 24 Hz."]),
      crearOnda("s4", "f", { v: 8, lambda: 0.25 }, ["Dividir entre 0,25 es multiplicar por 4.", "f = 8 / 0,25 = 32 Hz."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_ONDA = (
  <>
    <V>v</V>
    <Op>=</Op>
    <V>λ</V>
    <V>f</V>
    <Op>=</Op>
    <Frac n={<V>λ</V>} d={<V>T</V>} />
  </>
);
