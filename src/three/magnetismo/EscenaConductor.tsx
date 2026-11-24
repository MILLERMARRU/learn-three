// ══ Escena de la fuerza sobre un conductor (Nivel 20): el cable colgante entre los polos se desvía y el dinamómetro marca F ───────
// El imán de herradura tiene el polo N arriba y el S abajo (campo vertical); con la corriente a lo largo del cable,
// la fuerza es horizontal y saca al cable del imán (hacia el frente). La escena está girada para que ese vaivén se vea.
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { anguloMedidor, Medidor } from "../circuitos/Medidor";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Fuerza real y propuesta (mN; null = sin marca) y fondo de escala del dinamómetro. */
  F: number;
  propuesta: number | null;
  escala: number;
  textoB: string;
  textoI: string;
  textoL: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const GIRO = -0.55; // giro de la escena alrededor de y
const Y_SOPORTE = 1.45;
const LARGO = 2; // cable
const X_HILO = 0.9; // hilos de los que cuelga
const POLO = 0.42; // altura de cada polo sobre/bajo el cable
const XM = 2.4; // dinamómetro
const DUR = 2.6;
const suave = (x: number) => x * x * (3 - 2 * x);

export function EscenaConductor({ F, propuesta, escala, textoB, textoI, textoL, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const aguja = useRef<THREE.Group>(null!);
  const cable = useRef<THREE.Group>(null!);
  const hilos = useRef<THREE.Mesh[]>([]);
  const campo = useRef<THREE.Group>(null!);
  const desvio = 0.55 * Math.min(1, F / escala);

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      cable: new THREE.CylinderGeometry(0.035, 0.035, LARGO, 12).rotateZ(Math.PI / 2),
      hilo: new THREE.CylinderGeometry(0.008, 0.008, 1, 6).translate(0, -0.5, 0),
      punta: new THREE.ConeGeometry(0.045, 0.1, 10).rotateX(Math.PI),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      norte: new THREE.MeshStandardMaterial({ color: "#d94a3a", roughness: 0.5 }),
      sur: new THREE.MeshStandardMaterial({ color: "#3a7ad9", roughness: 0.5 }),
      yugo: new THREE.MeshStandardMaterial({ color: "#5d6673", metalness: 0.4, roughness: 0.5 }),
      cable: new THREE.MeshStandardMaterial({ color: "#c98b4a", metalness: 0.5, roughness: 0.4, emissive: "#ffb24a", emissiveIntensity: 0 }),
      hilo: new THREE.MeshStandardMaterial({ color: "#d9e2ee" }),
      soporte: new THREE.MeshStandardMaterial({ color: "#2a3038" }),
      campo: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.5, depthWrite: false }),
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
    if (exito) emitirPolvo({ pos: [XM, 0.3, 0.4], color: "#6fd6a8", n: 110, radio: 0.4, fuerza: 1 });
  }, [exito]);

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
    const u = suave(Math.min(1, S.t / DUR));
    // el cable sale del imán hacia el frente (z) y los hilos se inclinan con él
    const z = desvio * u + (corrida ? 0.01 * Math.sin(state.clock.elapsedTime * 9) * (1 - u) : 0);
    cable.current.position.z = z;
    const largoHilo = Math.hypot(Y_SOPORTE, z);
    const ang = Math.atan2(z, Y_SOPORTE);
    hilos.current.forEach((h) => {
      if (!h) return;
      h.scale.y = largoHilo;
      h.rotation.x = -ang; // girar en −x lleva la punta de abajo hacia +z
    });
    mats.cable.emissiveIntensity = corrida ? 0.35 : 0;
    campo.current.visible = !!corrida;
    aguja.current.rotation.z = anguloMedidor(F * u, escala);
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  return (
    <group>
      <group rotation={[0, GIRO, 0]}>
        {/* soporte y hilos */}
        <mesh geometry={geo.caja} material={mats.soporte} position={[0, Y_SOPORTE, 0]} scale={[2.2, 0.06, 0.08]} />
        {[-X_HILO, X_HILO].map((x, i) => (
          <mesh
            key={x}
            ref={(m) => {
              if (m) hilos.current[i] = m;
            }}
            geometry={geo.hilo}
            material={mats.hilo}
            position={[x, Y_SOPORTE, 0]}
            scale={[1, Y_SOPORTE, 1]}
          />
        ))}
        {/* cable */}
        <group ref={cable}>
          <mesh geometry={geo.cable} material={mats.cable} />
        </group>
        {/* imán de herradura abierto hacia el frente: N arriba, S abajo y el yugo atrás */}
        <mesh geometry={geo.caja} material={mats.norte} position={[0, POLO + 0.15, -0.15]} scale={[0.9, 0.3, 0.75]} />
        <mesh geometry={geo.caja} material={mats.sur} position={[0, -POLO - 0.15, -0.15]} scale={[0.9, 0.3, 0.75]} />
        <mesh geometry={geo.caja} material={mats.yugo} position={[0, 0, -0.62]} scale={[0.9, 2 * POLO + 0.6, 0.2]} />
        {/* líneas del campo, de N a S */}
        <group ref={campo} visible={false}>
          {[-0.28, 0, 0.28].map((x) =>
            [-0.35, 0.05].map((zz) => (
              <group key={`${x}${zz}`} position={[x, 0, zz]}>
                <mesh geometry={geo.caja} material={mats.campo} scale={[0.015, 2 * POLO - 0.1, 0.015]} />
                <mesh geometry={geo.punta} material={mats.campo} position={[0, -POLO + 0.1, 0]} />
              </group>
            )),
          )}
        </group>
      </group>
      <Medidor ref={aguja} position={[XM, 0.3, 0]} radio={0.5} escala={escala} propuesta={propuesta} />
      {etiquetas && (
        <>
          <Etiqueta position={[-1.02, POLO + 0.15, 0.3]} className="etq-dato etq-izq">
            {textoB}
          </Etiqueta>
          <Etiqueta position={[-1.05, 0.05, 0.3]} className="etq-dato etq-izq">
            {textoI}
          </Etiqueta>
          <Etiqueta position={[-0.1, -POLO - 0.35, 0.3]} className="etq-dato etq-abajo">
            {textoL}
          </Etiqueta>
          <Etiqueta position={[XM, 0.3 - 0.58, 0.3]} className={`etq-dato etq-abajo ${exito ? "etq-acento" : ""}`}>
            {verValor ? `F = ${F} mN` : "dinamómetro"}
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
