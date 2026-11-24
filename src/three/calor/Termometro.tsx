// ══ Termómetro sin números (Nivel 15): tubo de vidrio con bulbo, columna roja y la marca azul de la temperatura propuesta ───────
// La columna se mueve desde fuera (ref) para no re-renderizar cada cuadro.
import { forwardRef, useEffect, useMemo } from "react";
import * as THREE from "three";

export const TERMO_ALTO = 2.6; // largo útil del tubo
export const TERMO_ESCALA = 150; // °C a fondo de escala (fijo, para no dar pistas)

/** Altura (desde la base del tubo) de una temperatura. */
export const alturaTermo = (T: number) => (Math.max(0, Math.min(TERMO_ESCALA, T)) / TERMO_ESCALA) * TERMO_ALTO;

interface Props {
  position: [number, number, number];
  /** Temperatura propuesta (null = sin marca) y la inicial con la que arranca la columna. */
  Tpropuesta: number | null;
  T0: number;
}

/** El grupo de la columna se escala en y desde fuera (scale.y = altura). */
export const Termometro = forwardRef<THREE.Mesh, Props>(function Termometro({ position, Tpropuesta, T0 }, columna) {
  const geo = useMemo(
    () => ({
      tubo: new THREE.CylinderGeometry(0.09, 0.09, TERMO_ALTO + 0.2, 20, 1, true),
      bulbo: new THREE.SphereGeometry(0.17, 20, 14),
      // columna de altura 1 con la base en y = 0 (se escala en y)
      columna: new THREE.CylinderGeometry(0.045, 0.045, 1, 12).translate(0, 0.5, 0),
      caja: new THREE.BoxGeometry(1, 1, 1),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      vidrio: new THREE.MeshStandardMaterial({ color: "#c8d6e8", transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }),
      rojo: new THREE.MeshStandardMaterial({ color: "#ff5a4a", emissive: "#ff5a4a", emissiveIntensity: 0.35 }),
      marca: new THREE.MeshStandardMaterial({ color: "#86b2ff", emissive: "#86b2ff", emissiveIntensity: 0.6 }),
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
      <mesh geometry={geo.tubo} material={mats.vidrio} position={[0, TERMO_ALTO / 2, 0]} />
      <mesh geometry={geo.bulbo} material={mats.rojo} position={[0, -0.12, 0]} />
      <mesh ref={columna} geometry={geo.columna} material={mats.rojo} scale={[1, Math.max(0.01, alturaTermo(T0)), 1]} />
      {Tpropuesta !== null && <mesh geometry={geo.caja} material={mats.marca} position={[0, alturaTermo(Tpropuesta), 0.05]} scale={[0.34, 0.03, 0.03]} />}
    </group>
  );
});
