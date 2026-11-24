// ══ Hero del Nivel 12: el resorte, el péndulo y la sombra de un punto que gira (MAS) ───────
import type { ReactNode } from "react";
import type { EscenaOscilacion } from "@/contenido/nivel-12/examen";
import { crearCirculo, crearPendulo, crearResorte } from "@/contenido/nivel-12/modelo";
import { VistaOscilacion } from "@/etapas/nivel-12/vista";
import { Frac, Raiz, Sup, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  escena: EscenaOscilacion;
  /** Desplazamiento y escala de la escena: la cámara es fija, así que cada una se ubica sobre la leyenda. */
  desplaza: [number, number];
  escala: number;
}

const sin: [string, string] = ["", ""];
const raiz = (n: ReactNode, d: ReactNode) => (
  <Raiz>
    <Frac n={n} d={d} />
  </Raiz>
);

const DEMOS: Demo[] = [
  {
    nombre: "Sistema masa-resorte",
    eq: (
      <>
        <V>T</V> = 2π{raiz(<V>m</V>, <V>k</V>)}
      </>
    ),
    resultado: "= 2 s",
    escena: { tipo: "resorte", p: crearResorte("h1", 1, 10, sin) },
    desplaza: [0.7, 0.9],
    escala: 1,
  },
  {
    nombre: "Péndulo simple",
    eq: (
      <>
        <V>T</V> = 2π{raiz(<V>L</V>, <V>g</V>)}
      </>
    ),
    resultado: "= 2 s",
    escena: { tipo: "pendulo", p: crearPendulo("h2", 1, 10, sin) },
    desplaza: [0, -0.4],
    escala: 1.1,
  },
  {
    nombre: "MAS y movimiento circular",
    eq: (
      <>
        <V>v</V> = <V>A</V>
        <V>ω</V>
      </>
    ),
    resultado: "= 2 m/s",
    escena: { tipo: "circulo", p: crearCirculo("h3", "v", 0.5, 4, sin) },
    desplaza: [0, 0.2],
    escala: 0.95,
  },
  {
    nombre: "Aceleración máxima",
    eq: (
      <>
        <V>a</V> = <V>A</V>
        <V>ω</V>
        <Sup>2</Sup>
      </>
    ),
    resultado: "= 18 m/s²",
    escena: { tipo: "circulo", p: crearCirculo("h4", "a", 2, 3, sin) },
    desplaza: [0, 0.2],
    escala: 0.95,
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5;
const MUESTRA = 18; // pasos hasta mostrar el resultado

export const heroOscilaciones: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: (
      <group position={[d.desplaza[0], d.desplaza[1], 0]} scale={d.escala}>
        <VistaOscilacion key={ciclo} limpia escena={d.escena} id={`hero-${ciclo}`} corre={k >= ARRANQUE} />
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
