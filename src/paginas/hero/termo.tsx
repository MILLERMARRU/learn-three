// ══ Hero del Nivel 16: un gas en un cilindro, el trabajo en el diagrama P–V y una máquina térmica ───────
import type { ReactNode } from "react";
import type { EscenaTermo } from "@/contenido/nivel-16/examen";
import { crearGas, crearMaquina, crearTrabajo } from "@/contenido/nivel-16/modelo";
import { VistaTermo } from "@/etapas/nivel-16/vista";
import { Frac, Sub, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  escena: EscenaTermo;
  /** Desplazamiento y escala de la escena: la cámara es fija, así que cada una se ubica sobre la leyenda. */
  desplaza: [number, number];
  escala: number;
}

const sin: [string, string] = ["", ""];

const DEMOS: Demo[] = [
  {
    nombre: "Gases ideales",
    eq: (
      <>
        <Frac
          n={
            <>
              <V>P</V>
              <V>V</V>
            </>
          }
          d={<V>T</V>}
        />{" "}
        = cte
      </>
    ),
    resultado: "V₂ = 30 L",
    escena: { tipo: "gas", p: crearGas("h1", "general", 2, 10, 27, 1, 177, sin) },
    desplaza: [0, 1.25],
    escala: 0.8,
  },
  {
    nombre: "Trabajo de un gas",
    eq: (
      <>
        <V>W</V> = <V>P</V>
        <V>ΔV</V>
      </>
    ),
    resultado: "= 4 kJ",
    escena: { tipo: "trabajo", p: crearTrabajo("h2", "kPa-m3", 200, 0.01, 0.03, sin) },
    desplaza: [0.25, 1.2],
    escala: 0.8,
  },
  {
    nombre: "Máquina térmica",
    eq: (
      <>
        <V>η</V> ={" "}
        <Frac
          n={<V>W</V>}
          d={
            <>
              <V>Q</V>
              <Sub>1</Sub>
            </>
          }
        />
      </>
    ),
    resultado: "= 40 %",
    escena: { tipo: "maquina", p: crearMaquina("h3", "trabajo", 1000, 400, sin) },
    desplaza: [-0.2, 1.05],
    escala: 0.85,
  },
  {
    nombre: "Ciclo de Carnot",
    eq: (
      <>
        <V>η</V> = 1 −{" "}
        <Frac
          n={
            <>
              <V>T</V>
              <Sub>2</Sub>
            </>
          }
          d={
            <>
              <V>T</V>
              <Sub>1</Sub>
            </>
          }
        />
      </>
    ),
    resultado: "= 50 %",
    escena: { tipo: "maquina", p: crearMaquina("h4", "carnot", 327, 27, sin) },
    desplaza: [-0.2, 1.05],
    escala: 0.85,
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5;
const MUESTRA = 20; // pasos hasta mostrar el resultado

export const heroTermo: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: (
      <group position={[d.desplaza[0], d.desplaza[1], 0]} scale={d.escala}>
        <VistaTermo key={ciclo} limpia escena={d.escena} id={`hero-${ciclo}`} corre={k >= ARRANQUE} />
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
