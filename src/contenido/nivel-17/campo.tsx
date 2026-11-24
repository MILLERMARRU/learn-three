// ══ Nivel 17 · Electrostática: contenido de la etapa 17.2, campo eléctrico de cargas puntuales (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, V } from "@/ui/Formula";
import { crearCampo, type ProblemaCampo } from "./modelo";

export { crearCampo, E_MAX, E_MIN } from "./modelo";
export type { CargaCampo, ProblemaCampo } from "./modelo";

export const RONDAS_CAMPO: RondaDef<ProblemaCampo>[] = [
  {
    ronda: "guiado",
    items: [
      crearCampo("g1", [{ q: 4, d: 30 }], ["El campo de una carga puntual es E = k·Q/d²; apunta hacia afuera si Q es positiva.", "E = 9×10⁹ · 4×10⁻⁶ / 0,09 = 4 × 10⁵ N/C."]),
      crearCampo("g2", [{ q: -6, d: 30 }], ["Si la carga es negativa, el campo apunta hacia ella; su valor se calcula sin el signo.", "E = 9×10⁹ · 6×10⁻⁶ / 0,09 = 6 × 10⁵ N/C."]),
      crearCampo("g3", [{ q: 3, d: 10 }], ["A 10 cm, d² = 0,01 m².", "E = 9×10⁹ · 3×10⁻⁶ / 0,01 = 27 × 10⁵ N/C."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearCampo("p1", [{ q: 5, d: 15 }], ["d = 0,15 m → d² = 0,0225 m².", "E = 9×10⁹ · 5×10⁻⁶ / 0,0225 = 20 × 10⁵ N/C."]),
      crearCampo("p2", [{ q: 12, d: 60 }], ["Lejos, el campo es débil: d² = 0,36 m².", "E = 9×10⁹ · 12×10⁻⁶ / 0,36 = 3 × 10⁵ N/C."]),
      crearCampo("p3", [{ q: -8, d: 20 }], ["d² = 0,04 m²; el campo apunta hacia la carga negativa.", "E = 9×10⁹ · 8×10⁻⁶ / 0,04 = 18 × 10⁵ N/C."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearCampo("s1", [{ q: 4, d: 30 }, { q: -2, d: 30 }], ["Calcula cada campo en P y mira su sentido: el de la positiva se aleja de ella y el de la negativa apunta hacia ella.", "E₁ = 4 y E₂ = 2, los dos hacia la derecha: E = 6 × 10⁵ N/C."]),
      crearCampo("s2", [{ q: 9, d: 30 }, { q: 4, d: 30 }], ["Dos positivas: en P sus campos tienen sentidos opuestos y se restan.", "E₁ = 9 y E₂ = 4: E = 9 − 4 = 5 × 10⁵ N/C."]),
      crearCampo("s3", [{ q: 2, d: 10 }, { q: 4, d: 20 }], ["E₁ a 10 cm y E₂ a 20 cm, en sentidos opuestos.", "E₁ = 18 y E₂ = 9: E = 9 × 10⁵ N/C."]),
      crearCampo("s4", [{ q: 1, d: 10 }, { q: -8, d: 20 }], ["Positiva a la izquierda y negativa a la derecha: los dos campos apuntan a la derecha.", "E₁ = 9 y E₂ = 18: E = 27 × 10⁵ N/C."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_CAMPO = (
  <>
    <V>E</V>
    <Op>=</Op>
    <Frac
      n={
        <>
          <V>k</V>
          <V>Q</V>
        </>
      }
      d={
        <>
          <V>d</V>
          <sup>2</sup>
        </>
      }
    />
  </>
);
