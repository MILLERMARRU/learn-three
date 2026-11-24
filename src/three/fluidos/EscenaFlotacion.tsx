// ══ Escena de flotación (Nivel 14): el bloque cae al líquido y se asienta donde el empuje iguala su peso ───────
// A la derecha, un bloque fantasma flota a la profundidad propuesta; una línea azul la marca a lo ancho del recipiente.
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Color del líquido y del bloque. */
  colorLiquido: string;
  colorBloque: string;
  /** Altura del bloque (cm), profundidad real y propuesta (cm; null = sin fantasma). */
  H: number;
  h: number;
  hPropuesta: number | null;
  /** Rótulos del bloque y del líquido. */
  textoBloque: string;
  textoLiquido: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  /** Si el bloque está cayendo (su rótulo se oculta mientras se mueve). */
  moviendo?: boolean;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const ANCHO = 4.6; // recipiente
const Y_FONDO = -1.7;
const Y_SUP = 0.35; // superficie del líquido
const H_VIS = 1.4; // todos los bloques se dibujan con esta altura (cuenta la fracción sumergida)
const LADO = 1.05;
const XR = -1; // bloque real
const XF = 1.1; // bloque fantasma
const DUR = 2.8;

export function EscenaFlotacion({ colorLiquido, colorBloque, H, h, hPropuesta, textoBloque, textoLiquido, verValor = false, corrida = null, moviendo = false, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const real = useRef<THREE.Group>(null!);
  const yMeta = Y_SUP - (h / H) * H_VIS; // base del bloque real en reposo
  const yProp = hPropuesta === null ? null : Y_SUP - (Math.min(hPropuesta, H) / H) * H_VIS;
  const y0 = Y_SUP + 0.25; // antes de soltarlo, cuelga sobre el líquido

  const geo = useMemo(() => ({ caja: new THREE.BoxGeometry(1, 1, 1) }), []);
  const bordes = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(LADO, H_VIS, LADO * 0.8)), []);
  const mats = useMemo(
    () => ({
      vidrio: new THREE.MeshStandardMaterial({ color: "#c8d6e8", transparent: true, opacity: 0.1, depthWrite: false }),
      liquido: new THREE.MeshStandardMaterial({ color: colorLiquido, transparent: true, opacity: 0.42, depthWrite: false }),
      bloque: new THREE.MeshStandardMaterial({ color: colorBloque, roughness: 0.6, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.22, depthWrite: false }),
      bordeF: new THREE.LineBasicMaterial({ color: "#86b2ff" }),
      linea: new THREE.MeshStandardMaterial({ color: "#86b2ff", emissive: "#86b2ff", emissiveIntensity: 0.6 }),
      regla: new THREE.MeshStandardMaterial({ color: "#6fd6a8", emissive: "#6fd6a8", emissiveIntensity: 0.4 }),
    }),
    [colorLiquido, colorBloque],
  );
  useEffect(
    () => () => {
      geo.caja.dispose();
      bordes.dispose();
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, bordes, mats],
  );
  useEffect(() => {
    mats.bloque.emissiveIntensity = exito ? 0.35 : 0;
    if (exito) emitirPolvo({ pos: [XR, Y_SUP + 0.3, 0.5], color: "#6fd6a8", n: 110, radio: 0.45, fuerza: 1 });
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
    // cae y oscila amortiguado alrededor de su profundidad de equilibrio
    const yBase = corrida ? (S.t >= DUR - 1e-9 ? yMeta : yMeta + (y0 - yMeta) * Math.exp(-2.2 * S.t) * Math.cos(4.4 * S.t)) : y0;
    real.current.position.y = yBase + H_VIS / 2;
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  return (
    <group>
      {/* recipiente con el líquido */}
      <mesh geometry={geo.caja} material={mats.liquido} position={[0, (Y_FONDO + Y_SUP) / 2, 0]} scale={[ANCHO - 0.04, Y_SUP - Y_FONDO, 1.3]} />
      <mesh geometry={geo.caja} material={mats.vidrio} position={[0, (Y_FONDO + Y_SUP + 0.5) / 2, 0]} scale={[ANCHO, Y_SUP + 0.5 - Y_FONDO, 1.34]} />
      {/* bloque real */}
      <group ref={real} position={[XR, y0 + H_VIS / 2, 0]}>
        <mesh geometry={geo.caja} material={mats.bloque} scale={[LADO, H_VIS, LADO * 0.8]} />
      </group>
      {/* bloque fantasma a la profundidad propuesta y la línea que la marca */}
      {yProp !== null && (
        <>
          <group position={[XF, yProp + H_VIS / 2, 0]}>
            <mesh geometry={geo.caja} material={mats.fantasma} scale={[LADO, H_VIS, LADO * 0.8]} />
            <lineSegments geometry={bordes} material={mats.bordeF} />
          </group>
          <mesh geometry={geo.caja} material={mats.linea} position={[0, yProp, 0.68]} scale={[ANCHO, 0.018, 0.018]} />
        </>
      )}
      {/* al acertar: la profundidad real, con una regla a la izquierda del bloque */}
      {verValor && (
        <>
          <mesh geometry={geo.caja} material={mats.regla} position={[XR - LADO / 2 - 0.22, (Y_SUP + yMeta) / 2, 0.5]} scale={[0.02, Y_SUP - yMeta, 0.02]} />
          <mesh geometry={geo.caja} material={mats.regla} position={[XR - LADO / 2 - 0.22, yMeta, 0.5]} scale={[0.14, 0.02, 0.02]} />
        </>
      )}
      {etiquetas && (
        <>
          <Etiqueta position={[0, Y_FONDO - 0.08, 0.7]} className="etq-dato etq-abajo">
            {textoLiquido}
          </Etiqueta>
          {!moviendo && (
            <Etiqueta position={[XR, (corrida ? yMeta : y0) + H_VIS + 0.12, 0.3]} className="etq-dato etq-centro">
              {textoBloque}
            </Etiqueta>
          )}
          {verValor && (
            <Etiqueta position={[XR - LADO / 2 - 0.32, (Y_SUP + yMeta) / 2, 0.5]} className={`etq-dato etq-izq ${exito ? "etq-acento" : ""}`}>
              h = {h} cm
            </Etiqueta>
          )}
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
