// ══ Escena de mezcla (Nivel 15): el cuerpo caliente se vierte (o se sumerge) en el calorímetro y el termómetro busca el equilibrio ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";
import { alturaTermo, Termometro } from "./Termometro";

interface Props {
  /** El cuerpo caliente: color, si es líquido (se vierte) o metal (se sumerge) y su fracción de la masa total. */
  colorA: string;
  liquidoA: boolean;
  fraccionA: number;
  /** El líquido frío del calorímetro y su temperatura. */
  colorB: string;
  Tb: number;
  /** Temperatura de equilibrio real y propuesta (°C; null = sin marca). */
  Te: number;
  Tpropuesta: number | null;
  textoA: string;
  textoB: string;
  verValor?: boolean;
  corrida?: { id: number } | null;
  /** Mientras se mezcla, el rótulo del cuerpo caliente se oculta (el cuerpo se mueve). */
  moviendo?: boolean;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const XC = 0.1; // calorímetro
const Y_BASE = -1.35;
const R_CAL = 0.8;
const ALTO_CAL = 1.5;
const NIVEL = 1.15; // nivel final del líquido
const XA = -1.75; // vaso caliente antes de verter
const YA = 0.45; // base del vaso caliente
const R_VASO = 0.4;
const ALTO_VASO = 0.75;
const XT = 1.6; // termómetro
const YT = -1.05;
const T_VERTER = 1.4; // hasta aquí se vierte o se sumerge; después, el termómetro
const DUR = 3.4;
const ROJO = new THREE.Color("#ff7a3d");
const suave = (x: number) => x * x * (3 - 2 * x);

export function EscenaMezcla({ colorA, liquidoA, fraccionA, colorB, Tb, Te, Tpropuesta, textoA, textoB, verValor = false, corrida = null, moviendo = false, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const vaso = useRef<THREE.Group>(null!);
  const liqA = useRef<THREE.Mesh>(null!);
  const chorro = useRef<THREE.Mesh>(null!);
  const bloque = useRef<THREE.Group>(null!);
  const liqB = useRef<THREE.Mesh>(null!);
  const columna = useRef<THREE.Mesh>(null!);
  const nivelB = liquidoA ? NIVEL * (1 - fraccionA) : NIVEL - 0.12;
  const baseA = useMemo(() => new THREE.Color(colorA), [colorA]);
  const mezcla = useMemo(() => new THREE.Color(colorB).lerp(new THREE.Color(liquidoA ? colorA : colorB), 0.5), [colorA, colorB, liquidoA]);
  const frio = useMemo(() => new THREE.Color(colorB), [colorB]);

  const geo = useMemo(
    () => ({
      cal: new THREE.CylinderGeometry(R_CAL, R_CAL, ALTO_CAL, 40, 1, true),
      fondo: new THREE.CylinderGeometry(R_CAL, R_CAL, 0.08, 40),
      liqB: new THREE.CylinderGeometry(R_CAL - 0.05, R_CAL - 0.05, 1, 40).translate(0, 0.5, 0),
      vaso: new THREE.CylinderGeometry(R_VASO, R_VASO * 0.92, ALTO_VASO, 28, 1, true),
      liqA: new THREE.CylinderGeometry(R_VASO - 0.03, R_VASO * 0.92 - 0.03, 1, 28).translate(0, 0.5, 0),
      caja: new THREE.BoxGeometry(1, 1, 1),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      cal: new THREE.MeshStandardMaterial({ color: "#3a4250", transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }),
      fondo: new THREE.MeshStandardMaterial({ color: "#2a3038" }),
      vidrio: new THREE.MeshStandardMaterial({ color: "#c8d6e8", transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }),
      liqA: new THREE.MeshStandardMaterial({ color: colorA, transparent: true, opacity: 0.65, depthWrite: false, emissive: "#ff5a1f", emissiveIntensity: 0.12 }),
      liqB: new THREE.MeshStandardMaterial({ color: colorB, transparent: true, opacity: 0.6, depthWrite: false }),
      metal: new THREE.MeshStandardMaterial({ color: colorA, metalness: 0.5, roughness: 0.4, emissive: "#ff5a1f", emissiveIntensity: 0.6 }),
      hilo: new THREE.MeshStandardMaterial({ color: "#8a929d" }),
    }),
    [colorA, colorB],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    if (exito) emitirPolvo({ pos: [XT, YT + alturaTermo(Te), 0.4], color: "#6fd6a8", n: 110, radio: 0.35, fuerza: 1 });
  }, [exito, Te]);

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
    const mover = suave(Math.min(1, t / 0.5)); // el vaso va sobre el calorímetro y se inclina
    const verter = suave(Math.max(0, Math.min(1, (t - 0.45) / (T_VERTER - 0.45)))); // el líquido pasa
    let nivel = nivelB;
    if (liquidoA) {
      vaso.current.position.set(XA + (-0.55 - XA) * mover, YA + ALTO_VASO / 2 + (0.95 - YA - ALTO_VASO / 2) * mover, 0);
      vaso.current.rotation.z = (-110 * Math.PI * mover) / 180;
      liqA.current.scale.y = Math.max(0.001, 0.6 * (1 - verter));
      const chorroVisible = verter > 0 && verter < 1;
      nivel = nivelB + (NIVEL - nivelB) * verter;
      chorro.current.visible = chorroVisible;
      const yLabio = 0.43;
      const ySup = Y_BASE + 0.04 + nivel;
      chorro.current.position.set(-0.34, (yLabio + ySup) / 2, 0);
      chorro.current.scale.set(0.05, Math.max(0.01, yLabio - ySup), 0.05);
    } else {
      // el metal baja colgado del hilo hasta el fondo; al tocar el agua deja de brillar
      const yB = 1 + (Y_BASE + 0.3 - 1) * suave(Math.min(1, t / T_VERTER));
      bloque.current.position.y = yB;
      nivel = nivelB + (NIVEL - nivelB) * suave(Math.max(0, Math.min(1, (Y_BASE + 0.04 + nivelB + 0.2 - yB) / 0.4)));
    }
    liqB.current.scale.y = nivel;
    // tras mezclar, el termómetro va del frío al equilibrio y el líquido toma el color de la mezcla
    const u = suave(Math.max(0, Math.min(1, (t - T_VERTER) / (DUR - T_VERTER))));
    columna.current.scale.y = Math.max(0.01, alturaTermo(Tb + (Te - Tb) * u));
    mats.liqB.color.copy(frio).lerp(mezcla, liquidoA ? verter : 0).lerp(ROJO, 0.12 * u);
    mats.metal.emissiveIntensity = 0.6 * (1 - u);
    mats.metal.color.copy(baseA).lerp(ROJO, 0.4 * (1 - u));
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  return (
    <group>
      {/* calorímetro (paredes aislantes semitransparentes) con el líquido frío */}
      <mesh geometry={geo.cal} material={mats.cal} position={[XC, Y_BASE + ALTO_CAL / 2, 0]} />
      <mesh geometry={geo.fondo} material={mats.fondo} position={[XC, Y_BASE, 0]} />
      <mesh ref={liqB} geometry={geo.liqB} material={mats.liqB} position={[XC, Y_BASE + 0.04, 0]} scale={[1, nivelB, 1]} />
      {liquidoA ? (
        <>
          {/* vaso con el líquido caliente (pivote en su centro) y el chorro al verter */}
          <group ref={vaso} position={[XA, YA + ALTO_VASO / 2, 0]}>
            <mesh geometry={geo.vaso} material={mats.vidrio} />
            <mesh ref={liqA} geometry={geo.liqA} material={mats.liqA} position={[0, -ALTO_VASO / 2 + 0.03, 0]} scale={[1, 0.6, 1]} />
          </group>
          <mesh ref={chorro} geometry={geo.caja} material={mats.liqA} visible={false} />
        </>
      ) : (
        <group ref={bloque} position={[XC, 1, 0]}>
          <mesh geometry={geo.caja} material={mats.metal} scale={[0.55, 0.45, 0.45]} />
          <mesh geometry={geo.caja} material={mats.hilo} position={[0, 0.675, 0]} scale={[0.012, 0.9, 0.012]} />
        </group>
      )}
      <Termometro ref={columna} position={[XT, YT, 0]} Tpropuesta={Tpropuesta} T0={Tb} />
      {etiquetas && (
        <>
          {!corrida && !moviendo && (
            <Etiqueta position={liquidoA ? [XA, YA + ALTO_VASO + 0.12, 0.2] : [XC - 0.4, 1, 0.3]} className={`etq-dato ${liquidoA ? "etq-centro" : "etq-izq"}`}>
              {textoA}
            </Etiqueta>
          )}
          <Etiqueta position={[XC, Y_BASE - 0.1, 0.8]} className="etq-dato etq-abajo">
            {textoB}
          </Etiqueta>
          {verValor && (
            <Etiqueta position={[XT + 0.25, YT + alturaTermo(Te), 0.2]} className={`etq-dato ${exito ? "etq-acento" : ""}`}>
              Tₑ = {Te} °C
            </Etiqueta>
          )}
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -2, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
