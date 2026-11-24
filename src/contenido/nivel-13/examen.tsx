// ══ Nivel 13 · Etapa 13.4: examen tipo admisión de ondas mecánicas (problemas propios) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import { crearEstacionaria, crearOnda, crearPulso, type ProblemaEstacionaria, type ProblemaOnda, type ProblemaPulso } from "./modelo";

/** Escena que se reproduce al responder: la onda, el pulso o la onda estacionaria. */
export type EscenaOndas = { tipo: "onda"; p: ProblemaOnda } | { tipo: "pulso"; p: ProblemaPulso } | { tipo: "estacionaria"; p: ProblemaEstacionaria };

export interface PreguntaOndas extends PreguntaBase {
  escena?: EscenaOndas;
}

const t = (s: string) => ({ texto: s });
const sin: [string, string] = ["", ""];

export const PREGUNTAS_ONDAS: PreguntaOndas[] = [
  {
    id: "d1",
    enunciado: (
      <>
        Una onda de <b>4 m</b> de longitud de onda y <b>5 Hz</b> viaja a…
      </>
    ),
    opciones: [t("1,25 m/s"), t("20 m/s"), t("9 m/s"), t("0,8 m/s"), t("2 m/s")],
    correcta: 1,
    explicacion: "v = λ·f = 4 · 5 = 20 m/s.",
    escena: { tipo: "onda", p: crearOnda("d1", "v", { lambda: 4, f: 5 }, sin) },
  },
  {
    id: "d2",
    enunciado: (
      <>
        Un sonido de <b>170 Hz</b> viaja por el aire a 340 m/s. ¿Cuál es su longitud de onda?
      </>
    ),
    opciones: [t("0,5 m"), t("170 m"), t("2 m"), t("340 m"), t("1 m")],
    correcta: 2,
    explicacion: "λ = v / f = 340 / 170 = 2 m.",
    escena: { tipo: "onda", p: crearOnda("d2", "lambda", { v: 340, f: 170 }, sin) },
  },
  {
    id: "d3",
    enunciado: <>Si en el mismo medio la frecuencia de una onda se duplica, su longitud de onda…</>,
    opciones: [t("se duplica"), t("no cambia"), t("se cuadruplica"), t("se reduce a la mitad"), t("se anula")],
    correcta: 3,
    explicacion: "La velocidad la fija el medio: si f se duplica, λ = v/f se reduce a la mitad.",
    escena: { tipo: "onda", p: crearOnda("d3", "lambda", { v: 12, f: 6 }, sin) },
  },
  {
    id: "d4",
    enunciado: (
      <>
        Una onda tiene período <b>0,25 s</b> y longitud de onda <b>3 m</b>. ¿Con qué velocidad viaja?
      </>
    ),
    opciones: [t("0,75 m/s"), t("3 m/s"), t("6 m/s"), t("4 m/s"), t("12 m/s")],
    correcta: 4,
    explicacion: "v = λ / T = 3 / 0,25 = 12 m/s.",
    escena: { tipo: "onda", p: crearOnda("d4", "v", { lambda: 3, f: 4 }, sin, true) },
  },
  {
    id: "d5",
    enunciado: (
      <>
        ¿Con qué velocidad viaja un pulso por una cuerda con tensión <b>90 N</b> y densidad lineal <b>0,1 kg/m</b>?
      </>
    ),
    opciones: [t("30 m/s"), t("900 m/s"), t("9 m/s"), t("3 m/s"), t("90 m/s")],
    correcta: 0,
    explicacion: "v = √(T/μ) = √(90 / 0,1) = √900 = 30 m/s.",
    escena: { tipo: "pulso", p: crearPulso("d5", 90, 0.1, sin) },
  },
  {
    id: "d6",
    enunciado: <>Si la tensión de una cuerda se cuadruplica, la velocidad de las ondas en ella…</>,
    opciones: [t("se cuadruplica"), t("se duplica"), t("no cambia"), t("se reduce a la mitad"), t("se reduce a la cuarta parte")],
    correcta: 1,
    explicacion: "v = √(T/μ): con 4 veces la tensión, la velocidad se multiplica por √4 = 2.",
    escena: { tipo: "pulso", p: crearPulso("d6", 160, 0.1, sin) },
  },
  {
    id: "d7",
    enunciado: (
      <>
        Una cuerda de <b>2 m</b> fija en sus extremos transmite ondas a <b>40 m/s</b>. ¿Cuál es su frecuencia fundamental?
      </>
    ),
    opciones: [t("20 Hz"), t("80 Hz"), t("10 Hz"), t("5 Hz"), t("40 Hz")],
    correcta: 2,
    explicacion: "f₁ = v / 2L = 40 / 4 = 10 Hz.",
    escena: { tipo: "estacionaria", p: crearEstacionaria("d7", "f", 1, 2, 40, sin) },
  },
  {
    id: "d8",
    enunciado: <>En su tercer armónico, ¿cuántos nodos tiene una cuerda fija, contando los extremos?</>,
    opciones: [t("3"), t("2"), t("6"), t("4"), t("5")],
    correcta: 3,
    explicacion: "El armónico n tiene n vientres y n + 1 nodos: 3 + 1 = 4.",
    escena: { tipo: "estacionaria", p: crearEstacionaria("d8", "f", 3, 2, 40, sin) },
  },
  {
    id: "d9",
    enunciado: (
      <>
        La frecuencia fundamental de una cuerda es <b>12 Hz</b>. ¿Con qué frecuencia vibra en su cuarto armónico?
      </>
    ),
    opciones: [t("16 Hz"), t("3 Hz"), t("24 Hz"), t("36 Hz"), t("48 Hz")],
    correcta: 4,
    explicacion: "fₙ = n · f₁ = 4 · 12 = 48 Hz.",
    escena: { tipo: "estacionaria", p: crearEstacionaria("d9", "f", 4, 1, 24, sin, true) },
  },
  {
    id: "d10",
    enunciado: <>Una onda mecánica transporta…</>,
    opciones: [t("energía, pero no materia"), t("materia, pero no energía"), t("materia y energía"), t("solo sonido"), t("nada: es una ilusión")],
    correcta: 0,
    explicacion: "Cada punto del medio solo oscila en su lugar; lo que viaja es la energía (y la forma de la onda).",
    escena: { tipo: "onda", p: crearOnda("d10", "f", { v: 30, lambda: 6 }, sin) },
  },
];

export const RONDAS_EXAMEN_ONDAS: RondaDef<PreguntaOndas>[] = [{ ronda: "examen", items: PREGUNTAS_ONDAS }];
