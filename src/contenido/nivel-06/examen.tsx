// ══ Nivel 6 · Etapa 6.4: examen tipo admisión de movimiento circunferencial (problemas propios, g = 10 m/s²) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import type { TipoUnion } from "./circular";

/** Escena que se reproduce al responder: una rueda, un tren de poleas o la curva. ω en cuartos de π rad/s. */
export type EscenaExamen =
  | { tipo: "rueda"; k: number; objetivo?: number; tFin: number }
  | { tipo: "poleas"; radios: number[]; uniones: TipoUnion[]; ks: number[]; tFin: number }
  | { tipo: "curva"; R: number; aMax: number; v: number };

export interface PreguntaCircular extends PreguntaBase {
  escena?: EscenaExamen;
}

const t = (s: string) => ({ texto: s });
/** ω en rad/s → cuartos de π (la unidad de las escenas). */
const enCuartos = (w: number) => w / (Math.PI / 4);
const PI = Math.PI;

export const PREGUNTAS_CIRCULAR: PreguntaCircular[] = [
  {
    id: "c1",
    enunciado: (
      <>
        Una rueda gira con <b>ω = π/2 rad/s</b>. ¿Qué ángulo barre en <b>4 s</b>?
      </>
    ),
    opciones: [t("π/2 rad"), t("π rad"), t("2π rad"), t("4π rad"), t("π/8 rad")],
    correcta: 2,
    explicacion: "θ = ω · t = (π/2) · 4 = 2π rad: una vuelta completa.",
    escena: { tipo: "rueda", k: 2, objetivo: 2 * PI, tFin: 4 },
  },
  {
    id: "c2",
    enunciado: (
      <>
        Una rueda da <b>30 vueltas por minuto</b>. ¿Cuál es su periodo?
      </>
    ),
    opciones: [t("0,5 s"), t("1 s"), t("2 s"), t("30 s"), t("60 s")],
    correcta: 2,
    explicacion: "f = 30 / 60 = 0,5 vueltas por segundo; T = 1 / f = 2 s.",
    escena: { tipo: "rueda", k: 4, objetivo: 2 * PI, tFin: 2 },
  },
  {
    id: "c3",
    enunciado: (
      <>
        Un disco gira a <b>120 rpm</b>. ¿Cuál es su velocidad angular?
      </>
    ),
    opciones: [t("π rad/s"), t("2π rad/s"), t("8π rad/s"), t("4π rad/s"), t("120π rad/s")],
    correcta: 3,
    explicacion: "f = 120 / 60 = 2 vueltas por segundo; ω = 2πf = 4π rad/s.",
    escena: { tipo: "rueda", k: 16, objetivo: 4 * PI, tFin: 1 },
  },
  {
    id: "c4",
    enunciado: (
      <>
        Un punto del borde de una rueda de <b>0,5 m</b> de radio gira con <b>ω = 8 rad/s</b>. ¿Cuál es su rapidez tangencial?
      </>
    ),
    opciones: [t("0,5 m/s"), t("2 m/s"), t("8 m/s"), t("16 m/s"), t("4 m/s")],
    correcta: 4,
    explicacion: "v = ω · R = 8 · 0,5 = 4 m/s.",
    escena: { tipo: "rueda", k: enCuartos(8), tFin: 2 },
  },
  {
    id: "c5",
    enunciado: (
      <>
        Dos poleas están unidas por una faja: A (<b>20 cm</b>) gira a <b>30 rpm</b>. ¿A cuántas rpm gira B (<b>60 cm</b>)?
      </>
    ),
    opciones: [t("10 rpm"), t("90 rpm"), t("30 rpm"), t("20 rpm"), t("60 rpm")],
    correcta: 0,
    explicacion: "La faja iguala la rapidez de los bordes: 30 · 20 = ωB · 60 → ωB = 10 rpm.",
    escena: { tipo: "poleas", radios: [20, 60], uniones: ["faja"], ks: [4, 4 / 3], tFin: 4 },
  },
  {
    id: "c6",
    enunciado: (
      <>
        Un engranaje de <b>12 dientes</b> gira a <b>90 rpm</b> y mueve a otro de <b>36 dientes</b>. ¿Cómo gira el segundo?
      </>
    ),
    opciones: [t("30 rpm, en el mismo sentido"), t("30 rpm, en sentido contrario"), t("270 rpm, en sentido contrario"), t("90 rpm, en sentido contrario"), t("270 rpm, en el mismo sentido")],
    correcta: 1,
    explicacion: "Los dientes en contacto avanzan igual: 90 · 12 = ω · 36 → 30 rpm. Dos engranajes en contacto giran al revés.",
    escena: { tipo: "poleas", radios: [15, 45], uniones: ["engranaje"], ks: [12, -4], tFin: 2 },
  },
  {
    id: "c7",
    enunciado: (
      <>
        Las ruedas A (<b>40 cm</b>) y B (<b>10 cm</b>) están fijas al mismo eje. Si el borde de A avanza a <b>8 m/s</b>, ¿a qué rapidez avanza el borde de B?
      </>
    ),
    opciones: [t("2 m/s"), t("8 m/s"), t("32 m/s"), t("4 m/s"), t("0,5 m/s")],
    correcta: 0,
    explicacion: "Mismo eje, misma ω = 8 / 0,4 = 20 rad/s; vB = 20 · 0,1 = 2 m/s.",
    escena: { tipo: "poleas", radios: [40, 10], uniones: ["eje"], ks: [4, 4], tFin: 4 },
  },
  {
    id: "c8",
    enunciado: (
      <>
        Un auto toma una curva de <b>50 m</b> de radio a <b>20 m/s</b>. ¿Cuál es su aceleración centrípeta?
      </>
    ),
    opciones: [t("4 m/s²"), t("10 m/s²"), t("16 m/s²"), t("8 m/s²"), t("0,4 m/s²")],
    correcta: 3,
    explicacion: "a꜀ = v² / R = 400 / 50 = 8 m/s², dirigida hacia el centro de la curva.",
    escena: { tipo: "curva", R: 50, aMax: 8, v: 20 },
  },
  {
    id: "c9",
    enunciado: (
      <>
        En una curva plana de <b>64 m</b> de radio el coeficiente de rozamiento es <b>μ = 0,4</b>. ¿Cuál es la rapidez máxima para no salirse?
      </>
    ),
    opciones: [t("8 m/s"), t("25,6 m/s"), t("32 m/s"), t("4 m/s"), t("16 m/s")],
    correcta: 4,
    explicacion: "a máx = μg = 4 m/s²; v² = a máx · R = 4 · 64 = 256 → v = 16 m/s.",
    escena: { tipo: "curva", R: 64, aMax: 4, v: 16 },
  },
  {
    id: "c10",
    enunciado: <>En la misma curva, un auto duplica su rapidez. ¿Qué pasa con la aceleración centrípeta que necesita?</>,
    opciones: [t("Se duplica"), t("No cambia"), t("Se cuadruplica"), t("Se reduce a la mitad"), t("Se triplica")],
    correcta: 2,
    explicacion: "a꜀ = v² / R: con el doble de rapidez necesita 4 veces más. Si los neumáticos no la dan, se sale (como en la escena).",
    escena: { tipo: "curva", R: 40, aMax: 10, v: 40 },
  },
];

export const RONDAS_EXAMEN_CIRCULAR: RondaDef<PreguntaCircular>[] = [{ ronda: "examen", items: PREGUNTAS_CIRCULAR }];
