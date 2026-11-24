// ══ Escena de la red de resistencias (Nivel 18): la red se ilumina y el óhmetro, conectado entre A y B, marca la equivalente ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";
import { anguloMedidor, Medidor } from "./Medidor";

interface Props {
  tipo: "serie" | "paralelo" | "mixta";
  rs: number[];
  /** Resistencia equivalente real y propuesta (Ω; null = sin marca) y fondo de escala del óhmetro. */
  R: number;
  propuesta: number | null;
  escala: number;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const XA = -2.6; // bornes A y B
const XB = 1;
const LARGO_R = 0.7;
const XM = 2.2; // óhmetro
const Y_BAJO = -1.15; // cable de la punta negra, por debajo de la red
const DUR = 2.8;
const suave = (x: number) => x * x * (3 - 2 * x);

/** Posición (centro) de cada resistencia según la red, y los tramos de cable que las unen. */
function trazar(tipo: Props["tipo"], n: number) {
  const pos: [number, number][] = [];
  const cables: [number, number, number, number][] = [];
  if (tipo === "serie") {
    const paso = (XB - XA) / n;
    for (let i = 0; i < n; i++) pos.push([XA + paso * (i + 0.5), 0]);
    let x = XA;
    pos.forEach(([cx]) => {
      cables.push([x, 0, cx - LARGO_R / 2, 0]);
      x = cx + LARGO_R / 2;
    });
    cables.push([x, 0, XB, 0]);
  } else if (tipo === "paralelo") {
    const ys = n === 2 ? [0.42, -0.42] : [0.62, 0, -0.62];
    const xl = -1.9;
    const xr = 0.3;
    const cx = (xl + xr) / 2;
    ys.forEach((y) => {
      pos.push([cx, y]);
      cables.push([xl, y, cx - LARGO_R / 2, y], [cx + LARGO_R / 2, y, xr, y]);
    });
    cables.push([XA, 0, xl, 0], [xl, ys[0], xl, ys[ys.length - 1]], [xr, ys[0], xr, ys[ys.length - 1]], [xr, 0, XB, 0]);
  } else {
    // R₁ en serie a la izquierda y el paralelo de R₂ y R₃ a la derecha
    pos.push([-1.85, 0]);
    const xl = -0.95;
    const xr = 0.6;
    const cx = (xl + xr) / 2;
    [0.42, -0.42].forEach((y) => {
      pos.push([cx, y]);
      cables.push([xl, y, cx - LARGO_R / 2, y], [cx + LARGO_R / 2, y, xr, y]);
    });
    cables.push([XA, 0, -1.85 - LARGO_R / 2, 0], [-1.85 + LARGO_R / 2, 0, xl, 0], [xl, 0.42, xl, -0.42], [xr, 0.42, xr, -0.42], [xr, 0, XB, 0]);
  }
  return { pos, cables };
}

export function EscenaRed({ tipo, rs, R, propuesta, escala, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const aguja = useRef<THREE.Group>(null!);
  const { pos, cables } = useMemo(() => trazar(tipo, rs.length), [tipo, rs.length]);

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      resist: new THREE.CylinderGeometry(0.13, 0.13, LARGO_R, 20).rotateZ(Math.PI / 2),
      banda: new THREE.CylinderGeometry(0.14, 0.14, 0.05, 20).rotateZ(Math.PI / 2),
      borne: new THREE.SphereGeometry(0.08, 16, 12),
    }),
    [],
  );
  // un material por resistencia: se encienden una tras otra
  const matsR = useMemo(() => rs.map(() => new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.6, emissive: "#f0b44c", emissiveIntensity: 0 })), [rs]);
  const mats = useMemo(
    () => ({
      cable: new THREE.MeshStandardMaterial({ color: "#c98b4a", metalness: 0.4, roughness: 0.5 }),
      banda: new THREE.MeshStandardMaterial({ color: "#7a4a2a" }),
      borne: new THREE.MeshStandardMaterial({ color: "#d9e2ee", metalness: 0.5, roughness: 0.3 }),
      rojo: new THREE.MeshStandardMaterial({ color: "#d94a3a" }),
      negro: new THREE.MeshStandardMaterial({ color: "#6b7480" }),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
      matsR.forEach((m) => m.dispose());
    },
    [geo, mats, matsR],
  );
  useEffect(() => {
    if (exito) emitirPolvo({ pos: [XM, 0, 0.4], color: "#6fd6a8", n: 110, radio: 0.4, fuerza: 1 });
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
    // las resistencias se encienden una tras otra; luego la aguja va a la equivalente
    matsR.forEach((m, i) => {
      m.emissiveIntensity = 0.45 * suave(Math.max(0, Math.min(1, (t - i * 0.25) / 0.4)));
    });
    const u = suave(Math.max(0, Math.min(1, (t - 0.9) / (DUR - 0.9))));
    aguja.current.rotation.z = anguloMedidor(R * u, escala);
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  const cable = (c: [number, number, number, number], mat: THREE.Material, k: string) => (
    <mesh key={k} geometry={geo.caja} material={mat} position={[(c[0] + c[2]) / 2, (c[1] + c[3]) / 2, 0]} scale={[Math.max(0.035, Math.abs(c[2] - c[0])), Math.max(0.035, Math.abs(c[3] - c[1])), 0.035]} />
  );
  return (
    <group>
      {cables.map((c, i) => cable(c, mats.cable, `c${i}`))}
      {pos.map(([x, y], i) => (
        <group key={i} position={[x, y, 0]}>
          <mesh geometry={geo.resist} material={matsR[i]} />
          {[-0.18, -0.06, 0.06].map((dx) => (
            <mesh key={dx} geometry={geo.banda} material={mats.banda} position={[dx, 0, 0]} />
          ))}
        </group>
      ))}
      {/* bornes A y B */}
      <mesh geometry={geo.borne} material={mats.borne} position={[XA, 0, 0]} />
      <mesh geometry={geo.borne} material={mats.borne} position={[XB, 0, 0]} />
      {/* óhmetro: punta roja desde B y negra desde A, por debajo de la red */}
      {cable([XB, 0, XM - 0.5, 0], mats.rojo, "r")}
      {cable([XA, 0, XA, Y_BAJO], mats.negro, "n1")}
      {cable([XA, Y_BAJO, XM, Y_BAJO], mats.negro, "n2")}
      {cable([XM, Y_BAJO, XM, -0.5], mats.negro, "n3")}
      <Medidor ref={aguja} position={[XM, 0, 0.02]} radio={0.5} escala={escala} propuesta={propuesta} />
      {etiquetas && (
        <>
          {pos.map(([x, y], i) => (
            <Etiqueta key={`e${i}`} position={[x, y + 0.2, 0.3]} className="etq-dato etq-centro">
              {rs[i]} Ω
            </Etiqueta>
          ))}
          <Etiqueta position={[XA - 0.12, 0, 0.3]} className="etq-dato etq-izq">
            A
          </Etiqueta>
          <Etiqueta position={[XB, -0.12, 0.3]} className="etq-dato etq-abajo">
            B
          </Etiqueta>
          <Etiqueta position={[XM + 0.58, 0, 0.3]} className={`etq-dato ${exito ? "etq-acento" : ""}`}>
            {verValor ? `R = ${R} Ω` : "óhmetro"}
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
