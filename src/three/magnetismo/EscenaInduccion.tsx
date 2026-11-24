// ══ Escena de la inducción (Nivel 20): una barra cruza el campo (o un imán entra en una bobina), el foco se enciende y el voltímetro marca ε ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { anguloMedidor, Medidor } from "../circuitos/Medidor";
import { Etiqueta } from "../Etiqueta";

interface Props {
  modo: "barra" | "bobina";
  /** Fem real y propuesta (V; null = sin marca) y fondo de escala del voltímetro. */
  E: number;
  propuesta: number | null;
  escala: number;
  /** Rótulos: arriba, abajo y al costado del montaje. */
  textoArriba: string;
  textoAbajo: string;
  textoLado: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const XF = -2.4; // foco (en la conexión izquierda)
const Y_RIEL = 0.6;
const X_FIN = 1; // fin de los rieles
const XB0 = -1.3; // barra al empezar
const XB1 = 0.65; // barra al terminar
const XC = -0.6; // bobina
const X_IMAN = 1.15; // imán al empezar (sin tapar el voltímetro)
const XM = 2.4; // voltímetro
const DUR = 2.8;
const suave = (x: number) => x * x * (3 - 2 * x);

export function EscenaInduccion({ modo, E, propuesta, escala, textoArriba, textoAbajo, textoLado, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const aguja = useRef<THREE.Group>(null!);
  const movil = useRef<THREE.Group>(null!);
  const luz = useRef<THREE.PointLight>(null!);
  const brillo = Math.sqrt(Math.min(1, E / escala));
  const barra = modo === "barra";

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      vidrio: new THREE.SphereGeometry(0.22, 24, 16),
      halo: new THREE.SphereGeometry(0.4, 20, 14),
      espira: new THREE.TorusGeometry(0.45, 0.03, 8, 40).rotateY(Math.PI / 2),
      punta: new THREE.ConeGeometry(0.07, 0.18, 12).rotateZ(-Math.PI / 2),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      riel: new THREE.MeshStandardMaterial({ color: "#a9b4c0", metalness: 0.6, roughness: 0.35 }),
      barra: new THREE.MeshStandardMaterial({ color: "#c98b4a", metalness: 0.5, roughness: 0.4 }),
      cable: new THREE.MeshStandardMaterial({ color: "#c98b4a", metalness: 0.4, roughness: 0.5 }),
      cruz: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.45, depthWrite: false }),
      vidrio: new THREE.MeshStandardMaterial({ color: "#fff3d6", emissive: "#ffd27a", emissiveIntensity: 0, transparent: true, opacity: 0.55, roughness: 0.15 }),
      halo: new THREE.MeshBasicMaterial({ color: "#ffcf6a", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
      norte: new THREE.MeshStandardMaterial({ color: "#d94a3a" }),
      sur: new THREE.MeshStandardMaterial({ color: "#3a7ad9" }),
      flecha: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.4 }),
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
    if (exito) emitirPolvo({ pos: [XM, 0.1, 0.4], color: "#6fd6a8", n: 110, radio: 0.4, fuerza: 1 });
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
    // la barra (o el imán) se mueve; mientras se mueve hay fem: el foco brilla y la aguja la marca
    const u = Math.min(1, t / (DUR * 0.85));
    if (barra) movil.current.position.x = XB0 + (XB1 - XB0) * u;
    else movil.current.position.x = X_IMAN + (XC + 0.1 - X_IMAN) * suave(u);
    const sube = suave(Math.min(1, t / 0.6));
    const enMarcha = corrida ? sube : 0;
    mats.vidrio.emissiveIntensity = 2.6 * brillo * enMarcha;
    mats.halo.opacity = 0.55 * brillo * enMarcha;
    luz.current.intensity = 2.5 * brillo * enMarcha;
    aguja.current.rotation.z = anguloMedidor(E * suave(Math.min(1, t / (DUR * 0.7))), escala);
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  const cable = (xa: number, ya: number, xb: number, yb: number, k: string) => (
    <mesh key={k} geometry={geo.caja} material={mats.cable} position={[(xa + xb) / 2, (ya + yb) / 2, 0]} scale={[Math.max(0.035, Math.abs(xb - xa)), Math.max(0.035, Math.abs(yb - ya)), 0.035]} />
  );
  return (
    <group>
      {barra ? (
        <>
          {/* rieles y conexión con el foco */}
          <mesh geometry={geo.caja} material={mats.riel} position={[(XF + X_FIN) / 2, Y_RIEL, 0]} scale={[X_FIN - XF, 0.05, 0.05]} />
          <mesh geometry={geo.caja} material={mats.riel} position={[(XF + X_FIN) / 2, -Y_RIEL, 0]} scale={[X_FIN - XF, 0.05, 0.05]} />
          {cable(XF, Y_RIEL, XF, 0.24, "a")}
          {cable(XF, -0.24, XF, -Y_RIEL, "b")}
          {/* campo entrante (⊗): rejilla de cruces */}
          {[-1.7, -1.1, -0.5, 0.1, 0.7].map((x) =>
            [-0.3, 0.3].map((y) => (
              <group key={`${x}${y}`} position={[x, y, -0.05]} rotation={[0, 0, Math.PI / 4]}>
                <mesh geometry={geo.caja} material={mats.cruz} scale={[0.16, 0.025, 0.01]} />
                <mesh geometry={geo.caja} material={mats.cruz} scale={[0.025, 0.16, 0.01]} />
              </group>
            )),
          )}
          {/* barra que se desliza, con la flecha de su velocidad */}
          <group ref={movil} position={[XB0, 0, 0.05]}>
            <mesh geometry={geo.caja} material={mats.barra} scale={[0.07, 2 * Y_RIEL + 0.15, 0.07]} />
            <mesh geometry={geo.caja} material={mats.flecha} position={[0.2, 0, 0.03]} scale={[0.3, 0.03, 0.03]} />
            <mesh geometry={geo.punta} material={mats.flecha} position={[0.38, 0, 0.03]} />
          </group>
        </>
      ) : (
        <>
          {/* bobina de espiras y sus cables al foco */}
          {[-0.36, -0.18, 0, 0.18, 0.36].map((dx) => (
            <mesh key={dx} geometry={geo.espira} material={mats.cable} position={[XC + dx, 0, 0]} />
          ))}
          {cable(XC - 0.36, -0.45, XC - 0.36, -0.9, "c")}
          {cable(XC - 0.36, -0.9, XF, -0.9, "d")}
          {cable(XF, -0.9, XF, -0.24, "e")}
          {cable(XC + 0.36, 0.45, XC + 0.36, 0.9, "f")}
          {cable(XC + 0.36, 0.9, XF, 0.9, "g")}
          {cable(XF, 0.9, XF, 0.24, "h")}
          {/* imán que entra en la bobina */}
          <group ref={movil} position={[X_IMAN, 0, 0]}>
            <mesh geometry={geo.caja} material={mats.norte} position={[-0.25, 0, 0]} scale={[0.5, 0.28, 0.28]} />
            <mesh geometry={geo.caja} material={mats.sur} position={[0.25, 0, 0]} scale={[0.5, 0.28, 0.28]} />
          </group>
        </>
      )}
      {/* foco */}
      <mesh geometry={geo.vidrio} material={mats.vidrio} position={[XF, 0, 0]} />
      <mesh geometry={geo.halo} material={mats.halo} position={[XF, 0, 0]} />
      <pointLight ref={luz} position={[XF, 0.1, 0.6]} color="#ffd27a" intensity={0} distance={3.5} />
      <Medidor ref={aguja} position={[XM, 0.1, 0]} radio={0.5} escala={escala} propuesta={propuesta} />
      {etiquetas && (
        <>
          <Etiqueta position={[barra ? -0.3 : XC, barra ? Y_RIEL + 0.15 : 1.05, 0.3]} className="etq-dato etq-centro">
            {textoArriba}
          </Etiqueta>
          <Etiqueta position={[barra ? -0.3 : XC + 0.3, barra ? -Y_RIEL - 0.15 : -1.05, 0.3]} className="etq-dato etq-abajo">
            {textoAbajo}
          </Etiqueta>
          {textoLado && (
            <Etiqueta position={[XF - 0.32, 0.45, 0.3]} className="etq-dato etq-izq">
              {textoLado}
            </Etiqueta>
          )}
          <Etiqueta position={[XM, 0.1 - 0.58, 0.3]} className={`etq-dato etq-abajo ${exito ? "etq-acento" : ""}`}>
            {verValor ? `ε = ${E} V` : "voltímetro"}
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
