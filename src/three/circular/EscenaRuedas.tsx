// ══ Escena de ruedas (Nivel 6): ruedas con marca, fajas que avanzan, engranajes que encajan, meta fantasma y estela del giro en espiral ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

/** Un cuarto de π: las ω de la escena se dan en cuartos de π rad/s. */
const CUARTO = Math.PI / 4;

export interface Rueda {
  /** Centro y radio (unidades 3D). */
  x: number;
  y: number;
  r: number;
  /** ω de la corrida en cuartos de π rad/s (positivo = antihorario). */
  k: number;
  /** Ángulo que debe girar la marca (rad): se dibuja la meta fantasma. */
  objetivo?: number | null;
  /** Número de dientes (engranaje); sin dientes = polea lisa. */
  dientes?: number;
  /** Giro de los dientes (rad), para que dos engranajes encajen sin mover la marca. */
  fase?: number;
  /** Adelanto en z (rueda pegada al mismo eje que otra, dibujada encima). */
  z?: number;
  /** Rótulo bajo la rueda (o encima, si `rotuloArriba`). */
  rotulo?: ReactNode;
  rotuloArriba?: boolean;
  /** Distancia del rótulo al centro (por defecto, el radio): sirve para salir de una rueda más grande del mismo eje. */
  rotuloDist?: number;
  /** Borde verde o rojo al terminar la corrida. */
  estado?: "ok" | "mal" | null;
}

interface Props {
  ruedas: Rueda[];
  /** Fajas abiertas entre pares de ruedas [motriz, conducida]: avanzan a la rapidez del borde de la motriz. */
  fajas?: [number, number][];
  /** Estela en espiral y etiqueta de θ de la primera rueda (etapa 6.1). */
  medirGiro?: boolean;
  /** Simulación en curso: `id` cambia en cada corrida y dura `tFin` segundos físicos. */
  corrida?: { id: number; tFin: number } | null;
  onFin?: (p: { angulos: number[]; t: number }) => void;
  /** Giro correcto de la primera rueda (rad): espiral punteada y tenue (ronda guiada). */
  guia?: number | null;
  exito?: boolean;
  /** Vista previa del carrusel: sin etiquetas; si el texto no está vacío, va como rótulo debajo. */
  previa?: string;
}

const N_ESTELA = 180;
const N_GUIA = 180;
const PASO_ESTELA = Math.PI / 8; // un punto cada 22,5°
const N_RAYOS = 6;
const CADA_ETQ = 0.08; // s entre actualizaciones de las etiquetas (~12 por segundo)
const ALTO_DIENTE = 0.13;
const PASO_FAJA = 0.13; // separación entre los segmentos de la faja
const MAX_FAJA = 320;

/** Radio de la espiral de la estela: se abre un poco en cada vuelta para poder contarlas. */
const radioEspiral = (r: number, th: number) => r + 0.26 + (0.11 * th) / (2 * Math.PI);

/** Número con dos decimales y ancho estable: 0,00 · 1,25 · 10,00. */
const fmt2 = (n: number) => (Math.abs(n) < 0.005 ? 0 : n).toFixed(2).replace(".", ",");
const fmt1 = (n: number) => (Math.abs(n) < 0.05 ? 0 : n).toFixed(1).replace(".", ",");
const escribir = (el: HTMLElement | null, txt: string) => {
  if (el && el.textContent !== txt) el.textContent = txt;
};

// ══ Faja abierta entre dos poleas ───────
interface Circulo {
  x: number;
  y: number;
  r: number;
}

/**
 * Camino cerrado de una faja abierta (tangentes exteriores), recorrido en sentido antihorario de las dos poleas.
 * Devuelve su largo y un punto con el ángulo de la tangente para cualquier distancia s del recorrido.
 */
export function caminoFaja(a: Circulo, b: Circulo) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  const t0 = Math.atan2(dy, dx);
  const phi = Math.acos(Math.max(-1, Math.min(1, (a.r - b.r) / d)));
  const recta = Math.sqrt(Math.max(0, d * d - (a.r - b.r) ** 2));
  const L1 = a.r * (2 * Math.PI - 2 * phi); // arco de atrás en la motriz
  const L3 = b.r * 2 * phi; // arco de adelante en la conducida
  const L = L1 + recta + L3 + recta;
  const en = (c: Circulo, ang: number) => ({ x: c.x + c.r * Math.cos(ang), y: c.y + c.r * Math.sin(ang) });
  const punto = (s0: number) => {
    const s = ((s0 % L) + L) % L;
    if (s < L1) {
      const ang = t0 + phi + s / a.r;
      return { ...en(a, ang), ang: ang + Math.PI / 2 };
    }
    if (s < L1 + recta) {
      const p = en(a, t0 - phi);
      const q = en(b, t0 - phi);
      const u = (s - L1) / recta;
      return { x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u, ang: Math.atan2(q.y - p.y, q.x - p.x) };
    }
    if (s < L1 + recta + L3) {
      const ang = t0 - phi + (s - L1 - recta) / b.r;
      return { ...en(b, ang), ang: ang + Math.PI / 2 };
    }
    const p = en(b, t0 + phi);
    const q = en(a, t0 + phi);
    const u = (s - L1 - recta - L3) / recta;
    return { x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u, ang: Math.atan2(q.y - p.y, q.x - p.x) };
  };
  return { L, punto };
}

