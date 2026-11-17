// ══ Hero del Nivel 3: la pista repite MRU, encuentro y frenado (MRUV) ───────
import type { ReactNode } from "react";
import { COLOR_AUTO } from "@/contenido/nivel-03/cinematica";
import { EscenaPista, type MarcaPista, type Movil } from "@/three/pista/EscenaPista";
import { Sub, Sup, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  L: number;
  cada?: number;
  moviles: Movil[];
  marcas?: MarcaPista[];
  tFin: number;
}

const DEMOS: Demo[] = [
  {
    nombre: "MRU",
    eq: (
      <>
        <V>x</V> = <V>v</V>·<V>t</V>
      </>
    ),
    resultado: "= 10 · 5 = 50 m",
    L: 60,
    moviles: [{ color: COLOR_AUTO.A, x0: 0, v: 10 }],
    tFin: 5,
  },
  {
    nombre: "Encuentro",
    eq: (
      <>
        <V>t</V> = <V>d</V> / (<V>v</V>
        <Sub>A</Sub> + <V>v</V>
        <Sub>B</Sub>)
      </>
    ),
    resultado: "= 10 s",
    L: 110,
    cada: 20,
    moviles: [
      { color: COLOR_AUTO.A, x0: 0, v: 6, carril: 0, etiqueta: "A" },
      { color: COLOR_AUTO.B, x0: 100, v: -4, carril: 1, etiqueta: "B" },
    ],
    marcas: [{ x: 60, tipo: "linea" }],
    tFin: 10,
  },
  {
    nombre: "MRUV · frenado",
    eq: (
      <>
        <V>d</V> = <V>v</V>
        <Sub>0</Sub>
        <Sup>2</Sup> / 2<V>a</V>
      </>
    ),
    resultado: "= 400 / 8 = 50 m",
    L: 60,
    moviles: [{ color: COLOR_AUTO.A, x0: 0, v: 20, a: -4 }],
    // el muro queda pasando la parada: se detiene justo antes sin chocar
    marcas: [{ x: 57, tipo: "muro" }],
    tFin: 5,
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5; // pasos con el auto quieto antes de correr
const CORRIDA = 19; // pasos que dura la corrida en pantalla (máx. 3 s)

export const heroCinematica: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;

  return {
    escena: (
      <EscenaPista key={ciclo} L={d.L} cada={d.cada ?? 10} moviles={d.moviles} marcas={d.marcas} corrida={k >= ARRANQUE ? { id: ciclo, tFin: d.tFin } : null} />
    ),
    pie: (
      <>
        <span className="hero-mag">{d.nombre}</span>
        <span className="hero-eq">
          {d.eq}
          {k >= ARRANQUE + CORRIDA && <span className="hero-res">{d.resultado}</span>}
        </span>
      </>
    ),
    encuadre: { w: 11, h: 6.4 },
    centro: [0, 0.35],
    balanceo: 0.06,
  };
};
