// ══ Hero del Nivel 10: el empujón, la pista que baja, la que sube y la grúa ───────
import type { ReactNode } from "react";
import type { EscenaEnergiaExamen } from "@/contenido/nivel-10/examen";
import { crearEnergia, crearPotencia, crearTrabajo } from "@/contenido/nivel-10/modelo";
import { VistaEnergia } from "@/etapas/nivel-10/vista";
import { Frac, Sup, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  escena: EscenaEnergiaExamen;
  /** Desplazamiento y escala de la escena: la cámara es fija, así que cada una se sube hasta quedar sobre la leyenda. */
  desplaza: [number, number];
  escala: number;
}

const sin: [string, string] = ["", ""];

const DEMOS: Demo[] = [
  {
    nombre: "Trabajo y energía cinética",
    eq: (
      <>
        <V>F</V>·<V>d</V> = ½<V>m</V>
        <V>v</V>
        <Sup>2</Sup>
      </>
    ),
    resultado: "→ 10 m/s",
    escena: { tipo: "trabajo", p: crearTrabajo("h1", 2, 20, 0, 5, 0, 0, sin) },
    desplaza: [0, 0.5],
    escala: 0.9,
  },
  {
    nombre: "Conservación de la energía",
    eq: (
      <>
        <V>m</V>
        <V>g</V>
        <V>h</V> = ½<V>m</V>
        <V>v</V>
        <Sup>2</Sup>
      </>
    ),
    resultado: "5 m → 10 m/s",
    escena: { tipo: "pista", p: crearEnergia("h2", "v", 5, 0, 0, sin) },
    desplaza: [0, 0.35],
    escala: 0.9,
  },
  {
    nombre: "Altura máxima",
    eq: (
      <>
        <V>h</V> ={" "}
        <Frac
          n={
            <>
              <V>v</V>
              <Sup>2</Sup>
            </>
          }
          d={
            <>
              2<V>g</V>
            </>
          }
        />
      </>
    ),
    resultado: "= 20 m",
    escena: { tipo: "pista", p: crearEnergia("h3", "h", 0, 20, 0, sin) },
    desplaza: [0, 0.35],
    escala: 0.9,
  },
  {
    nombre: "Potencia",
    eq: (
      <>
        <V>P</V> ={" "}
        <Frac
          n={
            <>
              <V>m</V>
              <V>g</V>
              <V>h</V>
            </>
          }
          d={<V>t</V>}
        />
      </>
    ),
    resultado: "= 1000 W",
    escena: { tipo: "grua", p: crearPotencia("h4", 50, 8, 4, 1, false, sin) },
    desplaza: [0.3, 0.05],
    escala: 0.85,
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5;
const MUESTRA = 18; // pasos hasta mostrar el resultado

export const heroEnergia: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: (
      <group position={[d.desplaza[0], d.desplaza[1], 0]} scale={d.escala}>
        <VistaEnergia key={ciclo} limpia escena={d.escena} id={`hero-${ciclo}`} corre={k >= ARRANQUE} />
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
