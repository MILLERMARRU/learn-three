// ══ Escena del potencial (Nivel 17): la carga con sus anillos equipotenciales, la carga de prueba y el medidor ───────
// El medidor (sin números) parte de cero en el centro: sube si el valor es positivo y baja si es negativo.
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Carga fuente (μC), distancias de A (o P) y de B (m), y valor real y propuesto (kV o mJ). */
  Q: number;
  dA: number;
  dB: number | null;
  valor: number;
  propuesta: number | null;
  /** Unidad del medidor («kV» o «mJ») y rótulos. */
  unidad: string;
  textoQ: string;
  textoA: string;
  textoB: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const XC = -1.5; // carga fuente
const R_Q = 0.26;
const ANG = (20 * Math.PI) / 180; // dirección de los puntos A y B
const XM = 2.75; // medidor
const ALTO_M = 1.35; // mitad del medidor (90 unidades)
const ESCALA_M = 90;
const DUR = 2.8;
const POS = new THREE.Color("#ff6a5a");
const NEG = new THREE.Color("#5aa9ff");
const suave = (x: number) => x * x * (3 - 2 * x);
/** Radio dibujado de un anillo a la distancia d (m). */
const radio = (d: number) => 0.4 + 1.4 * d;
const punto = (d: number): [number, number] => [XC + radio(d) * Math.cos(ANG), radio(d) * Math.sin(ANG)];
/** Altura en el medidor de un valor (kV o mJ). */
const yM = (v: number) => (Math.max(-ESCALA_M, Math.min(ESCALA_M, v)) / ESCALA_M) * ALTO_M;

export function EscenaPotencial({ Q, dA, dB, valor, propuesta, unidad, textoQ, textoA, textoB, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const prueba = useRef<THREE.Group>(null!);
  const barra = useRef<THREE.Mesh>(null!);
  const [xA, yA] = punto(dA);
  const [xB, yB] = dB === null ? [xA, yA] : punto(dB);
  // potencial: la carga de prueba llega desde lejos hasta P; trabajo: va de A a B
  const desde: [number, number] = dB === null ? [XC + 3.1 * Math.cos(ANG), 3.1 * Math.sin(ANG)] : [xA, yA];
  const hasta: [number, number] = dB === null ? [xA, yA] : [xB, yB];

  const geo = useMemo(
    () => ({
      esfera: new THREE.SphereGeometry(R_Q, 32, 24),
      prueba: new THREE.SphereGeometry(0.1, 20, 14),
      aro: new THREE.TorusGeometry(1, 0.012, 6, 96),
      caja: new THREE.BoxGeometry(1, 1, 1),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      fuente: new THREE.MeshStandardMaterial({ color: Q > 0 ? POS : NEG, emissive: Q > 0 ? POS : NEG, emissiveIntensity: 0.45, roughness: 0.35 }),
      prueba: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.5 }),
      tenue: new THREE.MeshStandardMaterial({ color: Q > 0 ? POS : NEG, transparent: true, opacity: 0.18, depthWrite: false }),
      vivo: new THREE.MeshStandardMaterial({ color: "#d9e2ee", transparent: true, opacity: 0.7, depthWrite: false }),
      camino: new THREE.MeshStandardMaterial({ color: "#5d6673" }),
      marco: new THREE.MeshStandardMaterial({ color: "#2a3038" }),
      cero: new THREE.MeshStandardMaterial({ color: "#8a929d" }),
      barra: new THREE.MeshStandardMaterial({ color: valor >= 0 ? "#6fd6a8" : "#ff8a5c", emissive: valor >= 0 ? "#6fd6a8" : "#ff8a5c", emissiveIntensity: 0.35 }),
      marca: new THREE.MeshStandardMaterial({ color: "#86b2ff", emissive: "#86b2ff", emissiveIntensity: 0.6 }),
    }),
    [Q, valor],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    if (exito) emitirPolvo({ pos: [XM, yM(valor), 0.4], color: "#6fd6a8", n: 110, radio: 0.35, fuerza: 1 });
  }, [exito, valor]);

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
    // la carga de prueba se mueve y el medidor la sigue
    const u = suave(Math.min(1, t / (DUR * 0.8)));
    prueba.current.position.set(desde[0] + (hasta[0] - desde[0]) * u, desde[1] + (hasta[1] - desde[1]) * u, 0.05);
    prueba.current.visible = !!corrida;
    const v = valor * u;
    barra.current.scale.y = Math.max(0.001, Math.abs(yM(v)));
    barra.current.position.y = yM(v) / 2;
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  const radiosTenues = [0.3, 0.6, 0.9].filter((r) => r !== dA && r !== dB);
  return (
    <group>
      <mesh geometry={geo.esfera} material={mats.fuente} position={[XC, 0, 0]} />
      {/* superficies equipotenciales: tenues de fondo y vivas en los puntos del problema */}
      {radiosTenues.map((r) => (
        <mesh key={r} geometry={geo.aro} material={mats.tenue} position={[XC, 0, -0.05]} scale={[radio(r), radio(r), 1]} />
      ))}
      {[dA, dB].map((r, i) => r !== null && <mesh key={`v${i}`} geometry={geo.aro} material={mats.vivo} position={[XC, 0, -0.03]} scale={[radio(r), radio(r), 1]} />)}
      {/* camino de la carga de prueba */}
      <mesh geometry={geo.caja} material={mats.camino} position={[(desde[0] + hasta[0]) / 2, (desde[1] + hasta[1]) / 2, -0.02]} rotation={[0, 0, ANG]} scale={[Math.hypot(hasta[0] - desde[0], hasta[1] - desde[1]), 0.012, 0.012]} />
      <group ref={prueba} visible={false}>
        <mesh geometry={geo.prueba} material={mats.prueba} />
      </group>
      {/* medidor: marco, línea del cero, barra y la marca azul */}
      <mesh geometry={geo.caja} material={mats.marco} position={[XM, 0, -0.02]} scale={[0.3, 2 * ALTO_M + 0.1, 0.04]} />
      <mesh geometry={geo.caja} material={mats.cero} position={[XM, 0, 0.02]} scale={[0.42, 0.02, 0.03]} />
      <mesh ref={barra} geometry={geo.caja} material={mats.barra} position={[XM, 0, 0.03]} scale={[0.2, 0.001, 0.04]} />
      {propuesta !== null && <mesh geometry={geo.caja} material={mats.marca} position={[XM, yM(propuesta), 0.06]} scale={[0.5, 0.03, 0.03]} />}
      {etiquetas && (
        <>
          <Etiqueta position={[XC, -R_Q - 0.05, 0.3]} className="etq-dato etq-abajo">
            {textoQ}
          </Etiqueta>
          <Etiqueta position={[xA, yA + 0.38, 0.3]} className="etq-dato etq-centro">
            {textoA}
          </Etiqueta>
          {dB !== null && (
            <Etiqueta position={[xB, yB + 0.38, 0.3]} className="etq-dato etq-centro">
              {textoB}
            </Etiqueta>
          )}
          <Etiqueta position={[XM, ALTO_M + 0.15, 0.3]} className="etq-dato etq-centro">
            {unidad === "kV" ? "V" : "W"}
          </Etiqueta>
          {verValor && (
            <Etiqueta position={[XM + 0.3, yM(valor), 0.3]} className={`etq-dato ${exito ? "etq-acento" : ""}`}>
              {unidad === "kV" ? "V" : "W"} = {String(valor).replace("-", "−")} {unidad}
            </Etiqueta>
          )}
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -2.2, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
