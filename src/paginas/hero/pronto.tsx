// ══ Hero de los niveles que aún no existen: un poliedro que gira con el nombre del tema ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { NIVELES_FISICA } from "@/contenido/curso";
import type { Hero } from "./tipos";

function Poliedro() {
  const g = useRef<THREE.Group>(null!);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1.15, 0), []);
  const aristas = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  useEffect(
    () => () => {
      geo.dispose();
      aristas.dispose();
    },
    [geo, aristas],
  );
  useFrame((_, dt) => {
    g.current.rotation.y += Math.min(dt, 0.05) * 0.35;
    g.current.rotation.x += Math.min(dt, 0.05) * 0.12;
  });
  return (
    <group ref={g}>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#d9c3a0" transparent opacity={0.12} roughness={0.3} depthWrite={false} />
      </mesh>
      <lineSegments geometry={aristas}>
        <lineBasicMaterial color="#d9c3a0" transparent opacity={0.7} />
      </lineSegments>
    </group>
  );
}

export const heroPronto: Hero = (_tick, nivel) => ({
  escena: <Poliedro />,
  pie: (
    <>
      <span className="hero-mag">Nivel {String(nivel + 1).padStart(2, "0")} · pronto</span>
      <span className="hero-eq hero-eq-txt">{NIVELES_FISICA[nivel]}</span>
    </>
  ),
  encuadre: { w: 4.4, h: 4.6 },
  centro: [0, -0.35],
  balanceo: 0.1,
});
