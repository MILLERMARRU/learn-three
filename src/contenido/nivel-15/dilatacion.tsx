// ══ Nivel 15 · Calor: contenido de la etapa 15.1, dilatación térmica lineal (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Op, Sub, V } from "@/ui/Formula";
import { crearDilatacion, type ProblemaDilatacion } from "./modelo";

export { crearDilatacion, D_MAX, D_MIN, fmtC, METALES } from "./modelo";
export type { Metal, ProblemaDilatacion } from "./modelo";

export const RONDAS_DILATACION: RondaDef<ProblemaDilatacion>[] = [
  {
    ronda: "guiado",
    items: [
      crearDilatacion("g1", "acero", 10, 20, 70, false, ["El alargamiento es proporcional a la longitud, al coeficiente α y al cambio de temperatura: ΔL = L₀·α·ΔT.", "ΔL = 10 m · 12 × 10⁻⁶ · 50 = 0,006 m = 6 mm."]),
      crearDilatacion("g2", "acero", 25, 0, 40, false, ["Pasa L₀ a milímetros: 25 m = 25 000 mm.", "ΔL = 25 000 · 12 × 10⁻⁶ · 40 = 12 mm."]),
      crearDilatacion("g3", "acero", 20, 10, 85, false, ["ΔL = L₀·α·ΔT.", "ΔL = 20 000 · 12 × 10⁻⁶ · 75 = 18 mm."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearDilatacion("p1", "aluminio", 10, 20, 120, true, ["Primero ΔT = T final − T inicial.", "ΔT = 100 °C → ΔL = 10 000 · 24 × 10⁻⁶ · 100 = 24 mm."]),
      crearDilatacion("p2", "cobre", 20, 10, 60, true, ["ΔT = 60 − 10 = 50 °C.", "ΔL = 20 000 · 17 × 10⁻⁶ · 50 = 17 mm."]),
      crearDilatacion("p3", "laton", 10, 25, 125, true, ["ΔT = 125 − 25 = 100 °C.", "ΔL = 10 000 · 19 × 10⁻⁶ · 100 = 19 mm."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearDilatacion("s1", "acero", 100, 35, 5, true, ["Al enfriarse, ΔT es negativo y la barra se acorta. ¿Cuánto?", "ΔT = −30 °C → se acorta 100 000 · 12 × 10⁻⁶ · 30 = 36 mm."]),
      crearDilatacion("s2", "aluminio", 12.5, 30, -10, true, ["De 30 °C a −10 °C hay 40 °C de diferencia.", "Se acorta 12 500 · 24 × 10⁻⁶ · 40 = 12 mm."]),
      crearDilatacion("s3", "cobre", 100, 20, -10, true, ["ΔT = −10 − 20 = −30 °C.", "Se acorta 100 000 · 17 × 10⁻⁶ · 30 = 51 mm."]),
      crearDilatacion("s4", "acero", 80, 40, 15, true, ["ΔT = 15 − 40 = −25 °C.", "Se acorta 80 000 · 12 × 10⁻⁶ · 25 = 24 mm."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_DILATACION = (
  <>
    <V>ΔL</V>
    <Op>=</Op>
    <V>L</V>
    <Sub>0</Sub>
    <V>α</V>
    <V>ΔT</V>
  </>
);
