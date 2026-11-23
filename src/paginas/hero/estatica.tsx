// ══ Hero del Nivel 7: la lámpara con dos cuerdas, el plano inclinado, el aparejo de poleas y el balancín ───────
import type { ReactNode } from "react";
import type { EscenaEstatica } from "@/contenido/nivel-07/examen";
import { crearAparejo, crearEquilibrio, crearMomento } from "@/contenido/nivel-07/modelo";
import { VistaEstatica } from "@/etapas/nivel-07/vista";
import { Frac, Sub, Sup, V } from "@/ui/Formula";
import type { Hero } from "./tipos";

interface Demo {
  nombre: string;
  eq: ReactNode;
  resultado: string;
  escena: EscenaEstatica;
}

const sin: [string, string] = ["", ""];

const DEMOS: Demo[] = [
  {
    nombre: "Primera condición de equilibrio",
    eq: (
      <>
        Σ<V>F</V> = 0
      </>
    ),
    resultado: "T₁ = 30 N · T₂ = 40 N",
    escena: { tipo: "fuerzas", p: crearEquilibrio("h1", "cuerdas", { W: 50, angulo: 37, angulo2: 53 }, "T1", sin) },
  },
  {
    nombre: "Plano inclinado",
    eq: (
      <>
        <V>T</V> = <V>W</V> sen <V>θ</V>
      </>
    ),
    resultado: "= 100 · 0,6 = 60 N",
    escena: { tipo: "fuerzas", p: crearEquilibrio("h2", "plano", { W: 100, angulo: 37 }, "T", sin) },
  },
  {
    nombre: "Poleas móviles",
    eq: (
      <>
        <V>F</V> ={" "}
        <Frac
          n={<V>W</V>}
          d={
            <>
              2
              <Sup>
                <V>n</V>
              </Sup>
            </>
          }
        />
      </>
    ),
    resultado: "= 200 / 4 = 50 N",
    escena: { tipo: "poleas", p: crearAparejo("h3", 2, 200, 0, sin) },
  },
  {
    nombre: "Momento de una fuerza",
    eq: (
      <>
        <V>F</V>
        <Sub>1</Sub>
        <V>d</V>
        <Sub>1</Sub> = <V>F</V>
        <Sub>2</Sub>
        <V>d</V>
        <Sub>2</Sub>
      </>
    ),
    resultado: "60 · 2 = 40 · 3",
    escena: { tipo: "palanca", p: crearMomento("h4", { tipo: "fuerza", pivote: 0, pesas: [{ x: -2, W: 60 }], fuerzaX: 3 }, sin) },
  },
];

const DUR = 38; // ≈ 6,5 s por demostración
const ARRANQUE = 5;
const MUESTRA = 14; // pasos hasta mostrar el resultado

export const heroEstatica: Hero = (tick) => {
  const ciclo = Math.floor(tick / DUR);
  const d = DEMOS[ciclo % DEMOS.length];
  const k = tick % DUR;
  return {
    escena: <VistaEstatica key={ciclo} limpia escena={d.escena} id={`hero-${ciclo}`} corre={k >= ARRANQUE} />,
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
    centro: [0, -0.2],
    balanceo: 0.06,
  };
};
