// ══ Nivel 19 · Condensadores: contenido de la etapa 19.3, energía almacenada (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, V } from "@/ui/Formula";
import { crearEnergiaC, type ProblemaEnergiaC } from "./modelo";

export { crearEnergiaC, U_ESCALA } from "./modelo";
export type { DatoEnergia, ProblemaEnergiaC } from "./modelo";

export const RONDAS_ENERGIA_C: RondaDef<ProblemaEnergiaC>[] = [
  {
    ronda: "guiado",
    items: [
      crearEnergiaC("g1", "CV", 10, 40, ["La energía guardada es U = ½·C·V². Con μF y voltios sale en μJ: divide entre 1000 para tener mJ.", "U = ½ · 10 · 40² = 8000 μJ = 8 mJ."]),
      crearEnergiaC("g2", "CV", 100, 20, ["U = ½·C·V².", "U = ½ · 100 · 400 = 20 000 μJ = 20 mJ."]),
      crearEnergiaC("g3", "CV", 6, 100, ["El voltaje va al cuadrado: pesa mucho.", "U = ½ · 6 · 10 000 = 30 000 μJ = 30 mJ."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearEnergiaC("p1", "QC", 600, 10, ["Con la carga y la capacidad: U = Q²/(2C).", "U = 600² / 20 = 18 000 μJ = 18 mJ."]),
      crearEnergiaC("p2", "QV", 400, 50, ["Con la carga y el voltaje: U = ½·Q·V.", "U = ½ · 400 · 50 = 10 000 μJ = 10 mJ."]),
      crearEnergiaC("p3", "QC", 1000, 20, ["U = Q²/(2C).", "U = 1 000 000 / 40 = 25 000 μJ = 25 mJ."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearEnergiaC("s1", "serie", 0, 100, ["Primero la capacidad equivalente; luego U = ½·C·V².", "6 y 3 en serie = 2 μF → U = ½ · 2 · 100² = 10 mJ."], [6, 3]),
      crearEnergiaC("s2", "paralelo", 0, 60, ["En paralelo se suman: 10 μF.", "U = ½ · 10 · 60² = 18 000 μJ = 18 mJ."], [4, 6]),
      crearEnergiaC("s3", "serie", 0, 150, ["Tres de 12 μF en serie dan 4 μF.", "U = ½ · 4 · 150² = 45 000 μJ = 45 mJ."], [12, 12, 12]),
      crearEnergiaC("s4", "paralelo", 0, 50, ["10 + 30 = 40 μF.", "U = ½ · 40 · 50² = 50 000 μJ = 50 mJ."], [10, 30]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_ENERGIA_C = (
  <>
    <V>U</V>
    <Op>=</Op>
    <Frac n="1" d="2" />
    <V>C</V>
    <V>V</V>
    <sup>2</sup>
    <Op>=</Op>
    <Frac
      n={
        <>
          <V>Q</V>
          <sup>2</sup>
        </>
      }
      d={
        <>
          2<V>C</V>
        </>
      }
    />
  </>
);
