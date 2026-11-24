// ══ Nivel 12 · Etapa 12.4: examen tipo admisión de oscilaciones (problemas propios, π² ≈ 10) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import { crearCirculo, crearPendulo, crearResorte, type ProblemaCirculo, type ProblemaPendulo, type ProblemaResorte } from "./modelo";

/** Escena que se reproduce al responder: el resorte, el péndulo o el círculo de referencia. */
export type EscenaOscilacion = { tipo: "resorte"; p: ProblemaResorte } | { tipo: "pendulo"; p: ProblemaPendulo } | { tipo: "circulo"; p: ProblemaCirculo };

export interface PreguntaOscilacion extends PreguntaBase {
  escena?: EscenaOscilacion;
}

const t = (s: string) => ({ texto: s });
const sin: [string, string] = ["", ""];

export const PREGUNTAS_OSCILACION: PreguntaOscilacion[] = [
  {
    id: "d1",
    enunciado: (
      <>
        Un bloque de <b>1 kg</b> oscila unido a un resorte de <b>10 N/m</b>. ¿Cuál es su período? (π² ≈ 10)
      </>
    ),
    opciones: [t("1 s"), t("2 s"), t("4 s"), t("0,5 s"), t("10 s")],
    correcta: 1,
    explicacion: "T = 2π√(m/k) = 2√(10 · 1 / 10) = 2 s.",
    escena: { tipo: "resorte", p: crearResorte("d1", 1, 10, sin) },
  },
  {
    id: "d2",
    enunciado: <>Si la masa de un oscilador masa-resorte se cuadruplica, su período…</>,
    opciones: [t("se cuadruplica"), t("no cambia"), t("se duplica"), t("se reduce a la mitad"), t("se reduce a la cuarta parte")],
    correcta: 2,
    explicacion: "T va con √m: con 4 veces la masa, el período se multiplica por √4 = 2.",
    escena: { tipo: "resorte", p: crearResorte("d2", 4, 10, sin) },
  },
  {
    id: "d3",
    enunciado: (
      <>
        ¿Cuál es el período de un péndulo de <b>4 m</b> en la Tierra? (g ≈ π²)
      </>
    ),
    opciones: [t("2 s"), t("8 s"), t("16 s"), t("4 s"), t("1 s")],
    correcta: 3,
    explicacion: "T = 2π√(L/g) = 2√L = 2√4 = 4 s.",
    escena: { tipo: "pendulo", p: crearPendulo("d3", 4, 10, sin) },
  },
  {
    id: "d4",
    enunciado: <>Para oscilaciones pequeñas, el período de un péndulo simple NO depende de…</>,
    opciones: [t("su longitud"), t("la gravedad"), t("el planeta donde está"), t("la longitud ni de la gravedad"), t("la masa de la lenteja")],
    correcta: 4,
    explicacion: "T = 2π√(L/g): solo aparecen la longitud y la gravedad. La masa no influye.",
    escena: { tipo: "pendulo", p: crearPendulo("d4", 1, 10, sin) },
  },
  {
    id: "d5",
    enunciado: (
      <>
        En la Luna (g = 1,6 m/s²), ¿cuál es el período de un péndulo de <b>0,16 m</b>? (π² ≈ 10)
      </>
    ),
    opciones: [t("2 s"), t("1 s"), t("0,4 s"), t("4 s"), t("0,2 s")],
    correcta: 0,
    explicacion: "T = 2√(10 · 0,16 / 1,6) = 2√1 = 2 s.",
    escena: { tipo: "pendulo", p: crearPendulo("d5", 0.16, 1.6, sin) },
  },
  {
    id: "d6",
    enunciado: (
      <>
        Un MAS tiene amplitud <b>0,5 m</b> y ω = <b>4 rad/s</b>. ¿Cuál es su velocidad máxima?
      </>
    ),
    opciones: [t("8 m/s"), t("2 m/s"), t("4 m/s"), t("0,5 m/s"), t("1 m/s")],
    correcta: 1,
    explicacion: "v máx = A·ω = 0,5 · 4 = 2 m/s.",
    escena: { tipo: "circulo", p: crearCirculo("d6", "v", 0.5, 4, sin) },
  },
  {
    id: "d7",
    enunciado: <>En el mismo MAS (A = 0,5 m, ω = 4 rad/s), ¿cuál es la aceleración máxima?</>,
    opciones: [t("2 m/s²"), t("4 m/s²"), t("8 m/s²"), t("16 m/s²"), t("32 m/s²")],
    correcta: 2,
    explicacion: "a máx = A·ω² = 0,5 · 16 = 8 m/s².",
    escena: { tipo: "circulo", p: crearCirculo("d7", "a", 0.5, 4, sin) },
  },
  {
    id: "d8",
    enunciado: <>¿Dónde es máxima la rapidez de un cuerpo con MAS?</>,
    opciones: [t("en los extremos"), t("en ningún punto: es constante"), t("a mitad de camino del extremo"), t("en la posición de equilibrio"), t("depende de la masa")],
    correcta: 3,
    explicacion: "En el centro toda la energía es cinética; en los extremos se detiene y la aceleración es máxima.",
    escena: { tipo: "circulo", p: crearCirculo("d8", "v", 2, 3, sin) },
  },
  {
    id: "d9",
    enunciado: (
      <>
        Un MAS tiene A = <b>5 m</b> y ω = <b>2 rad/s</b>. ¿Con qué rapidez pasa a <b>3 m</b> del centro?
      </>
    ),
    opciones: [t("10 m/s"), t("6 m/s"), t("4 m/s"), t("2 m/s"), t("8 m/s")],
    correcta: 4,
    explicacion: "v = ω√(A² − x²) = 2√(25 − 9) = 2 · 4 = 8 m/s.",
    escena: { tipo: "circulo", p: crearCirculo("d9", "vx", 5, 2, sin, 3) },
  },
  {
    id: "d10",
    enunciado: (
      <>
        Un oscilador tiene un resorte de <b>200 N/m</b> y amplitud <b>0,1 m</b>. ¿Cuál es su energía mecánica?
      </>
    ),
    opciones: [t("1 J"), t("2 J"), t("10 J"), t("20 J"), t("0,5 J")],
    correcta: 0,
    explicacion: "E = ½·k·A² = ½ · 200 · 0,01 = 1 J (en los extremos, toda es potencial elástica).",
    escena: { tipo: "resorte", p: crearResorte("d10", 5, 200, sin) },
  },
];

export const RONDAS_EXAMEN_OSCILACION: RondaDef<PreguntaOscilacion>[] = [{ ronda: "examen", items: PREGUNTAS_OSCILACION }];
