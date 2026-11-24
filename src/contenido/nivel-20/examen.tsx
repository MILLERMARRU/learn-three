// ══ Nivel 20 · Etapa 20.4: examen tipo admisión de electromagnetismo (problemas propios, μ₀ = 4π × 10⁻⁷) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import { crearBarra, crearBobina, crearCampoRecto, crearConductor, type ProblemaCampoRecto, type ProblemaConductor, type ProblemaInduccion } from "./modelo";

/** Escena que se reproduce al responder: el cable entre los polos, el campo de un cable recto o la inducción. */
export type EscenaMagnetismo = { tipo: "conductor"; p: ProblemaConductor } | { tipo: "campo"; p: ProblemaCampoRecto } | { tipo: "induccion"; p: ProblemaInduccion };

export interface PreguntaMagnetismo extends PreguntaBase {
  escena?: EscenaMagnetismo;
}

const t = (s: string) => ({ texto: s });
const sin: [string, string] = ["", ""];

export const PREGUNTAS_MAGNETISMO: PreguntaMagnetismo[] = [
  {
    id: "e1",
    enunciado: (
      <>
        Un cable de <b>0,1 m</b> con <b>4 A</b> está perpendicular a un campo de <b>0,25 T</b>. ¿Qué fuerza recibe?
      </>
    ),
    opciones: [t("0,01 N"), t("0,1 N"), t("1 N"), t("10 N"), t("0,4 N")],
    correcta: 1,
    explicacion: "F = B·I·L = 0,25 · 4 · 0,1 = 0,1 N.",
    escena: { tipo: "conductor", p: crearConductor("e1", 0.25, 4, 0.1, 90, false, sin) },
  },
  {
    id: "e2",
    enunciado: <>Si se duplica la corriente de un cable dentro de un campo magnético, la fuerza sobre él…</>,
    opciones: [t("no cambia"), t("se reduce a la mitad"), t("se duplica"), t("se cuadruplica"), t("se anula")],
    correcta: 2,
    explicacion: "F = B·I·L es proporcional a la corriente.",
    escena: { tipo: "conductor", p: crearConductor("e2", 0.2, 3, 0.05, 90, false, sin) },
  },
  {
    id: "e3",
    enunciado: (
      <>
        Un cable de <b>0,1 m</b> con <b>5 A</b> forma <b>30°</b> con un campo de <b>0,4 T</b>. ¿Qué fuerza recibe?
      </>
    ),
    opciones: [t("0,2 N"), t("0,05 N"), t("0,17 N"), t("0,1 N"), t("0,4 N")],
    correcta: 3,
    explicacion: "F = B·I·L·sen 30° = 0,4 · 5 · 0,1 · 0,5 = 0,1 N.",
    escena: { tipo: "conductor", p: crearConductor("e3", 0.4, 5, 0.1, 30, false, sin) },
  },
  {
    id: "e4",
    enunciado: (
      <>
        ¿Qué campo crea un cable recto con <b>30 A</b> a <b>20 cm</b> de él?
      </>
    ),
    opciones: [t("3 μT"), t("300 μT"), t("60 μT"), t("15 μT"), t("30 μT")],
    correcta: 4,
    explicacion: "B = 2×10⁻⁷ · 30 / 0,2 = 3×10⁻⁵ T = 30 μT.",
    escena: { tipo: "campo", p: crearCampoRecto("e4", [{ I: 30, sentido: 1 }], 20, sin) },
  },
  {
    id: "e5",
    enunciado: <>Si te alejas de un cable recto al doble de distancia, el campo magnético…</>,
    opciones: [t("se reduce a la mitad"), t("se duplica"), t("se reduce a la cuarta parte"), t("no cambia"), t("se cuadruplica")],
    correcta: 0,
    explicacion: "B = μ₀I/(2πd) es inverso a la distancia (no a su cuadrado).",
    escena: { tipo: "campo", p: crearCampoRecto("e5", [{ I: 10, sentido: 1 }], 10, sin) },
  },
  {
    id: "e6",
    enunciado: (
      <>
        Dos cables paralelos con <b>10 A</b> en sentidos <b>opuestos</b> están a 20 cm. ¿Qué campo hay en el punto medio?
      </>
    ),
    opciones: [t("0"), t("40 μT"), t("20 μT"), t("10 μT"), t("80 μT")],
    correcta: 1,
    explicacion: "Cada uno da 20 μT y, con corrientes opuestas, en el medio apuntan igual: 40 μT.",
    escena: {
      tipo: "campo",
      p: crearCampoRecto(
        "e6",
        [
          { I: 10, sentido: 1 },
          { I: 10, sentido: -1 },
        ],
        10,
        sin,
      ),
    },
  },
  {
    id: "e7",
    enunciado: (
      <>
        Una barra de <b>0,8 m</b> se mueve a <b>15 m/s</b>, perpendicular a un campo de <b>0,5 T</b>. ¿Qué fem se induce?
      </>
    ),
    opciones: [t("60 V"), t("0,6 V"), t("6 V"), t("12 V"), t("1,5 V")],
    correcta: 2,
    explicacion: "ε = B·L·v = 0,5 · 0,8 · 15 = 6 V.",
    escena: { tipo: "induccion", p: crearBarra("e7", 0.5, 0.8, 15, false, sin) },
  },
  {
    id: "e8",
    enunciado: <>Si la barra se mueve el doble de rápido, la fem inducida…</>,
    opciones: [t("no cambia"), t("se reduce a la mitad"), t("se cuadruplica"), t("se duplica"), t("se anula")],
    correcta: 3,
    explicacion: "ε = B·L·v es proporcional a la rapidez.",
    escena: { tipo: "induccion", p: crearBarra("e8", 0.4, 1.5, 5, false, sin) },
  },
  {
    id: "e9",
    enunciado: (
      <>
        El flujo en una bobina de <b>100 espiras</b> cambia <b>0,02 Wb</b> en <b>0,1 s</b>. ¿Qué fem se induce?
      </>
    ),
    opciones: [t("2 V"), t("0,2 V"), t("200 V"), t("10 V"), t("20 V")],
    correcta: 4,
    explicacion: "ε = N·ΔΦ/Δt = 100 · 0,02 / 0,1 = 20 V.",
    escena: { tipo: "induccion", p: crearBobina("e9", 100, 0.04, 0.5, 0.1, sin) },
  },
  {
    id: "e10",
    enunciado: <>Según la ley de Lenz, la corriente inducida en una espira…</>,
    opciones: [t("se opone al cambio de flujo que la produce"), t("refuerza el cambio de flujo"), t("no tiene un sentido definido"), t("siempre circula en sentido horario"), t("no existe sin una pila")],
    correcta: 0,
    explicacion: "La corriente inducida crea un campo que se opone al cambio de flujo: por eso cuesta mover el imán.",
    escena: { tipo: "induccion", p: crearBobina("e10", 400, 0.01, 0.5, 0.1, sin) },
  },
];

export const RONDAS_EXAMEN_MAGNETISMO: RondaDef<PreguntaMagnetismo>[] = [{ ronda: "examen", items: PREGUNTAS_MAGNETISMO }];
