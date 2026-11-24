// ══ Escena de presión (Nivel 14): un sensor baja en un tanque; la aguja del manómetro gira hasta la presión real ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Color del líquido, profundidad (m) y presión real y propuesta (kPa; null = sin marca). */
  color: string;
  h: number;
  absoluta: boolean;
  P: number;
  Ppropuesta: number | null;
  /** Rótulo del líquido (con su densidad). */
  textoLiquido: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const TX = -0.8; // centro del tanque
const ANCHO = 2.6;
const Y_FONDO = -1.6;
const Y_SUP = 1; // superficie del líquido
const PROF_VIS = 2.2; // la profundidad pedida se dibuja con este largo
const DX = 2.1; // manómetro
const DY = 0.55;
const R_DIAL = 0.62;
// kPa a fondo de escala, fijo por tipo para no dar pistas (la esfera no tiene números)
const escalaDe = (absoluta: boolean) => (absoluta ? 200 : 120);
const ANG0 = (5 * Math.PI) / 4; // 0 kPa abajo a la izquierda
const ANG1 = -Math.PI / 4; // fondo de escala abajo a la derecha
const DUR = 2.4;
const fmt = (n: number) => String(n).replace(".", ",");
const angulo = (P: number, escala: number) => ANG0 + (ANG1 - ANG0) * Math.min(1, Math.max(0, P / escala));

