// ══ Hero del Nivel 18: un circuito con su amperímetro, redes de resistencias y un foco que brilla ───────
import type { ReactNode } from "react";
import type { EscenaCircuitos } from "@/contenido/nivel-18/examen";
import { crearOhm, crearPotenciaE, crearRed } from "@/contenido/nivel-18/modelo";
import { VistaCircuitos } from "@/etapas/nivel-18/vista";
import { Frac, Sub, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  escena: EscenaCircuitos;
  /** Desplazamiento y escala de la escena: la cámara es fija, así que cada una se ubica sobre la leyenda. */
  desplaza: [number, number];
  escala: number;
}

const sin: [string, string] = ["", ""];
const inv = (i?: string) => (
  <Frac
    n="1"
    d={
      <>
        <V>R</V>
        {i && <Sub>{i}</Sub>}
      </>
    }
  />
);

const DEMOS: Demo[] = [
  {
    nombre: "Ley de Ohm",
    eq: (
      <>
        <V>V</V> = <V>I</V>
        <V>R</V>
      </>
    ),
    resultado: "I = 4 A",
    escena: { tipo: "ohm", p: crearOhm("h1", "I", 12, 3, sin) },
    desplaza: [0.2, 1.15],
    escala: 0.8,
  },
  {
    nombre: "Resistencias en paralelo",
    eq: (
      <>
        {inv()} = {inv("1")} + {inv("2")}
      </>
    ),
    resultado: "R = 2 Ω",
    escena: { tipo: "red", p: crearRed("h2", "paralelo", [6, 3], sin) },
    desplaza: [0, 1.25],
    escala: 0.8,
  },
  {
    nombre: "Circuito mixto",
    eq: (
      <>
        <V>R</V> = <V>R</V>
        <Sub>1</Sub> + <V>R</V>
        <Sub>2</Sub> ∥ <V>R</V>
        <Sub>3</Sub>
      </>
    ),
    resultado: "= 7 Ω",
    escena: { tipo: "red", p: crearRed("h3", "mixta", [5, 6, 3], sin) },
    desplaza: [0, 1.25],
    escala: 0.8,
  },
  {
    nombre: "Potencia eléctrica",
    eq: (
      <>
        <V>P</V> = <V>V</V>
        <V>I</V>
      </>
    ),
    resultado: "= 110 W",
    escena: { tipo: "potencia", p: crearPotenciaE("h4", "VI", 220, 0.5, null, sin) },
    desplaza: [0, 1.15],
    escala: 0.8,
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5;
const MUESTRA = 20; // pasos hasta mostrar el resultado

export const heroCircuitos: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: (
      <group position={[d.desplaza[0], d.desplaza[1], 0]} scale={d.escala}>
        <VistaCircuitos key={ciclo} limpia escena={d.escena} id={`hero-${ciclo}`} corre={k >= ARRANQUE} />
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
