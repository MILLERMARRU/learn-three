// ══ Hero 3D del inicio: muestra el tema del nivel elegido en el carrusel (un solo Canvas para todos) ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Escenario } from "@/three/Escenario";
import { NIVELES_FISICA } from "@/contenido/curso";
import { heroDimensional } from "./dimensional";
import { heroPronto } from "./pronto";
import { PASO_MS, type Hero } from "./tipos";

/**
 * Hero de cada nivel (clave = número de nivel). El del nivel 1 viene en el inicio; los demás se descargan al elegirlos
 * (cada uno trae sus escenas 3D): así el chunk principal no crece con cada nivel nuevo.
 */
const CARGAR: Record<number, () => Promise<Hero>> = {
  2: () => import("./vectorial").then((m) => m.heroVectorial),
  3: () => import("./cinematica").then((m) => m.heroCinematica),
  4: () => import("./tiros").then((m) => m.heroTiros),
  5: () => import("./graficas").then((m) => m.heroGraficas),
  6: () => import("./circular").then((m) => m.heroCircular),
  7: () => import("./estatica").then((m) => m.heroEstatica),
  8: () => import("./dinamica").then((m) => m.heroDinamica),
  9: () => import("./gravitacion").then((m) => m.heroGravitacion),
  10: () => import("./energia").then((m) => m.heroEnergia),
  11: () => import("./momento").then((m) => m.heroMomento),
  12: () => import("./oscilaciones").then((m) => m.heroOscilaciones),
};

/** Mientras se descarga el hero: el nombre del tema, sin escena. */
const heroCargando: Hero = (_tick, nivel) => ({ escena: null, pie: <span className="hero-mag">{NIVELES_FISICA[nivel]}</span>, encuadre: { w: 9, h: 7 } });

export function HeroNivel({ nivel }: { nivel: number }) {
  const n = nivel + 1;
  const [cargados, setCargados] = useState<Record<number, Hero>>({ 1: heroDimensional });
  // descarga el del nivel elegido y precarga los vecinos, para que pasar al siguiente sea instantáneo
  useEffect(() => {
    let vivo = true;
    for (const k of [n, n + 1, n - 1]) {
      const cargar = CARGAR[k];
      if (!cargar) continue;
      cargar().then((h) => {
        if (vivo) setCargados((c) => (c[k] ? c : { ...c, [k]: h }));
      });
    }
    return () => {
      vivo = false;
    };
  }, [n]);
  const disponible = n === 1 || !!CARGAR[n];
  const hero = cargados[n] ?? (disponible ? heroCargando : heroPronto);
  const tipo = cargados[n] ? `n${n}` : disponible ? `cargando-${n}` : "pronto";

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
