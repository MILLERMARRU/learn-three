// ══ Nivel 7 · Etapa 7.4: examen tipo admisión de estática (problemas propios, g = 10 m/s²) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import { crearAparejo, crearEquilibrio, crearMomento, type ProblemaAparejo, type ProblemaEquilibrio, type ProblemaMomento } from "./modelo";

/** Escena que se reproduce al responder: un cuerpo con sus fuerzas, un aparejo de poleas o una palanca. */
export type EscenaEstatica = { tipo: "fuerzas"; p: ProblemaEquilibrio } | { tipo: "poleas"; p: ProblemaAparejo } | { tipo: "palanca"; p: ProblemaMomento };

export interface PreguntaEstatica extends PreguntaBase {
  escena?: EscenaEstatica;
}

const t = (s: string) => ({ texto: s });
const sin: [string, string] = ["", ""];

const plano50 = crearEquilibrio("e2", "plano", { W: 50, angulo: 37 }, "T", sin);

export const PREGUNTAS_ESTATICA: PreguntaEstatica[] = [
  {
    id: "e1",
    enunciado: (
      <>
        Un bloque de <b>8 kg</b> cuelga en reposo de una cuerda. ¿Cuál es la tensión de la cuerda?
      </>
    ),
    opciones: [t("8 N"), t("80 N"), t("0,8 N"), t("800 N"), t("18 N")],
    correcta: 1,
    explicacion: "En reposo, ΣFy = 0: T = W = m·g = 8 · 10 = 80 N.",
    escena: { tipo: "fuerzas", p: crearEquilibrio("e1", "colgado", { m: 8 }, "T", sin) },
  },
  {
    id: "e2",
    enunciado: (
      <>
        Un bloque de <b>50 N</b> está en reposo en un plano liso inclinado <b>37°</b>, sostenido por una cuerda paralela al plano. ¿Cuál es la tensión?
      </>
    ),
    opciones: [t("40 N"), t("50 N"), t("30 N"), t("20 N"), t("37,5 N")],
    correcta: 2,
    explicacion: "La cuerda equilibra la componente del peso paralela al plano: T = W sen 37° = 50 · 0,6 = 30 N.",
    escena: { tipo: "fuerzas", p: plano50 },
  },
  {
    id: "e3",
    enunciado: <>En el mismo plano, ¿cuánto vale la fuerza normal sobre el bloque?</>,
    opciones: [t("30 N"), t("50 N"), t("20 N"), t("40 N"), t("60 N")],
    correcta: 3,
    explicacion: "La normal equilibra la componente perpendicular del peso: N = W cos 37° = 50 · 0,8 = 40 N.",
    escena: { tipo: "fuerzas", p: plano50 },
  },
  {
    id: "e4",
    enunciado: (
      <>
        Una lámpara de <b>100 N</b> cuelga de dos cuerdas que forman <b>37°</b> y <b>53°</b> con el techo. ¿Cuál es la tensión de la cuerda de 53°?
      </>
    ),
    opciones: [t("60 N"), t("100 N"), t("50 N"), t("125 N"), t("80 N")],
    correcta: 4,
    explicacion: "En x: T₁ cos 37° = T₂ cos 53°; en y: T₁ sen 37° + T₂ sen 53° = 100. Como suman 90°: T₂ = W cos 37° = 80 N.",
    escena: { tipo: "fuerzas", p: crearEquilibrio("e4", "cuerdas", { W: 100, angulo: 37, angulo2: 53 }, "T2", sin) },
  },
  {
    id: "e5",
    enunciado: (
      <>
        Se tira de una caja de <b>150 N</b> con <b>100 N</b> formando <b>37°</b> con la horizontal, y la caja no se mueve. ¿Cuánto vale el rozamiento?
      </>
    ),
    opciones: [t("80 N"), t("60 N"), t("100 N"), t("0 N"), t("150 N")],
    correcta: 0,
    explicacion: "El rozamiento equilibra la componente horizontal de la fuerza: f = 100 cos 37° = 80 N.",
    escena: { tipo: "fuerzas", p: crearEquilibrio("e5", "piso", { W: 150, F: 100, angulo: 37 }, "f", sin) },
  },
  {
    id: "e6",
    enunciado: (
      <>
        Con una polea móvil (ideal), ¿qué fuerza hay que hacer para sostener un peso de <b>90 N</b>?
      </>
    ),
    opciones: [t("90 N"), t("45 N"), t("30 N"), t("180 N"), t("22,5 N")],
    correcta: 1,
    explicacion: "La polea móvil cuelga de dos tramos de cuerda: F = W / 2 = 45 N.",
    escena: { tipo: "poleas", p: crearAparejo("e6", 1, 90, 0, sin) },
  },
  {
    id: "e7",
    enunciado: (
      <>
        Un aparejo potencial de <b>3 poleas móviles</b> sostiene un peso de <b>240 N</b>. ¿Con qué fuerza se tira de la cuerda?
      </>
    ),
    opciones: [t("80 N"), t("120 N"), t("30 N"), t("60 N"), t("40 N")],
    correcta: 2,
    explicacion: "Cada polea móvil divide la fuerza entre dos: F = 240 / 2³ = 30 N.",
    escena: { tipo: "poleas", p: crearAparejo("e7", 3, 240, 0, sin) },
  },
  {
    id: "e8",
    enunciado: (
      <>
        Una barra ligera se apoya en su punto medio. A <b>1,5 m</b> de un lado cuelga una pesa de <b>80 N</b>. ¿A qué distancia del apoyo, del otro lado, hay que colgar una pesa de <b>40 N</b> para equilibrarla?
      </>
    ),
    opciones: [t("1,5 m"), t("2 m"), t("6 m"), t("3 m"), t("4 m")],
    correcta: 3,
    explicacion: "ΣM = 0: 80 · 1,5 = 40 · d → d = 3 m.",
    escena: { tipo: "palanca", p: crearMomento("e8", { tipo: "distancia", pivote: 0, pesas: [{ x: -1.5, W: 80 }], movil: { W: 40, lado: 1 } }, sin) },
  },
  {
    id: "e9",
    enunciado: (
      <>
        Una pesa de <b>120 N</b> cuelga a <b>1 m</b> del apoyo de una barra ligera. ¿Qué fuerza hacia abajo, a <b>4 m</b> del otro lado, la equilibra?
      </>
    ),
    opciones: [t("480 N"), t("120 N"), t("40 N"), t("60 N"), t("30 N")],
    correcta: 4,
    explicacion: "120 · 1 = F · 4 → F = 30 N: un brazo cuatro veces mayor necesita cuatro veces menos fuerza.",
    escena: { tipo: "palanca", p: crearMomento("e9", { tipo: "fuerza", pivote: 0, pesas: [{ x: -1, W: 120 }], fuerzaX: 4 }, sin) },
  },
  {
    id: "e10",
    enunciado: <>Además de ΣF = 0, ¿qué condición asegura que un cuerpo rígido no gire?</>,
    opciones: [t("ΣM = 0 respecto de cualquier punto"), t("Que su peso sea nulo"), t("Que la normal sea igual al peso"), t("Que no haya rozamiento"), t("Que las fuerzas sean iguales")],
    correcta: 0,
    explicacion: "Segunda condición de equilibrio: la suma de momentos es cero. Si ΣF = 0, da igual el punto que se tome.",
    escena: { tipo: "palanca", p: crearMomento("e10", { tipo: "fuerza", pivote: 0, pesas: [{ x: -3, W: 50 }, { x: -1, W: 30 }, { x: 2, W: 20 }], fuerzaX: 4 }, sin) },
  },
];

export const RONDAS_EXAMEN_ESTATICA: RondaDef<PreguntaEstatica>[] = [{ ronda: "examen", items: PREGUNTAS_ESTATICA }];
