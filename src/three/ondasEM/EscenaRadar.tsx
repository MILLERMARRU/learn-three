// ══ Escena del radar (Nivel 21): un pulso va de la antena al avión, rebota y vuelve; el medidor marca la distancia o el tiempo ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { anguloMedidor, Medidor } from "../circuitos/Medidor";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Valor real que marca el medidor, propuesta (null = sin marca) y fondo de escala. */
  valor: number;
  propuesta: number | null;
  escala: number;
  textoDato: string;
  textoValor: string;
  textoMedidor: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const XR = -2.4; // antena
const Y_SUELO = -1.15;
const A: [number, number] = [-2.2, -0.52]; // boca de la antena
const B: [number, number] = [0.8, 0.72]; // punto de rebote en el avión
const XP = 1.15; // avión
const YP = 0.78;
const XM = 2.55; // medidor
const DUR = 2.8;
const PHI = Math.atan2(B[1] - A[1], B[0] - A[0]);
const LARGO = Math.hypot(B[0] - A[0], B[1] - A[1]);
const DIR: [number, number] = [Math.cos(PHI), Math.sin(PHI)];
const SEP = 0.07; // separación entre la estela de ida y la de vuelta
const suave = (x: number) => x * x * (3 - 2 * x);

export function EscenaRadar({ valor, propuesta, escala, textoDato, textoValor, textoMedidor, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const aguja = useRef<THREE.Group>(null!);
  const pulsoIda = useRef<THREE.Group>(null!);
  const pulsoVuelta = useRef<THREE.Group>(null!);
  const estelaIda = useRef<THREE.Mesh>(null!);
  const estelaVuelta = useRef<THREE.Mesh>(null!);

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      plato: new THREE.SphereGeometry(0.34, 24, 10, 0, Math.PI * 2, 0, 0.95).translate(0, -0.26, 0),
      nariz: new THREE.ConeGeometry(0.065, 0.18, 14).rotateZ(Math.PI / 2),
      nucleo: new THREE.SphereGeometry(0.065, 14, 10),
      halo: new THREE.SphereGeometry(0.16, 14, 10),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      suelo: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.9 }),
      antena: new THREE.MeshStandardMaterial({ color: "#8a929d", metalness: 0.4, roughness: 0.45, side: THREE.DoubleSide }),
      avion: new THREE.MeshStandardMaterial({ color: "#d9e2ee", emissive: "#f0b44c", emissiveIntensity: 0, roughness: 0.5 }),
      ida: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.9 }),
      vuelta: new THREE.MeshStandardMaterial({ color: "#6fd6a8", emissive: "#6fd6a8", emissiveIntensity: 0.9 }),
      haloIda: new THREE.MeshBasicMaterial({ color: "#f0b44c", transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }),
      haloVuelta: new THREE.MeshBasicMaterial({ color: "#6fd6a8", transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }),
      estelaIda: new THREE.MeshBasicMaterial({ color: "#f0b44c", transparent: true, opacity: 0.5, depthWrite: false }),
      estelaVuelta: new THREE.MeshBasicMaterial({ color: "#6fd6a8", transparent: true, opacity: 0.55, depthWrite: false }),
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
    const H = DUR / 2;
    const ida = Math.min(1, t / H);
    const vuelta = Math.max(0, Math.min(1, (t - H) / H));
    // pulso de ida: de la antena al avión
    pulsoIda.current.visible = !!corrida && t < H;
    pulsoIda.current.position.set(A[0] + DIR[0] * LARGO * ida, A[1] + DIR[1] * LARGO * ida, 0);
    const lIda = Math.max(1e-3, LARGO * ida);
    estelaIda.current.visible = !!corrida;
    estelaIda.current.position.set(A[0] + (DIR[0] * lIda) / 2, A[1] + (DIR[1] * lIda) / 2, 0);
    estelaIda.current.scale.set(lIda, 0.025, 0.025);
    mats.estelaIda.opacity = 0.5 * (1 - 0.5 * vuelta);
    // eco de vuelta: del avión a la antena, algo separado para ver las dos estelas
    const nx = -DIR[1] * SEP;
    const ny = DIR[0] * SEP;
    pulsoVuelta.current.visible = !!corrida && t >= H && vuelta < 1;
    pulsoVuelta.current.position.set(B[0] - DIR[0] * LARGO * vuelta + nx, B[1] - DIR[1] * LARGO * vuelta + ny, 0);
    const lVuelta = Math.max(1e-3, LARGO * vuelta);
    estelaVuelta.current.visible = !!corrida && t >= H;
    estelaVuelta.current.position.set(B[0] - (DIR[0] * lVuelta) / 2 + nx, B[1] - (DIR[1] * lVuelta) / 2 + ny, 0);
    estelaVuelta.current.scale.set(lVuelta, 0.025, 0.025);
    // el avión destella cuando el pulso lo alcanza
    mats.avion.emissiveIntensity = corrida ? 0.9 * Math.exp(-Math.abs(t - H) * 7) : 0;
    aguja.current.rotation.z = anguloMedidor(valor * suave(Math.min(1, t / DUR)), escala);
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  return (
    <group>
      <group rotation={[0.1, -0.15, 0]}>
        {/* suelo */}
        <mesh geometry={geo.caja} material={mats.suelo} position={[-0.6, Y_SUELO, 0]} scale={[4.6, 0.05, 1.1]} />
        {/* antena de radar: base, mástil y plato apuntando al avión */}
        <mesh geometry={geo.caja} material={mats.antena} position={[XR, Y_SUELO + 0.05, 0]} scale={[0.42, 0.08, 0.42]} />
        <mesh geometry={geo.caja} material={mats.antena} position={[XR, Y_SUELO + 0.28, 0]} scale={[0.08, 0.46, 0.08]} />
        <mesh geometry={geo.plato} material={mats.antena} position={[XR + 0.06, Y_SUELO + 0.56, 0]} rotation={[0, 0, Math.PI / 2 + PHI]} />
        {/* avión mirando hacia la antena */}
        <group position={[XP, YP, 0]} rotation={[0.55, 0.25, -0.05]}>
          <mesh geometry={geo.caja} material={mats.avion} scale={[0.75, 0.13, 0.13]} />
          <mesh geometry={geo.nariz} material={mats.avion} position={[-0.46, 0, 0]} />
          <mesh geometry={geo.caja} material={mats.avion} position={[-0.02, 0, 0]} scale={[0.2, 0.025, 0.82]} />
          <mesh geometry={geo.caja} material={mats.avion} position={[0.3, 0.11, 0]} scale={[0.14, 0.2, 0.025]} />
          <mesh geometry={geo.caja} material={mats.avion} position={[0.32, 0.02, 0]} scale={[0.1, 0.02, 0.3]} />
        </group>
        {/* pulsos y estelas */}
        <mesh ref={estelaIda} geometry={geo.caja} material={mats.estelaIda} rotation={[0, 0, PHI]} visible={false} />
        <mesh ref={estelaVuelta} geometry={geo.caja} material={mats.estelaVuelta} rotation={[0, 0, PHI]} visible={false} />
        <group ref={pulsoIda} visible={false}>
          <mesh geometry={geo.nucleo} material={mats.ida} />
          <mesh geometry={geo.halo} material={mats.haloIda} />
        </group>
        <group ref={pulsoVuelta} visible={false}>
          <mesh geometry={geo.nucleo} material={mats.vuelta} />
          <mesh geometry={geo.halo} material={mats.haloVuelta} />
        </group>
      </group>
      <Medidor ref={aguja} position={[XM, 0.2, 0]} radio={0.5} escala={escala} propuesta={propuesta} />
      {etiquetas && (
        <>
          <Etiqueta position={[XR + 0.1, 0.3, 0]} className="etq-dato etq-centro">
            {textoDato}
          </Etiqueta>
          <Etiqueta position={[XM, 0.2 - 0.58, 0.3]} className={`etq-dato etq-abajo ${exito ? "etq-acento" : ""}`}>
            {verValor ? textoValor : textoMedidor}
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
