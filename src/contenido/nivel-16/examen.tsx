// ══ Nivel 16 · Etapa 16.4: examen tipo admisión de termodinámica (problemas propios, T = t + 273) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import { crearGas, crearMaquina, crearTrabajo, type ProblemaGas, type ProblemaMaquina, type ProblemaTrabajo } from "./modelo";

/** Escena que se reproduce al responder: el cilindro con pistón, el diagrama P–V o la máquina térmica. */
export type EscenaTermo = { tipo: "gas"; p: ProblemaGas } | { tipo: "trabajo"; p: ProblemaTrabajo } | { tipo: "maquina"; p: ProblemaMaquina };

export interface PreguntaTermo extends PreguntaBase {
  escena?: EscenaTermo;
}

const t = (s: string) => ({ texto: s });
const sin: [string, string] = ["", ""];

export const PREGUNTAS_TERMO: PreguntaTermo[] = [
  {
    id: "e1",
    enunciado: (
      <>
        Un gas ocupa <b>8 L</b> a 2 atm. A temperatura constante, la presión sube a <b>4 atm</b>. ¿Qué volumen ocupa?
      </>
    ),
    opciones: [t("16 L"), t("4 L"), t("8 L"), t("2 L"), t("6 L")],
    correcta: 1,
    explicacion: "Ley de Boyle: P₁V₁ = P₂V₂ → V₂ = 2 · 8 / 4 = 4 L.",
    escena: { tipo: "gas", p: crearGas("e1", "isotermico", 2, 8, 27, 4, 27, sin) },
  },
  {
    id: "e2",
    enunciado: (
      <>
        A presión constante, un gas de <b>6 L</b> pasa de 27 °C a <b>327 °C</b>. ¿Qué volumen ocupa?
      </>
    ),
    opciones: [t("72 L"), t("6 L"), t("12 L"), t("3 L"), t("18 L")],
    correcta: 2,
    explicacion: "Ley de Charles con kelvin: 300 K → 600 K, el volumen se duplica: 12 L.",
    escena: { tipo: "gas", p: crearGas("e2", "isobarico", 2, 6, 27, 2, 327, sin) },
  },
  {
    id: "e3",
    enunciado: <>En las leyes de los gases, la temperatura debe expresarse en…</>,
    opciones: [t("grados Celsius"), t("grados Fahrenheit"), t("cualquier escala"), t("kelvin"), t("grados Réaumur")],
    correcta: 3,
    explicacion: "Las leyes usan la temperatura absoluta: T = t + 273 (kelvin). Con °C, duplicar la temperatura no tendría sentido físico.",
    escena: { tipo: "gas", p: crearGas("e3", "isobarico", 2, 4, -73, 2, 327, sin) },
  },
  {
    id: "e4",
    enunciado: (
      <>
        Un gas se expande a <b>300 kPa</b> constantes de 0,02 m³ a <b>0,05 m³</b>. ¿Cuánto trabajo hace?
      </>
    ),
    opciones: [t("3 kJ"), t("15 kJ"), t("0,9 kJ"), t("90 kJ"), t("9 kJ")],
    correcta: 4,
    explicacion: "W = P·ΔV = 300 kPa · 0,03 m³ = 9 kJ.",
    escena: { tipo: "trabajo", p: crearTrabajo("e4", "kPa-m3", 300, 0.02, 0.05, sin) },
  },
  {
    id: "e5",
    enunciado: <>Si un gas se comprime a presión constante, el trabajo que realiza el gas es…</>,
    opciones: [t("negativo"), t("positivo"), t("cero"), t("infinito"), t("igual al calor que recibe")],
    correcta: 0,
    explicacion: "ΔV < 0, así que W = P·ΔV < 0: el trabajo lo hace el entorno sobre el gas.",
    escena: { tipo: "trabajo", p: crearTrabajo("e5", "atm-L", 3, 50, 20, sin) },
  },
  {
    id: "e6",
    enunciado: (
      <>
        Un gas recibe <b>5000 J</b> de calor y hace <b>2000 J</b> de trabajo. ¿Cuánto cambia su energía interna?
      </>
    ),
    opciones: [t("7000 J"), t("3000 J"), t("2500 J"), t("−3000 J"), t("0 J")],
    correcta: 1,
    explicacion: "Primera ley: ΔU = Q − W = 5000 − 2000 = 3000 J.",
    escena: { tipo: "trabajo", p: crearTrabajo("e6", "kPa-m3", 200, 0.01, 0.02, sin) },
  },
  {
    id: "e7",
    enunciado: (
      <>
        Una máquina toma <b>2500 J</b> del foco caliente y hace <b>500 J</b> de trabajo. ¿Cuál es su eficiencia?
      </>
    ),
    opciones: [t("50 %"), t("80 %"), t("20 %"), t("5 %"), t("25 %")],
    correcta: 2,
    explicacion: "η = W / Q₁ = 500 / 2500 = 0,2 = 20 %.",
    escena: { tipo: "maquina", p: crearMaquina("e7", "trabajo", 2500, 500, sin) },
  },
  {
    id: "e8",
    enunciado: (
      <>
        Una máquina toma <b>1600 J</b> del foco caliente y cede <b>1200 J</b> al frío. ¿Cuál es su eficiencia?
      </>
    ),
    opciones: [t("75 %"), t("33 %"), t("40 %"), t("25 %"), t("12 %")],
    correcta: 3,
    explicacion: "η = 1 − Q₂/Q₁ = 1 − 1200/1600 = 0,25 = 25 %.",
    escena: { tipo: "maquina", p: crearMaquina("e8", "calores", 1600, 1200, sin) },
  },
  {
    id: "e9",
    enunciado: (
      <>
        ¿Cuál es la eficiencia de una máquina de Carnot entre <b>527 °C</b> y <b>127 °C</b>?
      </>
    ),
    opciones: [t("76 %"), t("24 %"), t("100 %"), t("40 %"), t("50 %")],
    correcta: 4,
    explicacion: "800 K y 400 K: η = 1 − 400/800 = 50 %.",
    escena: { tipo: "maquina", p: crearMaquina("e9", "carnot", 527, 127, sin) },
  },
  {
    id: "e10",
    enunciado: <>Según la segunda ley de la termodinámica, ninguna máquina térmica puede…</>,
    opciones: [t("convertir todo el calor en trabajo"), t("funcionar entre dos focos"), t("tener eficiencia mayor que 0"), t("ceder calor al foco frío"), t("hacer trabajo")],
    correcta: 0,
    explicacion: "Siempre debe ceder algo de calor al foco frío: η < 100 %, y como máximo la de Carnot.",
    escena: { tipo: "maquina", p: crearMaquina("e10", "carnot", 327, 27, sin) },
  },
];

export const RONDAS_EXAMEN_TERMO: RondaDef<PreguntaTermo>[] = [{ ronda: "examen", items: PREGUNTAS_TERMO }];
