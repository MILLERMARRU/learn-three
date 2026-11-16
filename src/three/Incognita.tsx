// ══ Vista previa del siguiente ejercicio sin revelar la respuesta: un poliedro translúcido con su nombre ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Etiqueta } from "./Etiqueta";

export function Incognita({ nombre }: { nombre: string }) {
  const m = useRef<THREE.Mesh>(null!);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.9, 0), []);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.35, metalness: 0.1, flatShading: true, transparent: true, opacity: 0.32, emissive: "#d9c3a0", emissiveIntensity: 0.08 }),
    [],
  );
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );
  useFrame((st, dt) => {
    m.current.rotation.y += dt * 0.5;
    m.current.rotation.x = Math.sin(st.clock.elapsedTime * 0.4) * 0.35;
  });
  return (
    <group>
      <mesh ref={m} geometry={geo} material={mat} />
      <Etiqueta position={[0, -1.35, 0]} className="etq-siguiente">
        <span>siguiente</span> {nombre}
      </Etiqueta>
    </group>
  );
}
