// ══ Hero del Nivel 11: el golpe (impulso), un choque plástico, una explosión y un choque elástico ───────
import type { ReactNode } from "react";
import type { EscenaMomento } from "@/contenido/nivel-11/examen";
import { crearChoque, crearConservacion, crearImpulso } from "@/contenido/nivel-11/modelo";
import { VistaMomento } from "@/etapas/nivel-11/vista";
import { Sub, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  escena: EscenaMomento;
  /** Desplazamiento y escala de la escena: la cámara es fija, así que cada una se sube hasta quedar sobre la leyenda. */
  desplaza: [number, number];
  escala: number;
}

const sin: [string, string] = ["", ""];

const DEMOS: Demo[] = [
  {
    nombre: "Impulso",
    eq: (
      <>
        <V>F</V>·Δ<V>t</V> = Δ<V>p</V>
      </>
    ),
    resultado: "→ 10 m/s",
    escena: { tipo: "golpe", p: crearImpulso("h1", 2, 40, 0.5, 0, "rect", sin) },
    desplaza: [0, 0.3],
    escala: 0.85,
  },
  {
    nombre: "Choque plástico",
    eq: (
      <>
        <V>m</V>
        <Sub>1</Sub>
        <V>v</V>
        <Sub>1</Sub> = (<V>m</V>
        <Sub>1</Sub> + <V>m</V>
        <Sub>2</Sub>)<V>v</V>
      </>
    ),
    resultado: "→ 4 m/s",
    escena: { tipo: "conservacion", p: crearConservacion("h2", "plastico", 2, 1, 6, 0, 0, sin) },
    desplaza: [0, 1],
    escala: 1.15,
  },
  {
    nombre: "Explosión",
    eq: (
      <>
        <V>m</V>
        <Sub>1</Sub>
        <V>v</V>
        <Sub>1</Sub> + <V>m</V>
        <Sub>2</Sub>
        <V>v</V>
        <Sub>2</Sub> = 0
      </>
    ),
    resultado: "→ 6 m/s",
    escena: { tipo: "conservacion", p: crearConservacion("h3", "explosion", 2, 1, 0, 0, -3, sin) },
    desplaza: [0, 1],
    escala: 1.15,
  },
  {
    nombre: "Choque elástico",
    eq: (
      <>
        <V>e</V> = 1
      </>
    ),
    resultado: "intercambian velocidades",
    escena: { tipo: "choque", p: crearChoque("h4", 1, 1, 5, 0, 1, 2, sin) },
    desplaza: [0, 1],
    escala: 1.15,
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5;
const MUESTRA = 18; // pasos hasta mostrar el resultado

export const heroMomento: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: (
      <group position={[d.desplaza[0], d.desplaza[1], 0]} scale={d.escala}>
        <VistaMomento key={ciclo} limpia escena={d.escena} id={`hero-${ciclo}`} corre={k >= ARRANQUE} />
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
