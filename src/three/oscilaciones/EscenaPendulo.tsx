// ══ Escena del péndulo (Nivel 12): una lenteja oscila colgada de un hilo; la fantasma oscila con el período propuesto ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  L: number;
  g: number;
  /** Período real (s) y el propuesto (fantasma; null = sin fantasma). */
  T: number;
  Tfantasma: number | null;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const Y_PIVOTE = 2.4;
const AMPLITUD = 0.36; // rad (~20°)
const T_VIS = 1.8; // s reales que dura un período real
const VUELTAS = 2;
const R = 0.15;
const fmt = (n: number) => String(n).replace(".", ",");
/** Largo visual del hilo: crece con L y se satura para que quepa. */
const largoVisual = (L: number) => 0.8 + 1.4 * Math.min(1, L / 4);

export function EscenaPendulo({ L, g, T, Tfantasma, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const Lv = largoVisual(L);
  const tFin = T_VIS * VUELTAS;

  const brazo = useRef<THREE.Group>(null!);
  const fantasma = useRef<THREE.Group>(null);
  const sim = useRef({ id: -1, t: 0, fin: false });

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      hilo: new THREE.CylinderGeometry(0.008, 0.008, 1, 6).translate(0, -0.5, 0),
      lenteja: new THREE.SphereGeometry(R, 32, 20),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      soporte: new THREE.MeshStandardMaterial({ color: "#39404b", roughness: 0.7 }),
      hilo: new THREE.MeshStandardMaterial({ color: "#c9b48d" }),
      lenteja: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.4, metalness: 0.2, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.4, depthWrite: false, emissive: "#86b2ff", emissiveIntensity: 0.3 }),
      guia: new THREE.MeshStandardMaterial({ color: "#5d6673", transparent: true, opacity: 0.5 }),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((gg) => gg.dispose());
      Object.values(mats).forEach((mt) => mt.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    mats.lenteja.emissiveIntensity = exito ? 0.45 : 0;
    if (exito) emitirPolvo({ pos: [0, Y_PIVOTE - Lv, 0.4], color: "#6fd6a8", n: 110, radio: 0.4, fuerza: 1 });
  }, [exito, mats, Lv]);

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
    if (corrida && !S.fin) S.t = Math.min(tFin, S.t + d);
    // se suelta desde el extremo derecho: θ = θ₀·cos(2πt/T)
    brazo.current.rotation.z = AMPLITUD * Math.cos((2 * Math.PI * S.t) / T_VIS);
    if (fantasma.current && Tfantasma !== null) {
      fantasma.current.visible = !!corrida;
      fantasma.current.rotation.z = AMPLITUD * Math.cos((2 * Math.PI * S.t) / ((T_VIS * Tfantasma) / T));
    }
    if (corrida && !S.fin && S.t >= tFin - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  return (
    <group>
      <mesh geometry={geo.caja} material={mats.soporte} position={[0, Y_PIVOTE + 0.06, 0]} scale={[1.6, 0.12, 0.4]} />
      {/* vertical de referencia (posición de equilibrio) */}
      <mesh geometry={geo.hilo} material={mats.guia} position={[0, Y_PIVOTE, -0.05]} scale={[0.6, Lv + R, 0.6]} />
      <group ref={brazo} position={[0, Y_PIVOTE, 0]} rotation={[0, 0, AMPLITUD]}>
        <mesh geometry={geo.hilo} material={mats.hilo} scale={[1, Lv, 1]} />
        <mesh geometry={geo.lenteja} material={mats.lenteja} position={[0, -Lv, 0]} />
      </group>
      {Tfantasma !== null && (
        <group ref={fantasma} position={[0, Y_PIVOTE, 0.3]} rotation={[0, 0, AMPLITUD]} visible={false}>
          <mesh geometry={geo.hilo} material={mats.fantasma} scale={[1, Lv, 1]} />
          <mesh geometry={geo.lenteja} material={mats.fantasma} position={[0, -Lv, 0]} scale={1.08} />
        </group>
      )}
      {etiquetas && (
        <>
          {/* a la izquierda del hilo, más allá de su oscilación */}
          <Etiqueta position={[-Lv * Math.sin(AMPLITUD) - 0.25, Y_PIVOTE - Lv / 2, 0]} className="etq-dato etq-izq">
            L = {fmt(L)} m
          </Etiqueta>
          {g !== 10 && (
            <Etiqueta position={[0.95, Y_PIVOTE + 0.06, 0]} className="etq-dato">
              g = {fmt(g)} m/s²
            </Etiqueta>
          )}
          {verValor && (
            <Etiqueta position={[0, Y_PIVOTE + 0.2, 0.3]} className={`etq-dato etq-centro ${exito ? "etq-acento" : ""}`}>
              T = {fmt(T)} s
            </Etiqueta>
          )}
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -0.3, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
