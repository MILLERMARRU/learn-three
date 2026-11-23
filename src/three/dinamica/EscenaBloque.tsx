// ══ Escena del bloque (Nivel 8): piso con regla, bloque empujado con F, rozamiento, bandera y corrida durante t segundos ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { aceleracionEnPiso, posicion, rozamiento, G } from "@/lib/dinamica";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Masa (kg), distancia a la bandera (m), tiempo de la corrida (s) y rozamiento cinético. */
  m: number;
  d: number;
  t: number;
  mu: number;
  /** Fuerza aplicada (N). */
  F: number;
  corrida?: { id: number } | null;
  onFin?: (p: { x: number }) => void;
  exito?: boolean;
  previa?: string;
}

const ANCHO = 7.6; // unidades 3D del campo
const BLOQUE: [number, number] = [0.7, 0.55];
const N_ESTELA = 40;
const CADA_ETQ = 0.08;

/** Separación "redonda" para las marcas de una regla. */
function pasoBonito(rango: number, divisiones = 6) {
  const crudo = rango / divisiones;
  for (const p of [1, 2, 5, 10, 20, 25, 50]) if (p >= crudo) return p;
  return 100;
}
const fmt1 = (n: number) => (Math.abs(n) < 0.05 ? 0 : n).toFixed(1).replace(".", ",");
const escribir = (el: HTMLElement | null, txt: string) => {
  if (el && el.textContent !== txt) el.textContent = txt;
};

