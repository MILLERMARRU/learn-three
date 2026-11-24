// ══ Hero del Nivel 21: la onda de radio y la luz visible sobre el espectro, la ley de Malus y el radar ───────
import type { ReactNode } from "react";
import type { EscenaOndasEM } from "@/contenido/nivel-21/examen";
import { crearEspectro, crearPolarizacion, crearRadar } from "@/contenido/nivel-21/modelo";
import { VistaOndasEM } from "@/etapas/nivel-21/vista";
import { Frac, Sub, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  escena: EscenaOndasEM;
  /** Desplazamiento y escala de la escena: la cámara es fija, así que cada una se ubica sobre la leyenda. */
  desplaza: [number, number];
  escala: number;
}

const sin: [string, string] = ["", ""];
const LAMBDA = (
  <>
    <V>λ</V> = <Frac n={<V>c</V>} d={<V>f</V>} />
  </>
);

const DEMOS: Demo[] = [
  {
    nombre: "Ondas de radio",
    eq: LAMBDA,
    resultado: "= 3 m",
    escena: { tipo: "espectro", p: crearEspectro("h1", "lambdaM", 100e6, sin) },
    desplaza: [-0.15, 1.2],
    escala: 0.85,
  },
  {
    nombre: "Luz visible",
    eq: LAMBDA,
    resultado: "= 500 nm",
    escena: { tipo: "espectro", p: crearEspectro("h2", "lambdaNm", 6e14, sin) },
    desplaza: [-0.15, 1.2],
    escala: 0.85,
  },
  {
    nombre: "Ley de Malus",
    eq: (
      <>
        <V>I</V> = <V>I</V>
        <Sub>0</Sub> cos² <V>θ</V>
      </>
    ),
    resultado: "= 20 W/m²",
    escena: { tipo: "polarizacion", p: crearPolarizacion("h3", 80, 60, false, sin) },
    desplaza: [-0.35, 1.2],
    escala: 0.85,
  },
  {
    nombre: "Radar",
    eq: (
      <>
        <V>d</V> ={" "}
        <Frac
          n={
            <>
              <V>c</V>
              <V>t</V>
            </>
          }
          d="2"
        />
      </>
    ),
    resultado: "= 30 km",
    escena: { tipo: "radar", p: crearRadar("h4", "dKm", 200e-6, sin) },
    desplaza: [-0.1, 1.2],
    escala: 0.85,
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5;
const MUESTRA = 20; // pasos hasta mostrar el resultado

export const heroOndasEM: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: (
      <group position={[d.desplaza[0], d.desplaza[1], 0]} scale={d.escala}>
        <VistaOndasEM key={ciclo} limpia escena={d.escena} id={`hero-${ciclo}`} corre={k >= ARRANQUE} />
      </group>
    ),
    pie: (
      <>
        <span className="hero-mag">{d.nombre}</span>
        <span className="hero-eq">
          <span>{d.eq}</span>
          {k >= ARRANQUE + MUESTRA && <span className="hero-res">{d.resultado}</span>}
        </span>
      </>
    ),
    // cámara fija: el Escenario solo la recalcula al cambiar de hero
    encuadre: { w: 10.5, h: 8.4 },
    centro: [0, -0.3],
    balanceo: 0.06,
  };
};
