// ══ Escena del riel (Nivel 11): dos carritos chocan (pegados o rebotando) o un resorte los separa; fantasma del carrito pedido ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  m1: number;
  m2: number;
  /** choque: vienen con u₁ y u₂ y se encuentran en x = 0 · explosion: parten juntos y un resorte los separa. */
  modo: "choque" | "explosion";
  u1: number;
  u2: number;
  /** Velocidades reales después (m/s, con signo). */
  w1: number;
  w2: number;
  /** Qué carrito tiene fantasma: el 1, el 2 o los dos pegados (choque plástico). */
  fantasmaDe: 1 | 2 | "juntos";
  propuesta: number | null;
  /** Rótulo del resultado (al acertar, o en el examen); null = oculto. */
  rotulo?: string | null;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const ALTO = 0.34;
const T_ANTES = 1.1; // s reales hasta el choque
const T_SUELTA = 0.4; // s reales hasta que el resorte se suelta
const T_DESPUES = 2; // s reales después
const HUECO = 0.14; // explosión: medio espacio entre los carritos (el resorte comprimido)
const largo = (m: number) => Math.min(0.95, 0.5 + 0.06 * m);
const fmt = (n: number) => String(n).replace("-", "−").replace(".", ",");
const textoV = (v: number) => (v === 0 ? "en reposo" : `${fmt(v)} m/s`);

