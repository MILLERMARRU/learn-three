// ══ Escena de la palanca (Nivel 7): barra con apoyo, pesas colgadas, fuerza de la mano y peso propio; gira si ΣM ≠ 0 ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { sumaMomentos, type FuerzaEnBarra } from "@/lib/estatica";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

/** Algo que actúa sobre la barra: una pesa colgada, la mano que tira o el peso propio. */
export interface Carga {
  x: number;
  F: number;
  tipo: "pesa" | "mano" | "barra";
  /** La que ajusta el alumno (se resalta). */
  incognita?: boolean;
}

interface Props {
  pivote: number;
  cargas: Carga[];
  /** Media longitud de la barra (m). */
  media: number;
  /** Escala de las flechas (unidades 3D por newton), fija por problema. */
  escala: number;
  /** Mostrar marcas cada medio metro (cuando se ajusta una distancia). */
  medios?: boolean;
  /** Mostrar el momento neto (ronda guiada, o al terminar la corrida). */
  verMomento?: boolean;
  corrida?: { id: number } | null;
  onFin?: (p: { equilibrio: boolean; momento: number }) => void;
  exito?: boolean;
  previa?: string;
}

const K = 0.8; // unidades 3D por metro
const Y_BARRA = 0.55;
const GIRO_MAX = 0.24; // rad (~14°)
const DUR = 1.1;

const fmt = (n: number) => `${Math.round(Math.abs(n) * 10) / 10}`.replace(".", ",");

