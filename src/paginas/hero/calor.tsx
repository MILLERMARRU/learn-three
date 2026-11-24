// ══ Hero del Nivel 15: una barra que se dilata, una placa que calienta agua y mezclas en un calorímetro ───────
import type { ReactNode } from "react";
import type { EscenaCalor } from "@/contenido/nivel-15/examen";
import { crearCalentador, crearDilatacion, crearMezcla } from "@/contenido/nivel-15/modelo";
import { VistaCalor } from "@/etapas/nivel-15/vista";
import { Sub, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  escena: EscenaCalor;
  /** Desplazamiento y escala de la escena: la cámara es fija, así que cada una se ubica sobre la leyenda. */
  desplaza: [number, number];
  escala: number;
}

const sin: [string, string] = ["", ""];

const DEMOS: Demo[] = [
  {
    nombre: "Dilatación térmica",
    eq: (
      <>
        <V>ΔL</V> = <V>L</V>
        <Sub>0</Sub>
        <V>α</V>
        <V>ΔT</V>
      </>
    ),
    resultado: "= 24 mm",
    escena: { tipo: "dilatacion", p: crearDilatacion("h1", "aluminio", 10, 20, 120, true, sin) },
    desplaza: [-0.2, 1.2],
    escala: 0.85,
  },
  {
    nombre: "Calor sensible",
    eq: (
      <>
        <V>Q</V> = <V>m</V>
        <V>c</V>
        <V>ΔT</V>
      </>
    ),
    resultado: "T = 50 °C",
    escena: { tipo: "calentador", p: crearCalentador("h2", "agua", 200, 20, 6000, false, sin) },
    desplaza: [0, 1.1],
    escala: 0.85,
  },
  {
    nombre: "Equilibrio térmico",
    eq: (
      <>
        <V>Q</V>
        <Sub>ganado</Sub> = <V>Q</V>
        <Sub>perdido</Sub>
      </>
    ),
    resultado: "Tₑ = 50 °C",
    escena: { tipo: "mezcla", p: crearMezcla("h3", { sustancia: "agua", m: 100, T: 80 }, { sustancia: "agua", m: 100, T: 20 }, sin) },
    desplaza: [0, 1.1],
    escala: 0.85,
  },
  {
    nombre: "Metal en agua",
    eq: (
      <>
        <V>T</V>
        <Sub>e</Sub> = Σ<V>mcT</V> / Σ<V>mc</V>
      </>
    ),
    resultado: "= 36 °C",
    escena: { tipo: "mezcla", p: crearMezcla("h4", { sustancia: "aluminio", m: 500, T: 100 }, { sustancia: "agua", m: 440, T: 20 }, sin) },
    desplaza: [0, 1.1],
    escala: 0.85,
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5;
const MUESTRA = 20; // pasos hasta mostrar el resultado

export const heroCalor: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: (
      <group position={[d.desplaza[0], d.desplaza[1], 0]} scale={d.escala}>
        <VistaCalor key={ciclo} limpia escena={d.escena} id={`hero-${ciclo}`} corre={k >= ARRANQUE} />
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
