// ══ Escena de la potencia eléctrica (Nivel 18): el foco brilla según su potencia y el vatímetro marca el valor ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";
import { anguloMedidor, Medidor } from "./Medidor";

interface Props {
  /** Potencia real y propuesta (W; null = sin marca) y fondo de escala del vatímetro. */
  P: number;
  propuesta: number | null;
  escala: number;
  textoFuente: string;
  textoFoco: string;
  textoI: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const XF = -2.4; // fuente
const XL = 0; // foco (con sitio a su izquierda para su rótulo)
const Y_ARR = 0.95; // cable de arriba
const Y_ABA = -0.95; // cable de abajo
const R_FOCO = 0.38;
const XM = 2.3; // vatímetro
const DUR = 2.6;
const suave = (x: number) => x * x * (3 - 2 * x);

export function EscenaPotencia({ P, propuesta, escala, textoFuente, textoFoco, textoI, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const aguja = useRef<THREE.Group>(null!);
  const luz = useRef<THREE.PointLight>(null!);
  // brillo con raíz: crece con P y aún se nota con potencias bajas
  const brillo = Math.sqrt(Math.min(1, P / escala));

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      vidrio: new THREE.SphereGeometry(R_FOCO, 32, 24),
      filamento: new THREE.TorusGeometry(0.1, 0.012, 6, 24),
      rosca: new THREE.CylinderGeometry(0.16, 0.14, 0.26, 20),
      halo: new THREE.SphereGeometry(R_FOCO * 1.7, 24, 16),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      cable: new THREE.MeshStandardMaterial({ color: "#c98b4a", metalness: 0.4, roughness: 0.5 }),
      fuente: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.7 }),
      borneP: new THREE.MeshStandardMaterial({ color: "#d94a3a" }),
      borneN: new THREE.MeshStandardMaterial({ color: "#6b7480" }),
      vidrio: new THREE.MeshStandardMaterial({ color: "#fff3d6", emissive: "#ffd27a", emissiveIntensity: 0, transparent: true, opacity: 0.55, roughness: 0.15 }),
      filamento: new THREE.MeshStandardMaterial({ color: "#7a5a3a", emissive: "#ffb24a", emissiveIntensity: 0 }),
      rosca: new THREE.MeshStandardMaterial({ color: "#a9b4c0", metalness: 0.6, roughness: 0.35 }),
      // halo aditivo alrededor del vidrio: su opacidad sigue al brillo
      halo: new THREE.MeshBasicMaterial({ color: "#ffcf6a", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
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
    // el foco se enciende hasta su brillo (proporcional a la potencia) y la aguja llega a P
    const u = suave(Math.min(1, S.t / DUR));
    mats.vidrio.emissiveIntensity = 2.4 * brillo * u;
    mats.halo.opacity = 0.45 * brillo * u;
    mats.filamento.emissiveIntensity = 0.5 + 2.5 * brillo * u;
    if (!corrida) mats.filamento.emissiveIntensity = 0;
    luz.current.intensity = 3 * brillo * u;
    aguja.current.rotation.z = anguloMedidor(P * u, escala);
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  const cable = (xa: number, ya: number, xb: number, yb: number, k: string) => (
    <mesh key={k} geometry={geo.caja} material={mats.cable} position={[(xa + xb) / 2, (ya + yb) / 2, 0]} scale={[Math.max(0.04, Math.abs(xb - xa)), Math.max(0.04, Math.abs(yb - ya)), 0.04]} />
  );
  const yBase = -0.12; // base del foco (la rosca, bajo el vidrio)
  return (
    <group>
      {/* fuente con sus bornes */}
      <mesh geometry={geo.caja} material={mats.fuente} position={[XF, 0, 0]} scale={[0.75, 1, 0.6]} />
      <mesh geometry={geo.caja} material={mats.borneP} position={[XF, 0.56, 0]} scale={[0.14, 0.12, 0.14]} />
      <mesh geometry={geo.caja} material={mats.borneN} position={[XF, -0.56, 0]} scale={[0.14, 0.12, 0.14]} />
      {/* cables: del + a la parte de arriba del foco y de la rosca al − */}
      {cable(XF, 0.62, XF, Y_ARR, "a")}
      {cable(XF, Y_ARR, XL, Y_ARR, "b")}
      {cable(XL, Y_ARR, XL, yBase + 0.12 + 2 * R_FOCO, "c")}
      {cable(XL, yBase - 0.13, XL, Y_ABA, "d")}
      {cable(XL, Y_ABA, XF, Y_ABA, "e")}
      {cable(XF, Y_ABA, XF, -0.62, "f")}
      {/* foco: rosca, vidrio y filamento */}
      <mesh geometry={geo.rosca} material={mats.rosca} position={[XL, yBase, 0]} />
      <mesh geometry={geo.vidrio} material={mats.vidrio} position={[XL, yBase + 0.12 + R_FOCO, 0]} />
      <mesh geometry={geo.filamento} material={mats.filamento} position={[XL, yBase + 0.12 + R_FOCO, 0]} />
      <mesh geometry={geo.halo} material={mats.halo} position={[XL, yBase + 0.12 + R_FOCO, 0]} />
      <pointLight ref={luz} position={[XL, yBase + 0.5, 0.6]} color="#ffd27a" intensity={0} distance={4} />
      {/* vatímetro con sus puntas al foco */}
      {cable(XL + R_FOCO, yBase + 0.45, XM - 0.5, yBase + 0.45, "w")}
      <Medidor ref={aguja} position={[XM, yBase + 0.45, 0.02]} radio={0.5} escala={escala} propuesta={propuesta} />
      {etiquetas && (
        <>
          <Etiqueta position={[XF - 0.45, 0, 0.4]} className="etq-dato etq-izq">
            {textoFuente}
          </Etiqueta>
          <Etiqueta position={[XL - R_FOCO - 0.12, yBase + 0.12 + R_FOCO, 0.4]} className="etq-dato etq-izq">
            {textoFoco}
          </Etiqueta>
          <Etiqueta position={[(XF + XL) / 2, Y_ABA - 0.08, 0.4]} className="etq-dato etq-abajo">
            {textoI}
          </Etiqueta>
          <Etiqueta position={[XM, yBase - 0.13, 0.4]} className={`etq-dato etq-abajo ${exito ? "etq-acento" : ""}`}>
            {verValor ? `P = ${P} W` : "vatímetro"}
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