function Faja({ a, b, tiempo, geo, mat }: { a: Rueda; b: Rueda; tiempo: RefObject<number>; geo: THREE.BufferGeometry; mat: THREE.Material }) {
  const malla = useRef<THREE.InstancedMesh>(null!);
  const ayuda = useMemo(() => new THREE.Object3D(), []);
  const camino = useMemo(() => caminoFaja({ x: a.x, y: a.y, r: a.r + 0.05 }, { x: b.x, y: b.y, r: b.r + 0.05 }), [a.x, a.y, a.r, b.x, b.y, b.r]);
  const n = Math.min(MAX_FAJA, Math.floor(camino.L / PASO_FAJA));
  // la faja avanza con el borde de la motriz: v = ω · r
  const v = a.k * CUARTO * (a.r + 0.05);
  const z = Math.max(a.z ?? 0, b.z ?? 0) + 0.04;
  useFrame(() => {
    const m = malla.current;
    if (!m) return;
    const desfase = v * (tiempo.current ?? 0);
    for (let i = 0; i < n; i++) {
      const p = camino.punto((i * camino.L) / n + desfase);
      ayuda.position.set(p.x, p.y, z);
      ayuda.rotation.set(0, 0, p.ang);
      ayuda.updateMatrix();
      m.setMatrixAt(i, ayuda.matrix);
    }
    m.count = n;
    m.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={malla} args={[geo, mat, MAX_FAJA]} frustumCulled={false} />;
}

export function EscenaRuedas({ ruedas, fajas = [], medirGiro = false, corrida = null, onFin, guia = null, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const principal = ruedas[0];
  const giros = useRef<(THREE.Group | null)[]>([]);
  const estela = useRef<THREE.InstancedMesh>(null!);
  const puntosGuia = useRef<THREE.InstancedMesh>(null!);
  const etqT = useRef<HTMLSpanElement | null>(null);
  const etqTh = useRef<HTMLSpanElement | null>(null);
  const sim = useRef({ id: -1, t: 0, fin: false, etq: -1 });
  const tiempo = useRef(0);
  const ayuda = useMemo(() => new THREE.Object3D(), []);

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      disco: new THREE.CylinderGeometry(1, 1, 0.14, 72).rotateX(Math.PI / 2),
      aro: new THREE.TorusGeometry(1, 0.028, 10, 96),
      cubo: new THREE.CylinderGeometry(0.17, 0.17, 0.26, 24).rotateX(Math.PI / 2),
      marca: new THREE.SphereGeometry(0.15, 24, 16),
      punto: new THREE.SphereGeometry(0.045, 10, 8),
      segmento: new THREE.BoxGeometry(PASO_FAJA * 0.82, 0.07, 0.1),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      disco: new THREE.MeshStandardMaterial({ color: "#252b33", roughness: 0.8, metalness: 0.1 }),
      aro: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.45, emissive: "#d9c3a0", emissiveIntensity: 0.12 }),
      aroOk: new THREE.MeshStandardMaterial({ color: "#6fd6a8", roughness: 0.45, emissive: "#6fd6a8", emissiveIntensity: 0.45 }),
      aroMal: new THREE.MeshStandardMaterial({ color: "#ff7a6b", roughness: 0.45, emissive: "#ff7a6b", emissiveIntensity: 0.45 }),
      rayo: new THREE.MeshStandardMaterial({ color: "#4a525e", roughness: 0.6 }),
      radio: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.35 }),
      marca: new THREE.MeshStandardMaterial({ color: "#f4efe6", roughness: 0.35, emissive: "#f0b44c", emissiveIntensity: 0.25 }),
      meta: new THREE.MeshStandardMaterial({ color: "#6fd6a8", transparent: true, opacity: 0.35, depthWrite: false, emissive: "#6fd6a8", emissiveIntensity: 0.3 }),
      inicio: new THREE.MeshStandardMaterial({ color: "#8a929d", roughness: 0.5 }),
      faja: new THREE.MeshStandardMaterial({ color: "#3a414c", roughness: 0.7, emissive: "#86b2ff", emissiveIntensity: 0.08 }),
      estela: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.6, transparent: true, opacity: 0.95, depthWrite: false }),
      guia: new THREE.MeshBasicMaterial({ color: "#d9c3a0", transparent: true, opacity: 0.28, depthWrite: false }),
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

  // brillo y polvo al acertar, en la meta (dependencias numéricas: `ruedas` es un arreglo nuevo en cada render)
  const metaX = principal?.objetivo != null ? principal.x + principal.r * Math.cos(principal.objetivo) : null;
  const metaY = principal?.objetivo != null ? principal.y + principal.r * Math.sin(principal.objetivo) : null;
  useEffect(() => {
    mats.marca.emissiveIntensity = exito ? 0.7 : 0.25;
    mats.meta.opacity = exito ? 0.7 : 0.35;
    if (exito && metaX !== null && metaY !== null) emitirPolvo({ pos: [metaX, metaY, 0.2], color: "#6fd6a8", n: 160, radio: 0.4, fuerza: 1.3 });
  }, [exito, mats, metaX, metaY]);

  // espiral guía (fija)
  useLayoutEffect(() => {
    const m = puntosGuia.current;
    if (!m) return;
    const n = medirGiro && guia && principal ? Math.min(N_GUIA, Math.floor(guia / PASO_ESTELA + 1e-9)) : 0;
    for (let i = 0; i < n; i++) {
      const th = (i + 1) * PASO_ESTELA;
      const rho = radioEspiral(principal.r, th);
      ayuda.position.set(principal.x + rho * Math.cos(th), principal.y + rho * Math.sin(th), -0.02);
      ayuda.rotation.set(0, 0, 0);
      ayuda.scale.setScalar(1);
      ayuda.updateMatrix();
      m.setMatrixAt(i, ayuda.matrix);
    }
    m.count = n;
    m.instanceMatrix.needsUpdate = true;
  });

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
    const tMax = corrida ? corrida.tFin : 0;
    // la corrida dura a lo sumo ~3 s reales aunque el tiempo físico sea mayor
    if (corrida && !S.fin) S.t = Math.min(tMax, S.t + dt * Math.max(1, tMax / 3));
    tiempo.current = S.t;

    ruedas.forEach((w, i) => {
      const g = giros.current[i];
      if (g) g.rotation.z = w.k * CUARTO * S.t;
    });

    // estela de la primera rueda: un punto cada 22,5° hasta el ángulo actual
    const m = estela.current;
    let n = 0;
    if (medirGiro && corrida && principal) {
      const th = principal.k * CUARTO * S.t;
      for (let i = 1; i < N_ESTELA && i * PASO_ESTELA <= th + 1e-6; i++) {
        const a = i * PASO_ESTELA;
        const rho = radioEspiral(principal.r, a);
        ayuda.position.set(principal.x + rho * Math.cos(a), principal.y + rho * Math.sin(a), 0.02);
        ayuda.rotation.set(0, 0, 0);
        ayuda.scale.setScalar(1.6); // más grande que la guía para que se distinga encima de ella
        ayuda.updateMatrix();
        m.setMatrixAt(n++, ayuda.matrix);
      }
    }
    m.count = n;
    m.instanceMatrix.needsUpdate = true;

    // etiquetas que cambian: ~12 veces por segundo y siempre el valor final exacto
    const reloj = state.clock.elapsedTime;
    if (!corrida || S.fin || S.t >= tMax - 1e-9 || reloj - S.etq >= CADA_ETQ) {
      S.etq = reloj;
      escribir(etqT.current, fmt1(S.t));
      escribir(etqTh.current, fmt2(principal ? (principal.k * CUARTO * S.t) / Math.PI : 0));
    }

    if (corrida && !S.fin && S.t >= tMax - 1e-9) {
      S.fin = true;
      onFin?.({ angulos: ruedas.map((w) => w.k * CUARTO * S.t), t: S.t });
    }
  });

  // alto de la escena: el cronómetro va sobre la rueda más alta
  const techo = ruedas.reduce((m, w) => Math.max(m, w.y + w.r), 0);
  const conEstela = medirGiro && principal;

  return (
    <group>
      {ruedas.map((w, i) => {
        const meta = w.objetivo ?? null;
        const z = w.z ?? 0;
        const aro = w.estado === "ok" ? mats.aroOk : w.estado === "mal" ? mats.aroMal : mats.aro;
        const nd = w.dientes ?? 0;
        return (
          <group key={i} position={[w.x, w.y, z]}>
            {/* referencia del ángulo 0 (la marca parte de aquí) */}
            {medirGiro && i === 0 && <mesh geometry={geo.caja} material={mats.inicio} position={[w.r + 0.17, 0, 0]} scale={[0.22, 0.03, 0.03]} />}

            {/* meta fantasma */}
            {meta !== null && (
              <group rotation={[0, 0, meta]}>
                <mesh geometry={geo.caja} material={mats.meta} position={[w.r / 2, 0, 0.09]} scale={[w.r, 0.06, 0.06]} />
                <mesh geometry={geo.marca} material={mats.meta} position={[w.r, 0, 0.12]} scale={1.15} />
              </group>
            )}
            {meta !== null && etiquetas && i === 0 && (
              <Etiqueta
                // arriba o abajo el rótulo se corre a la derecha para no tapar el cronómetro ni la etiqueta de θ
                position={Math.abs(Math.sin(meta)) > 0.7 ? [(w.r + 0.2) * Math.cos(meta) + 0.95, (w.r + 0.2) * Math.sin(meta), 0.1] : [(w.r + 0.62) * Math.cos(meta), (w.r + 0.62) * Math.sin(meta), 0.1]}
                className="etq-dato etq-acento etq-centro"
              >
                meta
              </Etiqueta>
            )}

            {/* la rueda que gira */}
            <group
              ref={(g) => {
                giros.current[i] = g;
              }}
            >
              <mesh geometry={geo.disco} material={mats.disco} scale={[w.r, w.r, 1]} />
              <mesh geometry={geo.aro} material={aro} scale={w.r} position={[0, 0, 0.07]} />
              <group rotation={[0, 0, w.fase ?? 0]}>
                {Array.from({ length: nd }, (_, j) => {
                  const a = (j * 2 * Math.PI) / nd;
                  const rr = w.r + ALTO_DIENTE / 2 - 0.01;
                  const ancho = Math.min(0.16, ((2 * Math.PI * w.r) / nd) * 0.5);
                  return <mesh key={`d${j}`} geometry={geo.caja} material={aro} position={[rr * Math.cos(a), rr * Math.sin(a), 0]} rotation={[0, 0, a]} scale={[ALTO_DIENTE, ancho, 0.12]} />;
                })}
              </group>
              {Array.from({ length: N_RAYOS }, (_, j) => {
                const a = (j * 2 * Math.PI) / N_RAYOS + Math.PI / N_RAYOS;
                return <mesh key={j} geometry={geo.caja} material={mats.rayo} position={[(w.r / 2) * Math.cos(a), (w.r / 2) * Math.sin(a), 0.08]} rotation={[0, 0, a]} scale={[w.r * 0.9, 0.05, 0.03]} />;
              })}
              <mesh geometry={geo.caja} material={mats.radio} position={[w.r / 2, 0, 0.1]} scale={[w.r, 0.06, 0.05]} />
              <mesh geometry={geo.marca} material={mats.marca} position={[w.r, 0, 0.13]} scale={Math.min(1, 0.45 + w.r * 0.35)} />
              <mesh geometry={geo.cubo} material={mats.aro} position={[0, 0, 0.06]} scale={Math.min(1, 0.5 + w.r * 0.3)} />
            </group>

            {etiquetas && w.rotulo && (
              <Etiqueta position={[0, (w.rotuloArriba ? 1 : -1) * ((w.rotuloDist ?? w.r) + 0.42), 0.2]} className="etq-dato etq-centro">
                {w.rotulo}
              </Etiqueta>
            )}
          </group>
        );
      })}

      {fajas.map(([ia, ib], i) => ruedas[ia] && ruedas[ib] && <Faja key={i} a={ruedas[ia]} b={ruedas[ib]} tiempo={tiempo} geo={geo.segmento} mat={mats.faja} />)}

      {/* estela y guía de la primera rueda */}
      <instancedMesh ref={puntosGuia} args={[geo.punto, mats.guia, N_GUIA]} frustumCulled={false} />
      <instancedMesh ref={estela} args={[geo.punto, mats.estela, N_ESTELA]} frustumCulled={false} />

      {etiquetas && principal && (
        <Etiqueta position={[conEstela ? principal.x : 0, (conEstela ? principal.y + principal.r : techo) + 1.05, 0]} className="etq-dato etq-medida etq-centro etq-crono">
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
      {etiquetas && conEstela && (
        <Etiqueta position={[principal.x, principal.y - principal.r - 0.95, 0]} className="etq-dato etq-centro">
          θ ={" "}
          <span
            className="etq-num"
            ref={(el) => {
              if (el) etqTh.current = el;
            }}
          >
            0,00
          </span>
          π rad
        </Etiqueta>
      )}
      {previa && principal && (
        <Etiqueta position={[0, ruedas.reduce((m, w) => Math.min(m, w.y - w.r), 0) - 0.75, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
