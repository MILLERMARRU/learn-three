// ══ Escena de la grúa (Nivel 10): sube una carga a velocidad constante hasta la bandera; el cronómetro dice si llegó a tiempo ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  m: number;
  h: number;
  /** Tiempo en que debe llegar (s). */
  t: number;
  eta: number;
  /** Potencia entregada al motor (W): la carga sube con v = η·P / (mg). */
  P: number;
  corrida?: { id: number } | null;
  onFin?: (p: { tLlegada: number | null }) => void;
  exito?: boolean;
  previa?: string;
}

const G = 10;
const X_CARGA = 0.4;
const Y_BANDERA = 2.2; // altura visual de la bandera
const Y_PLUMA = 3.05;
const DUR = 2.6; // s reales que dura el tiempo pedido
const lado = (m: number) => Math.min(0.66, 0.3 + 0.0018 * m);
const fmt = (n: number) => (Math.round(n * 10) / 10).toString().replace(".", ",");

export function EscenaGrua({ m, h, t, eta, P, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const L = lado(m);
  const k = Y_BANDERA / h;
  const v = (eta * P) / (m * G); // m/s
  const tLlegada = h / v;
  // si no llega, se corta a 1,6 veces el tiempo pedido
  const tCorte = Math.min(tLlegada, t * 1.6);

  const carga = useRef<THREE.Group>(null!);
  const cable = useRef<THREE.Mesh>(null!);
  const crono = useRef<HTMLSpanElement>(null);
  const sim = useRef({ id: -1, t: 0, fin: false });

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      cable: new THREE.BoxGeometry(0.02, 1, 0.02),
      gancho: new THREE.TorusGeometry(0.06, 0.015, 8, 20, Math.PI * 1.4),
      tela: new THREE.BoxGeometry(0.3, 0.18, 0.01),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      estructura: new THREE.MeshStandardMaterial({ color: "#f0b44c", roughness: 0.6 }),
      piso: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.9 }),
      cable: new THREE.MeshStandardMaterial({ color: "#c9b48d" }),
      carga: new THREE.MeshStandardMaterial({ color: "#8a929d", roughness: 0.45, metalness: 0.3, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      motor: new THREE.MeshStandardMaterial({ color: "#39404b", roughness: 0.6 }),
      bandera: new THREE.MeshStandardMaterial({ color: "#6fd6a8", emissive: "#6fd6a8", emissiveIntensity: 0.3 }),
      asta: new THREE.MeshStandardMaterial({ color: "#5d6673" }),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((mt) => mt.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    mats.carga.emissiveIntensity = exito ? 0.35 : 0;
    if (exito) emitirPolvo({ pos: [X_CARGA, Y_BANDERA + 0.3, 0.4], color: "#6fd6a8", n: 130, radio: 0.4, fuerza: 1.1 });
  }, [exito, mats]);

  useFrame((_, dtCrudo) => {
    const dt = Math.min(0.05, dtCrudo);
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
    // el tiempo pedido t dura DUR segundos reales, sea cual sea
    if (corrida && !S.fin) S.t = Math.min(tCorte, S.t + (dt * t) / DUR);
    const y = Math.min(Y_BANDERA, v * S.t * k);
    carga.current.position.y = y;
    cable.current.position.y = (Y_PLUMA + y + L) / 2;
    cable.current.scale.y = Math.max(0.01, Y_PLUMA - y - L);
    const txt = `t = ${fmt(S.t)} s`;
    if (crono.current && crono.current.textContent !== txt) crono.current.textContent = txt;
    if (corrida && !S.fin && S.t >= tCorte - 1e-9) {
      S.fin = true;
      onFin?.({ tLlegada: tLlegada <= t * 1.6 ? tLlegada : null });
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* piso, torre, pluma con contrapeso y el motor */}
      <mesh geometry={geo.caja} material={mats.piso} position={[0, -0.05, 0]} scale={[6, 0.1, 1.2]} />
      <mesh geometry={geo.caja} material={mats.estructura} position={[-1.5, Y_PLUMA / 2, 0]} scale={[0.16, Y_PLUMA, 0.16]} />
      <mesh geometry={geo.caja} material={mats.estructura} position={[-0.6, Y_PLUMA + 0.06, 0]} scale={[3, 0.12, 0.14]} />
      <mesh geometry={geo.caja} material={mats.motor} position={[-1.9, Y_PLUMA + 0.22, 0]} scale={[0.4, 0.3, 0.3]} />
      <mesh geometry={geo.caja} material={mats.estructura} position={[X_CARGA, Y_PLUMA - 0.02, 0]} scale={[0.22, 0.08, 0.2]} />
      <mesh ref={cable} geometry={geo.cable} material={mats.cable} position={[X_CARGA, (Y_PLUMA + L) / 2, 0]} scale={[1, Y_PLUMA - L, 1]} />
      <group ref={carga} position={[X_CARGA, 0, 0]}>
        <mesh geometry={geo.caja} material={mats.carga} position={[0, L / 2, 0]} scale={[L, L, L]} />
        <mesh geometry={geo.gancho} material={mats.cable} position={[0, L + 0.05, 0]} rotation={[0, 0, Math.PI * 0.8]} />
        {etiquetas && (
          <Etiqueta position={[-L / 2, L / 2, 0.3]} className="etq-dato etq-izq">
            {m} kg
          </Etiqueta>
        )}
      </group>
      {/* bandera a la altura h, a la derecha del recorrido de la carga */}
      <mesh geometry={geo.caja} material={mats.asta} position={[1.35, Y_BANDERA / 2 + 0.1, 0]} scale={[0.03, Y_BANDERA + 0.2, 0.03]} />
      <mesh geometry={geo.tela} material={mats.bandera} position={[1.2, Y_BANDERA + 0.1, 0]} />
      <mesh geometry={geo.caja} material={mats.asta} position={[(X_CARGA + 1.35) / 2, Y_BANDERA, -0.3]} scale={[1.35 - X_CARGA, 0.01, 0.01]} />
      {etiquetas && (
        <>
          <Etiqueta position={[1.45, Y_BANDERA / 2, 0.2]} className="etq-dato">
            h = {fmt(h)} m
          </Etiqueta>
          {eta < 1 && (
            <Etiqueta position={[-2.15, Y_PLUMA + 0.22, 0.2]} className="etq-dato etq-izq">
              η = {Math.round(eta * 100)} %
            </Etiqueta>
          )}
          {/* anclado por su borde derecho: en móvil no se sale de la pantalla */}
          <Etiqueta position={[3.4, Y_PLUMA + 0.62, 0.2]} className="etq-dato etq-crono etq-izq">
            <span ref={crono}>t = 0 s</span> <span className="etq-tenue">/ {fmt(t)} s</span>
          </Etiqueta>
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -0.7, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
