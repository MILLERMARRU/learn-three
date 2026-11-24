// ══ Nivel 19 · Condensadores: contenido de la etapa 19.2, asociación en serie y en paralelo (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, V } from "@/ui/Formula";
import { crearAsociacion, type ProblemaAsociacion } from "./modelo";

export { C_ESCALA, crearAsociacion } from "./modelo";
export type { ProblemaAsociacion, TipoAsociacion } from "./modelo";

export const RONDAS_ASOCIACION: RondaDef<ProblemaAsociacion>[] = [
  {
    ronda: "guiado",
    items: [
      crearAsociacion("g1", "paralelo", [4, 6], ["En paralelo, los condensadores suman sus placas: las capacidades se suman (al revés que las resistencias).", "C = 4 + 6 = 10 μF."]),
      crearAsociacion("g2", "paralelo", [5, 7, 8], ["C = C₁ + C₂ + C₃.", "C = 5 + 7 + 8 = 20 μF."]),
      crearAsociacion("g3", "paralelo", [12, 18], ["Suma las dos.", "C = 12 + 18 = 30 μF."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearAsociacion("p1", "serie", [6, 3], ["En serie se suman los inversos: 1/C = 1/C₁ + 1/C₂. Con dos: C = C₁·C₂/(C₁ + C₂).", "C = 6·3 / 9 = 2 μF."]),
      crearAsociacion("p2", "serie", [12, 12, 12], ["n condensadores iguales en serie: C₁/n.", "C = 12 / 3 = 4 μF."]),
      crearAsociacion("p3", "serie", [20, 30], ["Producto entre suma.", "C = 600 / 50 = 12 μF."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearAsociacion("s1", "mixta", [6, 2, 1], ["Primero el paralelo (se suman); luego, en serie con C₁ (producto entre suma).", "2 + 1 = 3 μF → C = 6·3 / 9 = 2 μF."]),
      crearAsociacion("s2", "mixta", [12, 4, 2], ["4 + 2 = 6 μF.", "C = 12·6 / 18 = 4 μF."]),
      crearAsociacion("s3", "mixta", [10, 6, 4], ["6 + 4 = 10 μF: dos iguales en serie.", "C = 10 / 2 = 5 μF."]),
      crearAsociacion("s4", "mixta", [30, 20, 40], ["20 + 40 = 60 μF.", "C = 30·60 / 90 = 20 μF."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_PARALELO_C = (
  <>
    <V>C</V>
    <Op>=</Op>
    <V>C</V>
    <Sub>1</Sub>
    <Op>+</Op>
    <V>C</V>
    <Sub>2</Sub>
  </>
);

const inv = (i?: string) => (
  <Frac
    n="1"
    d={
      <>
        <V>C</V>
        {i && <Sub>{i}</Sub>}
      </>
    }
  />
);

export const F_SERIE_C = (
  <>
    {inv()}
    <Op>=</Op>
    {inv("1")}
    <Op>+</Op>
    {inv("2")}
  </>
);
