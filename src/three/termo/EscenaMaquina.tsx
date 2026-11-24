// ══ Escena de la máquina térmica (Nivel 16): el calor fluye del foco caliente, una parte sale como trabajo y el medidor marca η ───────
// El ancho de cada flecha es proporcional a su energía: Q₁ = W + Q₂.
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Eficiencia real y propuesta (%; null = sin marca). */
  eta: number;
  etaPropuesta: number | null;
  /** Rótulos de los focos y de las flechas («» = sin rótulo). */
  textoCaliente: string;
  textoFrio: string;
  textoQ1: string;
  textoW: string;
  textoQ2: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const XM = -0.7; // máquina y focos
const Y_CAL = 1.3;
const Y_FRI = -1.3;
const R_MAQ = 0.42;
const ANCHO_MAX = 0.5; // ancho de la flecha de Q₁
const X_W1 = 2.0; // punta de la flecha del trabajo
const XG = 0.75; // medidor de eficiencia (a la derecha del foco frío)
const YG = -0.7;
const LARGO_G = 2.2;
const DUR = 3;
const suave = (x: number) => x * x * (3 - 2 * x);
const tramo = (t: number, a: number, b: number) => suave(Math.max(0, Math.min(1, (t - a) / (b - a))));

export function EscenaMaquina({ eta, etaPropuesta, textoCaliente, textoFrio, textoQ1, textoW, textoQ2, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const q1 = useRef<THREE.Group>(null!);
  const w = useRef<THREE.Group>(null!);
  const q2 = useRef<THREE.Group>(null!);
  const rueda = useRef<THREE.Group>(null!);
  const barra = useRef<THREE.Mesh>(null!);
  const f = eta / 100;

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      rueda: new THREE.CylinderGeometry(R_MAQ, R_MAQ, 0.3, 12).rotateX(Math.PI / 2),
      eje: new THREE.CylinderGeometry(0.1, 0.1, 0.34, 16).rotateX(Math.PI / 2),
      // punta de flecha que apunta a +y, con su base en y = 0
      punta: new THREE.ConeGeometry(0.5, 1, 3).translate(0, 0.5, 0),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      caliente: new THREE.MeshStandardMaterial({ color: "#ff6a3d", emissive: "#ff5a1f", emissiveIntensity: 0.35, roughness: 0.6 }),
      frio: new THREE.MeshStandardMaterial({ color: "#4f8fd1", emissive: "#2f6fb1", emissiveIntensity: 0.3, roughness: 0.6 }),
      maquina: new THREE.MeshStandardMaterial({ color: "#8a929d", metalness: 0.5, roughness: 0.4 }),
      q1: new THREE.MeshStandardMaterial({ color: "#ff8a5c", emissive: "#ff8a5c", emissiveIntensity: 0.3 }),
      w: new THREE.MeshStandardMaterial({ color: "#6fd6a8", emissive: "#6fd6a8", emissiveIntensity: 0.35 }),
      q2: new THREE.MeshStandardMaterial({ color: "#86a8d6", emissive: "#86a8d6", emissiveIntensity: 0.25 }),
      marco: new THREE.MeshStandardMaterial({ color: "#2a3038" }),
      marca: new THREE.MeshStandardMaterial({ color: "#86b2ff", emissive: "#86b2ff", emissiveIntensity: 0.6 }),
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
    if (exito) emitirPolvo({ pos: [XG + LARGO_G * f, YG, 0.4], color: "#6fd6a8", n: 110, radio: 0.35, fuerza: 1 });
  }, [exito, f]);

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
    const t = corrida ? S.t : 0;
    // primero entra Q₁, luego salen W y Q₂, y al final el medidor llega a η
    q1.current.scale.y = Math.max(0.001, tramo(t, 0, 0.8));
    w.current.scale.x = Math.max(0.001, tramo(t, 0.8, 1.7));
    q2.current.scale.y = Math.max(0.001, tramo(t, 0.8, 1.7));
    const u = tramo(t, 1.7, DUR);
    barra.current.scale.x = Math.max(0.001, LARGO_G * f * u);
    barra.current.position.x = XG + (LARGO_G * f * u) / 2;
    if (corrida) rueda.current.rotation.z -= d * (1 + 5 * tramo(t, 0.6, 1.2));
    q1.current.visible = !!corrida;
    q2.current.visible = !!corrida;
    w.current.visible = !!corrida;
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  // flechas: el cuerpo y la punta escalan juntos desde su origen (crecen al empezar)
  const a1 = ANCHO_MAX;
  const aW = Math.max(0.04, ANCHO_MAX * f);
  const a2 = Math.max(0.04, ANCHO_MAX * (1 - f));
  const largoV = Y_CAL - 0.25 - R_MAQ - 0.05; // de foco a máquina
  const largoW = X_W1 - (XM + R_MAQ + 0.05);
  const xProp = etaPropuesta === null ? null : XG + (LARGO_G * Math.min(100, etaPropuesta)) / 100;
  return (
    <group>
      {/* focos caliente y frío */}
      <mesh geometry={geo.caja} material={mats.caliente} position={[XM, Y_CAL, 0]} scale={[2.2, 0.5, 0.8]} />
      <mesh geometry={geo.caja} material={mats.frio} position={[XM, Y_FRI, 0]} scale={[2.2, 0.5, 0.8]} />
      {/* máquina: una rueda que gira */}
      <group ref={rueda} position={[XM, 0, 0]}>
        <mesh geometry={geo.rueda} material={mats.maquina} />
        <mesh geometry={geo.eje} material={mats.marco} />
        {[0, 1, 2].map((i) => (
          <mesh key={i} geometry={geo.caja} material={mats.marco} rotation={[0, 0, (i * Math.PI) / 3]} scale={[2 * R_MAQ - 0.08, 0.06, 0.32]} />
        ))}
      </group>
      {/* Q₁: del foco caliente hacia abajo, a la máquina */}
      <group ref={q1} position={[XM, Y_CAL - 0.25, 0.1]} rotation={[0, 0, Math.PI]} visible={false}>
        <mesh geometry={geo.caja} material={mats.q1} position={[0, (largoV - 0.22) / 2, 0]} scale={[a1 * 0.6, largoV - 0.22, 0.08]} />
        <mesh geometry={geo.punta} material={mats.q1} position={[0, largoV - 0.22, 0]} scale={[a1, 0.22, 0.08]} />
      </group>
      {/* W: de la máquina hacia la derecha */}
      <group ref={w} position={[XM + R_MAQ + 0.05, 0, 0.1]} visible={false}>
        <mesh geometry={geo.caja} material={mats.w} position={[(largoW - 0.22) / 2, 0, 0]} scale={[largoW - 0.22, aW * 0.6, 0.08]} />
        <mesh geometry={geo.punta} material={mats.w} position={[largoW - 0.22, 0, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[aW, 0.22, 0.08]} />
      </group>
      {/* Q₂: de la máquina hacia abajo, al foco frío */}
      <group ref={q2} position={[XM, -R_MAQ - 0.05, 0.1]} rotation={[0, 0, Math.PI]} visible={false}>
        <mesh geometry={geo.caja} material={mats.q2} position={[0, (largoV - 0.22) / 2, 0]} scale={[a2 * 0.6, largoV - 0.22, 0.08]} />
        <mesh geometry={geo.punta} material={mats.q2} position={[0, largoV - 0.22, 0]} scale={[a2, 0.22, 0.08]} />
      </group>
      {/* medidor de eficiencia sin números: marco, barra y la marca azul */}
      <mesh geometry={geo.caja} material={mats.marco} position={[XG + LARGO_G / 2, YG, -0.02]} scale={[LARGO_G + 0.08, 0.26, 0.04]} />
      <mesh ref={barra} geometry={geo.caja} material={mats.w} position={[XG, YG, 0.02]} scale={[0.001, 0.18, 0.04]} />
      {xProp !== null && <mesh geometry={geo.caja} material={mats.marca} position={[xProp, YG, 0.06]} scale={[0.03, 0.42, 0.03]} />}
      {etiquetas && (
        <>
          <Etiqueta position={[XM, Y_CAL + 0.25, 0.3]} className="etq-dato etq-centro">
            {textoCaliente}
          </Etiqueta>
          <Etiqueta position={[XM, Y_FRI - 0.25, 0.3]} className="etq-dato etq-abajo">
            {textoFrio}
          </Etiqueta>
          {textoQ1 && (
            <Etiqueta position={[XM - 0.35, (Y_CAL - 0.25 + R_MAQ + 0.05) / 2, 0.3]} className="etq-dato etq-izq">
              {textoQ1}
            </Etiqueta>
          )}
          {textoQ2 && (
            <Etiqueta position={[XM - 0.35, (Y_FRI + 0.25 - R_MAQ - 0.05) / 2, 0.3]} className="etq-dato etq-izq">
              {textoQ2}
            </Etiqueta>
          )}
          {textoW && (
            <Etiqueta position={[(XM + X_W1) / 2 + 0.2, 0.3, 0.3]} className="etq-dato etq-centro">
              {textoW}
            </Etiqueta>
          )}
          <Etiqueta position={[XG - 0.1, YG, 0.2]} className="etq-dato etq-izq">
            η
          </Etiqueta>
          {verValor && (
            <Etiqueta position={[XG + LARGO_G * f, YG - 0.2, 0.2]} className={`etq-dato etq-abajo ${exito ? "etq-acento" : ""}`}>
              η = {eta} %
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