export function EscenaRiel({ m1, m2, modo, u1, u2, w1, w2, fantasmaDe, propuesta, rotulo = null, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const L1 = largo(m1);
  const L2 = largo(m2);
  const tc = modo === "choque" ? T_ANTES : T_SUELTA;
  const tFin = tc + T_DESPUES;
  const s = 3.4 / (T_DESPUES * Math.max(Math.abs(u1), Math.abs(u2), Math.abs(w1), Math.abs(w2), Math.abs(propuesta ?? 0), 1));
  // posiciones (centros) en el instante del choque o de la suelta
  const c1 = modo === "choque" ? -L1 / 2 : -HUECO - L1 / 2;
  const c2 = modo === "choque" ? L2 / 2 : HUECO + L2 / 2;
  const x1At = (t: number) => (t < tc ? c1 + (modo === "choque" ? u1 * s * (t - tc) : 0) : c1 + w1 * s * (t - tc));
  const x2At = (t: number) => (t < tc ? c2 + (modo === "choque" ? u2 * s * (t - tc) : 0) : c2 + w2 * s * (t - tc));

  const g1 = useRef<THREE.Group>(null!);
  const g2 = useRef<THREE.Group>(null!);
  const fan = useRef<THREE.Group>(null);
  const resorte = useRef<THREE.Mesh>(null);
  const sim = useRef({ id: -1, t: 0, fin: false });

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      rueda: new THREE.CylinderGeometry(0.07, 0.07, 0.06, 16).rotateX(Math.PI / 2),
      resorte: new THREE.TorusKnotGeometry(0.06, 0.012, 64, 6, 6, 1).rotateY(Math.PI / 2),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      riel: new THREE.MeshStandardMaterial({ color: "#39404b", roughness: 0.5, metalness: 0.3 }),
      c1: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.5, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      c2: new THREE.MeshStandardMaterial({ color: "#8a929d", roughness: 0.45, metalness: 0.25, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      rueda: new THREE.MeshStandardMaterial({ color: "#2a3038" }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.38, depthWrite: false, emissive: "#86b2ff", emissiveIntensity: 0.3 }),
      resorte: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.3 }),
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
    mats.c1.emissiveIntensity = exito ? 0.35 : 0;
    mats.c2.emissiveIntensity = exito ? 0.35 : 0;
    if (exito) emitirPolvo({ pos: [0, ALTO + 0.3, 0.4], color: "#6fd6a8", n: 120, radio: 0.4, fuerza: 1.1 });
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
    // antes de soltar, cada carrito espera en su punto de partida
    const t = corrida ? S.t : 0;
    const x1 = x1At(t);
    const x2 = x2At(t);
    g1.current.position.x = x1;
    g2.current.position.x = x2;
    // el resorte comprimido va entre los dos y se queda pegado al carrito 1 al soltarse
    if (resorte.current) {
      const suelto = corrida && t >= tc;
      resorte.current.position.x = x1 + L1 / 2 + (suelto ? HUECO * 1.6 : HUECO);
      resorte.current.scale.x = suelto ? 3.2 : 2;
    }
    if (fan.current && propuesta !== null) {
      const despues = corrida && t >= tc;
      fan.current.visible = !!despues;
      const base = fantasmaDe === 1 ? c1 : fantasmaDe === 2 ? c2 : (c1 + c2) / 2;
      fan.current.position.x = base + propuesta * s * Math.max(0, t - tc);
    }
    if (corrida && !S.fin && S.t >= tFin - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  const carrito = (L: number, mat: THREE.Material) => (
    <>
      <mesh geometry={geo.caja} material={mat} position={[0, 0.07 + ALTO / 2, 0]} scale={[L, ALTO, 0.42]} />
      <mesh geometry={geo.rueda} material={mats.rueda} position={[-L / 2 + 0.12, 0.07, 0.22]} />
      <mesh geometry={geo.rueda} material={mats.rueda} position={[L / 2 - 0.12, 0.07, 0.22]} />
    </>
  );
  const anchoFan = fantasmaDe === 1 ? L1 : fantasmaDe === 2 ? L2 : L1 + L2;

  return (
    <group>
      <mesh geometry={geo.caja} material={mats.riel} position={[0, -0.03, 0]} scale={[8.2, 0.06, 0.6]} />
      <group ref={g1} position={[x1At(0), 0, 0]}>
        {carrito(L1, mats.c1)}
      </group>
      <group ref={g2} position={[x2At(0), 0, 0]}>
        {carrito(L2, mats.c2)}
      </group>
      {modo === "explosion" && <mesh ref={resorte} geometry={geo.resorte} material={mats.resorte} position={[c1 + L1 / 2 + HUECO, 0.07 + ALTO / 2, 0]} scale={[2, 1, 1]} />}
      {propuesta !== null && (
        <group ref={fan} position={[0, 0, 0.3]} visible={false}>
          <mesh geometry={geo.caja} material={mats.fantasma} position={[0, 0.07 + ALTO / 2, 0]} scale={[anchoFan * 1.04, ALTO * 1.08, 0.42]} />
        </group>
      )}

      {/* rótulos fijos donde parten los carritos: se ocultan al soltar (si no, taparían al fantasma) */}
      {etiquetas && !corrida && (
        <>
          <Etiqueta position={[x1At(0), 0.07 + ALTO + 0.06, 0]} className="etq-dato etq-centro">
            {fmt(m1)} kg
          </Etiqueta>
          <Etiqueta position={[x2At(0), 0.07 + ALTO + 0.06, 0]} className="etq-dato etq-centro">
            {fmt(m2)} kg
          </Etiqueta>
          {modo === "choque" ? (
            <>
              <Etiqueta position={[x1At(0), -0.08, 0.3]} className="etq-dato etq-abajo">
                {textoV(u1)}
              </Etiqueta>
              <Etiqueta position={[x2At(0), -0.08, 0.3]} className="etq-dato etq-abajo">
                {textoV(u2)}
              </Etiqueta>
            </>
          ) : (
            <Etiqueta position={[x1At(0), -0.08, 0.3]} className="etq-dato etq-abajo">
              sale a {fmt(w1)} m/s
            </Etiqueta>
          )}
        </>
      )}
      {etiquetas && rotulo && (
        <Etiqueta position={[0, 1.05, 0.3]} className={`etq-dato etq-centro ${exito ? "etq-acento" : ""}`}>
          {rotulo}
        </Etiqueta>
      )}
      {previa && (
        <Etiqueta position={[0, -0.8, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
