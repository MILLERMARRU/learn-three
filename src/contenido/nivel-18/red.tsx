// ══ Nivel 18 · Electrodinámica: contenido de la etapa 18.2, resistencias en serie y en paralelo (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, V } from "@/ui/Formula";
import { crearRed, type ProblemaRed } from "./modelo";

export { crearRed, RED_ESCALA } from "./modelo";
export type { ProblemaRed, TipoRed } from "./modelo";

export const RONDAS_RED: RondaDef<ProblemaRed>[] = [
  {
    ronda: "guiado",
    items: [
      crearRed("g1", "serie", [4, 6], ["En serie, la corriente pasa por todas una tras otra: las resistencias se suman.", "R = 4 + 6 = 10 Ω."]),
      crearRed("g2", "serie", [5, 7, 8], ["R = R₁ + R₂ + R₃.", "R = 5 + 7 + 8 = 20 Ω."]),
      crearRed("g3", "serie", [12, 18], ["Suma las dos.", "R = 12 + 18 = 30 Ω."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearRed("p1", "paralelo", [6, 3], ["En paralelo, la corriente se reparte: se suman los inversos, 1/R = 1/R₁ + 1/R₂. Con dos: R = R₁·R₂/(R₁ + R₂).", "R = 6·3 / (6 + 3) = 18 / 9 = 2 Ω."]),
      crearRed("p2", "paralelo", [12, 12, 12], ["Con n resistencias iguales en paralelo, R = R₁/n.", "R = 12 / 3 = 4 Ω."]),
      crearRed("p3", "paralelo", [20, 30], ["Producto entre suma.", "R = 20·30 / 50 = 12 Ω."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearRed("s1", "mixta", [5, 6, 3], ["Primero reduce el paralelo; luego súmale la que está en serie.", "6 ∥ 3 = 2 Ω → R = 5 + 2 = 7 Ω."]),
      crearRed("s2", "mixta", [10, 12, 6], ["12 ∥ 6 = 72/18.", "12 ∥ 6 = 4 Ω → R = 10 + 4 = 14 Ω."]),
      crearRed("s3", "mixta", [3, 20, 20], ["Dos iguales en paralelo dan la mitad.", "20 ∥ 20 = 10 Ω → R = 3 + 10 = 13 Ω."]),
      crearRed("s4", "mixta", [8, 30, 60], ["30 ∥ 60 = 1800/90.", "30 ∥ 60 = 20 Ω → R = 8 + 20 = 28 Ω."]),
    ],
  },
];

// ══ Fórmulas ───────
const inv = (i: string) => (
  <Frac
    n="1"
    d={
      <>
        <V>R</V>
        <Sub>{i}</Sub>
      </>
    }
  />
);

export const F_SERIE = (
  <>
    <V>R</V>
    <Op>=</Op>
    <V>R</V>
    <Sub>1</Sub>
    <Op>+</Op>
    <V>R</V>
    <Sub>2</Sub>
  </>
);

export const F_PARALELO = (
  <>
    <Frac n="1" d={<V>R</V>} />
    <Op>=</Op>
    {inv("1")}
    <Op>+</Op>
    {inv("2")}
  </>
);
