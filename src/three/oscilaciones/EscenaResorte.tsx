// ══ Escena del resorte (Nivel 12): un bloque oscila unido a un resorte; el fantasma oscila con el período propuesto ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  m: number;
  k: number;
  /** Período real (s) y el propuesto (fantasma; null = sin fantasma). */
  T: number;
  Tfantasma: number | null;
  /** Rotular el período real (al acertar, o en el examen). */
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const X_PARED = -3.2;
const LADO = 0.6;
const A = 1.1; // amplitud visual
const Y = 0.32; // altura del eje del resorte
const T_VIS = 1.6; // s reales que dura un período real
const VUELTAS = 2;
const fmt = (n: number) => String(n).replace(".", ",");

/** Hélice de largo 1 a lo largo de x: se estira con scale.x. */
function geometriaResorte(): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = [];
  const espiras = 11;
  for (let i = 0; i <= espiras * 24; i++) {
    const u = i / (espiras * 24);
    const a = u * espiras * Math.PI * 2;
    pts.push(new THREE.Vector3(u, 0.11 * Math.sin(a), 0.11 * Math.cos(a)));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), espiras * 24, 0.018, 6, false);
}

export function EscenaResorte({ m, k, T, Tfantasma, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const tFin = T_VIS * VUELTAS;

  const bloque = useRef<THREE.Group>(null!);
  const resorte = useRef<THREE.Mesh>(null!);
  const fantasma = useRef<THREE.Group>(null);
  const sim = useRef({ id: -1, t: 0, fin: false });

  const geo = useMemo(() => ({ caja: new THREE.BoxGeometry(1, 1, 1), resorte: geometriaResorte() }), []);
  const mats = useMemo(
    () => ({
      piso: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.9 }),
      pared: new THREE.MeshStandardMaterial({ color: "#39404b", roughness: 0.8 }),
      resorte: new THREE.MeshStandardMaterial({ color: "#c9b48d", metalness: 0.4, roughness: 0.4 }),
      bloque: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.5, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.38, depthWrite: false, emissive: "#86b2ff", emissiveIntensity: 0.3 }),
      marca: new THREE.MeshStandardMaterial({ color: "#5d6673" }),
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
    mats.bloque.emissiveIntensity = exito ? 0.4 : 0;
    if (exito) emitirPolvo({ pos: [A, Y + 0.3, 0.4], color: "#6fd6a8", n: 120, radio: 0.4, fuerza: 1.1 });
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
    if (corrida && !S.fin) S.t = Math.min(tFin, S.t + d);
    // se suelta desde el extremo estirado (x = +A): x = A·cos(2πt/T), con T real = T_VIS
    const x = A * Math.cos((2 * Math.PI * S.t) / T_VIS);
    bloque.current.position.x = x;
    const izq = X_PARED + 0.1;
    resorte.current.position.x = izq;
    resorte.current.scale.x = Math.max(0.1, x - LADO / 2 - izq);
    if (fantasma.current && Tfantasma !== null) {
      fantasma.current.visible = !!corrida;
      fantasma.current.position.x = A * Math.cos((2 * Math.PI * S.t) / ((T_VIS * Tfantasma) / T));
    }
    if (corrida && !S.fin && S.t >= tFin - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  return (
    <group>
      <mesh geometry={geo.caja} material={mats.piso} position={[0, -0.05, 0]} scale={[7.2, 0.1, 1]} />
      <mesh geometry={geo.caja} material={mats.pared} position={[X_PARED, 0.5, 0]} scale={[0.2, 1.1, 1]} />
      {/* marcas: posición de equilibrio y los extremos ±A */}
      {[-A, 0, A].map((xm) => (
        <mesh key={xm} geometry={geo.caja} material={mats.marca} position={[xm, 0.005, 0.52]} scale={[0.02, 0.01, 0.06]} />
      ))}
      <mesh ref={resorte} geometry={geo.resorte} material={mats.resorte} position={[X_PARED + 0.1, Y, 0]} scale={[A - LADO / 2 - X_PARED - 0.1, 1, 1]} />
      <group ref={bloque} position={[A, 0, 0]}>
        <mesh geometry={geo.caja} material={mats.bloque} position={[0, LADO / 2, 0]} scale={[LADO, LADO, 0.6]} />
      </group>
      {Tfantasma !== null && (
        <group ref={fantasma} position={[A, 0, 0.34]} visible={false}>
          <mesh geometry={geo.caja} material={mats.fantasma} position={[0, LADO / 2, 0]} scale={[LADO * 1.05, LADO * 1.05, 0.6]} />
        </group>
      )}
      {etiquetas && (
        <>
          {/* cerca de la pared: el bloque, en su extremo izquierdo, llega hasta x = −A − lado/2 */}
          <Etiqueta position={[X_PARED + 0.9, Y + 0.3, 0]} className="etq-dato etq-centro">
            k = {fmt(k)} N/m
          </Etiqueta>
          {!corrida && (
            <Etiqueta position={[A, LADO + 0.06, 0]} className="etq-dato etq-centro">
              {fmt(m)} kg
            </Etiqueta>
          )}
          <Etiqueta position={[0, -0.12, 0.5]} className="etq-eje etq-abajo">
            equilibrio
          </Etiqueta>
          {verValor && (
            <Etiqueta position={[0, 1.25, 0.3]} className={`etq-dato etq-centro ${exito ? "etq-acento" : ""}`}>
              T = {fmt(T)} s
            </Etiqueta>
          )}
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -0.8, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
