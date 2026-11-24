// ══ Hero del Nivel 14: presión en un tanque, prensa hidráulica y un bloque que flota ───────
import type { ReactNode } from "react";
import type { EscenaFluidos } from "@/contenido/nivel-14/examen";
import { crearFlotacion, crearPrensa, crearPresion } from "@/contenido/nivel-14/modelo";
import { VistaFluidos } from "@/etapas/nivel-14/vista";
import { Frac, Sub, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  escena: EscenaFluidos;
  /** Desplazamiento y escala de la escena: la cámara es fija, así que cada una se ubica sobre la leyenda. */
  desplaza: [number, number];
  escala: number;
}

const sin: [string, string] = ["", ""];

const DEMOS: Demo[] = [
  {
    nombre: "Presión hidrostática",
    eq: (
      <>
        <V>P</V> = <V>ρ</V>
        <V>g</V>
        <V>h</V>
      </>
    ),
    resultado: "= 30 kPa",
    escena: { tipo: "presion", p: crearPresion("h1", "agua", 3, false, sin) },
    desplaza: [0, 1],
    escala: 0.9,
  },
  {
    nombre: "Prensa hidráulica",
    eq: (
      <>
        <Frac
          n={
            <>
              <V>F</V>
              <Sub>1</Sub>
            </>
          }
          d={
            <>
              <V>A</V>
              <Sub>1</Sub>
            </>
          }
        />{" "}
        ={" "}
        <Frac
          n={
            <>
              <V>F</V>
              <Sub>2</Sub>
            </>
          }
          d={
            <>
              <V>A</V>
              <Sub>2</Sub>
            </>
          }
        />
      </>
    ),
    resultado: "F₁ = 200 N",
    escena: { tipo: "prensa", p: crearPrensa("h2", 1000, "m2", 0.01, 0.5, sin) },
    desplaza: [0.6, 1],
    escala: 0.95,
  },
  {
    nombre: "Flotación",
    eq: (
      <>
        <V>h</V> = <V>H</V>
        <Frac
          n={
            <>
              <V>ρ</V>
              <Sub>c</Sub>
            </>
          }
          d={
            <>
              <V>ρ</V>
              <Sub>l</Sub>
            </>
          }
        />
      </>
    ),
    resultado: "h = 12 cm",
    escena: { tipo: "flotacion", p: crearFlotacion("h3", "agua", "madera", 600, 20, sin) },
    desplaza: [0, 0.9],
    escala: 0.9,
  },
  {
    nombre: "Empuje de Arquímedes",
    eq: (
      <>
        <V>E</V> = <V>ρ</V>
        <Sub>l</Sub>
        <V>g</V>
        <V>V</V>
        <Sub>sum</Sub>
      </>
    ),
    resultado: "E = peso",
    escena: { tipo: "flotacion", p: crearFlotacion("h4", "agua", "hielo", 900, 20, sin) },
    desplaza: [0, 0.9],
    escala: 0.9,
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5;
const MUESTRA = 18; // pasos hasta mostrar el resultado

export const heroFluidos: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: (
      <group position={[d.desplaza[0], d.desplaza[1], 0]} scale={d.escala}>
        <VistaFluidos key={ciclo} limpia escena={d.escena} id={`hero-${ciclo}`} corre={k >= ARRANQUE} />
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
