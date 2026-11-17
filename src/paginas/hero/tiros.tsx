// ══ Hero del Nivel 4: caída libre, lanzamiento horizontal y tiros a 37° y 53° (mismo alcance) ───────
import type { ReactNode } from "react";
import type { Lanzamiento } from "@/lib/tiro";
import { EscenaTiro } from "@/three/tiro/EscenaTiro";
import { Frac, Sub, Sup, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  W: number;
  H: number;
  lanz: Lanzamiento;
  torre?: number;
  canasta?: number;
  reglaX?: boolean;
  tFin?: number;
}

const ALCANCE = (
  <>
    <V>D</V> ={" "}
    <Frac
      n={
        <>
          <V>v</V>
          <Sub>0</Sub>
          <Sup>2</Sup> sen 2<V>θ</V>
        </>
      }
      d={<V>g</V>}
    />
  </>
);

const DEMOS: Demo[] = [
  {
    nombre: "Caída libre",
    eq: (
      <>
        <V>h</V> = ½<V>g</V>
        <V>t</V>
        <Sup>2</Sup>
      </>
    ),
    resultado: "= 5 · 4² = 80 m",
    W: 56,
    H: 90,
    lanz: { x0: 35, y0: 80, v: 0, angulo: -90 },
    torre: 80,
    reglaX: false,
  },
  {
    nombre: "Lanzamiento horizontal",
    eq: (
      <>
        <V>x</V> = <V>v</V>·<V>t</V>
      </>
    ),
    resultado: "= 20 · 3 = 60 m",
    W: 80,
    H: 55,
    lanz: { x0: 0, y0: 45, v: 20, angulo: 0 },
    torre: 45,
    canasta: 60,
  },
  { nombre: "Tiro parabólico · 37°", eq: ALCANCE, resultado: "= 60 m", W: 80, H: 35, lanz: { x0: 0, y0: 0, v: 25, angulo: 37 }, canasta: 60 },
  { nombre: "Tiro parabólico · 53°", eq: ALCANCE, resultado: "= 60 m: ¡el mismo alcance!", W: 80, H: 35, lanz: { x0: 0, y0: 0, v: 25, angulo: 53 }, canasta: 60 },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5; // pasos con la pelota quieta
const CORRIDA = 19; // pasos que dura la corrida en pantalla (máx. 3 s)

export const heroTiros: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: (
      <EscenaTiro
        key={ciclo}
        W={d.W}
        H={d.H}
        lanz={d.lanz}
        torre={d.torre ?? 0}
        canasta={d.canasta ?? null}
        reglaX={d.reglaX ?? true}
        corrida={k >= ARRANQUE ? { id: ciclo, tFin: d.tFin ?? 99 } : null}
      />
    ),
    pie: (
      <>
        <span className="hero-mag">{d.nombre}</span>
        <span className="hero-eq">
          <span>{d.eq}</span>
          {k >= ARRANQUE + CORRIDA && <span className="hero-res">{d.resultado}</span>}
        </span>
      </>
    ),
    encuadre: { w: 11, h: 7.6 },
    centro: [0, -0.1],
    balanceo: 0.06,
  };
};
