// ══ Cinta delgada para dibujar una cuerda cuyo perfil y(x) cambia en cada cuadro (ondas y pulsos) ───────
import * as THREE from "three";

/** Geometría de n puntos (2 filas de vértices) lista para escribir un perfil. */
export function crearCinta(n: number): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 2 * 3), 3));
  const idx: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  g.setIndex(idx);
  return g;
}

/** Escribe y = fy(x) entre x0 y x1 (con un grosor vertical) en la profundidad z. */
export function escribirCinta(g: THREE.BufferGeometry, x0: number, x1: number, fy: (x: number) => number, z: number, grosor: number) {
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  const n = pos.count / 2;
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * i) / (n - 1);
    const y = fy(x);
    pos.setXYZ(i * 2, x, y + grosor, z);
    pos.setXYZ(i * 2 + 1, x, y - grosor, z);
  }
  pos.needsUpdate = true;
  g.computeBoundingSphere();
}
