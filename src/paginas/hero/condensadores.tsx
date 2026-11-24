// ══ Hero del Nivel 19: un condensador que se carga, asociaciones en serie y en paralelo, y una descarga que destella ───────
import type { ReactNode } from "react";
import type { EscenaCondensadores } from "@/contenido/nivel-19/examen";
import { crearAsociacion, crearCarga, crearEnergiaC } from "@/contenido/nivel-19/modelo";
import { VistaCondensadores } from "@/etapas/nivel-19/vista";
import { Frac, Sub, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  escena: EscenaCondensadores;
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
        <V>C</V>
        {i && <Sub>{i}</Sub>}
      </>
    }
  />
);

const DEMOS: Demo[] = [
  {
    nombre: "Carga de un condensador",
    eq: (
      <>
        <V>Q</V> = <V>κ</V>
        <V>C</V>
        <V>V</V>
      </>
    ),
    resultado: "= 72 μC",
    escena: { tipo: "carga", p: crearCarga("h1", 2, 12, 3, sin) },
    desplaza: [-0.2, 1.25],
    escala: 0.8,
  },
  {
    nombre: "Condensadores en paralelo",
    eq: (
      <>
        <V>C</V> = <V>C</V>
        <Sub>1</Sub> + <V>C</V>
        <Sub>2</Sub>
      </>
    ),
    resultado: "= 10 μF",
    escena: { tipo: "asociacion", p: crearAsociacion("h2", "paralelo", [4, 6], sin) },
    desplaza: [0, 1.25],
    escala: 0.8,
  },
  {
    nombre: "Condensadores en serie",
    eq: (
      <>
        {inv()} = {inv("1")} + {inv("2")}
      </>
    ),
    resultado: "C = 2 μF",
    escena: { tipo: "asociacion", p: crearAsociacion("h3", "serie", [6, 3], sin) },
    desplaza: [0, 1.25],
    escala: 0.8,
  },
  {
    nombre: "Energía almacenada",
    eq: (
      <>
        <V>U</V> = <Frac n="1" d="2" />
        <V>C</V>
        <V>V</V>
        <sup>2</sup>
      </>
    ),
    resultado: "= 30 mJ",
    escena: { tipo: "energia", p: crearEnergiaC("h4", "CV", 6, 100, sin) },
    desplaza: [-0.1, 1.15],
    escala: 0.8,
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5;
const MUESTRA = 20; // pasos hasta mostrar el resultado

export const heroCondensadores: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: (
      <group position={[d.desplaza[0], d.desplaza[1], 0]} scale={d.escala}>
        <VistaCondensadores key={ciclo} limpia escena={d.escena} id={`hero-${ciclo}`} corre={k >= ARRANQUE} />
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
