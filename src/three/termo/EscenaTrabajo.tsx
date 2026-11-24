// ══ Escena del trabajo de un gas (Nivel 16): el pistón se mueve a presión constante y el área del diagrama P–V se llena ───────
// La marca azul es el volumen donde terminaría el área si el trabajo fuera el propuesto: V = V₁ + W/P.
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Presión (kPa), volúmenes inicial y final (m³) y trabajo propuesto (kJ; null = sin marca). */
  Pk: number;
  V1: number;
  V2: number;
  Wpropuesto: number | null;
  W: number;
  /** Rótulos de la presión y de los volúmenes (como los da el enunciado). */
  textoP: string;
  textoV1: string;
  textoV2: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const X0 = -0.9; // origen del diagrama
const Y0 = -1.3;
const ANCHO_V = 3.7;
const ALTO_P = 2.3;
const P_ESCALA = 520; // kPa a lo alto del eje (fijo)
const XC = -3.05; // cilindro (lejos del rótulo de la presión)
const R = 0.38;
const DUR = 2.6;
const suave = (x: number) => x * x * (3 - 2 * x);

export function EscenaTrabajo({ Pk, V1, V2, Wpropuesto, W, textoP, textoV1, textoV2, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const area = useRef<THREE.Mesh>(null!);
  const punto = useRef<THREE.Mesh>(null!);
  const piston = useRef<THREE.Mesh>(null!);
  const gasCil = useRef<THREE.Mesh>(null!);
  const Vtope = Math.max(V1, V2) * 1.25;
  const xV = (V: number) => X0 + (Math.max(0, Math.min(Vtope, V)) / Vtope) * ANCHO_V;
  const yP = Y0 + (Pk / P_ESCALA) * ALTO_P;
  const altoGas = (V: number) => 0.35 + (1.7 * V) / Vtope;
  const expande = V2 > V1;

  const geo = useMemo(() => ({ caja: new THREE.BoxGeometry(1, 1, 1), punto: new THREE.SphereGeometry(0.07, 16, 12), cil: new THREE.CylinderGeometry(R, R, 1, 32, 1, true), disco: new THREE.CylinderGeometry(R - 0.02, R - 0.02, 0.1, 32) }), []);
  const mats = useMemo(
    () => ({
      eje: new THREE.MeshStandardMaterial({ color: "#8a929d" }),
      linea: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.4 }),
      area: new THREE.MeshStandardMaterial({ color: expande ? "#6fd6a8" : "#ff8a5c", transparent: true, opacity: 0.4, depthWrite: false }),
      marca: new THREE.MeshStandardMaterial({ color: "#86b2ff", emissive: "#86b2ff", emissiveIntensity: 0.6 }),
      guia: new THREE.MeshStandardMaterial({ color: "#5d6673" }),
      vidrio: new THREE.MeshStandardMaterial({ color: "#c8d6e8", transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false }),
      gas: new THREE.MeshStandardMaterial({ color: "#f0b44c", transparent: true, opacity: 0.3, depthWrite: false }),
      metal: new THREE.MeshStandardMaterial({ color: "#8a929d", metalness: 0.5, roughness: 0.4 }),
    }),
    [expande],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    if (exito) emitirPolvo({ pos: [X0 + ANCHO_V / 2, (Y0 + yP) / 2, 0.4], color: "#6fd6a8", n: 110, radio: 0.5, fuerza: 1 });
  }, [exito, yP]);

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
    const u = corrida ? suave(Math.min(1, S.t / DUR)) : 0;
    const V = V1 + (V2 - V1) * u;
    // área entre V₁ y el volumen actual, bajo la línea de presión
    const xa = xV(V1);
    const xb = xV(V);
    area.current.visible = Math.abs(xb - xa) > 1e-3;
    area.current.position.set((xa + xb) / 2, (Y0 + yP) / 2, 0);
    area.current.scale.set(Math.max(1e-3, Math.abs(xb - xa)), yP - Y0, 0.02);
    punto.current.position.set(xb, yP, 0.05);
    const h = altoGas(V);
    gasCil.current.scale.y = h;
    gasCil.current.position.y = Y0 + h / 2;
    piston.current.position.y = Y0 + h + 0.05;
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  const xProp = Wpropuesto === null ? null : xV(V1 + Wpropuesto / Pk);
  const x1 = xV(V1);
  const x2 = xV(V2);
  return (
    <group>
      {/* cilindro con el pistón (a presión constante) */}
      <mesh geometry={geo.cil} material={mats.vidrio} position={[XC, Y0 + 1.1, 0]} scale={[1, 2.2, 1]} />
      <mesh ref={gasCil} geometry={geo.cil} material={mats.gas} position={[XC, Y0 + altoGas(V1) / 2, 0]} scale={[0.96, altoGas(V1), 0.96]} />
      <mesh ref={piston} geometry={geo.disco} material={mats.metal} position={[XC, Y0 + altoGas(V1) + 0.05, 0]} />
      <mesh geometry={geo.caja} material={mats.metal} position={[XC, Y0 - 0.04, 0]} scale={[2 * R + 0.1, 0.08, 2 * R + 0.1]} />
      {/* ejes del diagrama P–V (sin números) */}
      <mesh geometry={geo.caja} material={mats.eje} position={[X0 + ANCHO_V / 2 + 0.1, Y0, 0]} scale={[ANCHO_V + 0.2, 0.025, 0.025]} />
      <mesh geometry={geo.caja} material={mats.eje} position={[X0, Y0 + ALTO_P / 2 + 0.1, 0]} scale={[0.025, ALTO_P + 0.2, 0.025]} />
      {/* proceso a presión constante: línea horizontal de V₁ a V₂ y guías verticales */}
      <mesh geometry={geo.caja} material={mats.linea} position={[(x1 + x2) / 2, yP, 0.02]} scale={[Math.abs(x2 - x1), 0.035, 0.03]} />
      <mesh geometry={geo.caja} material={mats.guia} position={[x1, (Y0 + yP) / 2, 0]} scale={[0.012, yP - Y0, 0.012]} />
      <mesh geometry={geo.caja} material={mats.guia} position={[x2, (Y0 + yP) / 2, 0]} scale={[0.012, yP - Y0, 0.012]} />
      <mesh geometry={geo.caja} material={mats.guia} position={[(X0 + x1) / 2, yP, 0]} scale={[x1 - X0, 0.012, 0.012]} />
      <mesh ref={area} geometry={geo.caja} material={mats.area} visible={false} />
      <mesh ref={punto} geometry={geo.punto} material={mats.linea} position={[x1, yP, 0.05]} />
      {xProp !== null && <mesh geometry={geo.caja} material={mats.marca} position={[xProp, (Y0 + yP) / 2 + 0.1, 0.06]} scale={[0.03, yP - Y0 + 0.2, 0.03]} />}
      {etiquetas && (
        <>
          <Etiqueta position={[X0 + ANCHO_V + 0.25, Y0, 0.2]} className="etq-dato">
            V
          </Etiqueta>
          <Etiqueta position={[X0, Y0 + ALTO_P + 0.3, 0.2]} className="etq-dato etq-centro">
            P
          </Etiqueta>
          <Etiqueta position={[X0 - 0.1, yP, 0.2]} className="etq-dato etq-izq">
            {textoP}
          </Etiqueta>
          <Etiqueta position={[x1, Y0 - 0.08, 0.2]} className="etq-dato etq-abajo">
            {textoV1}
          </Etiqueta>
          <Etiqueta position={[x2, Y0 - 0.08, 0.2]} className="etq-dato etq-abajo">
            {textoV2}
          </Etiqueta>
          {verValor && (
            <Etiqueta position={[(x1 + x2) / 2, yP + 0.35, 0.2]} className={`etq-dato etq-centro ${exito ? "etq-acento" : ""}`}>
              W = {W} kJ
            </Etiqueta>
          )}
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -2.1, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
