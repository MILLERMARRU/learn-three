// ══ Nivel 21 · Ondas electromagnéticas: contenido de la etapa 21.3, radar y eco d = c·t/2 (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, V } from "@/ui/Formula";
import { crearRadar, type ProblemaRadar } from "./modelo";

export { crearRadar, fmtO, MAGNITUDES_RADAR } from "./modelo";
export type { PideRadar, ProblemaRadar } from "./modelo";

export const RONDAS_RADAR: RondaDef<ProblemaRadar>[] = [
  {
    ronda: "guiado",
    items: [
      crearRadar("g1", "dKm", 200e-6, ["El pulso va hasta el avión y vuelve: recorre 2d en el tiempo t, así que d = c·t / 2.", "d = 3×10⁸ · 200×10⁻⁶ / 2 = 30 000 m = 30 km."]),
      crearRadar("g2", "dKm", 400e-6, ["1 µs = 10⁻⁶ s. No olvides dividir entre 2: t es de ida y vuelta.", "d = 3×10⁸ · 400×10⁻⁶ / 2 = 60 000 m = 60 km."]),
      crearRadar("g3", "dKm", 100e-6, ["Menos tiempo de eco, objeto más cerca.", "d = 3×10⁸ · 100×10⁻⁶ / 2 = 15 000 m = 15 km."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearRadar("p1", "dKm", 0.5e-3, ["Ahora el tiempo viene en milisegundos: 1 ms = 10⁻³ s.", "d = 3×10⁸ · 0,5×10⁻³ / 2 = 75 000 m = 75 km."], "ms"),
      crearRadar("p2", "dKm", 0.32e-3, ["d = c·t / 2, con t en segundos.", "d = 3×10⁸ · 0,32×10⁻³ / 2 = 48 000 m = 48 km."], "ms"),
      crearRadar("p3", "dKm", 0.18e-3, ["0,18 ms = 1,8×10⁻⁴ s.", "d = 3×10⁸ · 0,18×10⁻³ / 2 = 27 000 m = 27 km."], "ms"),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearRadar("s1", "tUs", 90e3, ["Al revés: el eco recorre 2d a la velocidad c, así que t = 2d / c.", "t = 2 · 90 000 / 3×10⁸ = 6×10⁻⁴ s = 600 µs."]),
      crearRadar("s2", "tUs", 45e3, ["t = 2d / c, con d en metros.", "t = 2 · 45 000 / 3×10⁸ = 3×10⁻⁴ s = 300 µs."]),
      crearRadar("s3", "tUs", 75e3, ["t = 2d / c.", "t = 2 · 75 000 / 3×10⁸ = 5×10⁻⁴ s = 500 µs."]),
      crearRadar("s4", "tUs", 60e3, ["Cada kilómetro de distancia suma unos 6,7 µs de eco.", "t = 2 · 60 000 / 3×10⁸ = 4×10⁻⁴ s = 400 µs."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_RADAR = (
  <>
    <V>d</V>
    <Op>=</Op>
    <Frac
      n={
        <>
          <V>c</V>
          <Op>·</Op>
          <V>t</V>
        </>
      }
      d="2"
    />
  </>
);
