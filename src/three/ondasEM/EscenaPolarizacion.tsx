// ══ Escena de la polarización (Nivel 21): la luz atraviesa los polarizadores, se atenúa y el luxómetro marca la intensidad ───────
// El banco óptico está girado para ver los discos de frente; las rejillas muestran el eje de cada polarizador.
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { anguloMedidor, Medidor } from "../circuitos/Medidor";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Intensidad que llega, ángulo del analizador (°), si la luz llega sin polarizar, intensidad final y propuesta (null = sin marca). */
  I0: number;
  theta: number;
  noPolarizada: boolean;
  I: number;
  propuesta: number | null;
  escala: number;
  textoI0: string;
  textoTheta: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const GIRO = -0.75; // giro del banco óptico alrededor de y
const XF = -2.5; // fuente
const XP1 = -1.35; // primer polarizador (solo con luz no polarizada)
const XA = 0.05; // analizador (separado del primero: con el giro se verían pegados)
const XD = 1.3; // detector
const R_DISCO = 0.5;
const XM = 2.5; // luxómetro
const DUR = 2.6;
const suave = (x: number) => x * x * (3 - 2 * x);

export function EscenaPolarizacion({ I0, theta, noPolarizada, I, propuesta, escala, textoI0, textoTheta, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const aguja = useRef<THREE.Group>(null!);
  const tramo1 = useRef<THREE.Mesh>(null!);
  const tramo2 = useRef<THREE.Mesh>(null!);
  const tramo3 = useRef<THREE.Mesh>(null!);
  const rad = (theta * Math.PI) / 180;
  const Imedio = noPolarizada ? I0 / 2 : I0; // la que llega al analizador
  const fraccion = Imedio > 0 ? I / Imedio : 0;

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      disco: new THREE.CylinderGeometry(R_DISCO, R_DISCO, 0.03, 40).rotateZ(Math.PI / 2),
      aro: new THREE.TorusGeometry(R_DISCO, 0.03, 8, 48).rotateY(Math.PI / 2),
      haz: new THREE.CylinderGeometry(0.1, 0.1, 1, 20).rotateZ(Math.PI / 2),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      fuente: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.6 }),
      foco: new THREE.MeshStandardMaterial({ color: "#fff3d6", emissive: "#ffd27a", emissiveIntensity: 0.8 }),
      disco: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }),
      aro: new THREE.MeshStandardMaterial({ color: "#8a929d", metalness: 0.4, roughness: 0.4 }),
      rejilla: new THREE.MeshStandardMaterial({ color: "#d9e2ee" }),
      haz1: new THREE.MeshBasicMaterial({ color: "#fff1c4", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
      haz2: new THREE.MeshBasicMaterial({ color: "#fff1c4", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
      haz3: new THREE.MeshBasicMaterial({ color: "#fff1c4", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
      detector: new THREE.MeshStandardMaterial({ color: "#3a4250", roughness: 0.5 }),
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
    if (exito) emitirPolvo({ pos: [XM, 0.2, 0.4], color: "#6fd6a8", n: 110, radio: 0.4, fuerza: 1 });
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
    // el haz avanza tramo a tramo; cada polarizador lo atenúa
    const a = suave(Math.min(1, t / 0.6));
    const b = suave(Math.max(0, Math.min(1, (t - 0.5) / 0.6)));
    const c = suave(Math.max(0, Math.min(1, (t - 1) / 0.6)));
    mats.haz1.opacity = 0.75 * a;
    mats.haz2.opacity = 0.75 * (noPolarizada ? 0.5 : 1) * b;
    mats.haz3.opacity = 0.75 * (noPolarizada ? 0.5 : 1) * fraccion * c;
    tramo1.current.visible = !!corrida;
    tramo2.current.visible = !!corrida;
    tramo3.current.visible = !!corrida;
    aguja.current.rotation.z = anguloMedidor(I * suave(Math.max(0, Math.min(1, (t - 1) / (DUR - 1)))), escala);
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  /** Disco polarizador con su rejilla (líneas paralelas al eje de transmisión, girado `ang` alrededor del haz). */
  const polarizador = (x: number, ang: number) => (
    <group position={[x, 0, 0]}>
      <mesh geometry={geo.disco} material={mats.disco} />
      <mesh geometry={geo.aro} material={mats.aro} />
      <group rotation={[ang, 0, 0]}>
        {[-0.3, -0.15, 0, 0.15, 0.3].map((z) => (
          <mesh key={z} geometry={geo.caja} material={mats.rejilla} position={[0.02, 0, z]} scale={[0.01, 2 * Math.sqrt(R_DISCO * R_DISCO - z * z) - 0.04, 0.015]} />
        ))}
      </group>
    </group>
  );
  const xEntrada = noPolarizada ? XP1 : XA;
  return (
    <group>
      <group rotation={[0, GIRO, 0]}>
        {/* fuente */}
        <mesh geometry={geo.caja} material={mats.fuente} position={[XF - 0.2, 0, 0]} scale={[0.45, 0.6, 0.6]} />
        <mesh geometry={geo.caja} material={mats.foco} position={[XF + 0.04, 0, 0]} scale={[0.04, 0.32, 0.32]} />
        {/* polarizadores: el primero (eje vertical) solo con luz no polarizada; el analizador girado θ */}
        {noPolarizada && polarizador(XP1, 0)}
        {polarizador(XA, rad)}
        {/* detector */}
        <mesh geometry={geo.caja} material={mats.detector} position={[XD + 0.1, 0, 0]} scale={[0.2, 0.5, 0.5]} />
        {/* haz por tramos */}
        <mesh ref={tramo1} geometry={geo.haz} material={mats.haz1} position={[(XF + xEntrada) / 2, 0, 0]} scale={[xEntrada - XF, 1, 1]} visible={false} />
        <mesh ref={tramo2} geometry={geo.haz} material={mats.haz2} position={noPolarizada ? [(XP1 + XA) / 2, 0, 0] : [XA, 0, 0]} scale={[noPolarizada ? XA - XP1 : 0.001, 1, 1]} visible={false} />
        <mesh ref={tramo3} geometry={geo.haz} material={mats.haz3} position={[(XA + XD) / 2, 0, 0]} scale={[XD - XA, 1, 1]} visible={false} />
      </group>
      <Medidor ref={aguja} position={[XM, 0.2, 0]} radio={0.5} escala={escala} propuesta={propuesta} />
      {etiquetas && (
        <>
          <Etiqueta position={[-1.85, 0.85, 0.5]} className="etq-dato etq-centro">
            {textoI0}
          </Etiqueta>
          <Etiqueta position={[0, -0.75, 0.3]} className="etq-dato etq-abajo">
            {textoTheta}
          </Etiqueta>
          <Etiqueta position={[XM, 0.2 - 0.58, 0.3]} className={`etq-dato etq-abajo ${exito ? "etq-acento" : ""}`}>
            {verValor ? `I = ${I} W/m²` : "luxómetro"}
          </Etiqueta>
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -1.8, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