export function EscenaPresion({ color, h, absoluta, P, Ppropuesta, textoLiquido, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const yMeta = Y_SUP - PROF_VIS;
  const esc = escalaDe(absoluta);
  const sim = useRef({ id: -1, t: 0, fin: false });
  const sensor = useRef<THREE.Group>(null!);
  const cable = useRef<THREE.Mesh>(null!);
  const aguja = useRef<THREE.Group>(null!);

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      sensor: new THREE.SphereGeometry(0.13, 24, 16),
      dial: new THREE.CircleGeometry(R_DIAL, 48),
      aro: new THREE.TorusGeometry(R_DIAL, 0.03, 8, 64),
      arco: new THREE.TorusGeometry(R_DIAL * 0.82, 0.012, 6, 64, (3 * Math.PI) / 2).rotateZ(-Math.PI / 4),
      aguja: new THREE.BoxGeometry(R_DIAL * 0.75, 0.035, 0.02).translate((R_DIAL * 0.75) / 2, 0, 0),
      marca: new THREE.BoxGeometry(0.16, 0.05, 0.02).translate(R_DIAL * 0.78, 0, 0),
      eje: new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16).rotateX(Math.PI / 2),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      vidrio: new THREE.MeshStandardMaterial({ color: "#c8d6e8", transparent: true, opacity: 0.1, depthWrite: false }),
      liquido: new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.45, depthWrite: false }),
      sensor: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.3 }),
      cable: new THREE.MeshStandardMaterial({ color: "#2a3038" }),
      dial: new THREE.MeshStandardMaterial({ color: "#1b2129" }),
      aro: new THREE.MeshStandardMaterial({ color: "#8a929d", metalness: 0.4, roughness: 0.4 }),
      arco: new THREE.MeshStandardMaterial({ color: "#5d6673" }),
      aguja: new THREE.MeshStandardMaterial({ color: "#ff8a5c", emissive: "#ff8a5c", emissiveIntensity: 0.3 }),
      marca: new THREE.MeshStandardMaterial({ color: "#86b2ff", emissive: "#86b2ff", emissiveIntensity: 0.5 }),
      regla: new THREE.MeshStandardMaterial({ color: "#5d6673" }),
    }),
    [color],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    mats.aguja.emissive.set(exito ? "#6fd6a8" : "#ff8a5c");
    if (exito) emitirPolvo({ pos: [DX, DY, 0.4], color: "#6fd6a8", n: 110, radio: 0.4, fuerza: 1 });
  }, [exito, mats]);

  useFrame((_, dtCrudo) => {
    const d = Math.min(0.05, dtCrudo);
    const S = sim.current;
    if (corrida && corrida.id !== S.id) {
      S.id = corrida.id;
      S.t = 0;
      S.fin = false;
    }
    if (!corrida) {
      S.id = -1;
      S.t = 0;
      S.fin = false;
    }
    if (corrida && !S.fin) S.t = Math.min(DUR, S.t + d);
    // el sensor baja hasta la profundidad (la presión crece con él); antes de soltar, espera sobre la superficie
    const u = corrida ? Math.min(1, S.t / (DUR * 0.75)) : 0;
    const y = Y_SUP + 0.3 - (PROF_VIS + 0.3) * (1 - (1 - u) ** 2);
    sensor.current.position.y = y;
    cable.current.position.y = (Y_SUP + 0.9 + y) / 2;
    cable.current.scale.y = Math.max(0.01, Y_SUP + 0.9 - y);
    const prof = Math.max(0, Y_SUP - y) / PROF_VIS; // fracción de la profundidad pedida
    const Pact = (absoluta ? 100 : 0) + (P - (absoluta ? 100 : 0)) * prof;
    aguja.current.rotation.z = corrida ? angulo(Pact, esc) : angulo(absoluta ? 100 : 0, esc);
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  return (
    <group>
      {/* tanque de vidrio con el líquido */}
      <mesh geometry={geo.caja} material={mats.liquido} position={[TX, (Y_FONDO + Y_SUP) / 2, 0]} scale={[ANCHO - 0.04, Y_SUP - Y_FONDO, 1.1]} />
      <mesh geometry={geo.caja} material={mats.vidrio} position={[TX, (Y_FONDO + Y_SUP + 0.3) / 2, 0]} scale={[ANCHO, Y_SUP + 0.3 - Y_FONDO, 1.14]} />
      {/* regla de la profundidad, a la izquierda del tanque */}
      <mesh geometry={geo.caja} material={mats.regla} position={[TX - ANCHO / 2 - 0.2, (Y_SUP + yMeta) / 2, 0]} scale={[0.015, PROF_VIS, 0.015]} />
      <mesh geometry={geo.caja} material={mats.regla} position={[TX - ANCHO / 2 - 0.2, yMeta, 0]} scale={[0.14, 0.015, 0.015]} />
      <mesh geometry={geo.caja} material={mats.regla} position={[TX - ANCHO / 2 - 0.2, Y_SUP, 0]} scale={[0.14, 0.015, 0.015]} />
      {/* sensor con su cable */}
      <mesh ref={cable} geometry={geo.caja} material={mats.cable} position={[TX, Y_SUP + 0.6, 0]} scale={[0.02, 0.6, 0.02]} />
      <group ref={sensor} position={[TX, Y_SUP + 0.3, 0]}>
        <mesh geometry={geo.sensor} material={mats.sensor} />
      </group>
      {/* manómetro: esfera sin números; la marca azul es la presión propuesta */}
      <group position={[DX, DY, 0]}>
        <mesh geometry={geo.dial} material={mats.dial} />
        <mesh geometry={geo.aro} material={mats.aro} />
        <mesh geometry={geo.arco} material={mats.arco} position={[0, 0, 0.01]} />
        {Ppropuesta !== null && <mesh geometry={geo.marca} material={mats.marca} position={[0, 0, 0.02]} rotation={[0, 0, angulo(Ppropuesta, esc)]} />}
        <group ref={aguja} position={[0, 0, 0.04]} rotation={[0, 0, angulo(absoluta ? 100 : 0, esc)]}>
          <mesh geometry={geo.aguja} material={mats.aguja} />
        </group>
        <mesh geometry={geo.eje} material={mats.aro} position={[0, 0, 0.05]} />
      </group>
      {etiquetas && (
        <>
          <Etiqueta position={[TX - ANCHO / 2 - 0.3, (Y_SUP + yMeta) / 2, 0.2]} className="etq-dato etq-izq">
            h = {fmt(h)} m
          </Etiqueta>
          <Etiqueta position={[TX, Y_FONDO - 0.08, 0.6]} className="etq-dato etq-abajo">
            {textoLiquido}
          </Etiqueta>
          <Etiqueta position={[DX, DY - R_DIAL - 0.08, 0.2]} className={`etq-dato etq-abajo ${exito ? "etq-acento" : ""}`}>
            {verValor ? `P = ${P} kPa` : absoluta ? "P absoluta" : "P manométrica"}
          </Etiqueta>
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -2.3, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
