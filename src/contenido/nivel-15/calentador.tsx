// ══ Nivel 15 · Calor: contenido de la etapa 15.2, calor sensible (problemas propios, c del agua = 1 cal/g·°C) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, V } from "@/ui/Formula";
import { crearCalentador, type ProblemaCalentador } from "./modelo";

export { crearCalentador, SUSTANCIAS, T_MAX, T_MIN } from "./modelo";
export type { ProblemaCalentador, Sustancia } from "./modelo";

export const RONDAS_CALENTADOR: RondaDef<ProblemaCalentador>[] = [
  {
    ronda: "guiado",
    items: [
      crearCalentador("g1", "agua", 200, 20, 6000, false, ["El calor sube la temperatura: ΔT = Q / (m·c).", "ΔT = 6000 / (200 · 1) = 30 °C → T = 20 + 30 = 50 °C."]),
      crearCalentador("g2", "agua", 500, 10, 15000, false, ["Con c = 1, cada caloría sube 1 °C a un gramo de agua.", "ΔT = 15 000 / 500 = 30 °C → T = 40 °C."]),
      crearCalentador("g3", "agua", 250, 25, 12500, false, ["ΔT = Q / (m·c).", "ΔT = 12 500 / 250 = 50 °C → T = 75 °C."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearCalentador("p1", "aceite", 400, 20, 8000, false, ["El aceite tiene c = 0,5: se calienta el doble de rápido que el agua.", "ΔT = 8000 / (400 · 0,5) = 40 °C → T = 60 °C."]),
      crearCalentador("p2", "alcohol", 500, 15, 9000, false, ["c del alcohol = 0,6 cal/g·°C.", "ΔT = 9000 / (500 · 0,6) = 30 °C → T = 45 °C."]),
      crearCalentador("p3", "hierro", 1000, 20, 8800, false, ["Los metales tienen calor específico bajo: c del hierro = 0,11.", "ΔT = 8800 / (1000 · 0,11) = 80 °C → T = 100 °C."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearCalentador("s1", "agua", 2000, 18, 100000, true, ["Pasa a gramos y calorías: 2 kg = 2000 g, 100 kcal = 100 000 cal.", "ΔT = 100 000 / 2000 = 50 °C → T = 68 °C."]),
      crearCalentador("s2", "aluminio", 500, 20, 11000, true, ["c del aluminio = 0,22; 11 kcal = 11 000 cal.", "ΔT = 11 000 / (500 · 0,22) = 100 °C → T = 120 °C."]),
      crearCalentador("s3", "agua", 800, 12, 40000, true, ["0,8 kg = 800 g; 40 kcal = 40 000 cal.", "ΔT = 40 000 / 800 = 50 °C → T = 62 °C."]),
      crearCalentador("s4", "aceite", 1500, 25, 30000, true, ["1,5 kg = 1500 g; c = 0,5.", "ΔT = 30 000 / (1500 · 0,5) = 40 °C → T = 65 °C."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_CALENTADOR = (
  <>
    <V>T</V>
    <Op>=</Op>
    <V>T</V>
    <Sub>0</Sub>
    <Op>+</Op>
    <Frac
      n={<V>Q</V>}
      d={
        <>
          <V>m</V>
          <V>c</V>
        </>
      }
    />
  </>
);
