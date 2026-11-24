// ══ Hero del Nivel 20: un cable que sale del imán, el campo de un cable recto y la inducción ───────
import type { ReactNode } from "react";
import type { EscenaMagnetismo } from "@/contenido/nivel-20/examen";
import { crearBarra, crearBobina, crearCampoRecto, crearConductor } from "@/contenido/nivel-20/modelo";
import { VistaMagnetismo } from "@/etapas/nivel-20/vista";
import { Frac, Sub, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  escena: EscenaMagnetismo;
  /** Desplazamiento y escala de la escena: la cámara es fija, así que cada una se ubica sobre la leyenda. */
  desplaza: [number, number];
  escala: number;
}

const sin: [string, string] = ["", ""];

const DEMOS: Demo[] = [
  {
    nombre: "Fuerza sobre un conductor",
    eq: (
      <>
        <V>F</V> = <V>B</V>
        <V>I</V>
        <V>L</V>
      </>
    ),
    resultado: "= 50 mN",
    escena: { tipo: "conductor", p: crearConductor("h1", 0.4, 2.5, 0.05, 90, false, sin) },
    desplaza: [-0.2, 1.1],
    escala: 0.8,
  },
  {
    nombre: "Campo de un cable recto",
    eq: (
      <>
        <V>B</V> ={" "}
        <Frac
          n={
            <>
              <V>μ</V>
              <Sub>0</Sub>
              <V>I</V>
            </>
          }
          d={
            <>
              2π<V>d</V>
            </>
          }
        />
      </>
    ),
    resultado: "= 20 μT",
    escena: { tipo: "campo", p: crearCampoRecto("h2", [{ I: 10, sentido: 1 }], 10, sin) },
    desplaza: [-0.1, 1.2],
    escala: 0.75,
  },
  {
    nombre: "Fem por movimiento",
    eq: (
      <>
        <V>ε</V> = <V>B</V>
        <V>L</V>
        <V>v</V>
      </>
    ),
    resultado: "= 10 V",
    escena: { tipo: "induccion", p: crearBarra("h3", 0.5, 2, 10, false, sin) },
    desplaza: [0, 1.25],
    escala: 0.8,
  },
  {
    nombre: "Ley de Faraday",
    eq: (
      <>
        <V>ε</V> = <V>N</V>
        <Frac n={<V>ΔΦ</V>} d={<V>Δt</V>} />
      </>
    ),
    resultado: "= 20 V",
    escena: { tipo: "induccion", p: crearBobina("h4", 400, 0.01, 0.5, 0.1, sin) },
    desplaza: [0, 1.25],
    escala: 0.8,
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5;
const MUESTRA = 20; // pasos hasta mostrar el resultado

export const heroMagnetismo: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: (
      <group position={[d.desplaza[0], d.desplaza[1], 0]} scale={d.escala}>
        <VistaMagnetismo key={ciclo} limpia escena={d.escena} id={`hero-${ciclo}`} corre={k >= ARRANQUE} />
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
