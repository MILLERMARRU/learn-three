// ══ Hero del Nivel 8: el bloque empujado, el plano inclinado, la máquina de Atwood y el bloque con pesa colgante ───────
import type { ReactNode } from "react";
import type { EscenaDinamica } from "@/contenido/nivel-08/examen";
import { crearNewton, crearPlanoD, crearSistema } from "@/contenido/nivel-08/modelo";
import { VistaDinamica } from "@/etapas/nivel-08/vista";
import { Frac, Sub, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  escena: EscenaDinamica;
}

const sin: [string, string] = ["", ""];

const DEMOS: Demo[] = [
  {
    nombre: "Segunda ley de Newton",
    eq: (
      <>
        Σ<V>F</V> = <V>m</V>·<V>a</V>
      </>
    ),
    resultado: "40 = 10 · 4",
    escena: { tipo: "bloque", p: crearNewton("h1", 10, 8, 2, 0, sin) },
  },
  {
    nombre: "Plano inclinado",
    eq: (
      <>
        <V>a</V> = <V>g</V> sen <V>θ</V>
      </>
    ),
    // plano liso: la ecuación con rozamiento no cabe en una línea de la leyenda
    resultado: "= 6 m/s²",
    escena: { tipo: "plano", p: crearPlanoD("h2", 37, 0, 5, sin) },
  },
  {
    nombre: "Máquina de Atwood",
    eq: (
      <>
        <V>a</V> ={" "}
        <Frac
          n={
            <>
              (<V>m</V>
              <Sub>1</Sub> − <V>m</V>
              <Sub>2</Sub>)<V>g</V>
            </>
          }
          d={
            <>
              <V>m</V>
              <Sub>1</Sub> + <V>m</V>
              <Sub>2</Sub>
            </>
          }
        />
      </>
    ),
    resultado: "= 2 m/s²",
    escena: { tipo: "sistema", p: crearSistema("h3", "atwood", 6, 4, 0, "a", sin) },
  },
  {
    nombre: "Bloque y pesa colgante",
    eq: (
      <>
        <V>a</V> ={" "}
        <Frac
          n={
            <>
              <V>m</V>
              <Sub>2</Sub>
              <V>g</V>
            </>
          }
          d={
            <>
              <V>m</V>
              <Sub>1</Sub> + <V>m</V>
              <Sub>2</Sub>
            </>
          }
        />
      </>
    ),
    resultado: "= 4 m/s²",
    escena: { tipo: "sistema", p: crearSistema("h4", "mesa", 3, 2, 0, "a", sin) },
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5;
const MUESTRA = 16; // pasos hasta mostrar el resultado

export const heroDinamica: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: <VistaDinamica key={ciclo} limpia escena={d.escena} id={`hero-${ciclo}`} corre={k >= ARRANQUE} />,
    pie: (
      <>
        <span className="hero-mag">{d.nombre}</span>
        <span className="hero-eq">
          <span>{d.eq}</span>
          {k >= ARRANQUE + MUESTRA && <span className="hero-res">{d.resultado}</span>}
        </span>
      </>
    ),
    // más aire abajo: la leyenda va bajo la escena y no debe montarse sobre ella
    encuadre: { w: 10.5, h: 8.4 },
    centro: [0, -0.3],
    balanceo: 0.06,
  };
};
