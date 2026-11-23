// ══ Escena de ruedas (Nivel 6): rueda con marca en el borde, meta fantasma, estela del giro en espiral y etiquetas en vivo ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
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
}

interface Props {
  ruedas: Rueda[];
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

/** Radio de la espiral de la estela: se abre un poco en cada vuelta para poder contarlas. */
const radioEspiral = (r: number, th: number) => r + 0.26 + (0.11 * th) / (2 * Math.PI);

/** Número con dos decimales y ancho estable: 0,00 · 1,25 · 10,00. */
const fmt2 = (n: number) => (Math.abs(n) < 0.005 ? 0 : n).toFixed(2).replace(".", ",");
const fmt1 = (n: number) => (Math.abs(n) < 0.05 ? 0 : n).toFixed(1).replace(".", ",");
const escribir = (el: HTMLElement | null, txt: string) => {
  if (el && el.textContent !== txt) el.textContent = txt;
};

export function EscenaRuedas({ ruedas, corrida = null, onFin, guia = null, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const principal = ruedas[0];
  const giros = useRef<(THREE.Group | null)[]>([]);
  const estela = useRef<THREE.InstancedMesh>(null!);
  const puntosGuia = useRef<THREE.InstancedMesh>(null!);
  const etqT = useRef<HTMLSpanElement | null>(null);
  const etqTh = useRef<HTMLSpanElement | null>(null);
  const sim = useRef({ id: -1, t: 0, fin: false, etq: -1 });
  const ayuda = useMemo(() => new THREE.Object3D(), []);

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      disco: new THREE.CylinderGeometry(1, 1, 0.14, 72).rotateX(Math.PI / 2),
      aro: new THREE.TorusGeometry(1, 0.028, 10, 96),
      cubo: new THREE.CylinderGeometry(0.17, 0.17, 0.26, 24).rotateX(Math.PI / 2),
      marca: new THREE.SphereGeometry(0.15, 24, 16),
      punto: new THREE.SphereGeometry(0.045, 10, 8),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      disco: new THREE.MeshStandardMaterial({ color: "#252b33", roughness: 0.8, metalness: 0.1 }),
      aro: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.45, emissive: "#d9c3a0", emissiveIntensity: 0.12 }),
      rayo: new THREE.MeshStandardMaterial({ color: "#4a525e", roughness: 0.6 }),
      radio: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.35 }),
      marca: new THREE.MeshStandardMaterial({ color: "#f4efe6", roughness: 0.35, emissive: "#f0b44c", emissiveIntensity: 0.25 }),
      meta: new THREE.MeshStandardMaterial({ color: "#6fd6a8", transparent: true, opacity: 0.35, depthWrite: false, emissive: "#6fd6a8", emissiveIntensity: 0.3 }),
      inicio: new THREE.MeshStandardMaterial({ color: "#8a929d", roughness: 0.5 }),
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
    const n = guia && principal ? Math.min(N_GUIA, Math.floor(guia / PASO_ESTELA + 1e-9)) : 0;
    for (let i = 0; i < n; i++) {
      const th = (i + 1) * PASO_ESTELA;
      const rho = radioEspiral(principal.r, th);
      ayuda.position.set(principal.x + rho * Math.cos(th), principal.y + rho * Math.sin(th), -0.02);
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

    ruedas.forEach((w, i) => {
      const g = giros.current[i];
      if (g) g.rotation.z = w.k * CUARTO * S.t;
    });

    // estela de la primera rueda: un punto cada 22,5° hasta el ángulo actual
    const m = estela.current;
    let n = 0;
    if (corrida && principal) {
      const th = principal.k * CUARTO * S.t;
      for (let i = 1; i < N_ESTELA && i * PASO_ESTELA <= th + 1e-6; i++) {
        const a = i * PASO_ESTELA;
        const rho = radioEspiral(principal.r, a);
        ayuda.position.set(principal.x + rho * Math.cos(a), principal.y + rho * Math.sin(a), 0.02);
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

  return (
    <group>
      {ruedas.map((w, i) => {
        const meta = w.objetivo ?? null;
        return (
          <group key={i} position={[w.x, w.y, 0]}>
            {/* referencia del ángulo 0 (la marca parte de aquí) */}
            <mesh geometry={geo.caja} material={mats.inicio} position={[w.r + 0.17, 0, 0]} scale={[0.22, 0.03, 0.03]} />

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
              <mesh geometry={geo.aro} material={mats.aro} scale={w.r} position={[0, 0, 0.07]} />
              {Array.from({ length: N_RAYOS }, (_, j) => {
                const a = (j * 2 * Math.PI) / N_RAYOS + Math.PI / N_RAYOS;
                return <mesh key={j} geometry={geo.caja} material={mats.rayo} position={[(w.r / 2) * Math.cos(a), (w.r / 2) * Math.sin(a), 0.08]} rotation={[0, 0, a]} scale={[w.r * 0.9, 0.05, 0.03]} />;
              })}
              <mesh geometry={geo.caja} material={mats.radio} position={[w.r / 2, 0, 0.1]} scale={[w.r, 0.06, 0.05]} />
              <mesh geometry={geo.marca} material={mats.marca} position={[w.r, 0, 0.13]} />
              <mesh geometry={geo.cubo} material={mats.aro} position={[0, 0, 0.06]} />
            </group>
          </group>
        );
      })}

      {/* estela y guía de la primera rueda */}
      <instancedMesh ref={puntosGuia} args={[geo.punto, mats.guia, N_GUIA]} frustumCulled={false} />
      <instancedMesh ref={estela} args={[geo.punto, mats.estela, N_ESTELA]} frustumCulled={false} />

      {etiquetas && principal && (
        <>
          <Etiqueta position={[principal.x, principal.y + principal.r + 1.05, 0]} className="etq-dato etq-medida etq-centro etq-crono">
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
        </>
      )}
      {previa && principal && (
        <Etiqueta position={[principal.x, principal.y - principal.r - 0.75, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
