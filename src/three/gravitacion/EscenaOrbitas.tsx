// ══ Escena de órbitas (Nivel 9): planeta, órbita de referencia y órbita pedida; el satélite real y el fantasma giran juntos ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  tipo: "T" | "v";
  /** Radio de la órbita pedida entre el de la referencia. */
  q: number;
  /** Período (tipo T) o velocidad (tipo v) de la órbita de referencia. */
  dato: number;
  /** El valor real de la órbita pedida y el propuesto (fantasma; null = sin fantasma). */
  real: number;
  fantasma: number | null;
  /** La referencia va rasante, justo sobre la superficie. */
  rasante: boolean;
  /** Rótulos de cada órbita (leyenda bajo las órbitas, con el color de cada una). */
  textoRef: string;
  textoPedida: string;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const R_GRANDE = 2.25; // radio visual de la órbita mayor
const INCLINACION = -0.45; // se ve un poco desde arriba
const DUR = 3; // s reales que tarda el satélite real en dar una vuelta
const INICIO = Math.PI / 2; // todos parten de arriba
const ESPERA = 0.5; // rad/s del satélite de referencia antes de soltar

export function EscenaOrbitas({ tipo, q, dato, real, fantasma, rasante, textoRef, textoPedida, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  // radios visuales: la raíz de q comprime las razones grandes (64R) para que todo quepa
  const qv = Math.sqrt(q);
  const rPed = q >= 1 ? R_GRANDE : R_GRANDE * qv;
  const rRef = q >= 1 ? R_GRANDE / qv : R_GRANDE;
  const rChica = Math.min(rRef, rPed);
  const rPlaneta = rasante ? rRef / 1.15 : Math.min(0.5, rChica * 0.55);
  // velocidad angular de cada satélite: ω ∝ 1/T, o ω = v/r (con r de referencia = 1)
  const omega = (x: number, r: number) => (tipo === "T" ? 1 / x : x / r);
  const wReal = omega(real, q);
  const wRef = omega(dato, 1) / wReal;
  const wFan = fantasma === null ? 0 : omega(fantasma, q) / wReal;

  const sRef = useRef<THREE.Group>(null!);
  const sReal = useRef<THREE.Group>(null!);
  const sFan = useRef<THREE.Group>(null);
  const sim = useRef({ id: -1, t: 0, fin: false, espera: 0 });

  const geo = useMemo(
    () => ({
      esfera: new THREE.SphereGeometry(1, 40, 28),
      aro: new THREE.TorusGeometry(1, 0.01, 6, 128),
      cuerpo: new THREE.BoxGeometry(0.17, 0.17, 0.17),
      panel: new THREE.BoxGeometry(0.44, 0.09, 0.02),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      planeta: new THREE.MeshStandardMaterial({ color: "#4f79a8", roughness: 0.8 }),
      orbitaRef: new THREE.MeshStandardMaterial({ color: "#8a929d", transparent: true, opacity: 0.55 }),
      orbitaPed: new THREE.MeshStandardMaterial({ color: "#d9c3a0", transparent: true, opacity: 0.6 }),
      ref: new THREE.MeshStandardMaterial({ color: "#8a929d", roughness: 0.4, metalness: 0.3 }),
      real: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.25 }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.45, depthWrite: false, emissive: "#86b2ff", emissiveIntensity: 0.3 }),
      panel: new THREE.MeshStandardMaterial({ color: "#39557a", roughness: 0.5, metalness: 0.4 }),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    mats.real.emissiveIntensity = exito ? 0.6 : 0.25;
    if (exito) emitirPolvo({ pos: [0, R_GRANDE * 0.9, 0.4], color: "#6fd6a8", n: 120, radio: 0.4, fuerza: 1.1 });
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
      S.espera += dt;
    }
    if (corrida && !S.fin) S.t = Math.min(DUR, S.t + dt);
    // fase del satélite real: una vuelta en DUR segundos; los demás giran en proporción a su ω
    const fase = (2 * Math.PI * S.t) / DUR;
    const poner = (g: THREE.Group | null, r: number, ang: number) => {
      if (!g) return;
      g.position.set(r * Math.cos(ang), r * Math.sin(ang), 0);
      g.rotation.z = ang;
    };
    poner(sRef.current, rRef, corrida ? INICIO + fase * wRef : INICIO + S.espera * ESPERA);
    poner(sReal.current, rPed, INICIO + fase);
    poner(sFan.current, rPed, INICIO + fase * wFan);
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  const satelite = (mat: THREE.Material) => (
    <>
      <mesh geometry={geo.cuerpo} material={mat} />
      <mesh geometry={geo.panel} material={mats.panel} rotation={[0, 0, Math.PI / 2]} />
    </>
  );

  return (
    <group>
      <group rotation={[INCLINACION, 0, 0]}>
        <mesh geometry={geo.esfera} material={mats.planeta} scale={rPlaneta} />
        <mesh geometry={geo.aro} material={mats.orbitaRef} scale={rRef} />
        <mesh geometry={geo.aro} material={mats.orbitaPed} scale={rPed} />

        <group ref={sRef} position={[0, rRef, 0]}>
          {satelite(mats.ref)}
        </group>
        <group ref={sReal} position={[0, rPed, 0]}>
          {satelite(mats.real)}
        </group>
        {fantasma !== null && (
          <group ref={sFan} position={[0, rPed, 0.05]}>
            {satelite(mats.fantasma)}
          </group>
        )}

        {etiquetas && (
          <Etiqueta position={[0, R_GRANDE + 0.55, 0]} className="etq-eje etq-centro">
            radios fuera de escala
          </Etiqueta>
        )}
      </group>
      {/* leyenda bajo las órbitas, en una sola etiqueta: ningún satélite pasa por ahí y cabe en pantallas angostas */}
      {etiquetas && (
        <Etiqueta position={[0, -R_GRANDE * Math.cos(INCLINACION) - 0.1, 0]} className={`etq-dato etq-abajo ${exito ? "etq-acento" : ""}`}>
          <span style={{ display: "block" }}>
            <span style={{ color: "#8a929d" }}>●</span> {textoRef}
          </span>
          <span style={{ display: "block" }}>
            <span style={{ color: "#f0b44c" }}>●</span> {textoPedida}
          </span>
        </Etiqueta>
      )}
      {previa && (
        <Etiqueta position={[0, -2.9, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
