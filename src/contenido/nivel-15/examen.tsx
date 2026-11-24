// ══ Nivel 15 · Etapa 15.4: examen tipo admisión de calor (problemas propios, c del agua = 1 cal/g·°C) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import { crearCalentador, crearDilatacion, crearMezcla, type ProblemaCalentador, type ProblemaDilatacion, type ProblemaMezcla } from "./modelo";

/** Escena que se reproduce al responder: la barra que se dilata, la placa con el termómetro o el calorímetro. */
export type EscenaCalor = { tipo: "dilatacion"; p: ProblemaDilatacion } | { tipo: "calentador"; p: ProblemaCalentador } | { tipo: "mezcla"; p: ProblemaMezcla };

export interface PreguntaCalor extends PreguntaBase {
  escena?: EscenaCalor;
}

const t = (s: string) => ({ texto: s });
const sin: [string, string] = ["", ""];

export const PREGUNTAS_CALOR: PreguntaCalor[] = [
  {
    id: "e1",
    enunciado: (
      <>
        Un riel de acero (α = 12 × 10⁻⁶ /°C) de <b>50 m</b> se calienta <b>40 °C</b>. ¿Cuánto se alarga?
      </>
    ),
    opciones: [t("2,4 mm"), t("24 mm"), t("240 mm"), t("48 mm"), t("12 mm")],
    correcta: 1,
    explicacion: "ΔL = L₀·α·ΔT = 50 000 mm · 12 × 10⁻⁶ · 40 = 24 mm.",
    escena: { tipo: "dilatacion", p: crearDilatacion("e1", "acero", 50, 0, 40, false, sin) },
  },
  {
    id: "e2",
    enunciado: <>Si una barra tuviera el doble de longitud y se calentara el doble, su alargamiento…</>,
    opciones: [t("se duplicaría"), t("no cambiaría"), t("se cuadruplicaría"), t("se reduciría a la mitad"), t("se triplicaría")],
    correcta: 2,
    explicacion: "ΔL = L₀·α·ΔT es proporcional a L₀ y a ΔT: 2 · 2 = 4 veces.",
    escena: { tipo: "dilatacion", p: crearDilatacion("e2", "acero", 10, 20, 70, false, sin) },
  },
  {
    id: "e3",
    enunciado: <>¿Por qué las vías del tren se colocan con pequeñas juntas entre riel y riel?</>,
    opciones: [t("para ahorrar acero"), t("para que drene el agua"), t("para que el tren haga ruido"), t("para que se dilaten sin deformarse"), t("para reducir el peso")],
    correcta: 3,
    explicacion: "Con el calor del día los rieles se alargan; sin juntas, se empujarían entre sí y se curvarían.",
    escena: { tipo: "dilatacion", p: crearDilatacion("e3", "acero", 25, 0, 40, true, sin) },
  },
  {
    id: "e4",
    enunciado: (
      <>
        ¿Cuánto calor se necesita para llevar <b>500 g</b> de agua de 20 °C a 80 °C?
      </>
    ),
    opciones: [t("3 kcal"), t("300 kcal"), t("40 kcal"), t("10 kcal"), t("30 kcal")],
    correcta: 4,
    explicacion: "Q = m·c·ΔT = 500 · 1 · 60 = 30 000 cal = 30 kcal.",
    escena: { tipo: "calentador", p: crearCalentador("e4", "agua", 500, 20, 30000, false, sin) },
  },
  {
    id: "e5",
    enunciado: (
      <>
        <b>200 g</b> de aceite (c = 0,5 cal/g·°C) reciben <b>4000 cal</b>. ¿Cuánto sube su temperatura?
      </>
    ),
    opciones: [t("40 °C"), t("20 °C"), t("80 °C"), t("10 °C"), t("4 °C")],
    correcta: 0,
    explicacion: "ΔT = Q / (m·c) = 4000 / (200 · 0,5) = 40 °C.",
    escena: { tipo: "calentador", p: crearCalentador("e5", "aceite", 200, 20, 4000, false, sin) },
  },
  {
    id: "e6",
    enunciado: <>Con el mismo calor y la misma masa, ¿cuál se calienta más?</>,
    opciones: [t("agua (c = 1)"), t("hierro (c = 0,11)"), t("aceite (c = 0,5)"), t("alcohol (c = 0,6)"), t("todas por igual")],
    correcta: 1,
    explicacion: "ΔT = Q/(m·c): con Q y m iguales, sube más la de menor calor específico, el hierro.",
    escena: { tipo: "calentador", p: crearCalentador("e6", "hierro", 1000, 20, 8800, false, sin) },
  },
  {
    id: "e7",
    enunciado: (
      <>
        ¿Cuál es la capacidad calorífica de <b>2 kg</b> de agua?
      </>
    ),
    opciones: [t("2 cal/°C"), t("200 cal/°C"), t("2000 cal/°C"), t("0,5 cal/°C"), t("20 000 cal/°C")],
    correcta: 2,
    explicacion: "C = m·c = 2000 g · 1 cal/g·°C = 2000 cal/°C: el calor para subir 1 °C todo el cuerpo.",
    escena: { tipo: "calentador", p: crearCalentador("e7", "agua", 2000, 18, 100000, true, sin) },
  },
  {
    id: "e8",
    enunciado: (
      <>
        Se mezclan <b>200 g</b> de agua a 90 °C con <b>300 g</b> de agua a 40 °C. ¿Temperatura de equilibrio?
      </>
    ),
    opciones: [t("65 °C"), t("50 °C"), t("45 °C"), t("60 °C"), t("130 °C")],
    correcta: 3,
    explicacion: "Tₑ = (200·90 + 300·40) / 500 = 30 000 / 500 = 60 °C.",
    escena: { tipo: "mezcla", p: crearMezcla("e8", { sustancia: "agua", m: 200, T: 90 }, { sustancia: "agua", m: 300, T: 40 }, sin) },
  },
  {
    id: "e9",
    enunciado: <>Se juntan masas iguales de agua a 10 °C y a 70 °C. ¿Temperatura de equilibrio?</>,
    opciones: [t("80 °C"), t("60 °C"), t("30 °C"), t("10 °C"), t("40 °C")],
    correcta: 4,
    explicacion: "Con masas iguales de la misma sustancia, Tₑ es el promedio: (10 + 70) / 2 = 40 °C.",
    escena: { tipo: "mezcla", p: crearMezcla("e9", { sustancia: "agua", m: 100, T: 70 }, { sustancia: "agua", m: 100, T: 10 }, sin) },
  },
  {
    id: "e10",
    enunciado: <>Un metal caliente se sumerge en agua fría dentro de un calorímetro. Hasta el equilibrio, el calor que pierde el metal…</>,
    opciones: [t("es igual al que gana el agua"), t("es mayor que el que gana el agua"), t("es menor que el que gana el agua"), t("se convierte en temperatura"), t("desaparece")],
    correcta: 0,
    explicacion: "En un calorímetro no se pierde calor: calor perdido por el metal = calor ganado por el agua.",
    escena: { tipo: "mezcla", p: crearMezcla("e10", { sustancia: "hierro", m: 1000, T: 100 }, { sustancia: "agua", m: 440, T: 25 }, sin) },
  },
];

export const RONDAS_EXAMEN_CALOR: RondaDef<PreguntaCalor>[] = [{ ronda: "examen", items: PREGUNTAS_CALOR }];
