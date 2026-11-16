// ══ Plano cartesiano 3D con cuadrícula: haz clic o arrastra para colocar la punta del vector ───────
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { sfx } from "@/lib/sonido";
import type { Vec } from "@/lib/vec";
import { Etiqueta } from "../Etiqueta";
import { Flecha } from "./Flecha";

export interface VectorFijo {
  v: Vec;
  desde?: Vec;
  color: string;
  etiqueta?: ReactNode;
  variante?: "solida" | "fantasma";
}

interface Props {
  rx?: number;
  ry?: number;
  fijos?: VectorFijo[];
  /** Vector que el alumno mueve. */
  editable?: { v: Vec; color: string; etiqueta: ReactNode; onCambio: (v: Vec) => void; activo: boolean };
  /** Líneas punteadas (componentes, guías). */
  guias?: { desde: Vec; hasta: Vec }[];
  exito?: boolean;
  faseId?: number;
  /** Vista previa del carrusel: sin números ni interacción, con este rótulo debajo. */
  previa?: string;
}

export function PlanoVectorial({ rx = 7, ry = 5, fijos = [], editable, guias = [], exito = false, faseId = 0, previa }: Props) {
  const superficie = useRef<THREE.Mesh>(null!);
  const arrastrando = useRef(false);
  const punto = useMemo(() => new THREE.Vector3(), []);

  // ══ Cuadrícula y ejes ───────
  const malla = useMemo(() => {
    const p: number[] = [];
    for (let x = -rx; x <= rx; x++) p.push(x, -ry, 0, x, ry, 0);
    for (let y = -ry; y <= ry; y++) p.push(-rx, y, 0, rx, y, 0);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, [rx, ry]);
  const mats = useMemo(
    () => ({
      malla: new THREE.LineBasicMaterial({ color: "#2b3441", transparent: true, opacity: 0.75 }),
      eje: new THREE.MeshStandardMaterial({ color: "#6b7482", roughness: 0.5 }),
      sup: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      guia: new THREE.LineDashedMaterial({ color: "#d9c3a0", dashSize: 0.18, gapSize: 0.12, transparent: true, opacity: 0.8 }),
    }),
    [],
  );
  useEffect(
    () => () => {
      malla.dispose();
      Object.values(mats).forEach((m) => m.dispose());
    },
    [malla, mats],
  );
  const geoGuias = useMemo(() => {
    const p: number[] = [];
    for (const gd of guias) p.push(gd.desde[0], gd.desde[1], 0.01, gd.hasta[0], gd.hasta[1], 0.01);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, [guias]);
  const lineaGuias = useRef<THREE.LineSegments>(null!);
  useEffect(() => {
    lineaGuias.current?.computeLineDistances();
    return () => geoGuias.dispose();
  }, [geoGuias]);

  // polvo al acertar, en la punta del vector editable
  const ultimoId = useRef(faseId);
  useFrame(() => {
    if (exito && faseId !== ultimoId.current && editable) {
      ultimoId.current = faseId;
      const w = new THREE.Vector3(editable.v[0], editable.v[1], 0);
      superficie.current.localToWorld(w);
      emitirPolvo({ pos: [w.x, w.y, w.z], color: editable.color, n: 180, radio: 0.5, fuerza: 1.4 });
    }
  });

  const actualizar = (e: ThreeEvent<PointerEvent>) => {
    if (!editable?.activo) return;
    punto.copy(e.point);
    superficie.current.worldToLocal(punto);
    const nv: Vec = [Math.max(-rx, Math.min(rx, Math.round(punto.x))), Math.max(-ry, Math.min(ry, Math.round(punto.y)))];
    if (nv[0] !== editable.v[0] || nv[1] !== editable.v[1]) {
      editable.onCambio(nv);
      sfx.tecla();
    }
  };

  const marcas = [];
  if (!previa) {
  for (let x = -rx + (rx % 2); x <= rx; x += 2) if (x !== 0) marcas.push(<Etiqueta key={`x${x}`} position={[x, -0.32, 0]} className="etq-eje">{x}</Etiqueta>);
  for (let y = -ry + (ry % 2); y <= ry; y += 2) if (y !== 0) marcas.push(<Etiqueta key={`y${y}`} position={[-0.3, y, 0]} className="etq-eje etq-eje-y">{y}</Etiqueta>);
  }

  return (
    <group rotation={[-0.14, 0, 0]}>
      <lineSegments geometry={malla} material={mats.malla} />
      <mesh material={mats.eje} position={[0, 0, 0]} scale={[2 * rx + 0.8, 1, 1]}>
        <boxGeometry args={[1, 0.03, 0.03]} />
      </mesh>
      <mesh material={mats.eje} scale={[1, 2 * ry + 0.8, 1]}>
        <boxGeometry args={[0.03, 1, 0.03]} />
      </mesh>
      <mesh material={mats.eje} position={[rx + 0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.09, 0.25, 16]} />
      </mesh>
      <mesh material={mats.eje} position={[0, ry + 0.5, 0]}>
        <coneGeometry args={[0.09, 0.25, 16]} />
      </mesh>
      {!previa && <Etiqueta position={[rx + 0.85, 0.05, 0]} className="etq-eje etq-eje-nombre">x</Etiqueta>}
      {!previa && <Etiqueta position={[0.05, ry + 0.95, 0]} className="etq-eje etq-eje-nombre">y</Etiqueta>}
      {previa && (
        <Etiqueta position={[0, -ry - 1.6, 0]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
      {marcas}
      <lineSegments ref={lineaGuias} geometry={geoGuias} material={mats.guia} />
      {fijos.map((f, i) => (
        <Flecha key={i} desde={f.desde} hasta={f.desde ? [f.desde[0] + f.v[0], f.desde[1] + f.v[1]] : f.v} color={f.color} etiqueta={previa ? undefined : f.etiqueta} variante={f.variante} z={0.02 + i * 0.01} />
      ))}
      {editable && <Flecha hasta={editable.v} color={editable.color} etiqueta={editable.etiqueta} grosor={1.25} brillo={exito ? 0.6 : 0.2} z={0.08} />}
      {/* superficie invisible para colocar la punta con el mouse */}
      <mesh
        ref={superficie}
        material={mats.sup}
        onPointerDown={(e) => {
          if (!editable?.activo) return;
          e.stopPropagation();
          arrastrando.current = true;
          (e.target as unknown as Element).setPointerCapture?.(e.pointerId);
          actualizar(e);
        }}
        onPointerMove={(e) => arrastrando.current && actualizar(e)}
        onPointerUp={(e) => {
          arrastrando.current = false;
          (e.target as unknown as Element).releasePointerCapture?.(e.pointerId);
        }}
        onPointerOver={() => editable?.activo && (document.body.style.cursor = "crosshair")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <planeGeometry args={[2 * rx + 1, 2 * ry + 1]} />
      </mesh>
    </group>
  );
}
