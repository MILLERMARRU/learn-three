// ══ Péndulo simple: cambia L con − + y la masa con M o clic. ¿El periodo depende de la masa? ───────
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { useTeclas } from "@/lib/teclado";
import { sfx } from "@/lib/sonido";
import { Etiqueta } from "../Etiqueta";
import { COLORES, fmt, G, useMat } from "./comun";

const ESC = 1.5;
const TOPE = 2.15;
const AMP = 0.38;
const MASAS = [1, 2, 4];

export function Pendulo({ exito, activo = true }: { exito: boolean; activo?: boolean }) {
  const [L, setL] = useState(1);
  const [mi, setMi] = useState(0);
  const m = MASAS[mi];
  useTeclas((e) => {
    if (!activo) return;
    if ((e.key === "-" || e.key === "_")) setL((l) => Math.max(0.5, +(l - 0.25).toFixed(2)));
    else if ((e.key === "+" || e.key === "=")) setL((l) => Math.min(2, +(l + 0.25).toFixed(2)));
    else if (e.key.toLowerCase() === "m") setMi((i) => (i + 1) % MASAS.length);
    else return;
    sfx.seleccion();
  });
  const T = 2 * Math.PI * Math.sqrt(L / G);

  const brazo = useRef<THREE.Group>(null!);
  const hilo = useRef<THREE.Mesh>(null!);
  const bola = useRef<THREE.Group>(null!);
  const arco = useRef<THREE.Mesh>(null!);
  const s = useRef({ largo: L * ESC, fase: 0, r: 0.2 });
  const metal = useMat(COLORES.metal);
  const acento = useMat(COLORES.acento);
  const hiloMat = useMat(COLORES.hilo);
  const bolaMat = useMat({ color: "#ff8a5c", roughness: 0.3, metalness: 0.1 });
  const fantasma = useMat({ color: "#9aa3ae", transparent: true, opacity: 0.18, depthWrite: false });
  const geo = useMemo(
    () => ({
      techo: new RoundedBoxGeometry(2.2, 0.12, 0.5, 3, 0.05),
      pivote: new THREE.SphereGeometry(0.07, 20, 14),
      hilo: new THREE.CylinderGeometry(0.008, 0.008, 1, 6),
      bola: new THREE.SphereGeometry(1, 48, 32),
      arco: new THREE.TorusGeometry(1, 0.0035, 6, 80, AMP * 2),
    }),
    [],
  );

  useFrame((st, dtCrudo) => {
    const dt = Math.min(0.05, dtCrudo);
    const S = s.current;
    S.largo = THREE.MathUtils.damp(S.largo, L * ESC, 5, dt);
    S.fase += Math.sqrt(G / L) * dt;
    const ang = AMP * Math.cos(S.fase);
    brazo.current.rotation.z = ang;
    hilo.current.scale.y = S.largo;
    hilo.current.position.y = -S.largo / 2;
    bola.current.position.y = -S.largo;
    S.r = THREE.MathUtils.damp(S.r, 0.17 * Math.cbrt(m), 8, dt);
    bola.current.scale.setScalar(S.r);
    arco.current.scale.setScalar(S.largo);
    bolaMat.emissive.set("#ff8a5c").multiplyScalar(exito ? 0.35 + 0.2 * Math.sin(st.clock.elapsedTime * 6) : 0.05);
  });

  return (
    <group position={[0, -0.5, 0]}>
      <mesh geometry={geo.techo} material={metal} position={[0, TOPE + 0.06, 0]} />
      <mesh geometry={geo.pivote} material={acento} position={[0, TOPE, 0.05]} />
      <mesh ref={arco} geometry={geo.arco} material={fantasma} position={[0, TOPE, 0]} rotation={[0, 0, -Math.PI / 2 - AMP]} />
      <group ref={brazo} position={[0, TOPE, 0]}>
        <mesh ref={hilo} geometry={geo.hilo} material={hiloMat} />
        <group ref={bola}>
          <mesh
            geometry={geo.bola}
            material={bolaMat}
            onClick={(e) => {
              e.stopPropagation();
              if (!activo) return;
              setMi((i) => (i + 1) % MASAS.length);
              sfx.seleccion();
            }}
          />
        </group>
        <Etiqueta visible={activo} position={[0.32, -L * ESC, 0]} className="etq-dato">
          m = {m} kg
        </Etiqueta>
        <Etiqueta visible={activo} position={[-0.06, (-L * ESC) / 2, 0]} className="etq-dato etq-izq">
          L = {fmt(L)} m
        </Etiqueta>
      </group>
      <Etiqueta visible={activo} position={[1.25, TOPE + 0.05, 0]} className="etq-dato etq-medida">
        T = {fmt(T)} s
      </Etiqueta>
    </group>
  );
}
