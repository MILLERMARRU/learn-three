// ══ Nivel 19 · Etapa 19.4: examen tipo admisión de condensadores (problemas propios) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import { crearAsociacion, crearCarga, crearEnergiaC, type ProblemaAsociacion, type ProblemaCarga, type ProblemaEnergiaC } from "./modelo";

/** Escena que se reproduce al responder: el condensador que se carga, la asociación o la descarga en un foco. */
export type EscenaCondensadores = { tipo: "carga"; p: ProblemaCarga } | { tipo: "asociacion"; p: ProblemaAsociacion } | { tipo: "energia"; p: ProblemaEnergiaC };

export interface PreguntaCondensadores extends PreguntaBase {
  escena?: EscenaCondensadores;
}

const t = (s: string) => ({ texto: s });
const sin: [string, string] = ["", ""];

export const PREGUNTAS_CONDENSADORES: PreguntaCondensadores[] = [
  {
    id: "e1",
    enunciado: (
      <>
        ¿Qué carga almacena un condensador de <b>3 μF</b> conectado a <b>20 V</b>?
      </>
    ),
    opciones: [t("6,67 μC"), t("60 μC"), t("23 μC"), t("0,15 μC"), t("600 μC")],
    correcta: 1,
    explicacion: "Q = C·V = 3 μF · 20 V = 60 μC.",
    escena: { tipo: "carga", p: crearCarga("e1", 3, 20, 1, sin) },
  },
  {
    id: "e2",
    enunciado: <>Si se duplica el voltaje de un mismo condensador, su carga…</>,
    opciones: [t("se reduce a la mitad"), t("no cambia"), t("se duplica"), t("se cuadruplica"), t("se anula")],
    correcta: 2,
    explicacion: "Q = C·V: con C fija, la carga es proporcional al voltaje.",
    escena: { tipo: "carga", p: crearCarga("e2", 5, 6, 1, sin) },
  },
  {
    id: "e3",
    enunciado: (
      <>
        Entre las placas de un condensador se coloca un dieléctrico de <b>κ = 4</b>. Su capacidad…
      </>
    ),
    opciones: [t("se divide entre 4"), t("no cambia"), t("aumenta en 4 μF"), t("se multiplica por 4"), t("se anula")],
    correcta: 3,
    explicacion: "Un dieléctrico multiplica la capacidad por su constante κ.",
    escena: { tipo: "carga", p: crearCarga("e3", 1.5, 20, 4, sin) },
  },
  {
    id: "e4",
    enunciado: (
      <>
        ¿Cuál es la capacidad equivalente de <b>3 μF, 5 μF y 7 μF</b> en paralelo?
      </>
    ),
    opciones: [t("1,4 μF"), t("105 μF"), t("7 μF"), t("5 μF"), t("15 μF")],
    correcta: 4,
    explicacion: "En paralelo se suman: 3 + 5 + 7 = 15 μF.",
    escena: { tipo: "asociacion", p: crearAsociacion("e4", "paralelo", [3, 5, 7], sin) },
  },
  {
    id: "e5",
    enunciado: (
      <>
        ¿Cuál es la capacidad equivalente de <b>4 μF y 12 μF</b> en serie?
      </>
    ),
    opciones: [t("3 μF"), t("16 μF"), t("8 μF"), t("48 μF"), t("0,33 μF")],
    correcta: 0,
    explicacion: "Producto entre suma: 4·12 / 16 = 3 μF.",
    escena: { tipo: "asociacion", p: crearAsociacion("e5", "serie", [4, 12], sin) },
  },
  {
    id: "e6",
    enunciado: (
      <>
        Dos condensadores iguales de <b>10 μF</b> se conectan en serie. ¿Cuál es la equivalente?
      </>
    ),
    opciones: [t("20 μF"), t("5 μF"), t("10 μF"), t("100 μF"), t("2,5 μF")],
    correcta: 1,
    explicacion: "n iguales en serie: C/n = 10 / 2 = 5 μF.",
    escena: { tipo: "asociacion", p: crearAsociacion("e6", "serie", [10, 10], sin) },
  },
  {
    id: "e7",
    enunciado: (
      <>
        ¿Cuánta energía guarda un condensador de <b>20 μF</b> cargado a <b>50 V</b>?
      </>
    ),
    opciones: [t("500 mJ"), t("1 mJ"), t("25 mJ"), t("50 mJ"), t("2,5 mJ")],
    correcta: 2,
    explicacion: "U = ½·C·V² = ½ · 20 · 2500 = 25 000 μJ = 25 mJ.",
    escena: { tipo: "energia", p: crearEnergiaC("e7", "CV", 20, 50, sin) },
  },
  {
    id: "e8",
    enunciado: <>Si se duplica el voltaje de un condensador, la energía que guarda…</>,
    opciones: [t("se duplica"), t("se reduce a la mitad"), t("no cambia"), t("se cuadruplica"), t("se triplica")],
    correcta: 3,
    explicacion: "U = ½·C·V² va con el cuadrado del voltaje: 2² = 4 veces.",
    escena: { tipo: "energia", p: crearEnergiaC("e8", "CV", 10, 40, sin) },
  },
  {
    id: "e9",
    enunciado: (
      <>
        Un condensador de <b>1 μF</b> tiene una carga de <b>200 μC</b>. ¿Cuánta energía guarda?
      </>
    ),
    opciones: [t("100 mJ"), t("200 mJ"), t("0,1 mJ"), t("40 mJ"), t("20 mJ")],
    correcta: 4,
    explicacion: "U = Q²/(2C) = 40 000 / 2 = 20 000 μJ = 20 mJ.",
    escena: { tipo: "energia", p: crearEnergiaC("e9", "QC", 200, 1, sin) },
  },
  {
    id: "e10",
    enunciado: <>Un condensador cargado y desconectado almacena…</>,
    opciones: [t("energía en el campo eléctrico entre sus placas"), t("corriente eléctrica"), t("masa"), t("nada"), t("calor")],
    correcta: 0,
    explicacion: "Guarda energía en el campo eléctrico entre las placas; al descargarse la entrega de golpe.",
    escena: { tipo: "energia", p: crearEnergiaC("e10", "QV", 400, 50, sin) },
  },
];

export const RONDAS_EXAMEN_CONDENSADORES: RondaDef<PreguntaCondensadores>[] = [{ ronda: "examen", items: PREGUNTAS_CONDENSADORES }];
