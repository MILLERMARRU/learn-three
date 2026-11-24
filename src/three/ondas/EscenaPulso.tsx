// ══ Escena del pulso (Nivel 13): un pulso recorre una cuerda tensada por una pesa; el fantasma viaja con la velocidad propuesta ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";
import { crearCinta, escribirCinta } from "./cinta";

interface Props {
  T: number;
  mu: number;
  masa?: number;
  /** Velocidad real y propuesta (fantasma; null = sin fantasma). */
  v: number;
  vFantasma: number | null;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const X0 = -3.4; // soporte izquierdo
const X1 = 3.1; // polea
const Y = 0.6; // altura de la cuerda
const R_POLEA = 0.22;
const N = 200;
const AMP = 0.42;
const ANCHO = 0.32; // ancho del pulso
const DUR = 2.2; // s reales que tarda el pulso real en llegar a la polea
const GROSOR = 0.03;
const fmt = (n: number) => String(n).replace(".", ",");

export function EscenaPulso({ T, mu, masa, v, vFantasma, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const largo = X1 - X0;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const geo = useMemo(
    () => ({
      real: crearCinta(N),
      fan: crearCinta(N),
      caja: new THREE.BoxGeometry(1, 1, 1),
      polea: new THREE.CylinderGeometry(R_POLEA, R_POLEA, 0.1, 32).rotateX(Math.PI / 2),
      cuelga: new THREE.BoxGeometry(0.015, 1, 0.015),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      cuerda: new THREE.MeshStandardMaterial({ color: "#d9c3a0", side: THREE.DoubleSide, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false, emissive: "#86b2ff", emissiveIntensity: 0.35 }),
      soporte: new THREE.MeshStandardMaterial({ color: "#39404b", roughness: 0.7 }),
      polea: new THREE.MeshStandardMaterial({ color: "#8a929d", metalness: 0.4, roughness: 0.4 }),
      pesa: new THREE.MeshStandardMaterial({ color: "#8a929d", roughness: 0.45, metalness: 0.3 }),
      hilo: new THREE.MeshStandardMaterial({ color: "#c9b48d" }),
    }),
    [],
  );
  const fan = useRef<THREE.Mesh>(null);
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    mats.cuerda.emissiveIntensity = exito ? 0.45 : 0;
    if (exito) emitirPolvo({ pos: [X1, Y + 0.3, 0.4], color: "#6fd6a8", n: 110, radio: 0.4, fuerza: 1 });
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
    // el pulso real recorre la cuerda en DUR; el fantasma, en proporción a su velocidad
    const pulso = (c: number) => (x: number) => Y + AMP * Math.exp(-(((x - c) / ANCHO) ** 2));
    const cReal = corrida ? X0 + (largo * S.t) / DUR : X0 - 1;
    escribirCinta(geo.real, X0, X1, pulso(cReal), 0, GROSOR);
    if (vFantasma !== null) {
      const cFan = X0 + ((largo * S.t) / DUR) * (vFantasma / v);
      escribirCinta(geo.fan, X0, X1, pulso(Math.min(X1 + 1, cFan)), 0.06, GROSOR);
    }
    if (fan.current) fan.current.visible = !!corrida && vFantasma !== null;
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  const yPesa = Y - 1.25;
  return (
    <group>
      <mesh geometry={geo.real} material={mats.cuerda} />
      <mesh ref={fan} geometry={geo.fan} material={mats.fantasma} visible={false} />
      {/* soporte izquierdo, polea y pesa que tensa la cuerda */}
      <mesh geometry={geo.caja} material={mats.soporte} position={[X0 - 0.08, Y - 0.5, 0]} scale={[0.16, 1.4, 0.4]} />
      <mesh geometry={geo.polea} material={mats.polea} position={[X1, Y - R_POLEA, 0]} />
      <mesh geometry={geo.caja} material={mats.soporte} position={[X1, Y - 0.85, -0.1]} scale={[0.08, 1.3, 0.08]} />
      <mesh geometry={geo.cuelga} material={mats.hilo} position={[X1 + R_POLEA, (Y - R_POLEA + yPesa) / 2, 0]} scale={[1, Y - R_POLEA - yPesa, 1]} />
      <mesh geometry={geo.caja} material={mats.pesa} position={[X1 + R_POLEA, yPesa - 0.18, 0]} scale={[0.34, 0.36, 0.34]} />
      {etiquetas && (
        <>
          {/* bajo la cuerda: los pulsos suben y pasarían por encima del rótulo */}
          <Etiqueta position={[X0 + 1.4, Y - 0.1, 0.2]} className="etq-dato etq-abajo">
            μ = {fmt(mu)} kg/m
          </Etiqueta>
          {/* a la derecha de la pesa: la tensión (y la masa si la da una pesa) */}
          <Etiqueta position={[X1 + R_POLEA + 0.25, yPesa - 0.18, 0.2]} className="etq-dato">
            {masa ? `${fmt(masa)} kg · ` : ""}T = {fmt(T)} N
          </Etiqueta>
          {verValor && (
            <Etiqueta position={[0, Y + 0.85, 0.3]} className={`etq-dato etq-centro ${exito ? "etq-acento" : ""}`}>
              v = {v} m/s
            </Etiqueta>
          )}
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -1.3, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
