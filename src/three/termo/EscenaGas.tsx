// ══ Escena del gas (Nivel 16): cambian las pesas y el mechero, y el pistón se detiene en el volumen final ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Presiones (atm = número de pesas), volúmenes (L) y temperaturas absolutas (K). */
  P1: number;
  P2: number;
  V1: number;
  V2: number;
  Vpropuesto: number | null;
  T1: number;
  T2: number;
  /** Rótulos de la presión y de la temperatura (ya formateados). */
  textoP: string;
  textoT: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const Y_BASE = -1.5; // fondo del cilindro
const K = 0.07; // unidades por litro
const R = 0.62;
const ALTO = 40 * K; // capacidad: 40 L
const N = 44; // partículas del gas
const PESA = 0.11;
const DUR = 2.8;
const T_PESAS = 0.35; // las pesas cambian al empezar
const FRIO = new THREE.Color("#5aa9ff");
const CALIENTE = new THREE.Color("#ff6a3d");
const suave = (x: number) => x * x * (3 - 2 * x);
const colorGas = (T: number, c: THREE.Color) => c.copy(FRIO).lerp(CALIENTE, Math.max(0, Math.min(1, (T - 200) / 600)));

/** Posiciones fijas de las partículas (en un cilindro unitario) y sus fases. */
function particulas() {
  let s = 7;
  const azar = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: N }, () => {
    const a = azar() * Math.PI * 2;
    const r = Math.sqrt(azar()) * 0.86;
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, y: azar(), f: azar() * 10 };
  });
}

