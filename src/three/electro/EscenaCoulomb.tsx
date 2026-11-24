// ══ Escena de Coulomb (Nivel 17): dos esferas cargadas y las flechas de la fuerza (iguales y opuestas) ───────
// La flecha de q₂ va a la altura de la fantasma (la propuesta); la de q₁, un poco más arriba para que no se crucen al atraerse.
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Cargas (μC, con signo), distancia (cm), fuerza real y propuesta (N; null = sin fantasma). */
  q1: number;
  q2: number;
  d: number;
  F: number;
  Fpropuesta: number | null;
  textoQ1: string;
  textoQ2: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const R = 0.28;
const Y_ESF = 0.05;
const Y_BASE = -1.05;
// largo de una flecha: una base (para que se vea aun con 1 N) más 0,09 por newton
const largoDe = (F: number) => Math.min(3.3, 0.3 + 0.09 * F);
const Y_F2 = Y_ESF + 0.55; // flecha sobre q₂ (y la fantasma)
const Y_F1 = Y_ESF + 0.85; // flecha sobre q₁
const DUR = 2.6;
const POS = new THREE.Color("#ff6a5a");
const NEG = new THREE.Color("#5aa9ff");
const suave = (x: number) => x * x * (3 - 2 * x);
/** Media distancia dibujada: crece con d, sin salirse del encuadre. */
const mitad = (d: number) => 0.7 + 0.03 * d;

export function EscenaCoulomb({ q1, q2, d, F, Fpropuesta, textoQ1, textoQ2, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const f1 = useRef<THREE.Group>(null!);
  const f2 = useRef<THREE.Group>(null!);
  const atraen = q1 * q2 < 0;
  const h = mitad(d);
  const largo = largoDe(F);
  // sentido de la fuerza sobre q₂ (a la derecha si se repelen); sobre q₁, el opuesto
  const s2 = atraen ? -1 : 1;

  const geo = useMemo(
    () => ({
      esfera: new THREE.SphereGeometry(R, 32, 24),
      poste: new THREE.CylinderGeometry(0.035, 0.035, 1, 12),
      base: new THREE.CylinderGeometry(0.28, 0.32, 0.08, 24),
      caja: new THREE.BoxGeometry(1, 1, 1),
      // punta que apunta a +x, con su base en x = 0
      punta: new THREE.ConeGeometry(0.11, 0.24, 16).rotateZ(-Math.PI / 2).translate(0.12, 0, 0),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      e1: new THREE.MeshStandardMaterial({ color: q1 > 0 ? POS : NEG, emissive: q1 > 0 ? POS : NEG, emissiveIntensity: 0.15, roughness: 0.35 }),
      e2: new THREE.MeshStandardMaterial({ color: q2 > 0 ? POS : NEG, emissive: q2 > 0 ? POS : NEG, emissiveIntensity: 0.15, roughness: 0.35 }),
      aislante: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.7 }),
      base: new THREE.MeshStandardMaterial({ color: "#2a3038" }),
      regla: new THREE.MeshStandardMaterial({ color: "#5d6673" }),
      fuerza: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.4 }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", emissive: "#86b2ff", emissiveIntensity: 0.4, transparent: true, opacity: 0.45, depthWrite: false }),
    }),
    [q1, q2],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    if (exito) emitirPolvo({ pos: [0, Y_F2 + 0.4, 0.4], color: "#6fd6a8", n: 110, radio: 0.5, fuerza: 1 });
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
    const t = corrida ? S.t : 0;
    // primero se cargan (brillan); luego crecen las flechas
    const carga = Math.min(1, t / 0.5);
    const brillo = 0.15 + 0.5 * carga + (corrida ? 0.08 * Math.sin(state.clock.elapsedTime * 8) * carga : 0);
    mats.e1.emissiveIntensity = brillo;
    mats.e2.emissiveIntensity = brillo;
    const u = suave(Math.max(0, Math.min(1, (t - 0.5) / (DUR - 0.5))));
    f1.current.scale.x = Math.max(0.001, u);
    f2.current.scale.x = Math.max(0.001, u);
    f1.current.visible = u > 0.001;
    f2.current.visible = u > 0.001;
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  const largoProp = Fpropuesta === null ? 0 : largoDe(Fpropuesta);
  /** Flecha horizontal de largo l (cuerpo + punta) que apunta a +x desde su origen. */
  const flecha = (l: number, mat: THREE.Material) => (
    <>
      <mesh geometry={geo.caja} material={mat} position={[Math.max(0, l - 0.24) / 2, 0, 0]} scale={[Math.max(0.001, l - 0.24), 0.07, 0.07]} />
      <mesh geometry={geo.punta} material={mat} position={[Math.max(0, l - 0.24), 0, 0]} />
    </>
  );
  return (
    <group>
      {[
        { x: -h, mat: mats.e1 },
        { x: h, mat: mats.e2 },
      ].map(({ x, mat }) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh geometry={geo.esfera} material={mat} position={[0, Y_ESF, 0]} />
          <mesh geometry={geo.poste} material={mats.aislante} position={[0, (Y_ESF - R + Y_BASE) / 2, 0]} scale={[1, Y_ESF - R - Y_BASE, 1]} />
          <mesh geometry={geo.base} material={mats.base} position={[0, Y_BASE, 0]} />
        </group>
      ))}
      {/* regla de la distancia entre centros */}
      <mesh geometry={geo.caja} material={mats.regla} position={[0, Y_BASE - 0.22, 0.3]} scale={[2 * h, 0.015, 0.015]} />
      <mesh geometry={geo.caja} material={mats.regla} position={[-h, Y_BASE - 0.22, 0.3]} scale={[0.015, 0.14, 0.015]} />
      <mesh geometry={geo.caja} material={mats.regla} position={[h, Y_BASE - 0.22, 0.3]} scale={[0.015, 0.14, 0.015]} />
      {/* fuerzas: sobre q₂ y, opuesta, sobre q₁ (crecen desde la esfera) */}
      <group position={[h, Y_F2, 0.1]} scale={[s2, 1, 1]}>
        <group ref={f2} visible={false}>
          {flecha(largo, mats.fuerza)}
        </group>
        {Fpropuesta !== null && <group position={[0, 0, 0.05]}>{flecha(largoProp, mats.fantasma)}</group>}
      </group>
      <group position={[-h, Y_F1, 0.1]} scale={[-s2, 1, 1]}>
        <group ref={f1} visible={false}>
          {flecha(largo, mats.fuerza)}
        </group>
      </group>
      {etiquetas && (
        <>
          <Etiqueta position={[-h - R - 0.08, Y_ESF, 0.3]} className="etq-dato etq-izq">
            {textoQ1}
          </Etiqueta>
          <Etiqueta position={[h + R + 0.08, Y_ESF, 0.3]} className="etq-dato">
            {textoQ2}
          </Etiqueta>
          <Etiqueta position={[0, Y_BASE - 0.3, 0.3]} className="etq-dato etq-abajo">
            d = {d} cm
          </Etiqueta>
          {verValor && (
            <Etiqueta position={[0, Y_F1 + 0.45, 0.3]} className={`etq-dato etq-centro ${exito ? "etq-acento" : ""}`}>
              F = {F} N · {atraen ? "se atraen" : "se repelen"}
            </Etiqueta>
          )}
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -1.9, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
