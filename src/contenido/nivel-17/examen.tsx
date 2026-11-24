// ══ Nivel 17 · Etapa 17.4: examen tipo admisión de electrostática (problemas propios, k = 9 × 10⁹) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import { crearCampo, crearCoulomb, crearPotencial, crearTrabajoElectrico, type ProblemaCampo, type ProblemaCoulomb, type ProblemaPotencial } from "./modelo";

/** Escena que se reproduce al responder: las esferas con sus fuerzas, el campo en un punto o los anillos equipotenciales. */
export type EscenaElectro = { tipo: "coulomb"; p: ProblemaCoulomb } | { tipo: "campo"; p: ProblemaCampo } | { tipo: "potencial"; p: ProblemaPotencial };

export interface PreguntaElectro extends PreguntaBase {
  escena?: EscenaElectro;
}

const t = (s: string) => ({ texto: s });
const sin: [string, string] = ["", ""];

export const PREGUNTAS_ELECTRO: PreguntaElectro[] = [
  {
    id: "e1",
    enunciado: (
      <>
        Dos cargas de <b>+2 μC</b> y <b>+5 μC</b> están a <b>10 cm</b>. ¿Con qué fuerza se repelen?
      </>
    ),
    opciones: [t("0,9 N"), t("9 N"), t("90 N"), t("1 N"), t("3 N")],
    correcta: 1,
    explicacion: "F = k·q₁q₂/d² = 9×10⁹ · 10×10⁻¹² / 0,01 = 9 N.",
    escena: { tipo: "coulomb", p: crearCoulomb("e1", 2, 5, 10, sin) },
  },
  {
    id: "e2",
    enunciado: <>Si la distancia entre dos cargas se duplica, la fuerza entre ellas…</>,
    opciones: [t("se duplica"), t("se reduce a la mitad"), t("se reduce a la cuarta parte"), t("se cuadruplica"), t("no cambia")],
    correcta: 2,
    explicacion: "F es inversa al cuadrado de la distancia: (1/2)² = 1/4.",
    escena: { tipo: "coulomb", p: crearCoulomb("e2", 4, 10, 30, sin) },
  },
  {
    id: "e3",
    enunciado: <>Dos esferas con carga negativa, una cerca de la otra…</>,
    opciones: [t("se atraen"), t("no interactúan"), t("se neutralizan"), t("se repelen"), t("giran una alrededor de la otra")],
    correcta: 3,
    explicacion: "Cargas del mismo signo se repelen, sean positivas o negativas.",
    escena: { tipo: "coulomb", p: crearCoulomb("e3", -4, -10, 20, sin) },
  },
  {
    id: "e4",
    enunciado: (
      <>
        ¿Qué campo crea una carga de <b>+2 μC</b> a <b>10 cm</b>?
      </>
    ),
    opciones: [t("1,8 × 10⁴ N/C"), t("1,8 × 10⁵ N/C"), t("9 × 10⁵ N/C"), t("3,6 × 10⁶ N/C"), t("1,8 × 10⁶ N/C")],
    correcta: 4,
    explicacion: "E = k·Q/d² = 9×10⁹ · 2×10⁻⁶ / 0,01 = 1,8 × 10⁶ N/C.",
    escena: { tipo: "campo", p: crearCampo("e4", [{ q: 2, d: 10 }], sin) },
  },
  {
    id: "e5",
    enunciado: <>El campo eléctrico de una carga negativa apunta…</>,
    opciones: [t("hacia la carga"), t("alejándose de la carga"), t("perpendicular a la carga"), t("en círculos"), t("en ninguna dirección")],
    correcta: 0,
    explicacion: "El campo indica hacia dónde se movería una carga positiva: hacia la carga negativa.",
    escena: { tipo: "campo", p: crearCampo("e5", [{ q: -6, d: 30 }], sin) },
  },
  {
    id: "e6",
    enunciado: (
      <>
        Entre una carga de <b>+9 μC</b> y otra de <b>+4 μC</b>, el punto P está a 30 cm de cada una. ¿Cuánto vale el campo en P?
      </>
    ),
    opciones: [t("13 × 10⁵ N/C"), t("5 × 10⁵ N/C"), t("36 × 10⁵ N/C"), t("0"), t("2,25 × 10⁵ N/C")],
    correcta: 1,
    explicacion: "E₁ = 9 × 10⁵ y E₂ = 4 × 10⁵ en sentidos opuestos: E = 5 × 10⁵ N/C.",
    escena: { tipo: "campo", p: crearCampo("e6", [{ q: 9, d: 30 }, { q: 4, d: 30 }], sin) },
  },
  {
    id: "e7",
    enunciado: (
      <>
        ¿Cuál es el potencial a <b>0,3 m</b> de una carga de <b>+2 μC</b>?
      </>
    ),
    opciones: [t("6 kV"), t("600 kV"), t("60 kV"), t("20 kV"), t("180 kV")],
    correcta: 2,
    explicacion: "V = k·Q/d = 9×10⁹ · 2×10⁻⁶ / 0,3 = 60 000 V = 60 kV.",
    escena: { tipo: "potencial", p: crearPotencial("e7", 2, 0.3, sin) },
  },
  {
    id: "e8",
    enunciado: <>El potencial creado por una carga negativa…</>,
    opciones: [t("es positivo"), t("es cero"), t("es infinito"), t("es negativo"), t("no existe")],
    correcta: 3,
    explicacion: "V = k·Q/d lleva el signo de Q: con Q negativa, V es negativo.",
    escena: { tipo: "potencial", p: crearPotencial("e8", -3, 0.9, sin) },
  },
  {
    id: "e9",
    enunciado: (
      <>
        Una carga de <b>+1 μC</b> va de un punto a <b>60 kV</b> a otro a <b>20 kV</b>. ¿Cuánto trabajo hace el campo?
      </>
    ),
    opciones: [t("80 mJ"), t("20 mJ"), t("−40 mJ"), t("60 mJ"), t("40 mJ")],
    correcta: 4,
    explicacion: "W = q·(V(A) − V(B)) = 1 μC · 40 kV = 40 mJ.",
    escena: { tipo: "potencial", p: crearTrabajoElectrico("e9", 2, 0.3, 0.9, 1, sin) },
  },
  {
    id: "e10",
    enunciado: <>Al mover una carga sobre una misma superficie equipotencial, el trabajo del campo es…</>,
    opciones: [t("nulo"), t("máximo"), t("siempre negativo"), t("igual a q·V"), t("infinito")],
    correcta: 0,
    explicacion: "Todos sus puntos tienen el mismo potencial: ΔV = 0, así que W = q·ΔV = 0.",
    escena: { tipo: "potencial", p: crearPotencial("e10", 4, 0.6, sin) },
  },
];

export const RONDAS_EXAMEN_ELECTRO: RondaDef<PreguntaElectro>[] = [{ ronda: "examen", items: PREGUNTAS_ELECTRO }];
