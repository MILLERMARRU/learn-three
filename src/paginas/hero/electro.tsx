// ══ Hero del Nivel 17: la fuerza entre dos cargas, el campo en un punto y el potencial con sus anillos ───────
import type { ReactNode } from "react";
import type { EscenaElectro } from "@/contenido/nivel-17/examen";
import { crearCampo, crearCoulomb, crearPotencial, crearTrabajoElectrico } from "@/contenido/nivel-17/modelo";
import { VistaElectro } from "@/etapas/nivel-17/vista";
import { Frac, Sub, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  escena: EscenaElectro;
  /** Desplazamiento y escala de la escena: la cámara es fija, así que cada una se ubica sobre la leyenda. */
  desplaza: [number, number];
  escala: number;
}

const sin: [string, string] = ["", ""];
const d2 = (
  <>
    <V>d</V>
    <sup>2</sup>
  </>
);

const DEMOS: Demo[] = [
  {
    nombre: "Ley de Coulomb",
    eq: (
      <>
        <V>F</V> ={" "}
        <Frac
          n={
            <>
              <V>k</V>
              <V>q</V>
              <Sub>1</Sub>
              <V>q</V>
              <Sub>2</Sub>
            </>
          }
          d={d2}
        />
      </>
    ),
    resultado: "F = 27 N",
    escena: { tipo: "coulomb", p: crearCoulomb("h1", 6, -5, 10, sin) },
    desplaza: [0, 1.2],
    escala: 0.75,
  },
  {
    nombre: "Campo eléctrico",
    eq: (
      <>
        <V>E</V> ={" "}
        <Frac
          n={
            <>
              <V>k</V>
              <V>Q</V>
            </>
          }
          d={d2}
        />
      </>
    ),
    resultado: "= 4·10⁵ N/C",
    escena: { tipo: "campo", p: crearCampo("h2", [{ q: 4, d: 30 }], sin) },
    desplaza: [0, 1.3],
    escala: 0.8,
  },
  {
    nombre: "Potencial eléctrico",
    eq: (
      <>
        <V>V</V> ={" "}
        <Frac
          n={
            <>
              <V>k</V>
              <V>Q</V>
            </>
          }
          d={<V>d</V>}
        />
      </>
    ),
    resultado: "= 60 kV",
    escena: { tipo: "potencial", p: crearPotencial("h3", 4, 0.6, sin) },
    desplaza: [-0.2, 1.1],
    escala: 0.75,
  },
  {
    nombre: "Trabajo eléctrico",
    eq: (
      <>
        <V>W</V> = <V>q</V>
        <V>ΔV</V>
      </>
    ),
    resultado: "= 40 mJ",
    escena: { tipo: "potencial", p: crearTrabajoElectrico("h4", 2, 0.3, 0.9, 1, sin) },
    desplaza: [-0.2, 1.1],
    escala: 0.75,
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5;
const MUESTRA = 20; // pasos hasta mostrar el resultado

export const heroElectro: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: (
      <group position={[d.desplaza[0], d.desplaza[1], 0]} scale={d.escala}>
        <VistaElectro key={ciclo} limpia escena={d.escena} id={`hero-${ciclo}`} corre={k >= ARRANQUE} />
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
