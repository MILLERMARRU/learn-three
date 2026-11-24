// ══ Escena de la ley de Ohm (Nivel 18): al cerrar el circuito corren los electrones y la aguja del multímetro llega al valor ───────
// El amperímetro va en serie (en el cable de la derecha); el voltímetro y el óhmetro, a los extremos de la resistencia.
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";
import { anguloMedidor, Medidor } from "./Medidor";

interface Props {
  /** Qué mide el multímetro, su fondo de escala, el valor real y el propuesto (null = sin marca). */
  pide: "I" | "V" | "R";
  escala: number;
  valor: number;
  propuesta: number | null;
  /** Corriente del circuito (A): da la rapidez de los electrones. */
  I: number;
  textoPila: string;
  textoR: string;
  textoI: string;
  textoMedidor: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const X0 = -2.4; // circuito: rectángulo de cables
const X1 = 0.6;
const Y0 = -0.95;
const Y1 = 0.95;
const XR = -0.9; // resistencia (en el cable de arriba)
const ANCHO_R = 1;
const N = 18; // electrones
const PERIM = 2 * (X1 - X0 + Y1 - Y0);
const DUR = 2.6;
const suave = (x: number) => x * x * (3 - 2 * x);

/** Punto del rectángulo a la distancia s (recorrido en sentido horario desde la esquina inferior izquierda). */
function enCircuito(s: number): [number, number] {
  const a = Y1 - Y0;
  const b = X1 - X0;
  let u = ((s % PERIM) + PERIM) % PERIM;
  if (u < a) return [X0, Y0 + u];
  u -= a;
  if (u < b) return [X0 + u, Y1];
  u -= b;
  if (u < a) return [X1, Y1 - u];
  u -= a;
  return [X1 - u, Y0];
}

export function EscenaOhm({ pide, escala, valor, propuesta, I, textoPila, textoR, textoI, textoMedidor, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false, s: 0 });
  const aguja = useRef<THREE.Group>(null!);
  const electrones = useRef<THREE.InstancedMesh>(null!);
  const tmp = useMemo(() => new THREE.Matrix4(), []);
  const enSerie = pide === "I";
  const cxM = enSerie ? X1 : 2.05;
  const cyM = enSerie ? 0 : 0.15;

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      electron: new THREE.SphereGeometry(0.045, 10, 8),
      resist: new THREE.CylinderGeometry(0.14, 0.14, ANCHO_R, 20).rotateZ(Math.PI / 2),
      banda: new THREE.CylinderGeometry(0.15, 0.15, 0.06, 20).rotateZ(Math.PI / 2),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      cable: new THREE.MeshStandardMaterial({ color: "#c98b4a", metalness: 0.4, roughness: 0.5 }),
      resist: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.6 }),
      banda: new THREE.MeshStandardMaterial({ color: "#7a4a2a" }),
      bandaB: new THREE.MeshStandardMaterial({ color: "#d94a3a" }),
      positivo: new THREE.MeshStandardMaterial({ color: "#d9e2ee", metalness: 0.4, roughness: 0.4 }),
      negativo: new THREE.MeshStandardMaterial({ color: "#5d6673", metalness: 0.4, roughness: 0.4 }),
      electron: new THREE.MeshStandardMaterial({ color: "#86d4ff", emissive: "#86d4ff", emissiveIntensity: 0.8 }),
      rojo: new THREE.MeshStandardMaterial({ color: "#d94a3a" }),
      negro: new THREE.MeshStandardMaterial({ color: "#6b7480" }), // la punta «negra», algo más clara para verse sobre el fondo
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
    if (exito) emitirPolvo({ pos: [cxM, cyM, 0.4], color: "#6fd6a8", n: 110, radio: 0.4, fuerza: 1 });
  }, [exito, cxM, cyM]);

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
    // los electrones van del borne negativo al positivo por fuera (sentido antihorario en el dibujo)
    if (corrida) S.s -= d * (0.35 + 0.12 * Math.min(10, I));
    for (let i = 0; i < N; i++) {
      const [x, y] = enCircuito(S.s + (i * PERIM) / N);
      // en serie, los electrones no se dibujan sobre la esfera del amperímetro
      if (enSerie && x === X1 && Math.abs(y) < 0.5) tmp.makeScale(0, 0, 0);
      else tmp.makeTranslation(x, y, 0.06);
      electrones.current.setMatrixAt(i, tmp);
    }
    electrones.current.instanceMatrix.needsUpdate = true;
    electrones.current.visible = !!corrida;
    const u = suave(Math.min(1, S.t / DUR));
    aguja.current.rotation.z = anguloMedidor(valor * u, escala);
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  /** Cable recto entre dos puntos (horizontal o vertical). */
  const cable = (xa: number, ya: number, xb: number, yb: number, mat: THREE.Material = mats.cable, k = "") => (
    <mesh key={`${k}${xa},${ya},${xb},${yb}`} geometry={geo.caja} material={mat} position={[(xa + xb) / 2, (ya + yb) / 2, 0]} scale={[Math.max(0.04, Math.abs(xb - xa)), Math.max(0.04, Math.abs(yb - ya)), 0.04]} />
  );
  const xRa = XR - ANCHO_R / 2;
  const xRb = XR + ANCHO_R / 2;
  return (
    <group>
      {/* cables del circuito (con huecos para la pila, la resistencia y, en serie, el medidor) */}
      {cable(X0, Y0, X0, -0.2)}
      {cable(X0, 0.2, X0, Y1)}
      {cable(X0, Y1, xRa, Y1)}
      {cable(xRb, Y1, X1, Y1)}
      {enSerie ? (
        <>
          {cable(X1, Y1, X1, 0.5)}
          {cable(X1, -0.5, X1, Y0)}
        </>
      ) : (
        cable(X1, Y1, X1, Y0)
      )}
      {cable(X1, Y0, X0, Y0)}
      {/* pila: placa larga (+) arriba y corta (−) abajo */}
      <mesh geometry={geo.caja} material={mats.positivo} position={[X0, 0.12, 0]} scale={[0.6, 0.05, 0.2]} />
      <mesh geometry={geo.caja} material={mats.negativo} position={[X0, -0.12, 0]} scale={[0.34, 0.1, 0.2]} />
      {/* resistencia con sus bandas */}
      <mesh geometry={geo.resist} material={mats.resist} position={[XR, Y1, 0]} />
      {[-0.28, -0.12, 0.04].map((dx, i) => (
        <mesh key={dx} geometry={geo.banda} material={i === 1 ? mats.bandaB : mats.banda} position={[XR + dx, Y1, 0]} />
      ))}
      {/* electrones */}
      <instancedMesh ref={electrones} args={[geo.electron, mats.electron, N]} visible={false} />
      {/* multímetro: en serie o con sus puntas (roja y negra) en los extremos de la resistencia */}
      {!enSerie && (
        <>
          {cable(xRa, Y1, xRa, 1.55, mats.rojo, "r")}
          {cable(xRa, 1.55, 1.9, 1.55, mats.rojo, "r")}
          {cable(1.9, 1.55, 1.9, 0.62, mats.rojo, "r")}
          {cable(xRb, Y1, xRb, 1.35, mats.negro, "n")}
          {cable(xRb, 1.35, 2.2, 1.35, mats.negro, "n")}
          {cable(2.2, 1.35, 2.2, 0.62, mats.negro, "n")}
        </>
      )}
      <Medidor ref={aguja} position={[cxM, cyM, enSerie ? 0.05 : 0]} radio={enSerie ? 0.45 : 0.5} escala={escala} propuesta={propuesta} />
      {etiquetas && (
        <>
          <Etiqueta position={[X0 - 0.4, 0, 0.3]} className="etq-dato etq-izq">
            {textoPila}
          </Etiqueta>
          <Etiqueta position={[XR, Y1 - 0.25, 0.3]} className="etq-dato etq-abajo">
            {textoR}
          </Etiqueta>
          <Etiqueta position={[(X0 + X1) / 2, Y0 - 0.08, 0.3]} className="etq-dato etq-abajo">
            {textoI}
          </Etiqueta>
          {/* en serie, a la derecha de la esfera (debajo pasa el cable); con puntas, debajo */}
          <Etiqueta position={enSerie ? [cxM + 0.55, cyM, 0.3] : [cxM, cyM - 0.58, 0.3]} className={`etq-dato ${enSerie ? "" : "etq-abajo"} ${exito ? "etq-acento" : ""}`}>
            {verValor ? `${pide} = ${String(valor).replace(".", ",")} ${pide === "I" ? "A" : pide === "V" ? "V" : "Ω"}` : textoMedidor}
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
