// ══ Nivel 10 · Etapa 10.4: examen tipo admisión de trabajo, energía y potencia (problemas propios, g = 10 m/s²) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import { crearEnergia, crearPotencia, crearTrabajo, type ProblemaEnergia, type ProblemaPotencia, type ProblemaTrabajo } from "./modelo";

/** Escena que se reproduce al responder: el empujón, la pista o la grúa. */
export type EscenaEnergiaExamen = { tipo: "trabajo"; p: ProblemaTrabajo } | { tipo: "pista"; p: ProblemaEnergia } | { tipo: "grua"; p: ProblemaPotencia };

export interface PreguntaEnergia extends PreguntaBase {
  escena?: EscenaEnergiaExamen;
}

const t = (s: string) => ({ texto: s });
const sin: [string, string] = ["", ""];

export const PREGUNTAS_ENERGIA: PreguntaEnergia[] = [
  {
    id: "d1",
    enunciado: (
      <>
        Una fuerza de <b>50 N</b> arrastra un bloque <b>4 m</b> formando <b>60°</b> con la horizontal. ¿Qué trabajo realiza?
      </>
    ),
    opciones: [t("200 J"), t("100 J"), t("173 J"), t("50 J"), t("0 J")],
    correcta: 1,
    explicacion: "W = F·d·cos θ = 50 · 4 · ½ = 100 J: solo trabaja la componente horizontal.",
    escena: { tipo: "trabajo", p: crearTrabajo("d1", 2, 50, 60, 4, 0, 0, sin) },
  },
  {
    id: "d2",
    enunciado: <>¿Qué trabajo realiza el peso de un bloque que se desliza sobre un piso horizontal?</>,
    opciones: [t("m·g·d"), t("−m·g·d"), t("cero"), t("m·g·h"), t("depende de la rapidez")],
    correcta: 2,
    explicacion: "El peso es vertical y el desplazamiento horizontal: forman 90° y cos 90° = 0.",
    escena: { tipo: "trabajo", p: crearTrabajo("d2", 2, 20, 0, 5, 0, 0, sin) },
  },
  {
    id: "d3",
    enunciado: (
      <>
        Un bloque de <b>2 kg</b> parte del reposo y una fuerza neta de <b>25 N</b> lo empuja <b>4 m</b>. ¿Con qué rapidez termina?
      </>
    ),
    opciones: [t("5 m/s"), t("50 m/s"), t("20 m/s"), t("10 m/s"), t("100 m/s")],
    correcta: 3,
    explicacion: "W = 25 · 4 = 100 J = ½ · 2 · v² → v² = 100 → v = 10 m/s.",
    escena: { tipo: "trabajo", p: crearTrabajo("d3", 2, 25, 0, 4, 0, 0, sin) },
  },
  {
    id: "d4",
    enunciado: <>Si un cuerpo duplica su rapidez, su energía cinética…</>,
    opciones: [t("se duplica"), t("no cambia"), t("se reduce a la mitad"), t("se triplica"), t("se cuadruplica")],
    correcta: 4,
    explicacion: "Ec = ½mv²: con el doble de rapidez, v² se cuadruplica (por eso sube cuatro veces más alto).",
    escena: { tipo: "pista", p: crearEnergia("d4", "h", 0, 20, 0, sin) },
  },
  {
    id: "d5",
    enunciado: (
      <>
        Se suelta un cuerpo desde <b>45 m</b> de altura. Sin rozamiento, ¿con qué rapidez llega abajo?
      </>
    ),
    opciones: [t("30 m/s"), t("45 m/s"), t("15 m/s"), t("900 m/s"), t("20 m/s")],
    correcta: 0,
    explicacion: "mgh = ½mv² → v² = 2 · 10 · 45 = 900 → v = 30 m/s.",
    escena: { tipo: "pista", p: crearEnergia("d5", "v", 45, 0, 0, sin) },
  },
  {
    id: "d6",
    enunciado: (
      <>
        Un carrito pasa por el punto más bajo de una pista lisa a <b>10 m/s</b>. ¿Hasta qué altura sube?
      </>
    ),
    opciones: [t("10 m"), t("5 m"), t("20 m"), t("2 m"), t("50 m")],
    correcta: 1,
    explicacion: "½mv² = mgh → h = v² / 2g = 100 / 20 = 5 m.",
    escena: { tipo: "pista", p: crearEnergia("d6", "h", 0, 10, 0, sin) },
  },
  {
    id: "d7",
    enunciado: (
      <>
        Un carrito parte desde <b>3,2 m</b> de altura con <b>6 m/s</b> por una pista lisa. ¿Con qué rapidez pasa por el punto más bajo?
      </>
    ),
    opciones: [t("6 m/s"), t("8 m/s"), t("10 m/s"), t("12 m/s"), t("9,2 m/s")],
    correcta: 2,
    explicacion: "v² = 6² + 2 · 10 · 3,2 = 36 + 64 = 100 → v = 10 m/s.",
    escena: { tipo: "pista", p: crearEnergia("d7", "v", 3.2, 6, 0, sin) },
  },
  {
    id: "d8",
    enunciado: (
      <>
        Una grúa sube <b>200 kg</b> a <b>15 m</b> de altura en <b>10 s</b>. ¿Qué potencia desarrolla?
      </>
    ),
    opciones: [t("300 W"), t("30 000 W"), t("1500 W"), t("3000 W"), t("2000 W")],
    correcta: 3,
    explicacion: "P = mgh / t = 200 · 10 · 15 / 10 = 3000 W.",
    escena: { tipo: "grua", p: crearPotencia("d8", 200, 15, 10, 1, false, sin) },
  },
  {
    id: "d9",
    enunciado: (
      <>
        Un motor recibe <b>2000 W</b> y tiene un rendimiento del <b>75 %</b>. ¿Qué potencia útil entrega?
      </>
    ),
    opciones: [t("2000 W"), t("500 W"), t("2667 W"), t("750 W"), t("1500 W")],
    correcta: 4,
    explicacion: "P útil = η · P = 0,75 · 2000 = 1500 W; los otros 500 W se pierden (calor, rozamiento).",
    escena: { tipo: "grua", p: crearPotencia("d9", 50, 12, 4, 0.75, false, sin) },
  },
  {
    id: "d10",
    enunciado: <>El kilowatt-hora (kWh), que aparece en el recibo de luz, es una unidad de…</>,
    opciones: [t("energía"), t("potencia"), t("fuerza"), t("tiempo"), t("rendimiento")],
    correcta: 0,
    explicacion: "Potencia por tiempo es energía: 1 kWh = 1000 W · 3600 s = 3,6 millones de joules.",
    escena: { tipo: "grua", p: crearPotencia("d10", 100, 6, 3, 1, false, sin) },
  },
];

export const RONDAS_EXAMEN_ENERGIA: RondaDef<PreguntaEnergia>[] = [{ ronda: "examen", items: PREGUNTAS_ENERGIA }];
