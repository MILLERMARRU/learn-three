// ══ Escena del campo de un conductor recto (Nivel 20): aparecen los círculos del campo, la brújula gira y el teslámetro marca B ───────
// La mesa está de frente (algo inclinada) y los cables la atraviesan; ⊙ es corriente saliente y ⊗ entrante.
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { anguloMedidor, Medidor } from "../circuitos/Medidor";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Cables (sentido de la corriente), distancia a P (cm), campo total (μT), su sentido y el propuesto (null = sin marca). */
  cables: { I: number; sentido: 1 | -1 }[];
  d: number;
  B: number;
  sentidoB: 1 | -1;
  propuesta: number | null;
  escala: number;
  textos: string[];
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const INCLINA = -0.45; // la mesa se inclina hacia atrás para que los cables se vean como varillas
const XM = 2.55; // teslámetro
const DUR = 2.6;
const suave = (x: number) => x * x * (3 - 2 * x);
/** Distancia dibujada a P (crece con la real). */
const dVis = (d: number) => 0.55 + 0.06 * d;

export function EscenaCampoRecto({ cables, d, B, sentidoB, propuesta, escala, textos, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const aguja = useRef<THREE.Group>(null!);
  const brujula = useRef<THREE.Group>(null!);
  const circulos = useRef<THREE.Group>(null!);
  const r = dVis(d);
  // un cable: a la izquierda de P; dos: a ambos lados, con P en el medio
  const xP = cables.length === 1 ? -0.5 + r / 2 : -0.2;
  const xs = cables.map((_, i) => (i === 0 ? xP - r : xP + r));

  const geo = useMemo(
    () => ({
      mesa: new THREE.BoxGeometry(1, 1, 0.04),
      cable: new THREE.CylinderGeometry(0.06, 0.06, 1.4, 16).rotateX(Math.PI / 2),
      aro: new THREE.TorusGeometry(1, 0.01, 6, 96),
      punta: new THREE.ConeGeometry(0.07, 0.32, 12).translate(0, 0.16, 0),
      eje: new THREE.CylinderGeometry(0.03, 0.03, 0.04, 12).rotateX(Math.PI / 2),
      disco: new THREE.CircleGeometry(0.3, 32),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      mesa: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.9, transparent: true, opacity: 0.85 }),
      cable: new THREE.MeshStandardMaterial({ color: "#c98b4a", metalness: 0.5, roughness: 0.4, emissive: "#ffb24a", emissiveIntensity: 0 }),
      aro: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0, depthWrite: false }),
      aroP: new THREE.MeshStandardMaterial({ color: "#f0b44c", transparent: true, opacity: 0, depthWrite: false }),
      norte: new THREE.MeshStandardMaterial({ color: "#d94a3a", emissive: "#d94a3a", emissiveIntensity: 0.3 }),
      sur: new THREE.MeshStandardMaterial({ color: "#d9e2ee" }),
      disco: new THREE.MeshStandardMaterial({ color: "#3a4250", transparent: true, opacity: 0.8 }),
      eje: new THREE.MeshStandardMaterial({ color: "#8a929d" }),
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
    const dt = Math.min(0.05, dtCrudo);
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
    if (corrida && !S.fin) S.t = Math.min(DUR, S.t + dt);
    const u = suave(Math.min(1, S.t / DUR));
    // los círculos aparecen, la brújula pasa de apuntar al este a seguir el campo y la aguja llega a B
    mats.aro.opacity = 0.45 * Math.min(1, u * 2);
    mats.aroP.opacity = 0.8 * Math.min(1, u * 2);
    circulos.current.visible = !!corrida;
    mats.cable.emissiveIntensity = corrida ? 0.35 : 0;
    // la aguja (que apunta a +y) parte hacia el este (−90°) y termina a lo largo del campo: +y (0) o −y (−180°)
    const fin = sentidoB > 0 ? 0 : -Math.PI;
    brujula.current.rotation.z = -Math.PI / 2 + (fin + Math.PI / 2) * u;
    aguja.current.rotation.z = anguloMedidor(B * u, escala);
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  return (
    <group>
      <group rotation={[INCLINA, 0, 0]}>
        {/* mesa */}
        <mesh geometry={geo.mesa} material={mats.mesa} position={[-0.2, 0, -0.05]} scale={[4.6, 3, 1]} />
        {/* cables que atraviesan la mesa */}
        {xs.map((x, i) => (
          <mesh key={i} geometry={geo.cable} material={mats.cable} position={[x, 0, 0.2]} />
        ))}
        {/* círculos del campo: tenues alrededor de cada cable y, resaltado, el que pasa por P */}
        <group ref={circulos} visible={false}>
          {xs.map((x, i) =>
            [0.35, 0.7, 1.05]
              .filter((rr) => Math.abs(rr - r) > 0.12)
              .map((rr) => <mesh key={`${i}-${rr}`} geometry={geo.aro} material={mats.aro} position={[x, 0, 0.01]} scale={[rr, rr, 1]} />),
          )}
          {xs.map((x, i) => (
            <mesh key={`p${i}`} geometry={geo.aro} material={mats.aroP} position={[x, 0, 0.012]} scale={[r, r, 1]} />
          ))}
        </group>
        {/* brújula en P: disco, aguja (roja = norte) y eje */}
        <group position={[xP, 0, 0.03]}>
          <mesh geometry={geo.disco} material={mats.disco} />
          <group ref={brujula} rotation={[0, 0, -Math.PI / 2]}>
            <mesh geometry={geo.punta} material={mats.norte} position={[0, 0, 0.02]} />
            <mesh geometry={geo.punta} material={mats.sur} position={[0, 0, 0.02]} rotation={[0, 0, Math.PI]} />
          </group>
          <mesh geometry={geo.eje} material={mats.eje} position={[0, 0, 0.05]} />
        </group>
      </group>
      <Medidor ref={aguja} position={[XM, 0.2, 0]} radio={0.5} escala={escala} propuesta={propuesta} />
      {etiquetas && (
        <>
          {xs.map((x, i) => (
            <Etiqueta key={`c${i}`} position={[x, 0.95, 0.3]} className="etq-dato etq-centro">
              {textos[i]}
            </Etiqueta>
          ))}
          <Etiqueta position={[xP, -0.45, 0.4]} className="etq-dato etq-abajo">
            P · {d} cm
          </Etiqueta>
          <Etiqueta position={[XM, 0.2 - 0.58, 0.3]} className={`etq-dato etq-abajo ${exito ? "etq-acento" : ""}`}>
            {verValor ? `B = ${B} μT` : "teslámetro"}
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
