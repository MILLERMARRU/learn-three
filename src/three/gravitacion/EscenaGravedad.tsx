// ══ Escena de la gravedad (Nivel 9): el planeta con el punto a la altura h y un tubo de caída con la bola real y la fantasma ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Masa y radio del planeta relativos a la Tierra, y altura en radios del planeta. */
  kM: number;
  kR: number;
  hR: number;
  /** Gravedad real allí (m/s²). */
  gReal: number;
  /** Gravedad propuesta (bola fantasma); null = sin fantasma. */
  gFantasma: number | null;
  /** Rotular el valor real (al acertar, o en el examen). */
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const PX = -2; // centro del planeta
const PY = -0.5;
const R_BASE = 0.85; // radio visual de la Tierra
const ALTO_MAX = 2.5; // del centro del planeta al punto más alto
const TUBO_X = 1.6;
const ARRIBA = 1.55; // donde se sueltan las bolas
const ABAJO = -1.35; // fondo del tubo
const CAIDA = ARRIBA - ABAJO;
const BOLA = 0.14;
const DUR = 1.6; // s reales que tarda la bola más rápida

/** «2M₀ · 2R₀»: el planeta comparado con la Tierra. */
const fmtK = (k: number) => String(k).replace(".", ",");
/** «h = R», «h = R/4», «h = 4R». */
export function textoAltura(hR: number): string {
  if (hR === 1) return "h = R";
  if (Number.isInteger(hR)) return `h = ${hR}R`;
  if (Number.isInteger(1 / hR)) return `h = R/${1 / hR}`;
  return `h = ${String(hR).replace(".", ",")}R`;
}

