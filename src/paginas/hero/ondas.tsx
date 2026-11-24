// ══ Hero del Nivel 13: una onda viajera, un pulso en una cuerda tensa y ondas estacionarias ───────
import type { ReactNode } from "react";
import type { EscenaOndas } from "@/contenido/nivel-13/examen";
import { crearEstacionaria, crearOnda, crearPulso } from "@/contenido/nivel-13/modelo";
import { VistaOndas } from "@/etapas/nivel-13/vista";
import { Frac, Raiz, Sub, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  escena: EscenaOndas;
  /** Desplazamiento y escala de la escena: la cámara es fija, así que cada una se ubica sobre la leyenda. */
  desplaza: [number, number];
  escala: number;
}

const sin: [string, string] = ["", ""];

const DEMOS: Demo[] = [
  {
    nombre: "Ondas viajeras",
    eq: (
      <>
        <V>v</V> = <V>λ</V>
        <V>f</V>
      </>
    ),
    resultado: "= 20 m/s",
    escena: { tipo: "onda", p: crearOnda("h1", "v", { lambda: 4, f: 5 }, sin) },
    desplaza: [0, 0.9],
    escala: 1,
  },
  {
    nombre: "Pulso en una cuerda",
    eq: (
      <>
        <V>v</V> ={" "}
        <Raiz>
          <Frac n={<V>T</V>} d={<V>μ</V>} />
        </Raiz>
      </>
    ),
    resultado: "= 30 m/s",
    escena: { tipo: "pulso", p: crearPulso("h2", 90, 0.1, sin) },
    desplaza: [0, 0.7],
    escala: 1,
  },
  {
    nombre: "Onda estacionaria",
    eq: (
      <>
        <V>f</V>
        <Sub>n</Sub> = <V>n</V>
        <Frac
          n={<V>v</V>}
          d={
            <>
              2<V>L</V>
            </>
          }
        />
      </>
    ),
    resultado: "f₃ = 30 Hz",
    escena: { tipo: "estacionaria", p: crearEstacionaria("h3", "f", 3, 2, 40, sin) },
    desplaza: [0, 0.8],
    escala: 1,
  },
  {
    nombre: "Modo fundamental",
    eq: (
      <>
        <V>λ</V>
        <Sub>1</Sub> = 2<V>L</V>
      </>
    ),
    resultado: "f₁ = 10 Hz",
    escena: { tipo: "estacionaria", p: crearEstacionaria("h4", "f", 1, 2, 40, sin) },
    desplaza: [0, 0.8],
    escala: 1,
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5;
const MUESTRA = 18; // pasos hasta mostrar el resultado

export const heroOndas: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: (
      <group position={[d.desplaza[0], d.desplaza[1], 0]} scale={d.escala}>
        <VistaOndas key={ciclo} limpia escena={d.escena} id={`hero-${ciclo}`} corre={k >= ARRANQUE} />
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
