// ══ Auto 3D estilizado (primitivas): las ruedas giran según cuánto avanza ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

let GEO: Record<string, THREE.BufferGeometry> | null = null;
function geos() {
  if (!GEO) {
    GEO = {
      cuerpo: new RoundedBoxGeometry(0.9, 0.22, 0.44, 3, 0.07),
      cabina: new RoundedBoxGeometry(0.46, 0.2, 0.38, 3, 0.08),
      rueda: new THREE.CylinderGeometry(0.11, 0.11, 0.08, 20),
      faro: new THREE.SphereGeometry(0.045, 12, 8),
    };
  }
  return GEO;
}

const RUEDAS: [number, number][] = [
  [0.29, 0.23],
  [0.29, -0.23],
  [-0.29, 0.23],
  [-0.29, -0.23],
];

export function Auto({ color, brillo = 0 }: { color: string; brillo?: number }) {
  const g = useRef<THREE.Group>(null!);
  const ruedas = useRef<THREE.Group>(null!);
  const prev = useRef<number | null>(null);
  const w = useMemo(() => new THREE.Vector3(), []);
  const mats = useMemo(
    () => ({
      cuerpo: new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.15, emissive: color, emissiveIntensity: 0.06 }),
      cabina: new THREE.MeshStandardMaterial({ color: "#1d2733", roughness: 0.15, metalness: 0.4 }),
      rueda: new THREE.MeshStandardMaterial({ color: "#16191e", roughness: 0.8 }),
      faro: new THREE.MeshStandardMaterial({ color: "#fff6dc", emissive: "#fff2c8", emissiveIntensity: 1.2 }),
      stop: new THREE.MeshStandardMaterial({ color: "#ff5a4a", emissive: "#ff3a2a", emissiveIntensity: 0.8 }),
    }),
    [color],
  );
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);
  const geo = geos();

  useFrame(() => {
    g.current.getWorldPosition(w);
    if (prev.current !== null) {
      const d = w.x - prev.current;
      ruedas.current.children.forEach((r) => (r.rotation.y -= d / 0.11));
    }
    prev.current = w.x;
    mats.cuerpo.emissiveIntensity = 0.06 + brillo;
  });

  return (
    <group ref={g}>
      <mesh geometry={geo.cuerpo} material={mats.cuerpo} position={[0, 0.2, 0]} />
      <mesh geometry={geo.cabina} material={mats.cabina} position={[-0.05, 0.38, 0]} />
      <group ref={ruedas}>
        {RUEDAS.map(([x, z], i) => (
          <group key={i} position={[x, 0.11, z]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh geometry={geo.rueda} material={mats.rueda} />
          </group>
        ))}
      </group>
      <mesh geometry={geo.faro} material={mats.faro} position={[0.45, 0.22, 0.13]} />
      <mesh geometry={geo.faro} material={mats.faro} position={[0.45, 0.22, -0.13]} />
      <mesh geometry={geo.faro} material={mats.stop} position={[-0.45, 0.22, 0.14]} scale={0.8} />
      <mesh geometry={geo.faro} material={mats.stop} position={[-0.45, 0.22, -0.14]} scale={0.8} />
    </group>
  );
}
