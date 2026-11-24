// ══ Escena de dilatación (Nivel 15): la barra se calienta (o se enfría) y su extremo libre debe llegar a la marca ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  colorMetal: string;
  /** Cambio real y propuesto (mm, positivos; null = sin marca) y si la barra se enfría (se acorta). */
  dL: number;
  dLpropuesto: number | null;
  enfria: boolean;
  /** Rótulos de la barra y de las temperaturas. */
  textoBarra: string;
  textoTemp: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const X_PARED = -3;
const L_VIS = 4.4; // longitud dibujada de la barra (todas iguales)
const X_FIN = X_PARED + L_VIS; // extremo libre antes de calentar
const Y_BARRA = 0.3;
const GROSOR = 0.22;
const K = 0.034; // unidades por mm: el cambio se exagera mucho para que se vea
const DUR = 2.6;
const FRIO = new THREE.Color("#9fd4ff");
const CALIENTE = new THREE.Color("#ff7a3d");

export function EscenaDilatacion({ colorMetal, dL, dLpropuesto, enfria, textoBarra, textoTemp, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const signo = enfria ? -1 : 1;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const barra = useRef<THREE.Mesh>(null!);
  const tope = useRef<THREE.Mesh>(null!);
  const base = useMemo(() => new THREE.Color(colorMetal), [colorMetal]);
  const destino = enfria ? FRIO : CALIENTE;

  const geo = useMemo(() => ({ caja: new THREE.BoxGeometry(1, 1, 1), resist: new THREE.CylinderGeometry(0.05, 0.05, 1, 10).rotateZ(Math.PI / 2) }), []);
  const mats = useMemo(
    () => ({
      pared: new THREE.MeshStandardMaterial({ color: "#3a4250", roughness: 0.9 }),
      barra: new THREE.MeshStandardMaterial({ color: colorMetal, metalness: 0.5, roughness: 0.35, emissive: "#000000" }),
      apoyo: new THREE.MeshStandardMaterial({ color: "#5d6673" }),
      placa: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.8 }),
      resist: new THREE.MeshStandardMaterial({ color: "#5d3a2a", emissive: enfria ? "#4fa8ff" : "#ff5a1f", emissiveIntensity: 0 }),
      regla: new THREE.MeshStandardMaterial({ color: "#5d6673" }),
      marca: new THREE.MeshStandardMaterial({ color: "#86b2ff", emissive: "#86b2ff", emissiveIntensity: 0.6 }),
      cero: new THREE.MeshStandardMaterial({ color: "#8a929d" }),
    }),
    [colorMetal, enfria],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    if (exito) emitirPolvo({ pos: [X_FIN + signo * K * dL, Y_BARRA, 0.4], color: "#6fd6a8", n: 110, radio: 0.35, fuerza: 1 });
  }, [exito, signo, dL]);

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
    const u = corrida ? 1 - (1 - Math.min(1, S.t / DUR)) ** 2 : 0;
    const largo = L_VIS + signo * K * dL * u;
    barra.current.scale.x = largo;
    barra.current.position.x = X_PARED + largo / 2;
    tope.current.position.x = X_PARED + largo;
    mats.barra.color.copy(base).lerp(destino, 0.75 * u);
    mats.barra.emissive.copy(destino).multiplyScalar(enfria ? 0.12 * u : 0.35 * u);
    mats.resist.emissiveIntensity = corrida ? 0.4 + 0.8 * Math.min(1, S.t / 0.5) : 0;
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  const xProp = dLpropuesto === null ? null : X_FIN + signo * K * dLpropuesto;
  const xReal = X_FIN + signo * K * dL;
  return (
    <group>
      {/* pared con el extremo fijo */}
      <mesh geometry={geo.caja} material={mats.pared} position={[X_PARED - 0.15, Y_BARRA - 0.2, 0]} scale={[0.3, 2, 1.2]} />
      {/* barra y su cara del extremo libre (la que se compara con la marca) */}
      <mesh ref={barra} geometry={geo.caja} material={mats.barra} position={[X_PARED + L_VIS / 2, Y_BARRA, 0]} scale={[L_VIS, GROSOR, GROSOR]} />
      <mesh ref={tope} geometry={geo.caja} material={mats.barra} position={[X_FIN, Y_BARRA, 0]} scale={[0.02, GROSOR + 0.02, GROSOR + 0.02]} />
      {/* apoyos: rodillos para que la barra pueda deslizar */}
      {[-2.3, -0.7].map((x) => (
        <mesh key={x} geometry={geo.caja} material={mats.apoyo} position={[x, Y_BARRA - GROSOR / 2 - 0.35, 0]} scale={[0.12, 0.7, 0.5]} />
      ))}
      {/* calentador (o enfriador): placa con su resistencia, bajo la barra */}
      <mesh geometry={geo.caja} material={mats.placa} position={[-1.5, Y_BARRA - 0.62, 0]} scale={[2.6, 0.12, 0.7]} />
      <mesh geometry={geo.resist} material={mats.resist} position={[-1.5, Y_BARRA - 0.52, 0]} scale={[1, 2.3, 1]} />
      {/* regla sin números bajo el extremo libre (a la derecha del calentador): solo la marca de partida y la propuesta */}
      <mesh geometry={geo.caja} material={mats.regla} position={[1.65, Y_BARRA - 0.42, 0.3]} scale={[3.95, 0.015, 0.015]} />
      <mesh geometry={geo.caja} material={mats.cero} position={[X_FIN, Y_BARRA - 0.36, 0.3]} scale={[0.02, 0.14, 0.02]} />
      {xProp !== null && <mesh geometry={geo.caja} material={mats.marca} position={[xProp, Y_BARRA, 0.3]} scale={[0.025, 0.9, 0.025]} />}
      {etiquetas && (
        <>
          <Etiqueta position={[-0.9, Y_BARRA + 0.45, 0.2]} className="etq-dato etq-centro">
            {textoBarra}
          </Etiqueta>
          <Etiqueta position={[-1.5, Y_BARRA - 0.7, 0.4]} className="etq-dato etq-abajo">
            {textoTemp}
          </Etiqueta>
          {verValor && (
            <Etiqueta position={[xReal, Y_BARRA + 0.55, 0.3]} className={`etq-dato etq-centro ${exito ? "etq-acento" : ""}`}>
              ΔL = {enfria ? "−" : ""}
              {dL} mm
            </Etiqueta>
          )}
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -1.6, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
