// ══ Utilidades compartidas por las escenas de laboratorio ───────
import { useEffect, useMemo } from "react";
import * as THREE from "three";

export const G = 9.8;

export function useMat(params: THREE.MeshStandardMaterialParameters) {
  // los parámetros solo se leen al crear el material
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const m = useMemo(() => new THREE.MeshStandardMaterial(params), []);
  useEffect(() => () => m.dispose(), [m]);
  return m;
}

export const COLORES = {
  metal: { color: "#555b66", metalness: 0.5, roughness: 0.34 },
  oscuro: { color: "#2a2f37", metalness: 0.35, roughness: 0.45 },
  acento: { color: "#d9c3a0", metalness: 0.55, roughness: 0.28, emissive: "#d9c3a0", emissiveIntensity: 0.06 },
  hilo: { color: "#b8c0ca", metalness: 0.1, roughness: 0.6 },
} satisfies Record<string, THREE.MeshStandardMaterialParameters>;

export const fmt = (n: number, d = 2) => n.toFixed(d).replace(".", ",");
