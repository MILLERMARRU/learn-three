// ══ Nivel 1 · Etapa 1.4: examen tipo admisión (opción múltiple, problemas propios) ───────
import type { ReactNode } from "react";
import type { Dim } from "@/lib/dim";
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Raiz, Sup, V } from "@/ui/Formula";

export interface Opcion {
  texto: ReactNode;
  dim?: Dim;
  unidad?: boolean;
}

export interface Pregunta {
  id: string;
  enunciado: ReactNode;
  opciones: Opcion[];
  correcta: number;
  explicacion: ReactNode;
}

const d = (dim: Dim, texto: string): Opcion => ({ dim, texto });

export const PREGUNTAS: Pregunta[] = [
  {
    id: "q1",
    enunciado: <>¿Cuál es la ecuación dimensional de la <b>potencia</b>?</>,
    opciones: [d({ M: 1, L: 2, T: -2 }, "ML²T⁻²"), d({ M: 1, L: 2, T: -3 }, "ML²T⁻³"), d({ M: 1, L: 1, T: -3 }, "MLT⁻³"), d({ M: 1, L: 2, T: -1 }, "ML²T⁻¹"), d({ M: 1, L: -1, T: -2 }, "ML⁻¹T⁻²")],
    correcta: 1,
    explicacion: "Potencia = trabajo ÷ tiempo = ML²T⁻² ÷ T = ML²T⁻³.",
  },
  {
    id: "q2",
    enunciado: <>Si <V>x</V> es posición y <V>t</V> tiempo, en <V>x</V><Op>=</Op><V>A</V><V>t</V><Op>+</Op><V>B</V><V>t</V><Sup>3</Sup> halla <b>[B]</b>.</>,
    opciones: [d({ L: 1, T: -1 }, "LT⁻¹"), d({ L: 1, T: -2 }, "LT⁻²"), d({ L: 1, T: -3 }, "LT⁻³"), d({ L: 1, T: 3 }, "LT³"), d({ T: -3 }, "T⁻³")],
    correcta: 2,
    explicacion: "Homogeneidad: [B]·T³ = L, así que [B] = LT⁻³.",
  },
  {
    id: "q3",
    enunciado: <>¿Cuál de estas magnitudes es <b>adimensional</b>?</>,
    opciones: [{ texto: "Frecuencia", dim: { T: -1 } }, { texto: "Ángulo plano", unidad: true }, { texto: "Velocidad", dim: { L: 1, T: -1 } }, { texto: "Densidad", dim: { M: 1, L: -3 } }, { texto: "Caudal", dim: { L: 3, T: -1 } }],
    correcta: 1,
    explicacion: "Ángulo = arco ÷ radio = L ÷ L = 1.",
  },
  {
    id: "q4",
    enunciado: <>En la ley del resorte <V>F</V><Op>=</Op><V>k</V><V>x</V>, ¿cuál es <b>[k]</b>?</>,
    opciones: [d({ M: 1, L: 1, T: -2 }, "MLT⁻²"), d({ M: 1, T: -2 }, "MT⁻²"), d({ M: 1, L: -1 }, "ML⁻¹"), d({ L: 1, T: -2 }, "LT⁻²"), d({ M: 1, T: -1 }, "MT⁻¹")],
    correcta: 1,
    explicacion: "[k]·L = MLT⁻², así que [k] = MT⁻².",
  },
  {
    id: "q5",
    enunciado: <>Si el periodo de un péndulo es <V>T</V><Op>=</Op><V>k</V>·<V>L</V><Sup>x</Sup>·<V>g</V><Sup>y</Sup>, halla <b>x + y</b>.</>,
    opciones: [{ texto: "1" }, { texto: "½" }, { texto: "0" }, { texto: "−1" }, { texto: "2" }],
    correcta: 2,
    explicacion: "Fila T: −2y = 1 → y = −½. Fila L: x + y = 0.",
  },
  {
    id: "q6",
    enunciado: <>¿Cuál es la ecuación dimensional del <b>calor específico</b>, <V>c</V><Op>=</Op><Frac n={<V>Q</V>} d={<><V>m</V>Δ<V>T</V></>} />?</>,
    opciones: [d({ L: 2, T: -2, θ: -1 }, "L²T⁻²θ⁻¹"), d({ M: 1, L: 2, T: -2, θ: -1 }, "ML²T⁻²θ⁻¹"), d({ L: 2, T: -2 }, "L²T⁻²"), d({ M: -1, L: 2, θ: -1 }, "M⁻¹L²θ⁻¹"), d({ L: 2, T: -1, θ: -1 }, "L²T⁻¹θ⁻¹")],
    correcta: 0,
    explicacion: "ML²T⁻² ÷ (M·θ): la masa se cancela y queda L²T⁻²θ⁻¹.",
  },
  {
    id: "q7",
    enunciado: <>En <V>y</V><Op>=</Op><V>A</V> cos(<V>ω</V><V>t</V>), con <V>t</V> en segundos, ¿cuál es <b>[ω]</b>?</>,
    opciones: [d({ T: 1 }, "T"), d({ T: -1 }, "T⁻¹"), d({ L: 1, T: -1 }, "LT⁻¹"), { texto: "1", unidad: true }, d({ T: -2 }, "T⁻²")],
    correcta: 1,
    explicacion: "El argumento del coseno es adimensional: [ω]·T = 1, así que [ω] = T⁻¹.",
  },
  {
    id: "q8",
    enunciado: <>La constante de gravitación cumple <V>F</V><Op>=</Op><V>G</V><Frac n={<><V>m</V><sub className="fx-sub">1</sub><V>m</V><sub className="fx-sub">2</sub></>} d={<><V>d</V><Sup>2</Sup></>} />. Halla <b>[G]</b>.</>,
    opciones: [d({ M: -1, L: 3, T: -2 }, "M⁻¹L³T⁻²"), d({ M: 1, L: 3, T: -2 }, "ML³T⁻²"), d({ M: -2, L: 3, T: -2 }, "M⁻²L³T⁻²"), d({ M: -1, L: 2, T: -2 }, "M⁻¹L²T⁻²"), d({ L: 3, T: -2 }, "L³T⁻²")],
    correcta: 0,
    explicacion: "[G] = F·d² ÷ m² = MLT⁻²·L² ÷ M² = M⁻¹L³T⁻².",
  },
  {
    id: "q9",
    enunciado: <>¿Cuál de estas es una <b>magnitud fundamental</b> del Sistema Internacional?</>,
    opciones: [{ texto: "Fuerza", dim: { M: 1, L: 1, T: -2 } }, { texto: "Temperatura", dim: { θ: 1 } }, { texto: "Velocidad", dim: { L: 1, T: -1 } }, { texto: "Presión", dim: { M: 1, L: -1, T: -2 } }, { texto: "Área", dim: { L: 2 } }],
    correcta: 1,
    explicacion: "Las fundamentales son 7: longitud, masa, tiempo, temperatura, corriente, intensidad luminosa y cantidad de sustancia.",
  },
  {
    id: "q10",
    enunciado: <>La rapidez de una onda en una cuerda es <V>v</V><Op>=</Op><V>k</V><Raiz><Frac n={<V>F</V>} d={<V>μ</V>} /></Raiz>. Si <V>F</V> es fuerza, ¿qué dimensión tiene <b>μ</b>?</>,
    opciones: [d({ M: 1, L: -1 }, "ML⁻¹"), d({ M: 1, L: -3 }, "ML⁻³"), d({ M: 1 }, "M"), d({ M: 1, L: 1 }, "ML"), d({ M: 1, L: -2 }, "ML⁻²")],
    correcta: 0,
    explicacion: "v² = F/μ → [μ] = MLT⁻² ÷ L²T⁻² = ML⁻¹ (masa por longitud).",
  },
];

export const RONDAS_EXAMEN: RondaDef<Pregunta>[] = [{ ronda: "examen", items: PREGUNTAS }];
