// ══ Balanza de homogeneidad: viga con resorte amortiguado y una molécula en cada platillo ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Base, Dim } from "@/lib/dim";
import { layoutMolecula } from "@/lib/layout-molecula";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "./Etiqueta";
import { Molecula } from "./Molecula";
import type { FaseAnim, Marca } from "./Pieza";

const PIVOTE_Y = 1.55;
const BRAZO = 2.55;
const CUERDA = 1.95;
const ESCALA_MOL = 0.72;
// alto máximo (ya escalado) que puede ocupar una molécula sobre el plato sin pasar el gancho
const ALTO_MAX = 1.7;

export interface Platillo {
  dim: Dim;
  unidad?: boolean;
  etiqueta: ReactNode;
  marcas?: Partial<Record<Base, Marca>>;
}

interface Props {
  izq: Platillo;
  der: Platillo;
  /** Ángulo objetivo (rad). Positivo = baja el platillo derecho. */
  inclinacion: number;
  equilibrada: boolean;
  fase: FaseAnim;
  faseId: number;
  /** Etiquetas HTML sobre los platillos (se ocultan en la vista previa del carrusel). */
  etiquetas?: boolean;
}

function useMateriales() {
  const m = useMemo(
    () => ({
      metal: new THREE.MeshStandardMaterial({ color: "#555b66", metalness: 0.5, roughness: 0.34 }),
      oscuro: new THREE.MeshStandardMaterial({ color: "#2a2f37", metalness: 0.35, roughness: 0.45 }),
      acento: new THREE.MeshStandardMaterial({ color: "#d9c3a0", metalness: 0.55, roughness: 0.28, emissive: "#d9c3a0", emissiveIntensity: 0.05 }),
      cuerda: new THREE.MeshStandardMaterial({ color: "#9aa3ae", metalness: 0.2, roughness: 0.6 }),
      marca: new THREE.MeshStandardMaterial({ color: "#8fdcaa", emissive: "#8fdcaa", emissiveIntensity: 0.2 }),
    }),
    [],
  );
  useEffect(() => () => Object.values(m).forEach((x) => x.dispose()), [m]);
  return m;
}

// tres cuerdas del borde del platillo al gancho
function cuerdas() {
  const arriba = new THREE.Vector3(0, 0, 0);
  return [90, 210, 330].map((gr) => {
    const r = THREE.MathUtils.degToRad(gr);
    const abajo = new THREE.Vector3(Math.cos(r) * 0.82, -CUERDA, Math.sin(r) * 0.82);
    const dir = abajo.clone().sub(arriba);
    const largo = dir.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    const medio = arriba.clone().add(abajo).multiplyScalar(0.5);
    return { largo, q, medio };
  });
}

