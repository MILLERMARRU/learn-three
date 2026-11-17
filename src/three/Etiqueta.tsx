// ══ Etiqueta HTML anclada a un punto 3D (reemplazo mínimo de drei <Html>) ───────
import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
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
  const caja = useRef<HTMLDivElement | null>(null);
  const raiz = useRef<Root | null>(null);
  const v = useMemo(() => new THREE.Vector3(), []);

  useLayoutEffect(() => {
    // contenedor nuevo en cada montaje: si React monta → desmonta → monta (StrictMode),
    // la raíz vieja no comparte nodo con la nueva y no puede borrarle el contenido
    const el = document.createElement("div");
    el.className = "etq-ancla";
    gl.domElement.parentElement?.appendChild(el);
    const r = createRoot(el);
    caja.current = el;
    raiz.current = r;
    return () => {
      if (raiz.current === r) raiz.current = null;
      if (caja.current === el) caja.current = null;
      el.remove();
      // desmontar fuera del ciclo de render actual
      setTimeout(() => r.unmount(), 0);
    };
  }, [gl]);

  useLayoutEffect(() => {
    raiz.current?.render(<div className={`etq ${className}`}>{children}</div>);
  });

  useFrame(() => {
    const el = caja.current;
    if (!el) return;
    if (!visible || !visibleEnArbol(ancla.current)) {
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

/** true si el objeto y todos sus padres están visibles. */
function visibleEnArbol(o: THREE.Object3D | null): boolean {
  for (let x = o; x; x = x.parent) if (!x.visible) return false;
  return true;
}
