// ══ Nivel 9 · Gravitación universal: contenido de la etapa 9.2, gravedad en la altura y en otros planetas (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sup, V } from "@/ui/Formula";
import { crearGravedad, type ProblemaGravedad } from "./modelo";

export { crearGravedad, G10_MAX, G10_MIN } from "./modelo";
export type { ProblemaGravedad } from "./modelo";

export const RONDAS_GRAVEDAD: RondaDef<ProblemaGravedad>[] = [
  {
    ronda: "guiado",
    items: [
      crearGravedad("g1", 1, 1, 1, ["A una altura h, la distancia al centro es R + h: g = g₀ · (R / (R + h))².", "R / 2R = ½ → g = 10 · ¼ = 2,5 m/s²."]),
      crearGravedad("g2", 1, 1, 0.25, ["1600 km es la cuarta parte del radio terrestre.", "R / (R + R/4) = 4/5 → g = 10 · 16/25 = 6,4 m/s²."]),
      crearGravedad("g3", 1, 1, 4, ["La distancia al centro es R + 4R = 5R.", "g = 10 · (1/5)² = 0,4 m/s²."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearGravedad("p1", 2, 2, 0, ["En la superficie, g = g₀ · (M/M₀) / (R/R₀)².", "g = 10 · 2 / 2² = 5 m/s²."]),
      crearGravedad("p2", 0.1, 0.5, 0, ["Poca masa, pero también un radio pequeño.", "g = 10 · 0,1 / (½)² = 10 · 0,1 · 4 = 4 m/s²."]),
      crearGravedad("p3", 4, 2, 0, ["El cuádruple de masa con el doble de radio.", "g = 10 · 4 / 2² = 10 m/s²: igual que en la Tierra."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearGravedad("s1", 8, 2, 1, ["Primero la gravedad en su superficie; luego, el efecto de la altura.", "Superficie: 10 · 8 / 4 = 20 m/s²; a h = R: 20 · ¼ = 5 m/s²."]),
      crearGravedad("s2", 2, 1, 0.25, ["En su superficie la gravedad es el doble que en la Tierra.", "20 · (4/5)² = 20 · 0,64 = 12,8 m/s²."]),
      crearGravedad("s3", 16, 2, 1, ["Superficie: g₀ · 16 / 2².", "40 m/s² en la superficie; a h = R: 40 / 4 = 10 m/s²."]),
      crearGravedad("s4", 0.5, 1, 0.25, ["En su superficie la gravedad es la mitad que en la Tierra.", "5 · (4/5)² = 5 · 0,64 = 3,2 m/s²."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_GRAVEDAD = (
  <>
    <V>g</V>
    <Op>=</Op>
    <Frac
      n={
        <>
          <V>G</V>
          <V>M</V>
        </>
      }
      d={
        <>
          (<V>R</V> + <V>h</V>)<Sup>2</Sup>
        </>
      }
    />
  </>
);