export function EscenaBloque({ m, d, t, mu, F, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const W = Math.max(d * 1.3, d + 3); // largo del campo (m)
  const K = ANCHO / W;
  const X = (x: number) => -ANCHO / 2 + x * K;
  const a = aceleracionEnPiso(F, m, mu);
  const f = mu > 0 ? rozamiento(mu, m * G) : 0;
  const kF = 1.3 / Math.max(F, f, 10);
  const cada = pasoBonito(W);

  const bloque = useRef<THREE.Group>(null!);
  const estela = useRef<THREE.InstancedMesh>(null!);
  const etqT = useRef<HTMLSpanElement | null>(null);
  const etqX = useRef<HTMLSpanElement | null>(null);
  const sim = useRef({ id: -1, t: 0, fin: false, etq: -1 });
  const ayuda = useMemo(() => new THREE.Object3D(), []);

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      punto: new THREE.SphereGeometry(0.035, 8, 6),
      tubo: new THREE.CylinderGeometry(0.032, 0.032, 1, 10).translate(0, 0.5, 0),
      punta: new THREE.ConeGeometry(0.085, 0.18, 16).translate(0, 0.09, 0),
      mastil: new THREE.CylinderGeometry(0.018, 0.018, 0.9, 8),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      piso: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.9 }),
      regla: new THREE.MeshStandardMaterial({ color: "#d9c3a0", emissive: "#d9c3a0", emissiveIntensity: 0.15 }),
      bloque: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.55, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      fuerza: new THREE.MeshStandardMaterial({ color: "#ff9ecd", emissive: "#ff9ecd", emissiveIntensity: 0.3 }),
      roce: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.3 }),
      bandera: new THREE.MeshStandardMaterial({ color: "#6fd6a8", emissive: "#6fd6a8", emissiveIntensity: 0.25, side: THREE.DoubleSide }),
      mastil: new THREE.MeshStandardMaterial({ color: "#8a929d" }),
      estela: new THREE.MeshBasicMaterial({ color: "#f0b44c", transparent: true, opacity: 0.5, depthWrite: false }),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((mm) => mm.dispose());
    },
    [geo, mats],
  );
  const xBandera = X(d);
  useEffect(() => {
    mats.bloque.emissiveIntensity = exito ? 0.35 : 0;
    mats.bandera.emissiveIntensity = exito ? 0.7 : 0.25;
    if (exito) emitirPolvo({ pos: [xBandera, BLOQUE[1] - 0.6, 0.3], color: "#6fd6a8", n: 140, radio: 0.4, fuerza: 1.2 });
  }, [exito, mats, xBandera]);

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
    // la corrida dura a lo sumo ~3 s reales aunque el tiempo físico sea mayor
    if (corrida && !S.fin) S.t = Math.min(t, S.t + dt * Math.max(1, t / 3));
    const x = posicion(a, S.t);
    // si se pasa del campo, el bloque se queda en el borde (igual se mide su x)
    bloque.current.position.set(X(Math.min(x, W)) + BLOQUE[0] / 2, BLOQUE[1] / 2, 0);

    const mm = estela.current;
    let n = 0;
    if (corrida) {
      const paso = Math.max(t / N_ESTELA, 0.12);
      for (let k = 1; k < N_ESTELA && k * paso <= S.t + 1e-6; k++) {
        ayuda.position.set(X(Math.min(posicion(a, k * paso), W)) + BLOQUE[0] / 2, 0.04, 0.45);
        ayuda.updateMatrix();
        mm.setMatrixAt(n++, ayuda.matrix);
      }
    }
    mm.count = n;
    mm.instanceMatrix.needsUpdate = true;

    const reloj = state.clock.elapsedTime;
    if (!corrida || S.fin || S.t >= t - 1e-9 || reloj - S.etq >= CADA_ETQ) {
      S.etq = reloj;
      escribir(etqT.current, fmt1(S.t));
      escribir(etqX.current, fmt1(x));
    }
    if (corrida && !S.fin && S.t >= t - 1e-9) {
      S.fin = true;
      onFin?.({ x });
    }
  });

  const ticks = Array.from({ length: Math.floor(W / cada) + 1 }, (_, i) => i * cada);
  const flecha = (mat: THREE.Material, largo: number, haciaIzq: boolean) => (
    <group rotation={[0, 0, haciaIzq ? Math.PI / 2 : -Math.PI / 2]}>
      <mesh geometry={geo.tubo} material={mat} scale={[1, Math.max(0.01, largo - 0.18), 1]} />
      <mesh geometry={geo.punta} material={mat} position={[0, Math.max(0.01, largo - 0.18), 0]} />
    </group>
  );

  return (
    <group position={[0, -0.6, 0]}>
      {/* piso con regla */}
      <mesh geometry={geo.caja} material={mats.piso} position={[0, -0.08, 0]} scale={[ANCHO + 0.9, 0.16, 1.2]} />
      {ticks.map((x) => (
        <group key={x} position={[X(x), 0.005, 0.55]}>
          <mesh geometry={geo.caja} material={mats.regla} scale={[0.025, 0.012, 0.14]} />
          {etiquetas && (
            <Etiqueta position={[0, -0.02, 0.3]} className="etq-eje">
              {x === 0 ? "0 m" : x}
            </Etiqueta>
          )}
        </group>
      ))}

      {/* bandera en d */}
      <group position={[X(d) + BLOQUE[0] / 2, 0, 0]}>
        <mesh geometry={geo.mastil} material={mats.mastil} position={[0, 0.45, 0]} />
        <mesh geometry={geo.caja} material={mats.bandera} position={[0.17, 0.78, 0]} scale={[0.32, 0.2, 0.01]} />
        {etiquetas && (
          <Etiqueta position={[0, 1.15, 0]} className="etq-dato etq-acento etq-centro">
            {d} m
          </Etiqueta>
        )}
      </group>

      <instancedMesh ref={estela} args={[geo.punto, mats.estela, N_ESTELA]} frustumCulled={false} />

      {/* bloque con sus fuerzas horizontales */}
      <group ref={bloque} position={[X(0) + BLOQUE[0] / 2, BLOQUE[1] / 2, 0]}>
        <mesh geometry={geo.caja} material={mats.bloque} scale={[BLOQUE[0], BLOQUE[1], 0.55]} />
        <group position={[BLOQUE[0] / 2, 0.05, 0.32]}>{flecha(mats.fuerza, Math.max(0.2, F * kF), false)}</group>
        {f > 0 && <group position={[-BLOQUE[0] / 2, -0.12, 0.32]}>{flecha(mats.roce, Math.max(0.2, f * kF), true)}</group>}
        {etiquetas && (
          <>
            <Etiqueta position={[0, 0, 0.4]} className="etq-dato etq-centro">
              {m} kg
            </Etiqueta>
            <Etiqueta position={[BLOQUE[0] / 2 + F * kF + 0.45, 0.05, 0.4]} className="etq-dato etq-acento etq-centro">
              F = {F} N
            </Etiqueta>
            {f > 0 && (
              <Etiqueta position={[-BLOQUE[0] / 2 - f * kF - 0.4, -0.12, 0.4]} className="etq-dato etq-centro">
                f = {Math.round(f * 10) / 10} N
              </Etiqueta>
            )}
            <Etiqueta position={[0, BLOQUE[1] / 2 + 0.4, 0]} className="etq-dato etq-centro">
              x ={" "}
              <span
                className="etq-num"
                ref={(el) => {
                  if (el) etqX.current = el;
                }}
              >
                0,0
              </span>{" "}
              m
            </Etiqueta>
          </>
        )}
      </group>

      {etiquetas && (
        <Etiqueta position={[0, 2.0, 0]} className="etq-dato etq-medida etq-centro etq-crono">
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
        <Etiqueta position={[0, -0.75, 0.4]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