export function EscenaGravedad({ kM, kR, hR, gReal, gFantasma, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const tierra = kM === 1 && kR === 1;
  // todo se achica si el punto queda muy alto: el planeta y la Tierra de referencia con la misma escala
  const f = Math.min(1, ALTO_MAX / (R_BASE * kR * (1 + hR)));
  const Rv = R_BASE * kR * f;
  const yPunto = PY + Rv * (1 + hR);
  const gMax = Math.max(gReal, gFantasma ?? 0);
  const tFin = Math.sqrt((2 * CAIDA) / gMax);

  const real = useRef<THREE.Mesh>(null!);
  const fantasma = useRef<THREE.Mesh>(null);
  const sim = useRef({ id: -1, t: 0, fin: false });

  const geo = useMemo(
    () => ({
      esfera: new THREE.SphereGeometry(1, 48, 32),
      aro: new THREE.TorusGeometry(1, 0.012, 8, 96),
      tubo: new THREE.CylinderGeometry(0.2, 0.2, CAIDA + 0.45, 24, 1, true),
      base: new THREE.BoxGeometry(1.3, 0.08, 0.5),
      sonda: new THREE.BoxGeometry(0.16, 0.16, 0.16),
      regla: new THREE.BoxGeometry(0.018, 1, 0.018),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      planeta: new THREE.MeshStandardMaterial({ color: tierra ? "#4f79a8" : "#c08a5e", roughness: 0.8, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      ecuador: new THREE.MeshStandardMaterial({ color: "#d9c3a0", transparent: true, opacity: 0.35 }),
      tierra: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.45 }),
      vidrio: new THREE.MeshStandardMaterial({ color: "#c8d6e8", transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false }),
      base: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.9 }),
      bola: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.4, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.4, depthWrite: false, emissive: "#86b2ff", emissiveIntensity: 0.3 }),
      sonda: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.3 }),
      regla: new THREE.MeshStandardMaterial({ color: "#5d6673" }),
    }),
    [tierra],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    mats.bola.emissiveIntensity = exito ? 0.4 : 0;
    mats.planeta.emissiveIntensity = exito ? 0.12 : 0;
    if (exito) emitirPolvo({ pos: [TUBO_X, ABAJO + 0.2, 0.4], color: "#6fd6a8", n: 120, radio: 0.4, fuerza: 1.1 });
  }, [exito, mats]);

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
    // el tiempo físico se comprime: la bola más rápida tarda DUR segundos reales en llegar al fondo
    if (corrida && !S.fin) S.t = Math.min(tFin, S.t + (dt * tFin) / DUR);
    const y = (g: number) => Math.max(ABAJO + BOLA, ARRIBA - 0.5 * g * S.t * S.t);
    real.current.position.y = y(gReal);
    if (fantasma.current && gFantasma !== null) fantasma.current.position.y = y(gFantasma);
    if (corrida && !S.fin && S.t >= tFin - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  return (
    <group>
      {/* planeta, su ecuador y, si no es la Tierra, el contorno de la Tierra con la misma escala para comparar */}
      <mesh geometry={geo.esfera} material={mats.planeta} position={[PX, PY, 0]} scale={Rv} />
      <mesh geometry={geo.aro} material={mats.ecuador} position={[PX, PY, 0]} rotation={[Math.PI / 2.2, 0, 0]} scale={Rv * 1.002} />
      {!tierra && <mesh geometry={geo.aro} material={mats.tierra} position={[PX, PY, Rv + 0.02]} scale={R_BASE * f} />}
      {hR > 0 && (
        <>
          <mesh geometry={geo.regla} material={mats.regla} position={[PX, PY + Rv * (1 + hR / 2), 0]} scale={[1, Rv * hR - 0.1, 1]} />
          <mesh geometry={geo.sonda} material={mats.sonda} position={[PX, yPunto, 0]} />
        </>
      )}
      {etiquetas && (
        <>
          {/* bajo el planeta y bajo el contorno de la Tierra, el que sea más grande */}
          <Etiqueta position={[PX, PY - Math.max(Rv, tierra ? 0 : R_BASE * f), 0.2]} className="etq-dato etq-abajo">
            {tierra ? "Tierra" : `${fmtK(kM)}M₀ · ${fmtK(kR)}R₀`}
          </Etiqueta>
          {hR > 0 && (
            <Etiqueta position={[PX - 0.04, PY + Rv + Math.max(Rv * hR / 2, 0.28), 0.2]} className="etq-medida etq-izq">
              {textoAltura(hR)}
            </Etiqueta>
          )}
        </>
      )}

      {/* tubo de caída: la bola real (crema) y la fantasma (azul) se sueltan juntas */}
      <mesh geometry={geo.tubo} material={mats.vidrio} position={[TUBO_X, (ARRIBA + ABAJO) / 2 + 0.05, 0]} />
      <mesh geometry={geo.base} material={mats.base} position={[TUBO_X + 0.15, ABAJO - 0.04, 0]} />
      <mesh ref={real} geometry={geo.esfera} material={mats.bola} position={[TUBO_X, ARRIBA, 0]} scale={BOLA} />
      {gFantasma !== null && <mesh ref={fantasma} geometry={geo.esfera} material={mats.fantasma} position={[TUBO_X + 0.42, ARRIBA, 0]} scale={BOLA} />}
      {gFantasma !== null && <mesh geometry={geo.tubo} material={mats.vidrio} position={[TUBO_X + 0.42, (ARRIBA + ABAJO) / 2 + 0.05, 0]} scale={[0.85, 1, 0.85]} />}
      {etiquetas && (
        <>
          <Etiqueta position={[TUBO_X + 0.2, ARRIBA + 0.6, 0.2]} className="etq-eje etq-centro">
            {hR > 0 ? "caída a la altura h" : "caída en la superficie"}
          </Etiqueta>
          {verValor && (
            <Etiqueta position={[TUBO_X + 0.2, ABAJO - 0.08, 0.2]} className={`etq-dato etq-abajo ${exito ? "etq-acento" : ""}`}>
              g = {String(gReal).replace(".", ",")} m/s²
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
