// ══ Dos vectores con un ángulo θ, el paralelogramo punteado y la resultante ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import type { Vec } from "@/lib/vec";
import { V } from "@/ui/Formula";
import { Etiqueta } from "../Etiqueta";
import { Flecha } from "./Flecha";

const COL = { A: "#86b2ff", B: "#ff8a5c", R: "#f0b44c" };

interface Props {
  a: number;
  b: number;
  angulo: number;
  /** Cómo se muestra R: oculta, fantasma (guía) o sólida (al acertar). */
  r: "oculta" | "fantasma" | "solida";
  valorR?: number;
  etiquetas?: boolean;
  faseId?: number;
}

export function EscenaParalelogramo({ a, b, angulo, r, valorR, etiquetas = true, faseId = 0 }: Props) {
  const rad = (angulo * Math.PI) / 180;
  const R = Math.sqrt(a * a + b * b + 2 * a * b * Math.cos(rad));
  // escala para que todo quepa
  const k = 5.4 / Math.max(a, b, R, 1);
  const A: Vec = [a * k, 0];
  const B: Vec = [b * k * Math.cos(rad), b * k * Math.sin(rad)];
  const S: Vec = [A[0] + B[0], A[1] + B[1]];
  // centra el dibujo
  const cx = -(Math.min(0, B[0]) + Math.max(A[0], S[0])) / 2;
  const cy = -Math.max(0, S[1], B[1]) / 2;

  const geoGuia = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([A[0], A[1], 0, S[0], S[1], 0, B[0], B[1], 0, S[0], S[1], 0], 3));
    return g;
    // depende solo de los vectores
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, b, angulo]);
  const mat = useMemo(() => new THREE.LineDashedMaterial({ color: "#d9c3a0", dashSize: 0.16, gapSize: 0.12, transparent: true, opacity: 0.7 }), []);
  const arco = useMemo(() => new THREE.TorusGeometry(0.9, 0.012, 6, 48, Math.max(0.001, rad)), [rad]);
  const matArco = useMemo(() => new THREE.MeshBasicMaterial({ color: "#d9c3a0", transparent: true, opacity: 0.8 }), []);
  const linea = useRef<THREE.LineSegments>(null!);
  useEffect(() => {
    linea.current?.computeLineDistances();
    return () => geoGuia.dispose();
  }, [geoGuia]);
  useEffect(
    () => () => {
      mat.dispose();
      matArco.dispose();
      arco.dispose();
    },
    [mat, matArco, arco],
  );

  const grupo = useRef<THREE.Group>(null!);
  const ultimo = useRef(faseId);
  useFrame(() => {
    if (r === "solida" && faseId !== ultimo.current) {
      ultimo.current = faseId;
      const w = new THREE.Vector3(S[0], S[1], 0);
      grupo.current.localToWorld(w);
      emitirPolvo({ pos: [w.x, w.y, w.z], color: COL.R, n: 200, radio: 0.6, fuerza: 1.5 });
    }
  });

  const angTxt = angulo === 0 || angulo === 180 ? `${angulo}°` : `θ = ${angulo}°`;

  return (
    <group ref={grupo} position={[cx, cy, 0]} rotation={[-0.12, 0, 0]}>
      <lineSegments ref={linea} geometry={geoGuia} material={mat} />
      {angulo > 0 && angulo < 180 && <mesh geometry={arco} material={matArco} />}
      <Flecha hasta={A} color={COL.A} etiqueta={etiquetas ? <><V>A</V> = {a}</> : undefined} />
      <Flecha hasta={B} color={COL.B} etiqueta={etiquetas ? <><V>B</V> = {b}</> : undefined} z={0.01} />
      {r !== "oculta" && <Flecha hasta={S} color={COL.R} variante={r === "fantasma" ? "fantasma" : "solida"} grosor={1.2} brillo={0.4} etiqueta={r === "solida" && etiquetas ? <><V>R</V> = {valorR}</> : undefined} z={0.02} />}
      {etiquetas && (
        <Etiqueta position={[Math.cos(rad / 2) * 1.35, Math.sin(rad / 2) * 1.35 + (angulo === 0 ? 0.35 : 0), 0]} className="etq-dato etq-acento">
          {angTxt}
        </Etiqueta>
      )}
    </group>
  );
}
