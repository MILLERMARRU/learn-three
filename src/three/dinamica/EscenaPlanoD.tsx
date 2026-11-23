// ══ Escena del plano inclinado (Nivel 8): el bloque real baja con g(sen θ − μ cos θ) y un fantasma con la aceleración propuesta ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { aceleracionPlano, posicion } from "@/lib/dinamica";
import { senCos } from "@/lib/estatica";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  theta: number;
  mu: number;
  /** Largo del plano que recorre el bloque (m). */
  largo: number;
  /** Aceleración propuesta por el alumno (m/s²): la del fantasma. */
  aFantasma: number;
  /** Mostrar el fantasma (en la vista previa y en el hero, no). */
  conFantasma?: boolean;
  corrida?: { id: number } | null;
  onFin?: (p: { sReal: number; sFantasma: number }) => void;
  exito?: boolean;
  previa?: string;
}

const LV = 5.6; // largo visible del plano (unidades 3D)
const BLOQUE: [number, number] = [0.6, 0.45];
const CADA_ETQ = 0.08;

const fmt1 = (n: number) => (Math.abs(n) < 0.05 ? 0 : n).toFixed(1).replace(".", ",");
const escribir = (el: HTMLElement | null, txt: string) => {
  if (el && el.textContent !== txt) el.textContent = txt;
};

