// ══ Etiqueta HTML anclada a un punto 3D (reemplazo mínimo de drei <Html>) ───────
import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import * as THREE from "three";

interface Props {
  position?: [number, number, number];
  children: ReactNode;
  className?: string;
  visible?: boolean;
}

export function Etiqueta({ position = [0, 0, 0], children, className = "", visible = true }: Props) {
  const ancla = useRef<THREE.Group>(null!);
  const { gl, camera, size } = useThree();
  const [el] = useState(() => document.createElement("div"));
  const raiz = useRef<Root | null>(null);
  const v = useMemo(() => new THREE.Vector3(), []);

  useLayoutEffect(() => {
    el.className = "etq-ancla";
    const padre = gl.domElement.parentElement;
    padre?.appendChild(el);
    raiz.current = createRoot(el);
    return () => {
      const r = raiz.current;
      raiz.current = null;
      // desmontar fuera del ciclo de render actual
      setTimeout(() => r?.unmount(), 0);
      el.remove();
    };
  }, [gl, el]);

  useLayoutEffect(() => {
    raiz.current?.render(<div className={`etq ${className}`}>{children}</div>);
  });

  useFrame(() => {
    if (!visible) {
      el.style.display = "none";
      return;
    }
    ancla.current.getWorldPosition(v);
    v.project(camera);
    const oculto = v.z > 1;
    el.style.display = oculto ? "none" : "";
    const x = (v.x * 0.5 + 0.5) * size.width;
    const y = (-v.y * 0.5 + 0.5) * size.height;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  });

  return <group ref={ancla} position={position} />;
}
