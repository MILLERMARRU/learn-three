// ══ Hero del Nivel 6: rueda en MCU, faja, engranajes y la curva del auto (a꜀ = v²/R) ───────
import type { ReactNode } from "react";
import type { EscenaExamen } from "@/contenido/nivel-06/examen";
import { VistaCircular } from "@/etapas/nivel-06/vista";
import { Frac, Sub, Sup, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  escena: EscenaExamen;
}

const TRANSMISION = (
  <>
    <V>ω</V>
    <Sub>A</Sub>
    <V>R</V>
    <Sub>A</Sub> = <V>ω</V>
    <Sub>B</Sub>
    <V>R</V>
    <Sub>B</Sub>
  </>
);

const DEMOS: Demo[] = [
  {
    nombre: "Velocidad angular",
    eq: (
      <>
        <V>ω</V> = <Frac n={<>2π</>} d={<V>T</V>} />
      </>
    ),
    resultado: "= 2π / 2 s = π rad/s",
    escena: { tipo: "rueda", k: 4, objetivo: 2 * Math.PI, tFin: 2 },
  },
  { nombre: "Poleas con faja", eq: TRANSMISION, resultado: "π · 30 = 2π · 15", escena: { tipo: "poleas", radios: [30, 15], uniones: ["faja"], ks: [4, 8], tFin: 4 } },
  { nombre: "Engranajes", eq: TRANSMISION, resultado: "el chico gira el doble y al revés", escena: { tipo: "poleas", radios: [40, 20], uniones: ["engranaje"], ks: [4, -8], tFin: 4 } },
  {
    nombre: "Aceleración centrípeta",
    eq: (
      <>
        <V>a</V>
        <Sub>c</Sub> ={" "}
        <Frac
          n={
            <>
              <V>v</V>
              <Sup>2</Sup>
            </>
          }
          d={<V>R</V>}
        />
      </>
    ),
    resultado: "= 400 / 40 = 10 m/s²",
    escena: { tipo: "curva", R: 40, aMax: 10, v: 20 },
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5; // pasos con todo quieto
const CORRIDA = 19; // pasos que dura la corrida en pantalla (máx. ~3 s)

export const heroCircular: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: <VistaCircular key={ciclo} limpia escena={d.escena} id={`hero-${ciclo}`} corre={k >= ARRANQUE} />,
    pie: (
      <>
        <span className="hero-mag">{d.nombre}</span>
        <span className="hero-eq">
          <span>{d.eq}</span>
          {k >= ARRANQUE + CORRIDA && <span className="hero-res">{d.resultado}</span>}
        </span>
      </>
    ),
    // más aire abajo: la leyenda va bajo la escena y no debe montarse sobre ella
    encuadre: { w: 11, h: 8.8 },
    centro: [0, -0.7],
    balanceo: 0.06,
  };
};
