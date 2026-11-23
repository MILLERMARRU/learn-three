// ══ Nivel 8 · Etapa 8.4: examen tipo admisión de dinámica (problemas propios, g = 10 m/s²) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import { crearNewton, crearPlanoD, crearSistema, type ProblemaNewton, type ProblemaPlanoD, type ProblemaSistema } from "./modelo";

/** Escena que se reproduce al responder: el bloque empujado, el plano inclinado o un sistema de bloques. */
export type EscenaDinamica = { tipo: "bloque"; p: ProblemaNewton } | { tipo: "plano"; p: ProblemaPlanoD } | { tipo: "sistema"; p: ProblemaSistema };

export interface PreguntaDinamica extends PreguntaBase {
  escena?: EscenaDinamica;
}

const t = (s: string) => ({ texto: s });
const sin: [string, string] = ["", ""];
const atwood73 = crearSistema("d6", "atwood", 7, 3, 0, "a", sin);

export const PREGUNTAS_DINAMICA: PreguntaDinamica[] = [
  {
    id: "d1",
    enunciado: (
      <>
        Sobre un cuerpo de <b>6 kg</b> actúa una fuerza neta de <b>30 N</b>. ¿Cuál es su aceleración?
      </>
    ),
    opciones: [t("3 m/s²"), t("5 m/s²"), t("180 m/s²"), t("0,2 m/s²"), t("36 m/s²")],
    correcta: 1,
    explicacion: "Segunda ley: a = ΣF / m = 30 / 6 = 5 m/s².",
    escena: { tipo: "bloque", p: crearNewton("d1", 6, 10, 2, 0, sin) },
  },
  {
    id: "d2",
    enunciado: (
      <>
        Un bloque de <b>10 kg</b> parte del reposo en un piso liso empujado con <b>40 N</b>. ¿Cuánto recorre en <b>3 s</b>?
      </>
    ),
    opciones: [t("12 m"), t("36 m"), t("18 m"), t("6 m"), t("24 m")],
    correcta: 2,
    explicacion: "a = 40 / 10 = 4 m/s²; d = ½ · 4 · 3² = 18 m.",
    escena: { tipo: "bloque", p: crearNewton("d2", 10, 18, 3, 0, sin) },
  },
  {
    id: "d3",
    enunciado: (
      <>
        Se empuja una caja de <b>20 kg</b> con <b>100 N</b> sobre un piso con <b>μ = 0,3</b>. ¿Cuál es su aceleración?
      </>
    ),
    opciones: [t("5 m/s²"), t("3 m/s²"), t("0 m/s²"), t("2 m/s²"), t("8 m/s²")],
    correcta: 3,
    explicacion: "El rozamiento vale f = 0,3 · 200 = 60 N; a = (100 − 60) / 20 = 2 m/s².",
    escena: { tipo: "bloque", p: crearNewton("d3", 20, 4, 2, 0.3, sin) },
  },
  {
    id: "d4",
    enunciado: (
      <>
        Un bloque baja por un plano liso inclinado <b>53°</b>. ¿Con qué aceleración baja?
      </>
    ),
    opciones: [t("6 m/s²"), t("10 m/s²"), t("5,3 m/s²"), t("4 m/s²"), t("8 m/s²")],
    correcta: 4,
    explicacion: "Sin rozamiento, a = g sen 53° = 10 · 0,8 = 8 m/s² (no depende de la masa).",
    escena: { tipo: "plano", p: crearPlanoD("d4", 53, 0, 5, sin) },
  },
  {
    id: "d5",
    enunciado: (
      <>
        El mismo bloque baja ahora por un plano de <b>37°</b> con <b>μ = 0,5</b>. ¿Cuál es su aceleración?
      </>
    ),
    opciones: [t("2 m/s²"), t("6 m/s²"), t("4 m/s²"), t("3 m/s²"), t("0 m/s²")],
    correcta: 0,
    explicacion: "a = g(sen 37° − μ cos 37°) = 10(0,6 − 0,5 · 0,8) = 2 m/s².",
    escena: { tipo: "plano", p: crearPlanoD("d5", 37, 0.5, 5, sin) },
  },
  {
    id: "d6",
    enunciado: (
      <>
        En una máquina de Atwood cuelgan bloques de <b>7 kg</b> y <b>3 kg</b>. ¿Cuál es la aceleración del sistema?
      </>
    ),
    opciones: [t("10 m/s²"), t("4 m/s²"), t("7 m/s²"), t("2,5 m/s²"), t("3 m/s²")],
    correcta: 1,
    explicacion: "a = (m₁ − m₂)g / (m₁ + m₂) = 40 / 10 = 4 m/s².",
    escena: { tipo: "sistema", p: atwood73 },
  },
  {
    id: "d7",
    enunciado: <>En la misma máquina de Atwood, ¿cuál es la tensión de la cuerda?</>,
    opciones: [t("70 N"), t("30 N"), t("42 N"), t("21 N"), t("50 N")],
    correcta: 2,
    explicacion: "Para el bloque de 3 kg, que sube: T − 30 = 3 · 4 → T = 42 N. (Está entre los dos pesos: 30 N < T < 70 N.)",
    escena: { tipo: "sistema", p: atwood73 },
  },
  {
    id: "d8",
    enunciado: (
      <>
        Un bloque de <b>6 kg</b> está sobre una mesa lisa, unido a una pesa de <b>4 kg</b> que cuelga. ¿Cuál es la tensión de la cuerda?
      </>
    ),
    opciones: [t("40 N"), t("16 N"), t("10 N"), t("24 N"), t("4 N")],
    correcta: 3,
    explicacion: "a = 40 / 10 = 4 m/s²; para la pesa: 40 − T = 4 · 4 → T = 24 N.",
    escena: { tipo: "sistema", p: crearSistema("d8", "mesa", 6, 4, 0, "a", sin) },
  },
  {
    id: "d9",
    enunciado: (
      <>
        Un bloque de <b>10 kg</b> está sobre una mesa con <b>μ = 0,5</b>, unido a una pesa de <b>4 kg</b> que cuelga. ¿Cuál es la aceleración?
      </>
    ),
    opciones: [t("4 m/s²"), t("1 m/s²"), t("2,9 m/s²"), t("0,7 m/s²"), t("0: no se mueve")],
    correcta: 4,
    explicacion: "El peso que cuelga (40 N) no vence al rozamiento (0,5 · 100 = 50 N): el sistema queda en reposo.",
    escena: { tipo: "sistema", p: crearSistema("d9", "mesa", 10, 4, 0.5, "a", sin) },
  },
  {
    id: "d10",
    enunciado: <>Si la fuerza neta sobre un cuerpo es cero, entonces…</>,
    opciones: [t("su velocidad no cambia: está en reposo o en MRU"), t("está siempre en reposo"), t("se detiene poco a poco"), t("acelera hacia abajo"), t("su masa es cero")],
    correcta: 0,
    explicacion: "Primera ley de Newton (inercia): sin fuerza neta no hay aceleración, así que la velocidad se mantiene.",
    escena: { tipo: "plano", p: crearPlanoD("d10", 37, 0.75, 5, sin) },
  },
];

export const RONDAS_EXAMEN_DINAMICA: RondaDef<PreguntaDinamica>[] = [{ ronda: "examen", items: PREGUNTAS_DINAMICA }];