export function EscenaPlanoD({ theta, mu, largo, aFantasma, conFantasma = true, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const aReal = aceleracionPlano(theta, mu);
  const tFin = aReal > 0 ? Math.sqrt((2 * largo) / aReal) : 2.5;
  const [s, c] = senCos(theta);
  // el plano baja hacia la derecha: u = hacia abajo por el plano, n = normal hacia afuera
  const u: [number, number] = [c, -s];
  const n: [number, number] = [s, c];
  const xa = (-LV * c) / 2;
  const yb = (-LV * s) / 2 - 0.2;
  const cima: [number, number] = [xa, yb + LV * s];
  const util = LV - 1.0; // tramo del plano donde se mueve el bloque
  /** Centro del bloque a s metros de la salida. */
  const enPlano = (sm: number): [number, number] => {
    const q = 0.45 + (Math.min(sm, largo) / largo) * util;
    return [cima[0] + u[0] * q + n[0] * (BLOQUE[1] / 2), cima[1] + u[1] * q + n[1] * (BLOQUE[1] / 2)];
  };

  const real = useRef<THREE.Group>(null!);
  const fantasma = useRef<THREE.Group>(null!);
  const etqT = useRef<HTMLSpanElement | null>(null);
  const sim = useRef({ id: -1, t: 0, fin: false, etq: -1 });

  const cuna = useMemo(() => {
    const forma = new THREE.Shape();
    forma.moveTo(xa, yb);
    forma.lineTo(xa + LV * c, yb);
    forma.lineTo(xa, yb + LV * s);
    forma.closePath();
    return new THREE.ExtrudeGeometry(forma, { depth: 1.3, bevelEnabled: false }).translate(0, 0, -0.65);
  }, [xa, yb, s, c]);
  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      tubo: new THREE.CylinderGeometry(0.028, 0.028, 1, 10).translate(0, 0.5, 0),
      punta: new THREE.ConeGeometry(0.075, 0.16, 16).translate(0, 0.08, 0),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      cuna: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.9 }),
      marca: new THREE.MeshStandardMaterial({ color: "#d9c3a0", emissive: "#d9c3a0", emissiveIntensity: 0.15 }),
      real: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.55, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.35, depthWrite: false, emissive: "#86b2ff", emissiveIntensity: 0.3 }),
      w: new THREE.MeshStandardMaterial({ color: "#ff8a5c", emissive: "#ff8a5c", emissiveIntensity: 0.3 }),
      nn: new THREE.MeshStandardMaterial({ color: "#6fd6a8", emissive: "#6fd6a8", emissiveIntensity: 0.3 }),
      f: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.3 }),
    }),
    [],
  );
  useEffect(() => () => cuna.dispose(), [cuna]);
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );
  const finX = enPlano(largo)[0];
  const finY = enPlano(largo)[1];
  useEffect(() => {
    mats.real.emissiveIntensity = exito ? 0.35 : 0;
    if (exito) emitirPolvo({ pos: [finX, finY, 0.4], color: "#6fd6a8", n: 140, radio: 0.4, fuerza: 1.2 });
  }, [exito, mats, finX, finY]);

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
    if (corrida && !S.fin) S.t = Math.min(tFin, S.t + dt * Math.max(1, tFin / 3));
    const sr = Math.min(largo, posicion(aReal, S.t));
    const sf = Math.min(largo, posicion(aFantasma, S.t));
    const pr = enPlano(sr);
    const pf = enPlano(sf);
    real.current.position.set(pr[0], pr[1], 0);
    fantasma.current?.position.set(pf[0], pf[1], 0.55);
    const reloj = state.clock.elapsedTime;
    if (!corrida || S.fin || reloj - S.etq >= CADA_ETQ) {
      S.etq = reloj;
      escribir(etqT.current, fmt1(S.t));
    }
    if (corrida && !S.fin && S.t >= tFin - 1e-9) {
      S.fin = true;
      onFin?.({ sReal: sr, sFantasma: sf });
    }
  });

  const ang = (theta * Math.PI) / 180;
  const flecha = (mat: THREE.Material, largoF: number, dirAng: number) => (
    <group rotation={[0, 0, dirAng - Math.PI / 2]} position={[0, 0, 0.38]}>
      <mesh geometry={geo.tubo} material={mat} scale={[1, Math.max(0.01, largoF - 0.16), 1]} />
      <mesh geometry={geo.punta} material={mat} position={[0, Math.max(0.01, largoF - 0.16), 0]} />
    </group>
  );
  const marcas = Array.from({ length: Math.floor(largo / 2) + 1 }, (_, i) => i * 2);
  const p0 = enPlano(0);

  return (
    <group>
      <mesh geometry={cuna} material={mats.cuna} />
      {marcas.map((m) => {
        const p = enPlano(m);
        return (
          <group key={m} position={[p[0] - n[0] * (BLOQUE[1] / 2), p[1] - n[1] * (BLOQUE[1] / 2), 0.66]} rotation={[0, 0, -ang]}>
            <mesh geometry={geo.caja} material={mats.marca} scale={[0.025, 0.14, 0.01]} />
            {etiquetas && (
              <Etiqueta position={[-n[0] * 0.05, -0.28, 0]} className="etq-eje">
                {m === 0 ? "0 m" : m}
              </Etiqueta>
            )}
          </group>
        );
      })}

      {/* el bloque real con su diagrama de fuerzas */}
      <group ref={real} position={[p0[0], p0[1], 0]}>
        <mesh geometry={geo.caja} material={mats.real} rotation={[0, 0, -ang]} scale={[BLOQUE[0], BLOQUE[1], 0.5]} />
        {flecha(mats.w, 0.9, -Math.PI / 2)}
        {flecha(mats.nn, 0.9 * c, Math.PI / 2 - ang)}
        {mu > 0 && flecha(mats.f, Math.max(0.15, 0.9 * mu * c), Math.PI - ang)}
      </group>

      {conFantasma && (
        <group ref={fantasma} position={[p0[0], p0[1], 0.55]}>
          <mesh geometry={geo.caja} material={mats.fantasma} rotation={[0, 0, -ang]} scale={[BLOQUE[0] * 1.06, BLOQUE[1] * 1.06, 0.5]} />
          {etiquetas && (
            <Etiqueta position={[n[0] * 0.55, n[1] * 0.55, 0.2]} className="etq-dato etq-centro">
              fantasma · {aFantasma} m/s²
            </Etiqueta>
          )}
        </group>
      )}

      {etiquetas && (
        // arriba a la derecha, sobre el pie del plano: la zona libre (el fantasma y su rótulo salen de la cima, a la izquierda)
        <Etiqueta position={[xa + LV * c - 0.4, cima[1] + 0.1, 0]} className="etq-dato etq-medida etq-centro etq-crono">
          t ={" "}
          <span
            className="etq-num etq-num-t"
            ref={(el) => {
              if (el) etqT.current = el;
            }}
          >
            0,0
          </span>{" "}
          s
        </Etiqueta>
      )}
      {previa && (
        <Etiqueta position={[0, yb - 0.45, 0.4]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
