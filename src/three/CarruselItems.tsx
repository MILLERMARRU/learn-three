// ══ Carrusel 3D de ejercicios: el siguiente espera pequeño a la derecha y entra al centro al acertar ───────
import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";

export type Rol = "actual" | "siguiente" | "anterior";

export interface ItemCarrusel<T> {
  item: T;
  r: number;
  clave: string;
}

interface Props<T> {
  /** Todos los ejercicios de la etapa (motor.todos). */
  items: ItemCarrusel<T>[];
  /** Posición del ejercicio actual (motor.indiceGlobal). */
  indice: number;
  render: (t: T, rol: Rol, r: number) => ReactNode;
  /** Separación entre ejercicios (unidades 3D). */
  paso?: number;
  /** Escala del ejercicio que espera a la derecha. */
  escala?: number;
}

export function CarruselItems<T>({ items, indice, render, paso = 6, escala = 0.42 }: Props<T>) {
  return (
    <>
      {items.map((it, i) => {
        const off = i - indice;
        if (off < -1 || off > 1) return null;
        return (
          <Ranura key={it.clave} off={off} paso={paso} escala={escala}>
            {render(it.item, off === 0 ? "actual" : off > 0 ? "siguiente" : "anterior", it.r)}
          </Ranura>
        );
      })}
    </>
  );
}

function Ranura({ off, paso, escala, children }: { off: number; paso: number; escala: number; children: ReactNode }) {
  const g = useRef<THREE.Group>(null!);
  const s = useRef({ init: false, esc: 0 });
  useFrame((_, dtCrudo) => {
    const dt = Math.min(0.05, dtCrudo);
    const S = s.current;
    // actual: centro y tamaño completo · siguiente: a la derecha, chico y al fondo · anterior: sale por la izquierda
    const x = off * paso;
    const y = off === 0 ? 0 : -0.35;
    const z = off === 0 ? 0 : -3;
    const esc = off === 0 ? 1 : off > 0 ? escala : 0.001;
    if (!S.init) {
      S.init = true;
      // la que aparece por primera vez entra desde más a la derecha
      g.current.position.set(x + (off >= 0 ? paso * 0.7 : 0), y, z);
      S.esc = off === 0 ? 1 : 0.001;
    }
    const p = g.current.position;
    p.x = THREE.MathUtils.damp(p.x, x, 4, dt);
    p.y = THREE.MathUtils.damp(p.y, y, 4, dt);
    p.z = THREE.MathUtils.damp(p.z, z, 4, dt);
    S.esc = THREE.MathUtils.damp(S.esc, esc, off < 0 ? 6 : 4, dt);
    g.current.scale.setScalar(Math.max(0.001, S.esc));
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, off === 0 ? 0 : -0.45 * Math.sign(off), 4, dt);
    g.current.visible = S.esc > 0.01;
  });
  return <group ref={g}>{children}</group>;
}
