// ══ Escena del empujón (Nivel 10): una fuerza empuja el bloque en una zona de d metros; luego sigue liso. Bloque fantasma ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  m: number;
  F: number;
  /** Ángulo de la fuerza sobre la horizontal (°). */
  theta: number;
  d: number;
  mu: number;
  v0: number;
  /** Rapidez real con que sale de la zona (m/s). */
  vReal: number;
  /** Rapidez propuesta (bloque fantasma); null = sin fantasma. */
  vFantasma: number | null;
  /** Rotular la rapidez real (al acertar, o en el examen). */
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const ZA = -3; // la zona va de ZA a ZB (posiciones del centro del bloque)
const ZB = 0.4;
const X_FIN = 3.9;
const LARGO_F = 0.75; // largo visual de la flecha de la fuerza
const DUR = 2.6; // s reales que tarda el bloque real en llegar al final
const lado = (m: number) => Math.min(0.74, 0.38 + 0.012 * m);
const fmt = (n: number) => String(n).replace(".", ",");

/** Recorrido (m desde la entrada de la zona) al tiempo t: acelera en la zona y luego sigue con la rapidez de salida. */
function recorrido(t: number, v0: number, v: number, d: number): number {
  if (v0 + v <= 0) return 0;
  const tz = (2 * d) / (v0 + v);
  if (t <= tz) {
    const a = (v * v - v0 * v0) / (2 * d);
    return v0 * t + 0.5 * a * t * t;
  }
  return d + v * (t - tz);
}

export function EscenaEmpujon({ m, F, theta, d, mu, v0, vReal, vFantasma, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const L = lado(m);
  const k = (ZB - ZA) / d; // unidades 3D por metro
  const sFin = d + (X_FIN - ZB) / k;
  const tFin = (2 * d) / (v0 + vReal) + (sFin - d) / vReal;
  const rad = (theta * Math.PI) / 180;

  const real = useRef<THREE.Group>(null!);
  const fantasma = useRef<THREE.Group>(null);
  const flecha = useRef<THREE.Group>(null!);
  const sim = useRef({ id: -1, t: 0, fin: false });

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      tubo: new THREE.CylinderGeometry(0.035, 0.035, 1, 10).translate(0, 0.5, 0),
      punta: new THREE.ConeGeometry(0.09, 0.18, 16).translate(0, 0.09, 0),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      piso: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.9 }),
      zona: new THREE.MeshStandardMaterial({ color: mu > 0 ? "#6b5a45" : "#3d4a5c", roughness: 1 }),
      marca: new THREE.MeshStandardMaterial({ color: "#5d6673" }),
      bloque: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.55, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.34, depthWrite: false, emissive: "#86b2ff", emissiveIntensity: 0.3 }),
      fuerza: new THREE.MeshStandardMaterial({ color: "#ff9ecd", emissive: "#ff9ecd", emissiveIntensity: 0.3 }),
    }),
    [mu],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((mt) => mt.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    mats.bloque.emissiveIntensity = exito ? 0.35 : 0;
    if (exito) emitirPolvo({ pos: [X_FIN, L / 2, 0.4], color: "#6fd6a8", n: 130, radio: 0.4, fuerza: 1.1 });
  }, [exito, mats, L]);

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
    // el tiempo físico se comprime: el bloque real llega al final en DUR segundos reales
    if (corrida && !S.fin) S.t = Math.min(tFin, S.t + (dt * tFin) / DUR);
    const x = (v: number) => ZA + Math.min(sFin, recorrido(S.t, v0, v, d)) * k;
    const xr = x(vReal);
    real.current.position.x = xr;
    if (fantasma.current && vFantasma !== null) fantasma.current.position.x = x(vFantasma);
    // la fuerza solo actúa dentro de la zona
    flecha.current.visible = F > 0 && xr < ZB - 1e-6;
    if (corrida && !S.fin && S.t >= tFin - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  const zonaMedio = (ZA + ZB) / 2;
  return (
    <group>
      {/* piso liso y la zona donde actúa la fuerza (con rozamiento, más rugosa) */}
      <mesh geometry={geo.caja} material={mats.piso} position={[0.1, -0.06, 0]} scale={[8.8, 0.12, 1]} />
      <mesh geometry={geo.caja} material={mats.zona} position={[zonaMedio, 0.002, 0]} scale={[ZB - ZA, 0.008, 0.98]} />
      <mesh geometry={geo.caja} material={mats.marca} position={[ZA, -0.06, 0.52]} scale={[0.02, 0.2, 0.02]} />
      <mesh geometry={geo.caja} material={mats.marca} position={[ZB, -0.06, 0.52]} scale={[0.02, 0.2, 0.02]} />
      {etiquetas && (
        <Etiqueta position={[zonaMedio, -0.12, 0.5]} className="etq-dato etq-abajo">
          d = {fmt(d)} m{mu > 0 ? ` · μ = ${fmt(mu)}` : ""}
        </Etiqueta>
      )}

      <group ref={real} position={[ZA, 0, 0]}>
        <mesh geometry={geo.caja} material={mats.bloque} position={[0, L / 2, 0]} scale={[L, L, 0.5]} />
        <group ref={flecha} position={[0, L / 2, 0.32]} rotation={[0, 0, rad - Math.PI / 2]}>
          <mesh geometry={geo.tubo} material={mats.fuerza} scale={[1, LARGO_F - 0.18, 1]} />
          <mesh geometry={geo.punta} material={mats.fuerza} position={[0, LARGO_F - 0.18, 0]} />
        </group>
        {/* los rótulos que viajan con el bloque se ocultan mientras corre: taparían al fantasma */}
        {etiquetas && !corrida && (
          <>
            {/* masa a la izquierda: arriba choca con la fuerza inclinada */}
            <Etiqueta position={[-L / 2, L / 2, 0.3]} className="etq-dato etq-izq">
              {m} kg
            </Etiqueta>
            {F > 0 && (
              <Etiqueta position={[LARGO_F * Math.cos(rad), L / 2 + LARGO_F * Math.sin(rad), 0.32]} className="etq-dato etq-acento">
                F = {F} N{theta > 0 ? ` · ${theta}°` : ""}
              </Etiqueta>
            )}
            {v0 > 0 && (
              <Etiqueta position={[0, L + 0.06, 0.3]} className="etq-dato etq-centro">
                v₀ = {v0} m/s
              </Etiqueta>
            )}
          </>
        )}
      </group>
      {vFantasma !== null && (
        <group ref={fantasma} position={[ZA, 0, 0.42]}>
          <mesh geometry={geo.caja} material={mats.fantasma} position={[0, L / 2, 0]} scale={[L * 1.06, L * 1.06, 0.5]} />
        </group>
      )}
      {etiquetas && verValor && (
        // sobre la salida de la zona, donde alcanza esa rapidez (al final del piso aparecía antes de que llegara el bloque)
        <Etiqueta position={[ZB, Math.max(L, 0.5) + 0.6, 0.3]} className={`etq-dato etq-centro ${exito ? "etq-acento" : ""}`}>
          v = {vReal} m/s
        </Etiqueta>
      )}
      {previa && (
        <Etiqueta position={[0, -0.9, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
