// ══ Flecha 3D (vector) que se estira y gira con suavidad entre dos puntos del plano ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import type { Vec } from "@/lib/vec";
import { Etiqueta } from "../Etiqueta";

let GEO: { tallo: THREE.BufferGeometry; punta: THREE.BufferGeometry; base: THREE.BufferGeometry } | null = null;
function geos() {
  if (!GEO) {
    GEO = {
      tallo: new THREE.CylinderGeometry(0.055, 0.055, 1, 16),
      punta: new THREE.ConeGeometry(0.16, 0.38, 24),
      base: new THREE.SphereGeometry(0.09, 16, 12),
    };
  }
  return GEO;
}

export interface FlechaProps {
  desde?: Vec;
  hasta: Vec;
  color: string;
  variante?: "solida" | "fantasma";
  grosor?: number;
  etiqueta?: ReactNode;
  brillo?: number;
  z?: number;
}

export function Flecha({ desde = [0, 0], hasta, color, variante = "solida", grosor = 1, etiqueta, brillo = 0.12, z = 0 }: FlechaProps) {
  const g = useRef<THREE.Group>(null!);
  const tallo = useRef<THREE.Mesh>(null!);
  const punta = useRef<THREE.Mesh>(null!);
  const etq = useRef<THREE.Group>(null!);
  const fantasma = variante === "fantasma";
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.32,
        metalness: 0.08,
        transparent: fantasma,
        opacity: fantasma ? 0.24 : 1,
        depthWrite: !fantasma,
        emissive: color,
        emissiveIntensity: fantasma ? 0 : brillo,
      }),
    [color, fantasma, brillo],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  const s = useRef({ x0: desde[0], y0: desde[1], x1: desde[0], y1: desde[1] });
  const geo = geos();

  useFrame((_, dtCrudo) => {
    const dt = Math.min(0.05, dtCrudo);
    const S = s.current;
    S.x0 = THREE.MathUtils.damp(S.x0, desde[0], 10, dt);
    S.y0 = THREE.MathUtils.damp(S.y0, desde[1], 10, dt);
    S.x1 = THREE.MathUtils.damp(S.x1, hasta[0], 10, dt);
    S.y1 = THREE.MathUtils.damp(S.y1, hasta[1], 10, dt);
    const dx = S.x1 - S.x0;
    const dy = S.y1 - S.y0;
    const L = Math.hypot(dx, dy);
    const cab = Math.min(0.38 * grosor, L * 0.45);
    g.current.position.set(S.x0, S.y0, z);
    g.current.rotation.z = Math.atan2(dy, dx) - Math.PI / 2;
    tallo.current.scale.set(grosor, Math.max(0.001, L - cab), grosor);
    tallo.current.position.y = (L - cab) / 2;
    punta.current.scale.set(grosor, cab / 0.38, grosor);
    punta.current.position.y = L - cab / 2;
    g.current.visible = L > 0.04;
    if (etq.current) {
      // la etiqueta va un poco más allá de la punta
      const ux = L > 0.01 ? dx / L : 0;
      const uy = L > 0.01 ? dy / L : 1;
      etq.current.position.set(S.x1 + ux * 0.45 - uy * 0.25, S.y1 + uy * 0.45 + ux * 0.25, z);
      etq.current.visible = L > 0.04;
    }
  });

  return (
    <>
      <group ref={g}>
        <mesh ref={tallo} geometry={geo.tallo} material={mat} />
        <mesh ref={punta} geometry={geo.punta} material={mat} />
        <mesh geometry={geo.base} material={mat} scale={grosor} />
      </group>
      {etiqueta && (
        <group ref={etq}>
          <Etiqueta className="etq-vector">{etiqueta}</Etiqueta>
        </group>
      )}
    </>
  );
}
