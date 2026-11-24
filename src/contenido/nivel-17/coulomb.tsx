// ══ Nivel 17 · Electrostática: contenido de la etapa 17.1, ley de Coulomb (problemas propios, k = 9 × 10⁹) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, V } from "@/ui/Formula";
import { crearCoulomb, type ProblemaCoulomb } from "./modelo";

export { crearCoulomb, F_MAX, F_MIN, fmtQ } from "./modelo";
export type { ProblemaCoulomb } from "./modelo";

export const RONDAS_COULOMB: RondaDef<ProblemaCoulomb>[] = [
  {
    ronda: "guiado",
    items: [
      crearCoulomb("g1", 2, 5, 30, ["F = k·q₁·q₂/d², con las cargas en coulomb (1 μC = 10⁻⁶ C) y d en metros.", "F = 9×10⁹ · 2×10⁻⁶ · 5×10⁻⁶ / 0,3² = 0,09 / 0,09 = 1 N."]),
      crearCoulomb("g2", 5, 6, 30, ["A 30 cm, d² = 0,09: F = 9×10⁹ · q₁q₂ / 0,09.", "F = 9×10⁹ · 30×10⁻¹² / 0,09 = 3 N."]),
      crearCoulomb("g3", 4, 10, 30, ["Con d = 30 cm, cada μC² da 0,1 N.", "F = 0,1 · 4 · 10 = 4 N."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearCoulomb("p1", 1, 10, 10, ["La fuerza va con el inverso del cuadrado de la distancia: a 10 cm, d² = 0,01 m².", "F = 9×10⁹ · 10×10⁻¹² / 0,01 = 9 N."]),
      crearCoulomb("p2", 8, 10, 20, ["d = 0,2 m → d² = 0,04 m².", "F = 9×10⁹ · 80×10⁻¹² / 0,04 = 0,72 / 0,04 = 18 N."]),
      crearCoulomb("p3", 1, 2, 3, ["Muy cerca: d = 0,03 m → d² = 0,0009 m².", "F = 9×10⁹ · 2×10⁻¹² / 0,0009 = 0,018 / 0,0009 = 20 N."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearCoulomb("s1", -4, -10, 20, ["Cargas del mismo signo se repelen; el signo no cambia el valor de la fuerza.", "F = 9×10⁹ · 40×10⁻¹² / 0,04 = 9 N (repulsión)."]),
      crearCoulomb("s2", 5, -8, 60, ["Signos opuestos: se atraen. Usa los valores sin signo.", "F = 9×10⁹ · 40×10⁻¹² / 0,36 = 1 N (atracción)."]),
      crearCoulomb("s3", -2, -15, 30, ["Mismo signo: repulsión.", "F = 9×10⁹ · 30×10⁻¹² / 0,09 = 3 N."]),
      crearCoulomb("s4", 6, -5, 10, ["Signos opuestos: atracción.", "F = 9×10⁹ · 30×10⁻¹² / 0,01 = 27 N."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_COULOMB = (
  <>
    <V>F</V>
    <Op>=</Op>
    <Frac
      n={
        <>
          <V>k</V>
          <V>q</V>
          <Sub>1</Sub>
          <V>q</V>
          <Sub>2</Sub>
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
