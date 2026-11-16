// ══ Movimiento circular: − + cambia la rapidez, R el radio, M la masa. La flecha es la fuerza centrípeta ───────
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useTeclas } from "@/lib/teclado";
import { sfx } from "@/lib/sonido";
import { Etiqueta } from "../Etiqueta";
import { COLORES, fmt, useMat } from "./comun";

const ESC = 1.55;
const MASAS = [1, 2, 4];
const RADIOS = [0.6, 1, 1.4];

export function Circular({ exito, activo = true }: { exito: boolean; activo?: boolean }) {
  const [v, setV] = useState(2);
  const [mi, setMi] = useState(0);
  const [ri, setRi] = useState(1);
  const m = MASAS[mi];
  const R = RADIOS[ri];
  useTeclas((e) => {
    if (!activo) return;
    const k = e.key.toLowerCase();
    if ((e.key === "-" || e.key === "_")) setV((x) => Math.max(1, x - 1));
    else if ((e.key === "+" || e.key === "=")) setV((x) => Math.min(4, x + 1));
    else if (k === "m") setMi((i) => (i + 1) % MASAS.length);
    else if (k === "r") setRi((i) => (i + 1) % RADIOS.length);
    else return;
    sfx.seleccion();
  });
  const F = (m * v * v) / R;

  const brazo = useRef<THREE.Group>(null!);
  const hilo = useRef<THREE.Mesh>(null!);
  const bola = useRef<THREE.Group>(null!);
  const flecha = useRef<THREE.Group>(null!);
  const aro = useRef<THREE.Mesh>(null!);
  const s = useRef({ ang: 0, r: R * ESC, tam: 0.18, largo: 0.6 });
  const metal = useMat(COLORES.metal);
  const acento = useMat(COLORES.acento);
  const hiloMat = useMat(COLORES.hilo);
  const bolaMat = useMat({ color: "#6fd6a8", roughness: 0.3, metalness: 0.1 });
  const flechaMat = useMat({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.45, roughness: 0.4 });
  const aroMat = useMat({ color: "#9aa3ae", transparent: true, opacity: 0.25, depthWrite: false });
  const geo = useMemo(
    () => ({
      eje: new THREE.CylinderGeometry(0.05, 0.08, 1.6, 24),
      cubo: new THREE.SphereGeometry(0.11, 24, 16),
      hilo: new THREE.CylinderGeometry(0.008, 0.008, 1, 6),
      bola: new THREE.SphereGeometry(1, 40, 28),
      aro: new THREE.TorusGeometry(1, 0.006, 6, 120),
      tallo: new THREE.CylinderGeometry(0.03, 0.03, 1, 12),
      punta: new THREE.ConeGeometry(0.08, 0.2, 20),
    }),
    [],
  );

  useFrame((_, dtCrudo) => {
    const dt = Math.min(0.05, dtCrudo);
    const S = s.current;
    S.r = THREE.MathUtils.damp(S.r, R * ESC, 5, dt);
    S.ang += (v / R) * dt * 0.45;
    brazo.current.rotation.y = -S.ang;
    hilo.current.scale.y = S.r;
    hilo.current.position.x = S.r / 2;
    bola.current.position.x = S.r;
    S.tam = THREE.MathUtils.damp(S.tam, 0.15 * Math.cbrt(m), 8, dt);
    bola.current.scale.setScalar(S.tam);
    aro.current.scale.setScalar(S.r);
    // largo de la flecha proporcional a la fuerza
    S.largo = THREE.MathUtils.damp(S.largo, THREE.MathUtils.clamp(0.25 + F / 30, 0.3, Math.max(0.35, S.r - 0.3)), 6, dt);
    flecha.current.position.x = S.r - S.tam - 0.04;
    flecha.current.scale.set(1, S.largo, 1);
    bolaMat.emissive.set("#6fd6a8").multiplyScalar(exito ? 0.4 : 0.05);
  });

  return (
    <group rotation={[0.42, 0, 0]} position={[0, -0.2, 0]}>
      <mesh geometry={geo.eje} material={metal} position={[0, -0.8, 0]} />
      <mesh geometry={geo.cubo} material={acento} />
      <mesh ref={aro} geometry={geo.aro} material={aroMat} rotation={[Math.PI / 2, 0, 0]} />
      <group ref={brazo}>
        <mesh ref={hilo} geometry={geo.hilo} material={hiloMat} rotation={[0, 0, Math.PI / 2]} />
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
        {/* flecha hacia el centro (escala en y = largo) */}
        <group ref={flecha} rotation={[0, 0, Math.PI / 2]}>
          <mesh geometry={geo.tallo} material={flechaMat} position={[0, 0.5, 0]} />
          <mesh geometry={geo.punta} material={flechaMat} position={[0, 1.05, 0]} scale={[1, 0.6, 1]} />
        </group>
        <Etiqueta visible={activo} position={[R * ESC, 0.42, 0]} className="etq-dato">
          m = {m} kg
        </Etiqueta>
        <Etiqueta visible={activo} position={[(R * ESC) / 2, -0.25, 0]} className="etq-dato etq-acento">
          F = {fmt(F, 1)} N
        </Etiqueta>
      </group>
      <Etiqueta visible={activo} position={[0, 1.5, 0]} className="etq-dato etq-medida">
        v = {v} m/s · R = {fmt(R, 1)} m
      </Etiqueta>
    </group>
  );
}
