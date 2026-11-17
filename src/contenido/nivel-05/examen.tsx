// ══ Nivel 5 · Etapa 5.4: examen tipo admisión de gráficas del movimiento (problemas propios) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import { integrar, interpolar, type Punto } from "@/lib/graficas";
import type { Panel } from "@/three/grafica/EscenaGrafica";

export interface PreguntaGrafica extends PreguntaBase {
  escena?: { T: number; panel: Panel; pista?: { xMin: number; xMax: number; x: (t: number) => number } };
}

const t = (s: string) => ({ texto: s });
const AZUL = "#86b2ff";
const VERDE = "#6fd6a8";

/** Escena x–t: la pista sigue la misma curva. */
function escenaXT(puntos: Punto[], yMin: number, yMax: number): PreguntaGrafica["escena"] {
  const T = puntos[puntos.length - 1][0];
  return { T, panel: { eje: "x", yMin, yMax, series: [{ puntos, color: AZUL }] }, pista: { xMin: yMin, xMax: yMax, x: (s) => interpolar(puntos, s) } };
}

/** Escena v–t con el área sombreada; la pista integra la velocidad. */
function escenaVT(puntos: Punto[], yMin: number, yMax: number, xMax: number, eje: "v" | "a" = "v"): PreguntaGrafica["escena"] {
  const T = puntos[puntos.length - 1][0];
  return {
    T,
    panel: { eje, yMin, yMax, series: [{ puntos, color: eje === "a" ? "#ff8a5c" : VERDE }], area: { puntos, t1: T, siempre: true } },
    pista: eje === "v" ? { xMin: -10, xMax, x: (s) => integrar(puntos, s) } : undefined,
  };
}

const PARABOLA: Punto[] = Array.from({ length: 13 }, (_, i) => [i / 2, (i / 2) ** 2]);

export const PREGUNTAS_GRAFICA: PreguntaGrafica[] = [
  {
    id: "q1",
    enunciado: <>En una gráfica posición–tiempo (x–t), ¿qué representa la <b>pendiente</b>?</>,
    opciones: [t("La aceleración"), t("La velocidad"), t("El desplazamiento"), t("La distancia recorrida"), t("El tiempo")],
    correcta: 1,
    explicacion: "Pendiente de x–t = Δx / Δt = velocidad.",
    escena: escenaXT([[0, 0], [6, 30]], -10, 40),
  },
  {
    id: "q2",
    enunciado: <>En la x–t un móvil pasa de x = 10 m a x = 40 m en 6 s con una recta. ¿Cuál es su velocidad?</>,
    opciones: [t("5 m/s"), t("6 m/s"), t("30 m/s"), t("40 m/s"), t("4 m/s")],
    correcta: 0,
    explicacion: "v = (40 − 10) / 6 = 5 m/s.",
    escena: escenaXT([[0, 10], [6, 40]], -10, 50),
  },
  {
    id: "q3",
    enunciado: <>En una gráfica velocidad–tiempo (v–t), ¿qué representa el <b>área bajo la curva</b>?</>,
    opciones: [t("La aceleración"), t("La rapidez media"), t("El desplazamiento"), t("El tiempo de vuelo"), t("La fuerza")],
    correcta: 2,
    explicacion: "Área de v–t = v · t sumado en cada instante = desplazamiento.",
    escena: escenaVT([[0, 10], [4, 10]], -5, 15, 50),
  },
  {
    id: "q4",
    enunciado: <>La v–t es una recta horizontal en v = 8 m/s durante 5 s. ¿Cuánto se desplaza?</>,
    opciones: [t("13 m"), t("40 m"), t("1,6 m"), t("20 m"), t("80 m")],
    correcta: 1,
    explicacion: "Área del rectángulo: 8 · 5 = 40 m.",
    escena: escenaVT([[0, 8], [5, 8]], -5, 15, 50),
  },
  {
    id: "q5",
    enunciado: <>En la v–t la velocidad sube en línea recta de 0 a 20 m/s en 5 s. ¿Cuál es la aceleración?</>,
    opciones: [t("4 m/s²"), t("5 m/s²"), t("20 m/s²"), t("100 m/s²"), t("0,25 m/s²")],
    correcta: 0,
    explicacion: "Pendiente de v–t = Δv / Δt = 20 / 5 = 4 m/s².",
    escena: escenaVT([[0, 0], [5, 20]], -5, 25, 60),
  },
  {
    id: "q6",
    enunciado: <>Con la misma gráfica (0 → 20 m/s en 5 s), ¿cuánto se desplaza?</>,
    opciones: [t("100 m"), t("25 m"), t("50 m"), t("20 m"), t("4 m")],
    correcta: 2,
    explicacion: "Área del triángulo: ½ · 5 · 20 = 50 m.",
    escena: escenaVT([[0, 0], [5, 20]], -5, 25, 60),
  },
  {
    id: "q7",
    enunciado: <>En una gráfica a–t, la aceleración vale 2 m/s² durante 5 s. ¿Cuánto cambia la velocidad?</>,
    opciones: [t("2,5 m/s"), t("7 m/s"), t("10 m/s"), t("25 m/s"), t("0,4 m/s")],
    correcta: 2,
    explicacion: "Área de a–t = Δv = 2 · 5 = 10 m/s.",
    escena: escenaVT([[0, 2], [5, 2]], -1, 4, 0, "a"),
  },
  {
    id: "q8",
    enunciado: <>Si la gráfica x–t es una recta <b>horizontal</b>, el móvil…</>,
    opciones: [t("va a velocidad constante"), t("acelera"), t("está en reposo"), t("frena"), t("regresa")],
    correcta: 2,
    explicacion: "La posición no cambia: pendiente 0, velocidad 0.",
    escena: escenaXT([[0, 20], [6, 20]], -10, 40),
  },
  {
    id: "q9",
    enunciado: <>Si la gráfica x–t es una <b>parábola</b>, el movimiento es…</>,
    opciones: [t("MRU"), t("MRUV"), t("reposo"), t("circular uniforme"), t("imposible")],
    correcta: 1,
    explicacion: "x = x₀ + v₀t + ½at² es cuadrática en t: la x–t del MRUV es una parábola.",
    escena: escenaXT(PARABOLA, -5, 40),
  },
  {
    id: "q10",
    enunciado: <>La v–t baja en línea recta de 10 m/s a −10 m/s en 4 s. ¿Cuál es el desplazamiento?</>,
    opciones: [t("0 m"), t("20 m"), t("40 m"), t("10 m"), t("−20 m")],
    correcta: 0,
    explicacion: "Arriba del eje avanza 10 m y abajo regresa 10 m: Δx = 10 − 10 = 0 (aunque recorrió 20 m).",
    escena: escenaVT([[0, 10], [4, -10]], -15, 15, 20),
  },
];

export const RONDAS_EXAMEN_GRAFICA: RondaDef<PreguntaGrafica>[] = [{ ronda: "examen", items: PREGUNTAS_GRAFICA }];
