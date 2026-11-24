// ══ Nivel 14 · Etapa 14.4: examen tipo admisión de hidrostática (problemas propios, g = 10 m/s²) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import { crearCubo, crearFlotacion, crearPrensa, crearPresion, type ProblemaFlotacion, type ProblemaPrensa, type ProblemaPresion } from "./modelo";

/** Escena que se reproduce al responder: el tanque con el manómetro, la prensa o el bloque que flota. */
export type EscenaFluidos = { tipo: "presion"; p: ProblemaPresion } | { tipo: "prensa"; p: ProblemaPrensa } | { tipo: "flotacion"; p: ProblemaFlotacion };

export interface PreguntaFluidos extends PreguntaBase {
  escena?: EscenaFluidos;
}

const t = (s: string) => ({ texto: s });
const sin: [string, string] = ["", ""];

export const PREGUNTAS_FLUIDOS: PreguntaFluidos[] = [
  {
    id: "e1",
    enunciado: (
      <>
        ¿Qué presión manométrica soporta un buzo a <b>6 m</b> de profundidad en agua dulce?
      </>
    ),
    opciones: [t("6 kPa"), t("60 kPa"), t("600 kPa"), t("0,6 kPa"), t("160 kPa")],
    correcta: 1,
    explicacion: "P = ρ·g·h = 1000 · 10 · 6 = 60 000 Pa = 60 kPa.",
    escena: { tipo: "presion", p: crearPresion("e1", "agua", 6, false, sin) },
  },
  {
    id: "e2",
    enunciado: (
      <>
        ¿Cuál es la presión <b>absoluta</b> a 3 m de profundidad en una piscina? (P atm = 100 kPa)
      </>
    ),
    opciones: [t("30 kPa"), t("100 kPa"), t("130 kPa"), t("300 kPa"), t("103 kPa")],
    correcta: 2,
    explicacion: "P = P atm + ρgh = 100 + 30 = 130 kPa.",
    escena: { tipo: "presion", p: crearPresion("e2", "agua", 3, true, sin) },
  },
  {
    id: "e3",
    enunciado: <>Dos recipientes de formas muy distintas tienen agua hasta la misma altura. La presión en el fondo…</>,
    opciones: [t("es mayor en el más ancho"), t("es mayor en el más angosto"), t("depende de cuánta agua hay"), t("es la misma en ambos"), t("es cero en los dos")],
    correcta: 3,
    explicacion: "P = ρgh solo depende de la profundidad y del líquido, no de la forma del recipiente (paradoja hidrostática).",
    escena: { tipo: "presion", p: crearPresion("e3", "agua", 2, false, sin) },
  },
  {
    id: "e4",
    enunciado: (
      <>
        ¿Qué presión manométrica hay a <b>50 cm</b> de profundidad en mercurio (13 600 kg/m³)?
      </>
    ),
    opciones: [t("5 kPa"), t("6,8 kPa"), t("50 kPa"), t("680 kPa"), t("68 kPa")],
    correcta: 4,
    explicacion: "P = 13 600 · 10 · 0,5 = 68 000 Pa = 68 kPa.",
    escena: { tipo: "presion", p: crearPresion("e4", "mercurio", 0.5, false, sin) },
  },
  {
    id: "e5",
    enunciado: (
      <>
        Una prensa hidráulica tiene émbolos de <b>0,02 m²</b> y <b>0,6 m²</b>. ¿Qué fuerza en el chico sostiene un auto de 1200 kg?
      </>
    ),
    opciones: [t("400 N"), t("12 000 N"), t("36 000 N"), t("40 N"), t("4000 N")],
    correcta: 0,
    explicacion: "F₁ = F₂ · A₁ / A₂ = 12 000 · 0,02 / 0,6 = 400 N.",
    escena: { tipo: "prensa", p: crearPrensa("e5", 1200, "m2", 0.02, 0.6, sin) },
  },
  {
    id: "e6",
    enunciado: (
      <>
        Los émbolos de una prensa tienen radios de <b>3 cm</b> y <b>15 cm</b>. ¿Cuántas veces multiplica la fuerza?
      </>
    ),
    opciones: [t("5"), t("25"), t("15"), t("125"), t("3")],
    correcta: 1,
    explicacion: "Las áreas van con el radio al cuadrado: (15/3)² = 25.",
    escena: { tipo: "prensa", p: crearPrensa("e6", 2500, "radio", 3, 15, sin) },
  },
  {
    id: "e7",
    enunciado: (
      <>
        Un cubo de <b>4,8 kg</b> flota en agua. ¿Qué empuje recibe?
      </>
    ),
    opciones: [t("4,8 N"), t("480 N"), t("48 N"), t("24 N"), t("0 N")],
    correcta: 2,
    explicacion: "Si flota en equilibrio, el empuje iguala su peso: E = m·g = 4,8 · 10 = 48 N.",
    escena: { tipo: "flotacion", p: crearCubo("e7", "agua", 20, 4.8, sin) },
  },
  {
    id: "e8",
    enunciado: (
      <>
        Un bloque de madera de <b>600 kg/m³</b> flota en agua. ¿Qué fracción de su volumen queda sumergida?
      </>
    ),
    opciones: [t("40 %"), t("50 %"), t("100 %"), t("60 %"), t("6 %")],
    correcta: 3,
    explicacion: "La fracción sumergida es ρ cuerpo / ρ líquido = 600 / 1000 = 0,6 = 60 %.",
    escena: { tipo: "flotacion", p: crearFlotacion("e8", "agua", "madera", 600, 20, sin) },
  },
  {
    id: "e9",
    enunciado: (
      <>
        Un bloque de hielo (<b>900 kg/m³</b>) flota en agua. ¿Qué fracción de su volumen queda fuera del agua?
      </>
    ),
    opciones: [t("90 %"), t("9 %"), t("50 %"), t("1 %"), t("10 %")],
    correcta: 4,
    explicacion: "Se sumerge 900/1000 = 90 %; queda fuera el 10 %.",
    escena: { tipo: "flotacion", p: crearFlotacion("e9", "agua", "hielo", 900, 20, sin) },
  },
  {
    id: "e10",
    enunciado: <>Un bote pasa de un río (agua dulce) al mar (agua salada, más densa). Respecto del agua, el bote…</>,
    opciones: [t("se hunde menos"), t("se hunde más"), t("se hunde igual"), t("se hunde por completo"), t("depende de la marea")],
    correcta: 0,
    explicacion: "Su peso no cambia; en un líquido más denso basta desalojar menos volumen para igualarlo, así que se hunde menos.",
    escena: { tipo: "flotacion", p: crearFlotacion("e10", "mar", "madera", 515, 20, sin) },
  },
];

export const RONDAS_EXAMEN_FLUIDOS: RondaDef<PreguntaFluidos>[] = [{ ronda: "examen", items: PREGUNTAS_FLUIDOS }];
