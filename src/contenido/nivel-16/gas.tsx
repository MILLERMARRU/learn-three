// ══ Nivel 16 · Termodinámica: contenido de la etapa 16.1, leyes de los gases ideales (problemas propios, T = t + 273) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, V } from "@/ui/Formula";
import { crearGas, type ProblemaGas } from "./modelo";

export { crearGas, fmtT, V_MAX, V_MIN } from "./modelo";
export type { ProblemaGas, Proceso } from "./modelo";

export const RONDAS_GAS: RondaDef<ProblemaGas>[] = [
  {
    ronda: "guiado",
    items: [
      crearGas("g1", "isotermico", 2, 10, 27, 4, 27, ["A temperatura constante, presión y volumen son inversos: P₁V₁ = P₂V₂ (ley de Boyle).", "V₂ = 2 · 10 / 4 = 5 L."]),
      crearGas("g2", "isotermico", 3, 6, 27, 1, 27, ["Si la presión baja a la tercera parte, el volumen se triplica.", "V₂ = 3 · 6 / 1 = 18 L."]),
      crearGas("g3", "isotermico", 1, 12, 27, 3, 27, ["P₁V₁ = P₂V₂.", "V₂ = 1 · 12 / 3 = 4 L."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearGas("p1", "isobarico", 2, 10, 27, 2, 177, ["A presión constante, V/T es constante (ley de Charles), con T en kelvin: T = t + 273.", "300 K → 450 K: V₂ = 10 · 450 / 300 = 15 L."]),
      crearGas("p2", "isobarico", 2, 8, 127, 2, 27, ["Pasa a kelvin: 127 °C = 400 K y 27 °C = 300 K.", "V₂ = 8 · 300 / 400 = 6 L."]),
      crearGas("p3", "isobarico", 2, 4, -73, 2, 327, ["−73 °C = 200 K y 327 °C = 600 K: la temperatura absoluta se triplica.", "V₂ = 4 · 3 = 12 L."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearGas("s1", "general", 2, 10, 27, 1, 177, ["Ecuación general: P₁V₁/T₁ = P₂V₂/T₂ → V₂ = V₁ · (P₁/P₂) · (T₂/T₁).", "V₂ = 10 · (2/1) · (450/300) = 30 L."]),
      crearGas("s2", "general", 1, 6, 27, 3, 327, ["300 K → 600 K y 1 atm → 3 atm.", "V₂ = 6 · (1/3) · 2 = 4 L."]),
      crearGas("s3", "general", 2, 9, 127, 3, 527, ["400 K → 800 K y 2 atm → 3 atm.", "V₂ = 9 · (2/3) · 2 = 12 L."]),
      crearGas("s4", "general", 1, 20, 27, 5, 327, ["300 K → 600 K y 1 atm → 5 atm.", "V₂ = 20 · (1/5) · 2 = 8 L."]),
    ],
  },
];

// ══ Fórmulas ───────
const pvt = (i: string) => (
  <Frac
    n={
      <>
        <V>P</V>
        <Sub>{i}</Sub>
        <V>V</V>
        <Sub>{i}</Sub>
      </>
    }
    d={
      <>
        <V>T</V>
        <Sub>{i}</Sub>
      </>
    }
  />
);

export const F_GAS = (
  <>
    {pvt("1")}
    <Op>=</Op>
    {pvt("2")}
  </>
);
