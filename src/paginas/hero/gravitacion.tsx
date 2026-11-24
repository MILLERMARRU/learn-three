// ══ Hero del Nivel 9: dos esferas que se atraen, la gravedad en la altura, la tercera ley de Kepler y la velocidad orbital ───────
import type { ReactNode } from "react";
import type { EscenaGravitacion } from "@/contenido/nivel-09/examen";
import { crearAtraccion, crearGravedad, crearOrbita } from "@/contenido/nivel-09/modelo";
import { VistaGravitacion } from "@/etapas/nivel-09/vista";
import { Frac, Raiz, Sub, Sup, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  escena: EscenaGravitacion;
  /** Desplazamiento y escala de la escena: la cámara es fija, así que cada una se sube hasta quedar sobre la leyenda. */
  desplaza: [number, number];
  escala: number;
}

const sin: [string, string] = ["", ""];

const DEMOS: Demo[] = [
  {
    nombre: "Ley de gravitación universal",
    eq: (
      <>
        <V>F</V> = <V>G</V>
        <Frac
          n={
            <>
              <V>m</V>
              <Sub>1</Sub>
              <V>m</V>
              <Sub>2</Sub>
            </>
          }
          d={
            <>
              <V>d</V>
              <Sup>2</Sup>
            </>
          }
        />
      </>
    ),
    resultado: "2d → F/4",
    escena: { tipo: "atraccion", p: crearAtraccion("h1", 40, 1, 1, 2, sin) },
    desplaza: [0, 0.35],
    escala: 1,
  },
  {
    nombre: "Gravedad en la altura",
    eq: (
      <>
        <V>g</V> ={" "}
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
    ),
    resultado: "h = R → g₀/4",
    escena: { tipo: "gravedad", p: crearGravedad("h2", 1, 1, 1, sin) },
    desplaza: [0.3, 0.85],
    escala: 1,
  },
  {
    nombre: "Tercera ley de Kepler",
    eq: (
      <>
        <V>T</V>
        <Sup>2</Sup> ∝ <V>r</V>
        <Sup>3</Sup>
      </>
    ),
    resultado: "4r → 8T",
    escena: { tipo: "orbita", p: crearOrbita("h3", "T", 4, 2, sin) },
    desplaza: [0, 1.4],
    escala: 0.8,
  },
  {
    nombre: "Velocidad orbital",
    eq: (
      <>
        <V>v</V> ={" "}
        <Raiz>
          <Frac
            n={
              <>
                <V>G</V>
                <V>M</V>
              </>
            }
            d={<V>r</V>}
          />
        </Raiz>
      </>
    ),
    resultado: "4R → v/2",
    escena: { tipo: "orbita", p: crearOrbita("h4", "v", 4, 8, sin, { rasante: true }) },
    desplaza: [0, 1.4],
    escala: 0.8,
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5;
const MUESTRA = 18; // pasos hasta mostrar el resultado

export const heroGravitacion: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: (
      <group position={[d.desplaza[0], d.desplaza[1], 0]} scale={d.escala}>
        <VistaGravitacion key={ciclo} limpia escena={d.escena} id={`hero-${ciclo}`} corre={k >= ARRANQUE} />
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
    // más aire abajo: la leyenda va bajo la escena y no debe montarse sobre ella
    encuadre: { w: 10.5, h: 8.4 },
    centro: [0, -0.3],
    balanceo: 0.06,
  };
};
