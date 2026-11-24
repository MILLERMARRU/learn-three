// ══ Medidor analógico sin números (Nivel 18): esfera, aguja y la marca azul de la propuesta ───────
// La aguja se gira desde fuera (ref) para no re-renderizar cada cuadro.
import { forwardRef, useEffect, useMemo } from "react";
import * as THREE from "three";

const ANG0 = (5 * Math.PI) / 4; // cero abajo a la izquierda
const ANG1 = -Math.PI / 4; // fondo de escala abajo a la derecha

/** Ángulo de la aguja para un valor en una escala dada. */
export const anguloMedidor = (v: number, escala: number) => ANG0 + (ANG1 - ANG0) * Math.min(1, Math.max(0, v / escala));

interface Props {
  position: [number, number, number];
  radio?: number;
  escala: number;
  /** Valor propuesto (null = sin marca). */
  propuesta: number | null;
}

/** La ref apunta al grupo de la aguja (se rota en z). */
export const Medidor = forwardRef<THREE.Group, Props>(function Medidor({ position, radio = 0.5, escala, propuesta }, aguja) {
  const geo = useMemo(
    () => ({
      dial: new THREE.CircleGeometry(radio, 48),
      aro: new THREE.TorusGeometry(radio, 0.03, 8, 64),
      arco: new THREE.TorusGeometry(radio * 0.82, 0.012, 6, 64, (3 * Math.PI) / 2).rotateZ(-Math.PI / 4),
      aguja: new THREE.BoxGeometry(radio * 0.75, 0.035, 0.02).translate((radio * 0.75) / 2, 0, 0),
      marca: new THREE.BoxGeometry(0.14, 0.045, 0.02).translate(radio * 0.78, 0, 0),
      eje: new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16).rotateX(Math.PI / 2),
    }),
    [radio],
  );
  const mats = useMemo(
    () => ({
      dial: new THREE.MeshStandardMaterial({ color: "#1b2129" }),
      aro: new THREE.MeshStandardMaterial({ color: "#8a929d", metalness: 0.4, roughness: 0.4 }),
      arco: new THREE.MeshStandardMaterial({ color: "#5d6673" }),
      aguja: new THREE.MeshStandardMaterial({ color: "#ff8a5c", emissive: "#ff8a5c", emissiveIntensity: 0.3 }),
      marca: new THREE.MeshStandardMaterial({ color: "#86b2ff", emissive: "#86b2ff", emissiveIntensity: 0.5 }),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );
  return (
    <group position={position}>
      <mesh geometry={geo.dial} material={mats.dial} />
      <mesh geometry={geo.aro} material={mats.aro} />
      <mesh geometry={geo.arco} material={mats.arco} position={[0, 0, 0.01]} />
      {propuesta !== null && <mesh geometry={geo.marca} material={mats.marca} position={[0, 0, 0.02]} rotation={[0, 0, anguloMedidor(propuesta, escala)]} />}
      <group ref={aguja} position={[0, 0, 0.04]} rotation={[0, 0, anguloMedidor(0, escala)]}>
        <mesh geometry={geo.aguja} material={mats.aguja} />
      </group>
      <mesh geometry={geo.eje} material={mats.aro} position={[0, 0, 0.05]} />
    </group>
  );
});