export function Balanza({ izq, der, inclinacion, equilibrada, fase, faseId, etiquetas = true }: Props) {
  const mat = useMateriales();
  const viga = useRef<THREE.Group>(null!);
  const pI = useRef<THREE.Group>(null!);
  const pD = useRef<THREE.Group>(null!);
  const fis = useRef({ ang: 0.25, vel: 0, faseId, t0: -10, polvo: false });
  const geo = useMemo(
    () => ({
      viga: new RoundedBoxGeometry(BRAZO * 2 + 0.3, 0.12, 0.16, 3, 0.05),
      poste: new THREE.CylinderGeometry(0.07, 0.09, 3.6, 24),
      base: new THREE.CylinderGeometry(1.05, 1.2, 0.16, 64),
      aro: new THREE.TorusGeometry(1.06, 0.022, 12, 96),
      pivote: new THREE.SphereGeometry(0.15, 32, 20),
      aguja: new THREE.ConeGeometry(0.045, 0.55, 16),
      arco: new THREE.TorusGeometry(0.72, 0.011, 8, 64, 1.0),
      tick: new THREE.BoxGeometry(0.02, 0.12, 0.02),
      plato: new THREE.CylinderGeometry(0.95, 0.8, 0.08, 64),
      borde: new THREE.TorusGeometry(0.95, 0.025, 12, 96),
      gancho: new THREE.SphereGeometry(0.06, 16, 12),
      cuerda: new THREE.CylinderGeometry(0.008, 0.008, 1, 6),
    }),
    [],
  );
  useEffect(() => () => Object.values(geo).forEach((x) => x.dispose()), [geo]);
  const hilos = useMemo(() => cuerdas(), []);

  // altura de cada molécula para apoyarla sobre el plato
  const altoI = izq.unidad ? 0.84 : layoutMolecula(izq.dim).alto + 0.3;
  const altoD = der.unidad ? 0.84 : layoutMolecula(der.dim).alto + 0.3;
  // las moléculas altas se achican un poco para quedar dentro de las cuerdas
  const escDe = (alto: number) => Math.min(ESCALA_MOL, ALTO_MAX / Math.max(alto, 0.84));
  const yMol = (alto: number) => -CUERDA + 0.05 + (Math.max(alto, 0.84) * escDe(alto)) / 2;

  useFrame((st, dtCrudo) => {
    const dt = Math.min(0.033, dtCrudo);
    const F = fis.current;
    const t = st.clock.elapsedTime;
    if (faseId !== F.faseId) {
      F.faseId = faseId;
      F.t0 = t;
      F.polvo = false;
    }
    // resorte amortiguado: oscila un poco antes de quedarse quieto
    const acc = 26 * (inclinacion - F.ang) - 3.6 * F.vel;
    F.vel += acc * dt;
    F.ang += F.vel * dt;
    viga.current.rotation.z = -F.ang;
    const c = Math.cos(F.ang);
    const s = Math.sin(F.ang);
    pI.current.position.set(-BRAZO * c, PIVOTE_Y + BRAZO * s, 0);
    pD.current.position.set(BRAZO * c, PIVOTE_Y - BRAZO * s, 0);
    const brillo = equilibrada ? 0.25 + 0.15 * Math.sin(t * 4) : 0.05;
    mat.acento.emissiveIntensity = THREE.MathUtils.damp(mat.acento.emissiveIntensity, brillo, 6, dt);
    mat.marca.emissiveIntensity = equilibrada ? 0.9 : 0.15;
    if (fase === "exito" && !F.polvo && t - F.t0 > 0.3) {
      F.polvo = true;
      emitirPolvo({ pos: [0, PIVOTE_Y, 0], color: "#d9c3a0", n: 120, radio: 0.3, fuerza: 1.3 });
    }
  });

  const platillo = (p: Platillo, alto: number, lado: "i" | "d") => (
    <group ref={lado === "i" ? pI : pD}>
      <mesh geometry={geo.gancho} material={mat.acento} />
      {hilos.map((h, i) => (
        <mesh key={i} geometry={geo.cuerda} material={mat.cuerda} position={h.medio} quaternion={h.q} scale={[1, h.largo, 1]} />
      ))}
      <mesh geometry={geo.plato} material={mat.metal} position={[0, -CUERDA - 0.02, 0]} />
      <mesh geometry={geo.borde} material={mat.acento} position={[0, -CUERDA + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <Molecula dim={p.dim} unidad={p.unidad} position={[0, yMol(alto), 0]} escala={escDe(alto)} marcas={p.marcas} fase={fase} faseId={faseId} tips={false} />
      {etiquetas && (
        <Etiqueta position={[0, 0.5, 0]} className="etq-platillo">
          {p.etiqueta}
        </Etiqueta>
      )}
    </group>
  );

  return (
    <group position={[0, -0.35, 0]}>
      {/* base y poste */}
      <mesh geometry={geo.base} material={mat.oscuro} position={[0, -2.13, 0]} />
      <mesh geometry={geo.aro} material={mat.acento} position={[0, -2.04, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={geo.poste} material={mat.metal} position={[0, -0.25, 0]} />
      {/* escala de equilibrio */}
      <mesh geometry={geo.arco} material={mat.cuerda} position={[0, PIVOTE_Y, -0.05]} rotation={[0, 0, Math.PI / 2 - 0.5]} />
      <mesh geometry={geo.tick} material={mat.marca} position={[0, PIVOTE_Y + 0.72, -0.05]} />
      {/* viga que gira */}
      <group ref={viga} position={[0, PIVOTE_Y, 0]}>
        <mesh geometry={geo.viga} material={mat.metal} />
        <mesh geometry={geo.aguja} material={mat.acento} position={[0, 0.36, 0.02]} />
      </group>
      <mesh geometry={geo.pivote} material={mat.acento} position={[0, PIVOTE_Y, 0.06]} />
      {platillo(izq, altoI, "i")}
      {platillo(der, altoD, "d")}
    </group>
  );
}
