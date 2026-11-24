// ══ Escena de la onda (Nivel 13): una onda viaja por una cuerda desde un generador; la fantasma usa el valor propuesto ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";
import { crearCinta, escribirCinta } from "./cinta";

interface Props {
  tipo: "lambda" | "v" | "f";
  lambda: number;
  f: number;
  v: number;
  conT: boolean;
  /** Valor propuesto (onda fantasma; null = sin fantasma). */
  propuesta: number | null;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const X0 = -3.4; // el generador
const X1 = 3.6;
const N = 220; // puntos de la cuerda
const AMP = 0.42;
const LAMBDA_VIS = 1.8; // una longitud de onda real se dibuja con este largo
const F_VIS = 0.7; // oscilaciones por segundo real de la onda real
const DUR = 3.2;
const GROSOR = 0.035;
const fmt = (n: number) => String(n).replace(".", ",");

/** Perfil y = A·sen(k(x − x0) − ωt); la onda solo existe hasta donde llegó el frente. */
function perfil(g: THREE.BufferGeometry, lamVis: number, fVis: number, t: number, z: number) {
  const k = (2 * Math.PI) / lamVis;
  const w = 2 * Math.PI * fVis;
  const frente = X0 + lamVis * fVis * t + 2 * lamVis; // ya hay dos longitudes de onda al empezar
  escribirCinta(g, X0, X1, (x) => (x <= frente ? AMP * Math.sin(k * (x - X0) - w * t) : 0), z, GROSOR);
}

export function EscenaOnda({ tipo, lambda, f, v, conT, propuesta, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  // la fantasma cambia lo que se pregunta: su longitud de onda, su velocidad o su frecuencia (con la misma λ)
  const r = propuesta === null ? 1 : propuesta / (tipo === "lambda" ? lambda : tipo === "v" ? v : f);
  const lamFan = tipo === "lambda" ? LAMBDA_VIS * r : LAMBDA_VIS;
  const fFan = tipo === "lambda" ? F_VIS : F_VIS * r;

  const sim = useRef({ id: -1, t: 0, fin: false });
  const geo = useMemo(() => ({ real: crearCinta(N), fan: crearCinta(N), caja: new THREE.BoxGeometry(1, 1, 1) }), []);
  const mats = useMemo(
    () => ({
      cuerda: new THREE.MeshStandardMaterial({ color: "#d9c3a0", side: THREE.DoubleSide, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false, emissive: "#86b2ff", emissiveIntensity: 0.35 }),
      generador: new THREE.MeshStandardMaterial({ color: "#39404b", roughness: 0.6 }),
      regla: new THREE.MeshStandardMaterial({ color: "#8a929d" }),
    }),
    [],
  );
  const generador = useRef<THREE.Mesh>(null!);
  const fan = useRef<THREE.Mesh>(null);
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    mats.cuerda.emissiveIntensity = exito ? 0.45 : 0;
    if (exito) emitirPolvo({ pos: [0, AMP + 0.2, 0.4], color: "#6fd6a8", n: 110, radio: 0.5, fuerza: 1 });
  }, [exito, mats]);

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
    perfil(geo.real, LAMBDA_VIS, F_VIS, S.t, 0);
    perfil(geo.fan, lamFan, fFan, S.t, 0.06);
    if (fan.current) fan.current.visible = !!corrida && propuesta !== null;
    // el generador sube y baja con la fuente
    generador.current.position.y = AMP * Math.sin(-2 * Math.PI * F_VIS * S.t);
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  /** El valor que se pregunta se rotula «?» hasta acertar. */
  const pide = (t: Props["tipo"]) => tipo === t && !verValor;
  return (
    <group>
      <mesh geometry={geo.real} material={mats.cuerda} />
      <mesh ref={fan} geometry={geo.fan} material={mats.fantasma} visible={false} />
      <mesh ref={generador} geometry={geo.caja} material={mats.generador} position={[X0 - 0.12, 0, 0]} scale={[0.22, 0.32, 0.3]} />
      {/* soporte del generador */}
      <mesh geometry={geo.caja} material={mats.generador} position={[X0 - 0.12, -0.8, 0]} scale={[0.08, 0.9, 0.08]} />
      {/* regla de una longitud de onda, sobre la cuerda */}
      <mesh geometry={geo.caja} material={mats.regla} position={[X0 + 0.5 + LAMBDA_VIS / 2, AMP + 0.3, 0]} scale={[LAMBDA_VIS, 0.015, 0.015]} />
      <mesh geometry={geo.caja} material={mats.regla} position={[X0 + 0.5, AMP + 0.3, 0]} scale={[0.015, 0.14, 0.015]} />
      <mesh geometry={geo.caja} material={mats.regla} position={[X0 + 0.5 + LAMBDA_VIS, AMP + 0.3, 0]} scale={[0.015, 0.14, 0.015]} />
      {etiquetas && (
        <>
          <Etiqueta position={[X0 + 0.5 + LAMBDA_VIS / 2, AMP + 0.36, 0]} className={`etq-dato etq-centro ${tipo === "lambda" && verValor && exito ? "etq-acento" : ""}`}>
            λ = {pide("lambda") ? "?" : `${fmt(lambda)} m`}
          </Etiqueta>
          <Etiqueta position={[X0 - 0.12, -1.3, 0.2]} className={`etq-dato etq-abajo ${tipo === "f" && verValor && exito ? "etq-acento" : ""}`}>
            {conT ? `T = ${fmt(1 / f)} s` : `f = ${pide("f") ? "?" : `${fmt(f)} Hz`}`}
          </Etiqueta>
          <Etiqueta position={[2.6, AMP + 0.36, 0]} className={`etq-dato etq-centro ${tipo === "v" && verValor && exito ? "etq-acento" : ""}`}>
            v = {pide("v") ? "?" : `${fmt(v)} m/s`} →
          </Etiqueta>
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -1.4, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
