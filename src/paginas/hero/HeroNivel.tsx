// ══ Hero 3D del inicio: muestra el tema del nivel elegido en el carrusel (un solo Canvas para todos) ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Escenario } from "@/three/Escenario";
import { heroCinematica } from "./cinematica";
import { heroCircular } from "./circular";
import { heroDimensional } from "./dimensional";
import { heroDinamica } from "./dinamica";
import { heroEstatica } from "./estatica";
import { heroGraficas } from "./graficas";
import { heroPronto } from "./pronto";
import { heroTiros } from "./tiros";
import { PASO_MS, type Hero } from "./tipos";
import { heroVectorial } from "./vectorial";

/** Hero de cada nivel (clave = número de nivel). Los que no estén usan el de "pronto". */
const HEROES: Record<number, Hero> = { 1: heroDimensional, 2: heroVectorial, 3: heroCinematica, 4: heroTiros, 5: heroGraficas, 6: heroCircular, 7: heroEstatica, 8: heroDinamica };

export function HeroNivel({ nivel }: { nivel: number }) {
  const hero = HEROES[nivel + 1] ?? heroPronto;
  const tipo = HEROES[nivel + 1] ? `n${nivel + 1}` : "pronto";

  // reloj que vuelve a 0 cada vez que cambia el tipo de hero
  const tipoActual = useRef(tipo);
  const [reloj, setReloj] = useState({ tipo, tick: 0 });
  useEffect(() => {
    tipoActual.current = tipo;
  }, [tipo]);
  useEffect(() => {
    const id = window.setInterval(() => setReloj((r) => (r.tipo === tipoActual.current ? { tipo: r.tipo, tick: r.tick + 1 } : { tipo: tipoActual.current, tick: 0 })), PASO_MS);
    return () => window.clearInterval(id);
  }, []);
  const tick = reloj.tipo === tipo ? reloj.tick : 0;

  const v = hero(tick, nivel);
  return (
    <div className="hero-3d">
      <Escenario encuadre={v.encuadre} balanceo={v.balanceo ?? 0.14} centro={v.centro ?? [0, 0]} vista={tipo}>
        <Aparecer key={tipo}>{v.escena}</Aparecer>
      </Escenario>
      <div className="hero-tecleo" key={tipo}>
        {v.pie}
      </div>
    </div>
  );
}

/** La escena nueva crece desde el centro al cambiar de nivel. */
function Aparecer({ children }: { children: ReactNode }) {
  const g = useRef<THREE.Group>(null!);
  const esc = useRef(0.001);
  useFrame((_, dt) => {
    esc.current = THREE.MathUtils.damp(esc.current, 1, 5, Math.min(dt, 0.05));
    g.current.scale.setScalar(esc.current);
  });
  return (
    <group ref={g} scale={0.001}>
      {children}
    </group>
  );
}
