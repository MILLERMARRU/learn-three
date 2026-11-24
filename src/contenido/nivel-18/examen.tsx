// ══ Nivel 18 · Etapa 18.4: examen tipo admisión de electrodinámica (problemas propios) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import { crearOhm, crearPotenciaE, crearRed, type ProblemaOhm, type ProblemaPotenciaE, type ProblemaRed } from "./modelo";

/** Escena que se reproduce al responder: el circuito con el multímetro, la red con el óhmetro o el foco con el vatímetro. */
export type EscenaCircuitos = { tipo: "ohm"; p: ProblemaOhm } | { tipo: "red"; p: ProblemaRed } | { tipo: "potencia"; p: ProblemaPotenciaE };

export interface PreguntaCircuitos extends PreguntaBase {
  escena?: EscenaCircuitos;
}

const t = (s: string) => ({ texto: s });
const sin: [string, string] = ["", ""];

export const PREGUNTAS_CIRCUITOS: PreguntaCircuitos[] = [
  {
    id: "e1",
    enunciado: (
      <>
        Una pila de <b>18 V</b> se conecta a una resistencia de <b>6 Ω</b>. ¿Qué corriente circula?
      </>
    ),
    opciones: [t("108 A"), t("3 A"), t("0,33 A"), t("12 A"), t("24 A")],
    correcta: 1,
    explicacion: "I = V/R = 18 / 6 = 3 A.",
    escena: { tipo: "ohm", p: crearOhm("e1", "I", 18, 6, sin) },
  },
  {
    id: "e2",
    enunciado: (
      <>
        Por una resistencia de <b>50 Ω</b> pasan <b>0,2 A</b>. ¿Qué voltaje tiene entre sus extremos?
      </>
    ),
    opciones: [t("250 V"), t("0,004 V"), t("10 V"), t("50,2 V"), t("5 V")],
    correcta: 2,
    explicacion: "V = I·R = 0,2 · 50 = 10 V.",
    escena: { tipo: "ohm", p: crearOhm("e2", "V", 0.2, 50, sin) },
  },
  {
    id: "e3",
    enunciado: <>Si se duplica el voltaje aplicado a una misma resistencia, la corriente…</>,
    opciones: [t("se reduce a la mitad"), t("no cambia"), t("se cuadruplica"), t("se duplica"), t("se anula")],
    correcta: 3,
    explicacion: "I = V/R: con R fija, la corriente es proporcional al voltaje.",
    escena: { tipo: "ohm", p: crearOhm("e3", "I", 12, 3, sin) },
  },
  {
    id: "e4",
    enunciado: (
      <>
        ¿Cuál es la resistencia equivalente de <b>3 Ω, 5 Ω y 12 Ω</b> en serie?
      </>
    ),
    opciones: [t("2 Ω"), t("60 Ω"), t("180 Ω"), t("12 Ω"), t("20 Ω")],
    correcta: 4,
    explicacion: "En serie se suman: 3 + 5 + 12 = 20 Ω.",
    escena: { tipo: "red", p: crearRed("e4", "serie", [3, 5, 12], sin) },
  },
  {
    id: "e5",
    enunciado: (
      <>
        ¿Cuál es la resistencia equivalente de <b>10 Ω y 15 Ω</b> en paralelo?
      </>
    ),
    opciones: [t("6 Ω"), t("25 Ω"), t("12,5 Ω"), t("5 Ω"), t("150 Ω")],
    correcta: 0,
    explicacion: "Producto entre suma: 10·15 / 25 = 6 Ω.",
    escena: { tipo: "red", p: crearRed("e5", "paralelo", [10, 15], sin) },
  },
  {
    id: "e6",
    enunciado: (
      <>
        Tres resistencias iguales de <b>30 Ω</b> se conectan en paralelo. ¿Cuál es la equivalente?
      </>
    ),
    opciones: [t("90 Ω"), t("10 Ω"), t("30 Ω"), t("15 Ω"), t("3 Ω")],
    correcta: 1,
    explicacion: "n resistencias iguales en paralelo: R/n = 30 / 3 = 10 Ω.",
    escena: { tipo: "red", p: crearRed("e6", "paralelo", [30, 30, 30], sin) },
  },
  {
    id: "e7",
    enunciado: (
      <>
        Un artefacto conectado a <b>220 V</b> consume <b>0,5 A</b>. ¿Cuál es su potencia?
      </>
    ),
    opciones: [t("440 W"), t("220,5 W"), t("110 W"), t("55 W"), t("0,0023 W")],
    correcta: 2,
    explicacion: "P = V·I = 220 · 0,5 = 110 W.",
    escena: { tipo: "potencia", p: crearPotenciaE("e7", "VI", 220, 0.5, null, sin) },
  },
  {
    id: "e8",
    enunciado: (
      <>
        ¿Qué potencia disipa una resistencia de <b>5 Ω</b> por la que pasan <b>4 A</b>?
      </>
    ),
    opciones: [t("20 W"), t("100 W"), t("1,25 W"), t("80 W"), t("9 W")],
    correcta: 3,
    explicacion: "P = I²·R = 16 · 5 = 80 W.",
    escena: { tipo: "potencia", p: crearPotenciaE("e8", "IR", 4, 5, null, sin) },
  },
  {
    id: "e9",
    enunciado: (
      <>
        Un foco de <b>«100 W · 220 V»</b> se conecta a <b>110 V</b>. ¿Qué potencia consume?
      </>
    ),
    opciones: [t("100 W"), t("50 W"), t("200 W"), t("12,5 W"), t("25 W")],
    correcta: 4,
    explicacion: "Su resistencia es fija: con la mitad del voltaje, P = V²/R es la cuarta parte: 25 W.",
    escena: { tipo: "potencia", p: crearPotenciaE("e9", "nominal", 100, 220, 110, sin) },
  },
  {
    id: "e10",
    enunciado: (
      <>
        Un foco de <b>100 W</b> encendido durante <b>10 horas</b> consume…
      </>
    ),
    opciones: [t("1 kW·h"), t("10 kW·h"), t("0,1 kW·h"), t("1000 kW·h"), t("100 kW·h")],
    correcta: 0,
    explicacion: "E = P·t = 0,1 kW · 10 h = 1 kW·h.",
    escena: { tipo: "potencia", p: crearPotenciaE("e10", "VR", 100, 100, null, sin) },
  },
];

export const RONDAS_EXAMEN_CIRCUITOS: RondaDef<PreguntaCircuitos>[] = [{ ronda: "examen", items: PREGUNTAS_CIRCUITOS }];
