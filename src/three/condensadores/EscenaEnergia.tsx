// ══ Escena de la energía de un condensador (Nivel 19): al cerrar el interruptor se descarga en un foco que destella ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { anguloMedidor, Medidor } from "../circuitos/Medidor";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Energía real y propuesta (mJ; null = sin marca) y fondo de escala del medidor. */
  U: number;
  propuesta: number | null;
  escala: number;
  textoArriba: string;
  textoAbajo: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const X0 = -1.6; // circuito: el condensador en el cable de la izquierda y el foco en el de la derecha
const X1 = 0.5;
const Y0 = -0.95;
const Y1 = 0.95;
const SEP = 0.17; // media separación de las placas (horizontales)
const XS = -0.55; // interruptor (en el cable de arriba)
const LARGO_S = 0.55;
const R_FOCO = 0.3;
const XM = 2.3; // medidor
const N = 16; // cargas por placa
const DUR = 2.8;
const suave = (x: number) => x * x * (3 - 2 * x);
const REJILLA = Array.from({ length: N }, (_, i) => ({ x: ((i % 4) - 1.5) * 0.2, z: (Math.floor(i / 4) - 1.5) * 0.18 }));

export function EscenaEnergia({ U, propuesta, escala, textoArriba, textoAbajo, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const aguja = useRef<THREE.Group>(null!);
  const pos = useRef<THREE.InstancedMesh>(null!);
  const neg = useRef<THREE.InstancedMesh>(null!);
  const palanca = useRef<THREE.Group>(null!);
  const luz = useRef<THREE.PointLight>(null!);
  const tmp = useMemo(() => new THREE.Matrix4(), []);
  const brillo = Math.sqrt(Math.min(1, U / escala));

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      carga: new THREE.SphereGeometry(0.045, 10, 8),
      vidrio: new THREE.SphereGeometry(R_FOCO, 28, 20),
      halo: new THREE.SphereGeometry(R_FOCO * 1.8, 20, 14),
      rosca: new THREE.CylinderGeometry(0.12, 0.1, 0.2, 16),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      cable: new THREE.MeshStandardMaterial({ color: "#c98b4a", metalness: 0.4, roughness: 0.5 }),
      placa: new THREE.MeshStandardMaterial({ color: "#a9b4c0", metalness: 0.6, roughness: 0.35 }),
      pos: new THREE.MeshStandardMaterial({ color: "#ff6a5a", emissive: "#ff6a5a", emissiveIntensity: 0.6 }),
      neg: new THREE.MeshStandardMaterial({ color: "#5aa9ff", emissive: "#5aa9ff", emissiveIntensity: 0.6 }),
      palanca: new THREE.MeshStandardMaterial({ color: "#d9e2ee", metalness: 0.5, roughness: 0.3 }),
      vidrio: new THREE.MeshStandardMaterial({ color: "#fff3d6", emissive: "#ffd27a", emissiveIntensity: 0, transparent: true, opacity: 0.55, roughness: 0.15 }),
      halo: new THREE.MeshBasicMaterial({ color: "#ffcf6a", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
      rosca: new THREE.MeshStandardMaterial({ color: "#a9b4c0", metalness: 0.6, roughness: 0.35 }),
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
    if (exito) emitirPolvo({ pos: [XM, 0.15, 0.4], color: "#6fd6a8", n: 110, radio: 0.4, fuerza: 1 });
  }, [exito]);

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
    // el interruptor se cierra; las cargas se van, el foco destella y la energía liberada se acumula en el medidor
    palanca.current.rotation.z = 0.5 * (1 - suave(Math.min(1, t / 0.35)));
    const descarga = suave(Math.max(0, Math.min(1, (t - 0.35) / (DUR - 0.9))));
    const n = Math.round(N * (1 - descarga));
    for (let i = 0; i < N; i++) {
      const g = REJILLA[i];
      if (i < n) tmp.makeTranslation(X0 + g.x, SEP - 0.06, g.z);
      else tmp.makeScale(0, 0, 0);
      pos.current.setMatrixAt(i, tmp);
      if (i < n) tmp.makeTranslation(X0 + g.x, -SEP + 0.06, g.z);
      neg.current.setMatrixAt(i, tmp);
    }
    pos.current.instanceMatrix.needsUpdate = true;
    neg.current.instanceMatrix.needsUpdate = true;
    // destello: sube rápido al cerrar y se apaga mientras se descarga
    const flash = t <= 0.35 ? 0 : Math.exp(-2.2 * (t - 0.45)) * Math.min(1, (t - 0.35) / 0.1);
    mats.vidrio.emissiveIntensity = 3.4 * brillo * flash;
    mats.halo.opacity = 0.7 * brillo * flash;
    luz.current.intensity = 3 * brillo * flash;
    aguja.current.rotation.z = anguloMedidor(U * descarga, escala);
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  const cable = (xa: number, ya: number, xb: number, yb: number, k: string) => (
    <mesh key={k} geometry={geo.caja} material={mats.cable} position={[(xa + xb) / 2, (ya + yb) / 2, 0]} scale={[Math.max(0.04, Math.abs(xb - xa)), Math.max(0.04, Math.abs(yb - ya)), 0.04]} />
  );
  return (
    <group>
      {/* cables (con huecos para las placas, el interruptor y el foco) */}
      {cable(X0, SEP, X0, Y1, "a")}
      {cable(X0, Y1, XS - LARGO_S / 2, Y1, "b")}
      {cable(XS + LARGO_S / 2, Y1, X1, Y1, "c")}
      {cable(X1, Y1, X1, R_FOCO + 0.02, "d")}
      {cable(X1, -R_FOCO - 0.2, X1, Y0, "e")}
      {cable(X1, Y0, X0, Y0, "f")}
      {cable(X0, Y0, X0, -SEP, "g")}
      {/* condensador: placas horizontales con sus cargas */}
      <mesh geometry={geo.caja} material={mats.placa} position={[X0, SEP, 0]} scale={[0.9, 0.05, 0.75]} />
      <mesh geometry={geo.caja} material={mats.placa} position={[X0, -SEP, 0]} scale={[0.9, 0.05, 0.75]} />
      <instancedMesh ref={pos} args={[geo.carga, mats.pos, N]} />
      <instancedMesh ref={neg} args={[geo.carga, mats.neg, N]} />
      {/* interruptor: palanca que gira sobre su pivote izquierdo */}
      <group ref={palanca} position={[XS - LARGO_S / 2, Y1, 0.02]} rotation={[0, 0, 0.5]}>
        <mesh geometry={geo.caja} material={mats.palanca} position={[LARGO_S / 2, 0, 0]} scale={[LARGO_S, 0.05, 0.05]} />
      </group>
      {/* foco */}
      <mesh geometry={geo.rosca} material={mats.rosca} position={[X1, -R_FOCO - 0.1, 0]} />
      <mesh geometry={geo.vidrio} material={mats.vidrio} position={[X1, 0, 0]} />
      <mesh geometry={geo.halo} material={mats.halo} position={[X1, 0, 0]} />
      <pointLight ref={luz} position={[X1, 0.1, 0.6]} color="#ffd27a" intensity={0} distance={4} />
      <Medidor ref={aguja} position={[XM, 0.15, 0]} radio={0.5} escala={escala} propuesta={propuesta} />
      {etiquetas && (
        <>
          <Etiqueta position={[X0 - 0.55, 0.42, 0.3]} className="etq-dato etq-izq">
            {textoArriba}
          </Etiqueta>
          <Etiqueta position={[X0 - 0.55, -0.42, 0.3]} className="etq-dato etq-izq">
            {textoAbajo}
          </Etiqueta>
          <Etiqueta position={[XM, 0.15 - 0.58, 0.3]} className={`etq-dato etq-abajo ${exito ? "etq-acento" : ""}`}>
            {verValor ? `U = ${U} mJ` : "energía liberada"}
          </Etiqueta>
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -1.7, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
