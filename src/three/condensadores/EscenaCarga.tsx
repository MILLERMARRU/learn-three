// ══ Escena de la carga de un condensador (Nivel 19): la pila llena las placas de cargas y el medidor marca Q ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { anguloMedidor, Medidor } from "../circuitos/Medidor";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Carga real y propuesta (μC; null = sin marca), fondo de escala y si hay dieléctrico entre las placas. */
  Q: number;
  propuesta: number | null;
  escala: number;
  dielectrico: boolean;
  textoC: string;
  textoV: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const XC = -0.4; // centro del condensador
const SEP = 0.5; // media separación de las placas
const ALTO = 1.5;
const FONDO = 1.1;
const Y_PILA = -1.3;
const XM = 2.15; // medidor
const N_MAX = 24; // cargas por placa a fondo de escala
const DUR = 2.6;
const suave = (x: number) => x * x * (3 - 2 * x);

/** Posiciones de las cargas sobre la cara interior de una placa (rejilla de 4 × 6), primero las del centro. */
const REJILLA = Array.from({ length: N_MAX }, (_, i) => ({ y: (Math.floor(i / 4) - 2.5) * 0.24, z: ((i % 4) - 1.5) * 0.24 })).sort((a, b) => Math.abs(a.y) + 0.5 * Math.abs(a.z) - (Math.abs(b.y) + 0.5 * Math.abs(b.z)));

export function EscenaCarga({ Q, propuesta, escala, dielectrico, textoC, textoV, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const aguja = useRef<THREE.Group>(null!);
  const pos = useRef<THREE.InstancedMesh>(null!);
  const neg = useRef<THREE.InstancedMesh>(null!);
  const campo = useRef<THREE.Group>(null!);
  const tmp = useMemo(() => new THREE.Matrix4(), []);
  const nFinal = Math.max(2, Math.round((N_MAX * Q) / escala));

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      carga: new THREE.SphereGeometry(0.055, 12, 10),
      punta: new THREE.ConeGeometry(0.05, 0.12, 10).rotateZ(-Math.PI / 2),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      placa: new THREE.MeshStandardMaterial({ color: "#a9b4c0", metalness: 0.6, roughness: 0.35 }),
      dielectrico: new THREE.MeshStandardMaterial({ color: "#9b7ad9", transparent: true, opacity: 0.35, depthWrite: false }),
      cable: new THREE.MeshStandardMaterial({ color: "#c98b4a", metalness: 0.4, roughness: 0.5 }),
      pila: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.7 }),
      pos: new THREE.MeshStandardMaterial({ color: "#ff6a5a", emissive: "#ff6a5a", emissiveIntensity: 0.6 }),
      neg: new THREE.MeshStandardMaterial({ color: "#5aa9ff", emissive: "#5aa9ff", emissiveIntensity: 0.6 }),
      campo: new THREE.MeshStandardMaterial({ color: "#f0b44c", transparent: true, opacity: 0.6, depthWrite: false }),
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
    // las cargas aparecen poco a poco (+ en la placa izquierda, − en la derecha), el campo crece y la aguja sube
    const u = suave(Math.min(1, S.t / DUR));
    const n = corrida ? Math.round(nFinal * u) : 0;
    for (let i = 0; i < N_MAX; i++) {
      const g = REJILLA[i];
      if (i < n) tmp.makeTranslation(XC - SEP + 0.09, g.y, g.z);
      else tmp.makeScale(0, 0, 0);
      pos.current.setMatrixAt(i, tmp);
      if (i < n) tmp.makeTranslation(XC + SEP - 0.09, g.y, g.z);
      neg.current.setMatrixAt(i, tmp);
    }
    pos.current.instanceMatrix.needsUpdate = true;
    neg.current.instanceMatrix.needsUpdate = true;
    mats.campo.opacity = 0.6 * u;
    campo.current.visible = u > 0.01;
    aguja.current.rotation.z = anguloMedidor(Q * u, escala);
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
      {/* placas y dieléctrico */}
      <mesh geometry={geo.caja} material={mats.placa} position={[XC - SEP, 0, 0]} scale={[0.06, ALTO, FONDO]} />
      <mesh geometry={geo.caja} material={mats.placa} position={[XC + SEP, 0, 0]} scale={[0.06, ALTO, FONDO]} />
      {dielectrico && <mesh geometry={geo.caja} material={mats.dielectrico} position={[XC, 0, 0]} scale={[2 * SEP - 0.14, ALTO - 0.1, FONDO - 0.1]} />}
      {/* cargas */}
      <instancedMesh ref={pos} args={[geo.carga, mats.pos, N_MAX]} />
      <instancedMesh ref={neg} args={[geo.carga, mats.neg, N_MAX]} />
      {/* líneas de campo de + a − */}
      <group ref={campo} visible={false}>
        {[-0.5, -0.17, 0.17, 0.5].map((y) => (
          <group key={y} position={[XC, y, 0.6]}>
            <mesh geometry={geo.caja} material={mats.campo} scale={[2 * SEP - 0.3, 0.018, 0.018]} />
            <mesh geometry={geo.punta} material={mats.campo} position={[SEP - 0.2, 0, 0]} />
          </group>
        ))}
      </group>
      {/* pila y cables */}
      <mesh geometry={geo.caja} material={mats.pila} position={[XC, Y_PILA, 0]} scale={[0.7, 0.36, 0.4]} />
      {cable(XC - SEP, -ALTO / 2, XC - SEP, Y_PILA, "a")}
      {cable(XC - SEP, Y_PILA, XC - 0.35, Y_PILA, "b")}
      {cable(XC + SEP, -ALTO / 2, XC + SEP, Y_PILA, "c")}
      {cable(XC + SEP, Y_PILA, XC + 0.35, Y_PILA, "d")}
      <Medidor ref={aguja} position={[XM, 0.2, 0]} radio={0.5} escala={escala} propuesta={propuesta} />
      {etiquetas && (
        <>
          <Etiqueta position={[XC, ALTO / 2 + 0.12, 0.3]} className="etq-dato etq-centro">
            {textoC}
          </Etiqueta>
          <Etiqueta position={[XC, Y_PILA - 0.2, 0.3]} className="etq-dato etq-abajo">
            {textoV}
          </Etiqueta>
          <Etiqueta position={[XM, 0.2 - 0.58, 0.3]} className={`etq-dato etq-abajo ${exito ? "etq-acento" : ""}`}>
            {verValor ? `Q = ${Q} μC` : "medidor de carga"}
          </Etiqueta>
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -2, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
