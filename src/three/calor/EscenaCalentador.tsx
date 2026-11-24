// ══ Escena del calentador (Nivel 15): la placa entrega Q y la columna del termómetro sube hasta la temperatura final ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";
import { alturaTermo, Termometro } from "./Termometro";

interface Props {
  /** Color de la sustancia y si es líquida (en un vaso) o sólida (un bloque sobre la placa). */
  color: string;
  liquida: boolean;
  /** Temperatura inicial, final y propuesta (°C; null = sin marca). */
  T0: number;
  T: number;
  Tpropuesta: number | null;
  /** Rótulos de la sustancia y del calor entregado. */
  textoSustancia: string;
  textoQ: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const XC = -0.3; // placa y vaso
const Y_PLACA = -1.2;
const R_VASO = 0.72;
const ALTO_VASO = 1.5;
const ALTO_LIQ = 1.05;
const XT = 1.55; // termómetro
const YT = -0.9; // base del tubo
const DUR = 2.8;
const TIBIO = new THREE.Color("#e0794f");

export function EscenaCalentador({ color, liquida, T0, T, Tpropuesta, textoSustancia, textoQ, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const columna = useRef<THREE.Mesh>(null!);
  const base = useMemo(() => new THREE.Color(color), [color]);
  const yTope = Y_PLACA + 0.125; // cara superior de la placa

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      vaso: new THREE.CylinderGeometry(R_VASO, R_VASO * 0.94, ALTO_VASO, 36, 1, true),
      fondo: new THREE.CylinderGeometry(R_VASO * 0.94, R_VASO * 0.94, 0.04, 36),
      liquido: new THREE.CylinderGeometry(R_VASO - 0.04, R_VASO * 0.94 - 0.04, ALTO_LIQ, 36),
      espira: new THREE.TorusGeometry(0.55, 0.035, 8, 48).rotateX(Math.PI / 2),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      placa: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.7 }),
      espira: new THREE.MeshStandardMaterial({ color: "#5d3a2a", emissive: "#ff5a1f", emissiveIntensity: 0 }),
      vidrio: new THREE.MeshStandardMaterial({ color: "#c8d6e8", transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false }),
      sustancia: liquida
        ? new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.6, depthWrite: false })
        : new THREE.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.4 }),
    }),
    [color, liquida],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    if (exito) emitirPolvo({ pos: [XT, YT + alturaTermo(T), 0.4], color: "#6fd6a8", n: 110, radio: 0.35, fuerza: 1 });
  }, [exito, T]);

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
    // la placa se enciende primero; la temperatura sube con suavidad hasta la final
    const u = corrida ? 1 - (1 - Math.min(1, S.t / DUR)) ** 2 : 0;
    columna.current.scale.y = Math.max(0.01, alturaTermo(T0 + (T - T0) * u));
    mats.espira.emissiveIntensity = corrida ? 1.1 * Math.min(1, S.t / 0.5) : 0;
    mats.sustancia.color.copy(base).lerp(TIBIO, 0.4 * u);
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  return (
    <group>
      {/* placa calefactora con su espira */}
      <mesh geometry={geo.caja} material={mats.placa} position={[XC, Y_PLACA, 0]} scale={[2.2, 0.25, 1.5]} />
      <mesh geometry={geo.espira} material={mats.espira} position={[XC, yTope + 0.02, 0]} />
      {liquida ? (
        <>
          <mesh geometry={geo.vaso} material={mats.vidrio} position={[XC, yTope + 0.04 + ALTO_VASO / 2, 0]} />
          <mesh geometry={geo.fondo} material={mats.vidrio} position={[XC, yTope + 0.06, 0]} />
          <mesh geometry={geo.liquido} material={mats.sustancia} position={[XC, yTope + 0.08 + ALTO_LIQ / 2, 0]} />
        </>
      ) : (
        <mesh geometry={geo.caja} material={mats.sustancia} position={[XC, yTope + 0.06 + 0.35, 0]} scale={[1.3, 0.7, 0.9]} />
      )}
      <Termometro ref={columna} position={[XT, YT, 0]} Tpropuesta={Tpropuesta} T0={T0} />
      {etiquetas && (
        <>
          <Etiqueta position={[XC, Y_PLACA - 0.16, 0.8]} className="etq-dato etq-abajo">
            {textoSustancia}
          </Etiqueta>
          <Etiqueta position={[XC - 1.2, Y_PLACA, 0.8]} className="etq-dato etq-izq">
            {textoQ}
          </Etiqueta>
          <Etiqueta position={[XT + 0.25, YT - 0.1, 0.2]} className="etq-dato">
            T₀ = {T0} °C
          </Etiqueta>
          {verValor && (
            <Etiqueta position={[XT + 0.25, YT + alturaTermo(T), 0.2]} className={`etq-dato ${exito ? "etq-acento" : ""}`}>
              T = {T} °C
            </Etiqueta>
          )}
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -1.9, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
