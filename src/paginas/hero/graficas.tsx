// ══ Hero del Nivel 5: la gráfica manda al auto (x–t por tramos, área de v–t y parábola del MRUV) ───────
import type { ReactNode } from "react";
import { integrar, interpolar, type Punto } from "@/lib/graficas";
import { EscenaGrafica, type Panel } from "@/three/grafica/EscenaGrafica";
import { V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  T: number;
  panel: Panel;
  pista: { xMin: number; xMax: number; x: (t: number) => number };
}

const TRAMOS: Punto[] = [
  [0, 0],
  [2, 20],
  [4, 20],
  [6, 10],
];
const TRAPECIO: Punto[] = [
  [0, 0],
  [2, 10],
  [6, 10],
  [8, 0],
];
const PARABOLA: Punto[] = Array.from({ length: 13 }, (_, i) => [i / 2, (i / 2) ** 2]);

const DEMOS: Demo[] = [
  {
    nombre: "x–t · la pendiente es la velocidad",
    eq: (
      <>
        <V>v</V> = Δ<V>x</V> / Δ<V>t</V>
      </>
    ),
    resultado: "= 20 / 2 = 10 m/s",
    T: 6,
    panel: { eje: "x", yMin: -10, yMax: 30, series: [{ puntos: TRAMOS, color: "#86b2ff" }] },
    pista: { xMin: -10, xMax: 30, x: (t) => interpolar(TRAMOS, t) },
  },
  {
    nombre: "v–t · el área es el desplazamiento",
    eq: (
      <>
        Δ<V>x</V> = área
      </>
    ),
    resultado: "= 10 + 40 + 10 = 60 m",
    T: 8,
    panel: { eje: "v", yMin: -5, yMax: 15, series: [{ puntos: TRAPECIO, color: "#6fd6a8" }], area: { puntos: TRAPECIO, t1: 8 } },
    pista: { xMin: -10, xMax: 70, x: (t) => integrar(TRAPECIO, t) },
  },
  {
    nombre: "x–t curva · MRUV",
    eq: (
      <>
        <V>x</V> = ½<V>a</V>
        <V>t</V>²
      </>
    ),
    resultado: "→ parábola",
    T: 6,
    panel: { eje: "x", yMin: -5, yMax: 40, series: [{ puntos: PARABOLA, color: "#86b2ff" }] },
    pista: { xMin: -5, xMax: 40, x: (t) => interpolar(PARABOLA, t) },
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5;
const CORRIDA = 19;

export const heroGraficas: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: <EscenaGrafica key={ciclo} T={d.T} paneles={[d.panel]} pista={d.pista} corrida={k >= ARRANQUE ? { id: ciclo } : null} />,
    pie: (
      <>
        <span className="hero-mag">{d.nombre}</span>
        <span className="hero-eq">
          <span>{d.eq}</span>
          {k >= ARRANQUE + CORRIDA && <span className="hero-res">{d.resultado}</span>}
        </span>
      </>
    ),
    encuadre: { w: 12.6, h: 9.8 },
    centro: [0.6, -0.9],
    balanceo: 0.06,
  };
};
