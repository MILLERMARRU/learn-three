// ══ Escena del espectro (Nivel 21): una onda electromagnética (E y B perpendiculares) viaja sobre la franja del espectro ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { anguloMedidor, Medidor } from "../circuitos/Medidor";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Región del espectro de la onda, valor real y propuesto (null = sin marca) y fondo de escala del medidor. */
  region: string;
  valor: number;
  propuesta: number | null;
  escala: number;
  textoDato: string;
  textoValor: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const X0 = -2.6; // onda y franja
const X1 = 1;
const Y_ONDA = 0.35;
const AMP = 0.42;
const N = 64; // puntos de cada campo
const K = (2 * Math.PI) / 1.2; // número de onda dibujado
const Y_FRANJA = -0.95;
const XM = 2.4; // medidor
const DUR = 2.6;
const suave = (x: number) => x * x * (3 - 2 * x);

/** Tramos de la franja del espectro (de mayor a menor λ) y su color. */
const TRAMOS: { nombre: string; x0: number; x1: number; color: string }[] = [
  { nombre: "radio", x0: -2.6, x1: -1.6, color: "#5d6673" },
  { nombre: "microondas", x0: -1.6, x1: -1, color: "#7a6a8a" },
  { nombre: "infrarrojo", x0: -1, x1: -0.55, color: "#8a2a2a" },
  { nombre: "visible", x0: -0.55, x1: -0.15, color: "#ffffff" },
  { nombre: "ultravioleta", x0: -0.15, x1: 0.25, color: "#6a3ad9" },
  { nombre: "rayos X", x0: 0.25, x1: 0.65, color: "#9aa4b1" },
  { nombre: "rayos gamma", x0: 0.65, x1: 1, color: "#d9e2ee" },
];
const ARCOIRIS = ["#ff3b30", "#ff9500", "#ffcc00", "#34c759", "#30b0c7", "#3a5bd9", "#8e44ad"];

export function EscenaEspectro({ region, valor, propuesta, escala, textoDato, textoValor, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false, fase: 0 });
  const aguja = useRef<THREE.Group>(null!);
  const campoE = useRef<THREE.InstancedMesh>(null!);
  const campoB = useRef<THREE.InstancedMesh>(null!);
  const cursor = useRef<THREE.Group>(null!);
  const tmp = useMemo(() => new THREE.Matrix4(), []);
  const tramo = TRAMOS.find((t) => t.nombre === region) ?? TRAMOS[0];
  const xCursor = (tramo.x0 + tramo.x1) / 2;

  const geo = useMemo(
    () => ({
      punto: new THREE.SphereGeometry(0.035, 8, 6),
      caja: new THREE.BoxGeometry(1, 1, 1),
      flecha: new THREE.ConeGeometry(0.09, 0.2, 3).rotateZ(Math.PI),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      E: new THREE.MeshStandardMaterial({ color: "#ff6a5a", emissive: "#ff6a5a", emissiveIntensity: 0.5 }),
      B: new THREE.MeshStandardMaterial({ color: "#5aa9ff", emissive: "#5aa9ff", emissiveIntensity: 0.5 }),
      eje: new THREE.MeshStandardMaterial({ color: "#5d6673" }),
      cursor: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.5 }),
      tramos: TRAMOS.map((t) => new THREE.MeshStandardMaterial({ color: t.color, roughness: 0.7 })),
      arcoiris: ARCOIRIS.map((c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.3 })),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      [mats.E, mats.B, mats.eje, mats.cursor, ...mats.tramos, ...mats.arcoiris].forEach((m) => m.dispose());
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
    if (corrida) S.fase += d * 5;
    const u = suave(Math.min(1, S.t / DUR));
    // la onda avanza desde la izquierda: los puntos aparecen a medida que llega el frente
    const frente = corrida ? X0 + (X1 - X0) * Math.min(1, S.t / (DUR * 0.6)) : -Infinity; // antes de emitir no se ve ningún punto
    for (let i = 0; i < N; i++) {
      const x = X0 + ((X1 - X0) * i) / (N - 1);
      const s = Math.sin(K * x - S.fase) * AMP;
      if (x <= frente) tmp.makeTranslation(x, Y_ONDA + s, 0);
      else tmp.makeScale(0, 0, 0);
      campoE.current.setMatrixAt(i, tmp);
      if (x <= frente) tmp.makeTranslation(x, Y_ONDA, s);
      campoB.current.setMatrixAt(i, tmp);
    }
    campoE.current.instanceMatrix.needsUpdate = true;
    campoB.current.instanceMatrix.needsUpdate = true;
    // el cursor baja sobre la región de la onda
    cursor.current.visible = !!corrida;
    cursor.current.position.set(xCursor, Y_FRANJA + 0.45 - 0.15 * u, 0.1);
    aguja.current.rotation.z = anguloMedidor(valor * u, escala);
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  return (
    <group>
      {/* la onda y la franja, giradas para que se vean los dos campos */}
      <group rotation={[0.18, -0.35, 0]}>
        {/* eje de propagación */}
        <mesh geometry={geo.caja} material={mats.eje} position={[(X0 + X1) / 2, Y_ONDA, 0]} scale={[X1 - X0, 0.012, 0.012]} />
        {/* campos E (vertical) y B (horizontal) */}
        <instancedMesh ref={campoE} args={[geo.punto, mats.E, N]} />
        <instancedMesh ref={campoB} args={[geo.punto, mats.B, N]} />
        {/* franja del espectro; el tramo visible lleva el arcoíris */}
        {TRAMOS.map((t, i) =>
          t.nombre === "visible" ? (
            ARCOIRIS.map((_, k) => {
              const w = (t.x1 - t.x0) / ARCOIRIS.length;
              return <mesh key={`v${k}`} geometry={geo.caja} material={mats.arcoiris[k]} position={[t.x0 + w * (k + 0.5), Y_FRANJA, 0]} scale={[w, 0.22, 0.08]} />;
            })
          ) : (
            <mesh key={t.nombre} geometry={geo.caja} material={mats.tramos[i]} position={[(t.x0 + t.x1) / 2, Y_FRANJA, 0]} scale={[t.x1 - t.x0 - 0.02, 0.22, 0.08]} />
          ),
        )}
        <group ref={cursor} visible={false}>
          <mesh geometry={geo.flecha} material={mats.cursor} />
        </group>
        {etiquetas && (
          <>
            <Etiqueta position={[-2.1, Y_FRANJA - 0.15, 0.1]} className="etq-dato etq-abajo">
              radio
            </Etiqueta>
            <Etiqueta position={[-0.35, Y_FRANJA - 0.15, 0.1]} className="etq-dato etq-abajo">
              visible
            </Etiqueta>
            <Etiqueta position={[0.82, Y_FRANJA - 0.15, 0.1]} className="etq-dato etq-abajo">
              γ
            </Etiqueta>
          </>
        )}
      </group>
      <Medidor ref={aguja} position={[XM, 0.2, 0]} radio={0.5} escala={escala} propuesta={propuesta} />
      {etiquetas && (
        <>
          <Etiqueta position={[X0 + 0.2, Y_ONDA + AMP + 0.35, 0]} className="etq-dato">
            {textoDato}
          </Etiqueta>
          <Etiqueta position={[XM, 0.2 - 0.58, 0.3]} className={`etq-dato etq-abajo ${exito ? "etq-acento" : ""}`}>
            {verValor ? textoValor : "medidor"}
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
