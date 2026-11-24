// ══ Escena de la prensa hidráulica (Nivel 14): con la fuerza justa en el émbolo chico, el auto queda en equilibrio ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Fuerza real que equilibra y la propuesta (null = sin mano). */
  F: number;
  Fpropuesta: number | null;
  /** Rótulos de los émbolos y del auto (ya formateados). */
  textoA1: string;
  textoA2: string;
  textoAuto: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const X1 = -2.2; // émbolo chico
const X2 = 0.9; // émbolo grande
const R1 = 0.22;
const R2 = 0.85;
const Y_BASE = -1.3; // tubo inferior
const Y_NIVEL = 0.2; // nivel del líquido en equilibrio
const DUR = 2.2;
const DESPL = 0.7; // desplazamiento máximo del émbolo chico

export function EscenaPrensa({ F, Fpropuesta, textoA1, textoA2, textoAuto, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const emb1 = useRef<THREE.Group>(null!);
  const emb2 = useRef<THREE.Group>(null!);
  const liq1 = useRef<THREE.Mesh>(null!);
  const liq2 = useRef<THREE.Mesh>(null!);

  const geo = useMemo(
    () => ({
      cil: new THREE.CylinderGeometry(1, 1, 1, 40, 1, true),
      disco: new THREE.CylinderGeometry(1, 1, 1, 40),
      caja: new THREE.BoxGeometry(1, 1, 1),
      rueda: new THREE.CylinderGeometry(0.11, 0.11, 0.08, 16).rotateX(Math.PI / 2),
      tubo: new THREE.CylinderGeometry(0.035, 0.035, 1, 10).translate(0, 0.5, 0),
      punta: new THREE.ConeGeometry(0.09, 0.18, 16).translate(0, 0.09, 0),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      vidrio: new THREE.MeshStandardMaterial({ color: "#c8d6e8", transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false }),
      liquido: new THREE.MeshStandardMaterial({ color: "#4f8fd1", transparent: true, opacity: 0.5, depthWrite: false }),
      embolo: new THREE.MeshStandardMaterial({ color: "#8a929d", metalness: 0.4, roughness: 0.4 }),
      auto: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.5, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      rueda: new THREE.MeshStandardMaterial({ color: "#2a3038" }),
      fuerza: new THREE.MeshStandardMaterial({ color: "#ff9ecd", emissive: "#ff9ecd", emissiveIntensity: 0.3 }),
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
    mats.auto.emissiveIntensity = exito ? 0.4 : 0;
    if (exito) emitirPolvo({ pos: [X2, Y_NIVEL + 0.8, 0.4], color: "#6fd6a8", n: 120, radio: 0.5, fuerza: 1 });
  }, [exito, mats]);

  useFrame((state, dtCrudo) => {
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
    // fuerza de más: el chico baja y el auto sube; de menos, al revés (el líquido no cambia de volumen)
    const u = corrida ? Math.min(1, S.t / DUR) : 0;
    const desb = Fpropuesta === null ? 0 : Math.max(-1, Math.min(1, (Fpropuesta - F) / F));
    const tiembla = corrida && desb === 0 ? 0.015 * Math.sin(state.clock.elapsedTime * 12) * (1 - u) : 0;
    const dy1 = -DESPL * desb * (1 - (1 - u) ** 2) + tiembla;
    const dy2 = -dy1 * 0.4; // el grande se mueve menos (en una prensa real, mucho menos: aquí se exagera para que se vea)
    emb1.current.position.y = Y_NIVEL + dy1;
    emb2.current.position.y = Y_NIVEL + dy2;
    liq1.current.scale.y = Y_NIVEL + dy1 - Y_BASE;
    liq1.current.position.y = (Y_NIVEL + dy1 + Y_BASE) / 2;
    liq2.current.scale.y = Y_NIVEL + dy2 - Y_BASE;
    liq2.current.position.y = (Y_NIVEL + dy2 + Y_BASE) / 2;
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  // el chico es alto (su émbolo recorre ±DESPL); el grande, bajo, para que se vea el auto
  const alto1 = Y_NIVEL + DESPL + 0.12 - Y_BASE;
  const alto2 = Y_NIVEL + 0.35 - Y_BASE;
  return (
    <group>
      {/* cilindros de vidrio y tubo que los une por abajo */}
      <mesh geometry={geo.cil} material={mats.vidrio} position={[X1, Y_BASE + alto1 / 2, 0]} scale={[R1 + 0.02, alto1, R1 + 0.02]} />
      <mesh geometry={geo.cil} material={mats.vidrio} position={[X2, Y_BASE + alto2 / 2, 0]} scale={[R2 + 0.02, alto2, R2 + 0.02]} />
      <mesh geometry={geo.caja} material={mats.liquido} position={[(X1 + X2) / 2, Y_BASE - 0.12, 0]} scale={[X2 - X1, 0.24, 0.3]} />
      <mesh ref={liq1} geometry={geo.disco} material={mats.liquido} position={[X1, (Y_NIVEL + Y_BASE) / 2, 0]} scale={[R1, Y_NIVEL - Y_BASE, R1]} />
      <mesh ref={liq2} geometry={geo.disco} material={mats.liquido} position={[X2, (Y_NIVEL + Y_BASE) / 2, 0]} scale={[R2, Y_NIVEL - Y_BASE, R2]} />
      {/* émbolo chico con la fuerza de la mano */}
      <group ref={emb1} position={[X1, Y_NIVEL, 0]}>
        <mesh geometry={geo.disco} material={mats.embolo} position={[0, 0.05, 0]} scale={[R1, 0.1, R1]} />
        {Fpropuesta !== null && (
          <group position={[0, 0.75, 0.2]} rotation={[0, 0, Math.PI]}>
            <mesh geometry={geo.tubo} material={mats.fuerza} scale={[1, 0.47, 1]} />
            <mesh geometry={geo.punta} material={mats.fuerza} position={[0, 0.47, 0]} />
          </group>
        )}
      </group>
      {/* émbolo grande con el auto */}
      <group ref={emb2} position={[X2, Y_NIVEL, 0]}>
        <mesh geometry={geo.disco} material={mats.embolo} position={[0, 0.05, 0]} scale={[R2, 0.1, R2]} />
        <mesh geometry={geo.caja} material={mats.auto} position={[0, 0.36, 0]} scale={[1.2, 0.34, 0.5]} />
        <mesh geometry={geo.caja} material={mats.auto} position={[-0.05, 0.62, 0]} scale={[0.65, 0.2, 0.46]} />
        <mesh geometry={geo.rueda} material={mats.rueda} position={[-0.38, 0.19, 0.26]} />
        <mesh geometry={geo.rueda} material={mats.rueda} position={[0.38, 0.19, 0.26]} />
        {etiquetas && (
          <Etiqueta position={[0, 0.8, 0.2]} className="etq-dato etq-centro">
            {textoAuto}
          </Etiqueta>
        )}
      </group>
      {etiquetas && (
        <>
          <Etiqueta position={[X1, Y_BASE - 0.3, 0.3]} className="etq-dato etq-abajo">
            {textoA1}
          </Etiqueta>
          <Etiqueta position={[X2, Y_BASE - 0.3, 0.3]} className="etq-dato etq-abajo">
            {textoA2}
          </Etiqueta>
          {Fpropuesta !== null && !corrida && (
            <Etiqueta position={[X1 - 0.18, Y_NIVEL + 0.55, 0.2]} className="etq-dato etq-izq etq-acento">
              F₁ = {Fpropuesta} N
            </Etiqueta>
          )}
          {verValor && (
            <Etiqueta position={[X1 - 0.18, Y_NIVEL + 0.55, 0.2]} className={`etq-dato etq-izq ${exito ? "etq-acento" : ""}`}>
              F₁ = {F} N
            </Etiqueta>
          )}
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -2.1, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
