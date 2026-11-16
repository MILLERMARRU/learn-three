// ══ Nivel 3 · Etapa 3.4: examen tipo admisión de cinemática (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import type { PreguntaBase } from "@/etapas/Examen";
import type { MarcaPista, Movil } from "@/three/pista/EscenaPista";
import { COLOR_AUTO } from "./cinematica";

export interface PreguntaCin extends PreguntaBase {
  /** Escena que se reproduce en 3D al responder. */
  escena?: { L: number; cada?: number; moviles: Movil[]; marcas?: MarcaPista[]; tFin: number };
}

const t = (s: string) => ({ texto: s });
const A = COLOR_AUTO.A;
const B = COLOR_AUTO.B;

export const PREGUNTAS_CIN: PreguntaCin[] = [
  {
    id: "k1",
    enunciado: <>Un auto viaja a <b>72 km/h</b>. ¿Cuánto es en m/s?</>,
    opciones: [t("7,2 m/s"), t("20 m/s"), t("36 m/s"), t("259 m/s"), t("12 m/s")],
    correcta: 1,
    explicacion: "Para pasar de km/h a m/s se multiplica por 5/18: 72 · 5/18 = 20 m/s.",
    escena: { L: 70, moviles: [{ color: A, x0: 0, v: 20 }], tFin: 3 },
  },
  {
    id: "k2",
    enunciado: <>Un móvil con MRU va a 15 m/s. ¿Qué distancia recorre en 8 s?</>,
    opciones: [t("23 m"), t("60 m"), t("120 m"), t("1,9 m"), t("150 m")],
    correcta: 2,
    explicacion: "d = v · t = 15 · 8 = 120 m.",
    escena: { L: 130, moviles: [{ color: A, x0: 0, v: 15 }], tFin: 8 },
  },
  {
    id: "k3",
    enunciado: <>Dos autos separados 300 m van al encuentro a 20 m/s y 10 m/s. ¿En cuánto tiempo se encuentran?</>,
    opciones: [t("30 s"), t("15 s"), t("10 s"), t("20 s"), t("5 s")],
    correcta: 2,
    explicacion: "Tiempo de encuentro: 300 / (20 + 10) = 10 s.",
    escena: { L: 300, cada: 50, moviles: [{ color: A, x0: 0, v: 20 }, { color: B, x0: 300, v: -10 }], tFin: 10 },
  },
  {
    id: "k4",
    enunciado: <>A va a 25 m/s y persigue a B, que está 100 m adelante a 15 m/s. ¿Cuánto tarda en alcanzarlo?</>,
    opciones: [t("4 s"), t("2,5 s"), t("10 s"), t("6,7 s"), t("40 s")],
    correcta: 2,
    explicacion: "Tiempo de alcance: 100 / (25 − 15) = 10 s.",
    escena: { L: 260, moviles: [{ color: A, x0: 0, v: 25 }, { color: B, x0: 100, v: 15 }], tFin: 10 },
  },
  {
    id: "k5",
    enunciado: <>Un móvil parte del reposo con a = 4 m/s². ¿Qué rapidez tiene a los 5 s?</>,
    opciones: [t("9 m/s"), t("20 m/s"), t("1,25 m/s"), t("40 m/s"), t("50 m/s")],
    correcta: 1,
    explicacion: "v = v₀ + a·t = 0 + 4 · 5 = 20 m/s.",
    escena: { L: 60, moviles: [{ color: A, x0: 0, v: 0, a: 4 }], tFin: 5 },
  },
  {
    id: "k6",
    enunciado: <>El mismo móvil (reposo, a = 4 m/s²): ¿qué distancia recorre en esos 5 s?</>,
    opciones: [t("20 m"), t("100 m"), t("50 m"), t("10 m"), t("25 m")],
    correcta: 2,
    explicacion: "d = ½ a t² = ½ · 4 · 25 = 50 m.",
    escena: { L: 60, moviles: [{ color: A, x0: 0, v: 0, a: 4 }], tFin: 5 },
  },
  {
    id: "k7",
    enunciado: <>Un auto a 20 m/s frena con 4 m/s². ¿Cuánto recorre hasta detenerse?</>,
    opciones: [t("80 m"), t("50 m"), t("5 m"), t("100 m"), t("40 m")],
    correcta: 1,
    explicacion: "v² = v₀² − 2ad → 0 = 400 − 8d → d = 50 m.",
    escena: { L: 60, moviles: [{ color: A, x0: 0, v: 20, a: -4 }], marcas: [{ x: 50, tipo: "linea" }], tFin: 5 },
  },
  {
    id: "k8",
    enunciado: <>¿Cuánto tarda ese auto (20 m/s, frenando con 4 m/s²) en detenerse?</>,
    opciones: [t("4 s"), t("80 s"), t("5 s"), t("16 s"), t("10 s")],
    correcta: 2,
    explicacion: "v = v₀ − a·t → 0 = 20 − 4t → t = 5 s.",
    escena: { L: 60, moviles: [{ color: A, x0: 0, v: 20, a: -4 }], marcas: [{ x: 50, tipo: "linea" }], tFin: 5 },
  },
  {
    id: "k9",
    enunciado: <>Un móvil pasa de 10 m/s a 30 m/s en 4 s. ¿Cuál es su aceleración?</>,
    opciones: [t("10 m/s²"), t("2,5 m/s²"), t("5 m/s²"), t("20 m/s²"), t("7,5 m/s²")],
    correcta: 2,
    explicacion: "a = (v − v₀) / t = (30 − 10) / 4 = 5 m/s².",
    escena: { L: 90, moviles: [{ color: A, x0: 0, v: 10, a: 5 }], tFin: 4 },
  },
  {
    id: "k10",
    enunciado: <>Partiendo del reposo con MRUV, las distancias recorridas en segundos consecutivos (1.º, 2.º, 3.º…) son proporcionales a:</>,
    opciones: [t("1, 2, 3, 4…"), t("1, 4, 9, 16…"), t("1, 3, 5, 7…"), t("1, 1, 1, 1…"), t("2, 4, 8, 16…")],
    correcta: 2,
    explicacion: "Son los números impares (números de Galileo): 1, 3, 5, 7… porque las posiciones crecen como 1, 4, 9, 16…",
    escena: { L: 50, cada: 5, moviles: [{ color: A, x0: 0, v: 0, a: 2 }], tFin: 7 },
  },
];

export const RONDAS_EXAMEN_CIN: RondaDef<PreguntaCin>[] = [{ ronda: "examen", items: PREGUNTAS_CIN }];