export function EscenaPalanca({ pivote, cargas, media, escala, medios = false, verMomento = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const fs: FuerzaEnBarra[] = cargas.map((c) => ({ x: c.x, Fy: -c.F }));
  const M = sumaMomentos(fs, pivote);
  const equilibrio = Math.abs(M) < 1e-9;
  const xp = pivote * K;

  const barra = useRef<THREE.Group>(null!);
  const colgantes = useRef<(THREE.Group | null)[]>([]);
  const sim = useRef({ id: -1, t: 0, fin: false });

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      apoyo: new THREE.ConeGeometry(0.34, 0.5, 4).rotateY(Math.PI / 4),
      mano: new THREE.SphereGeometry(0.13, 20, 14),
      cuerda: new THREE.BoxGeometry(0.02, 1, 0.02),
      tubo: new THREE.CylinderGeometry(0.032, 0.032, 1, 10).translate(0, 0.5, 0),
      punta: new THREE.ConeGeometry(0.085, 0.18, 16).translate(0, 0.09, 0),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      barra: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.5, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      marca: new THREE.MeshStandardMaterial({ color: "#39404b" }),
      apoyo: new THREE.MeshStandardMaterial({ color: "#4a525e", roughness: 0.7 }),
      piso: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.9 }),
      cuerda: new THREE.MeshStandardMaterial({ color: "#c9b48d" }),
      pesa: new THREE.MeshStandardMaterial({ color: "#8a929d", roughness: 0.4, metalness: 0.3 }),
      pesaInc: new THREE.MeshStandardMaterial({ color: "#f0b44c", roughness: 0.4, emissive: "#f0b44c", emissiveIntensity: 0.2 }),
      mano: new THREE.MeshStandardMaterial({ color: "#ff9ecd", emissive: "#ff9ecd", emissiveIntensity: 0.25 }),
      fMano: new THREE.MeshStandardMaterial({ color: "#ff9ecd", emissive: "#ff9ecd", emissiveIntensity: 0.3 }),
      fPeso: new THREE.MeshStandardMaterial({ color: "#ff8a5c", emissive: "#ff8a5c", emissiveIntensity: 0.3 }),
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
    mats.barra.emissiveIntensity = exito ? 0.35 : 0;
    if (exito) emitirPolvo({ pos: [xp, Y_BARRA + 0.2, 0.4], color: "#6fd6a8", n: 140, radio: 0.5, fuerza: 1.2 });
  }, [exito, mats, xp]);

  useFrame((state, dtCrudo) => {
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
    if (corrida && !S.fin) S.t += dt;
    // gira hacia el lado que gana (antihorario si ΣM > 0) y se detiene en el tope
    const u = Math.min(1, S.t / DUR);
    const th = corrida && !equilibrio ? Math.sign(M) * GIRO_MAX * (1 - (1 - u) ** 2) : corrida ? 0.012 * Math.sin(state.clock.elapsedTime * 9) * (1 - u) : 0;
    barra.current.rotation.z = th;
    colgantes.current.forEach((g) => g && (g.rotation.z = -th));
    if (corrida && !S.fin && S.t >= DUR) {
      S.fin = true;
      if (!equilibrio) emitirPolvo({ pos: [xp + Math.sign(-M) * media * K * 0.9, Y_BARRA - 0.5, 0.3], color: "#ff7a6b", n: 80, radio: 0.3, fuerza: 1, vida: 0.9 });
      onFin?.({ equilibrio, momento: M });
    }
  });

  // marcas de distancia medidas desde el apoyo
  const marcas: { x: number; d: number; entera: boolean }[] = [];
  for (let x = -media; x <= media + 1e-9; x += medios ? 0.5 : 1) {
    const d = Math.abs(x - pivote);
    marcas.push({ x, d, entera: Math.abs(d - Math.round(d)) < 1e-9 });
  }

  return (
    <group>
      {/* piso y apoyo */}
      <mesh geometry={geo.caja} material={mats.piso} position={[xp, Y_BARRA - 0.62, 0]} scale={[1.6, 0.1, 0.9]} />
      <mesh geometry={geo.apoyo} material={mats.apoyo} position={[xp, Y_BARRA - 0.32, 0]} />

      {/* la barra gira alrededor del apoyo; lo que cuelga se mantiene vertical */}
      <group ref={barra} position={[xp, Y_BARRA, 0]}>
        <mesh geometry={geo.caja} material={mats.barra} position={[-xp, 0, 0]} scale={[media * 2 * K, 0.14, 0.3]} />
        {marcas.map((m, i) => (
          <group key={i} position={[(m.x - pivote) * K, 0, 0.16]}>
            <mesh geometry={geo.caja} material={mats.marca} scale={[0.025, m.entera ? 0.14 : 0.07, 0.01]} />
            {etiquetas && m.entera && (
              <Etiqueta position={[0, 0.22, 0]} className="etq-eje">
                {m.d === 0 ? "0" : `${m.d}`}
              </Etiqueta>
            )}
          </group>
        ))}
        {cargas.map((c, i) => {
          const lx = (c.x - pivote) * K;
          const largo = Math.max(0.2, c.F * escala);
          return (
            <group key={i} position={[lx, -0.07, 0]}>
              <group
                ref={(g) => {
                  colgantes.current[i] = g;
                }}
              >
                {c.tipo === "pesa" && (
                  <>
                    <mesh geometry={geo.cuerda} material={mats.cuerda} position={[0, -0.25, 0]} scale={[1, 0.5, 1]} />
                    <mesh geometry={geo.caja} material={c.incognita ? mats.pesaInc : mats.pesa} position={[0, -0.5 - (0.26 + c.F * 0.002) / 2, 0]} scale={0.26 + c.F * 0.002} />
                    {etiquetas && (
                      <Etiqueta position={[0, -0.62 - (0.26 + c.F * 0.002), 0.3]} className={`etq-dato etq-centro ${c.incognita ? "etq-acento" : ""}`}>
                        {fmt(c.F)} N
                      </Etiqueta>
                    )}
                  </>
                )}
                {c.tipo === "mano" && (
                  <>
                    <group position={[0, 0, 0.25]} rotation={[0, 0, Math.PI]}>
                      <mesh geometry={geo.tubo} material={mats.fMano} scale={[1, Math.max(0.01, largo - 0.18), 1]} />
                      <mesh geometry={geo.punta} material={mats.fMano} position={[0, Math.max(0.01, largo - 0.18), 0]} />
                    </group>
                    <mesh geometry={geo.mano} material={mats.mano} position={[0, -largo - 0.1, 0.25]} />
                    {etiquetas && (
                      <Etiqueta position={[0, -largo - 0.45, 0.3]} className="etq-dato etq-acento etq-centro">
                        F = {fmt(c.F)} N
                      </Etiqueta>
                    )}
                  </>
                )}
                {c.tipo === "barra" && (
                  <>
                    <group position={[0, 0, 0.25]} rotation={[0, 0, Math.PI]}>
                      <mesh geometry={geo.tubo} material={mats.fPeso} scale={[1, Math.max(0.01, largo - 0.18), 1]} />
                      <mesh geometry={geo.punta} material={mats.fPeso} position={[0, Math.max(0.01, largo - 0.18), 0]} />
                    </group>
                    {etiquetas && (
                      <Etiqueta position={[0, -largo - 0.25, 0.3]} className="etq-dato etq-centro">
                        P = {fmt(c.F)} N
                      </Etiqueta>
                    )}
                  </>
                )}
              </group>
            </group>
          );
        })}
      </group>

      {etiquetas && verMomento && (
        <Etiqueta position={[xp, Y_BARRA - 0.95, 0.3]} className={`etq-dato etq-centro ${equilibrio ? "etq-acento" : "etq-mal"}`}>
          {equilibrio ? "ΣM = 0" : `ΣM = ${fmt(M)} N·m ${M > 0 ? "↺" : "↻"}`}
        </Etiqueta>
      )}
      {previa && (
        <Etiqueta position={[0, -1.4, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