export function EscenaGas({ P1, P2, V1, V2, Vpropuesto, T1, T2, textoP, textoT, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const piston = useRef<THREE.Group>(null!);
  const gas = useRef<THREE.InstancedMesh>(null!);
  const pesas = useRef<THREE.Mesh[]>([]);
  const llama = useRef<THREE.Mesh>(null!);
  const puntos = useMemo(() => particulas(), []);
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), c: new THREE.Color() }), []);
  const calienta = T2 > T1;
  const enfria = T2 < T1;

  const geo = useMemo(
    () => ({
      vidrio: new THREE.CylinderGeometry(R, R, ALTO, 40, 1, true),
      disco: new THREE.CylinderGeometry(1, 1, 1, 40),
      pesa: new THREE.CylinderGeometry(0.42, 0.42, PESA * 0.9, 32),
      punto: new THREE.SphereGeometry(0.045, 8, 6),
      aro: new THREE.TorusGeometry(R + 0.04, 0.022, 8, 48).rotateX(Math.PI / 2),
      llama: new THREE.ConeGeometry(0.16, 0.4, 16),
      caja: new THREE.BoxGeometry(1, 1, 1),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      vidrio: new THREE.MeshStandardMaterial({ color: "#c8d6e8", transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }),
      metal: new THREE.MeshStandardMaterial({ color: "#8a929d", metalness: 0.5, roughness: 0.4 }),
      pesa: new THREE.MeshStandardMaterial({ color: "#b08a4a", metalness: 0.5, roughness: 0.45 }),
      // blanco: el color de cada partícula (frío azul, caliente rojo) lo da su instancia
      punto: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5 }),
      marca: new THREE.MeshStandardMaterial({ color: "#86b2ff", emissive: "#86b2ff", emissiveIntensity: 0.6 }),
      base: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.8 }),
      llama: new THREE.MeshStandardMaterial({ color: enfria ? "#9fd4ff" : "#ff9a3d", emissive: enfria ? "#4fa8ff" : "#ff6a1f", emissiveIntensity: 1, transparent: true, opacity: 0.85 }),
    }),
    [enfria],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    if (exito) emitirPolvo({ pos: [0, Y_BASE + K * V2 + 0.2, 0.5], color: "#6fd6a8", n: 110, radio: 0.45, fuerza: 1 });
  }, [exito, V2]);

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
    const t = corrida ? S.t : 0;
    const u = suave(Math.max(0, Math.min(1, (t - T_PESAS) / (DUR - T_PESAS))));
    const V = V1 + (V2 - V1) * u;
    const T = T1 + (T2 - T1) * u;
    const yP = Y_BASE + K * V;
    piston.current.position.y = yP;
    // pesas: cambian al empezar (las que sobran desaparecen, las que faltan aparecen)
    const nPesas = t >= T_PESAS ? P2 : P1;
    pesas.current.forEach((m, i) => {
      if (m) m.visible = i < nPesas;
    });
    // partículas: llenan el volumen y se agitan más cuanto más caliente está el gas
    const agita = 0.02 + 0.05 * Math.sqrt(T / 600);
    const reloj = state.clock.elapsedTime * (2 + 4 * Math.sqrt(T / 600));
    const alto = yP - Y_BASE - 0.12;
    colorGas(T, tmp.c);
    puntos.forEach((p, i) => {
      const y = Y_BASE + 0.06 + p.y * alto + Math.sin(reloj + p.f) * agita;
      tmp.m.makeTranslation(p.x * R + Math.cos(reloj * 0.9 + p.f) * agita, Math.min(yP - 0.08, Math.max(Y_BASE + 0.05, y)), p.z * R);
      gas.current.setMatrixAt(i, tmp.m);
      gas.current.setColorAt(i, tmp.c);
    });
    gas.current.instanceMatrix.needsUpdate = true;
    if (gas.current.instanceColor) gas.current.instanceColor.needsUpdate = true;
    llama.current.visible = !!corrida && (calienta || enfria);
    llama.current.scale.setScalar(1 + 0.12 * Math.sin(state.clock.elapsedTime * 14));
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  const xDer = R + 0.28;
  return (
    <group>
      {/* cilindro de vidrio con su fondo */}
      <mesh geometry={geo.vidrio} material={mats.vidrio} position={[0, Y_BASE + ALTO / 2, 0]} />
      <mesh geometry={geo.disco} material={mats.metal} position={[0, Y_BASE - 0.04, 0]} scale={[R + 0.05, 0.08, R + 0.05]} />
      {/* gas */}
      <instancedMesh ref={gas} args={[geo.punto, mats.punto, N]} />
      {/* pistón con las pesas (una por atmósfera) */}
      <group ref={piston} position={[0, Y_BASE + K * V1, 0]}>
        <mesh geometry={geo.disco} material={mats.metal} position={[0, 0.05, 0]} scale={[R - 0.02, 0.1, R - 0.02]} />
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            ref={(m) => {
              if (m) pesas.current[i] = m;
            }}
            geometry={geo.pesa}
            material={mats.pesa}
            position={[0, 0.1 + PESA * (i + 0.5), 0]}
            visible={i < P1}
          />
        ))}
      </group>
      {/* marca azul del volumen propuesto, alrededor del vidrio */}
      {Vpropuesto !== null && <mesh geometry={geo.aro} material={mats.marca} position={[0, Y_BASE + K * Vpropuesto, 0]} />}
      {/* mechero (o enfriador) bajo el cilindro */}
      <mesh geometry={geo.caja} material={mats.base} position={[0, Y_BASE - 0.32, 0]} scale={[0.7, 0.18, 0.5]} />
      <mesh ref={llama} geometry={geo.llama} material={mats.llama} position={[0, Y_BASE - 0.16, 0]} visible={false} />
      {etiquetas && (
        <>
          <Etiqueta position={[-R - 0.2, Y_BASE + K * V1, 0.2]} className="etq-dato etq-izq">
            V₁ = {V1} L
          </Etiqueta>
          <Etiqueta position={[xDer, Y_BASE + ALTO - 0.1, 0.2]} className="etq-dato">
            {textoP}
          </Etiqueta>
          <Etiqueta position={[0, Y_BASE - 0.45, 0.4]} className="etq-dato etq-abajo">
            {textoT}
          </Etiqueta>
          {verValor && (
            <Etiqueta position={[xDer, Y_BASE + K * V2, 0.2]} className={`etq-dato ${exito ? "etq-acento" : ""}`}>
              V₂ = {V2} L
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
