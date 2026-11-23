// ══ Escena de la curva (Nivel 6): auto visto desde arriba en una curva en U, con su velocidad y su aceleración centrípeta ───────
// Si va más rápido que √(a_máx·R), los neumáticos solo dan a_máx: el auto describe un arco más abierto (R′ = v²/a_máx) y se sale.
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Radio real de la curva (m) y aceleración centrípeta máxima (m/s²). */
  R: number;
  aMax: number;
  /** Rapidez con la que entra (m/s). */
  v: number;
  /** Simulación en curso: `id` cambia en cada corrida. */
  corrida?: { id: number } | null;
  onFin?: (p: { salio: boolean }) => void;
  exito?: boolean;
  /** Vista previa del carrusel: sin etiquetas; si el texto no está vacío, va como rótulo debajo. */
  previa?: string;
}

const RS = 2; // radio de la línea central de la curva (unidades 3D): todas las curvas se dibujan del mismo tamaño
const ANCHO = 0.72; // ancho de la carretera
const LS = 1.7; // largo de las rectas de entrada y salida
const N_ESTELA = 140;
const PASO_ESTELA = 0.17;
const N_RAYAS = 40;
const CADA_ETQ = 0.08;
const COLOR_V = "#86b2ff";
const COLOR_A = "#f0b44c";
const COLOR_MAL = "#ff7a6b";

/** Punto del recorrido a la distancia s (unidades 3D) cuando el arco tiene radio rp (rp = RS: sigue la carretera). */
function enRecorrido(s: number, rp: number) {
  if (s <= LS) return { x: RS, y: -LS + s, ang: Math.PI / 2, curva: false };
  const d = s - LS;
  const phi = d / rp;
  if (rp <= RS + 1e-9 && phi > Math.PI) return { x: -RS, y: -(d - Math.PI * RS), ang: -Math.PI / 2, curva: false };
  return { x: RS - rp + rp * Math.cos(phi), y: rp * Math.sin(phi), ang: phi + Math.PI / 2, curva: true };
}

const fmt1 = (n: number) => (Math.abs(n) < 0.05 ? 0 : n).toFixed(1).replace(".", ",");
const escribir = (el: HTMLElement | null, txt: string) => {
  if (el && el.textContent !== txt) el.textContent = txt;
};

export function EscenaCurva({ R, aMax, v, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const vMax = Math.sqrt(aMax * R);
  const excede = v > vMax + 1e-9;
  // radio que logra el auto: el de la carretera o, si se excede, uno más abierto
  const rp = excede ? RS * (v / vMax) ** 2 : RS;
  const k = RS / R; // unidades 3D por metro
  const largoSeguro = 2 * LS + Math.PI * RS;
  const tRef = largoSeguro / k / v; // s físicos de la vuelta completa por la carretera

  const auto = useRef<THREE.Group>(null!);
  const anclaEtq = useRef<THREE.Group>(null!);
  const flechaV = useRef<THREE.Group>(null!);
  const flechaA = useRef<THREE.Group>(null!);
  const estela = useRef<THREE.InstancedMesh>(null!);
  const etqT = useRef<HTMLSpanElement | null>(null);
  const etqA = useRef<HTMLSpanElement | null>(null);
  const sim = useRef({ id: -1, t: 0, fin: false, fuera: false, etq: -1 });
  const ayuda = useMemo(() => new THREE.Object3D(), []);

  const geo = useMemo(
    () => ({
      curva: new THREE.RingGeometry(RS - ANCHO / 2, RS + ANCHO / 2, 96, 1, 0, Math.PI),
      bordeExt: new THREE.RingGeometry(RS + ANCHO / 2 - 0.03, RS + ANCHO / 2, 96, 1, 0, Math.PI),
      bordeInt: new THREE.RingGeometry(RS - ANCHO / 2, RS - ANCHO / 2 + 0.03, 96, 1, 0, Math.PI),
      plano: new THREE.PlaneGeometry(1, 1),
      caja: new THREE.BoxGeometry(1, 1, 1),
      punto: new THREE.SphereGeometry(0.04, 8, 6),
      centro: new THREE.SphereGeometry(0.07, 16, 12),
      tubo: new THREE.CylinderGeometry(0.025, 0.025, 1, 8).translate(0, 0.5, 0),
      punta: new THREE.ConeGeometry(0.07, 0.17, 14).translate(0, 0.085, 0),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      asfalto: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.9 }),
      borde: new THREE.MeshStandardMaterial({ color: "#d9c3a0", emissive: "#d9c3a0", emissiveIntensity: 0.15 }),
      raya: new THREE.MeshStandardMaterial({ color: "#8a929d" }),
      meta: new THREE.MeshStandardMaterial({ color: "#f4efe6", emissive: "#6fd6a8", emissiveIntensity: 0 }),
      carro: new THREE.MeshStandardMaterial({ color: "#f0b44c", roughness: 0.4, emissive: "#f0b44c", emissiveIntensity: 0.1 }),
      vidrio: new THREE.MeshStandardMaterial({ color: "#1c2128", roughness: 0.2 }),
      rueda: new THREE.MeshStandardMaterial({ color: "#0e1013", roughness: 0.8 }),
      v: new THREE.MeshStandardMaterial({ color: COLOR_V, emissive: COLOR_V, emissiveIntensity: 0.3 }),
      a: new THREE.MeshStandardMaterial({ color: excede ? COLOR_MAL : COLOR_A, emissive: excede ? COLOR_MAL : COLOR_A, emissiveIntensity: 0.3 }),
      estela: new THREE.MeshBasicMaterial({ color: "#f0b44c", transparent: true, opacity: 0.45, depthWrite: false }),
      centro: new THREE.MeshStandardMaterial({ color: "#8a929d" }),
    }),
    [excede],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
    },
    [geo],
  );
  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
    },
    [mats],
  );

  // brillo de la meta al acertar
  useEffect(() => {
    mats.meta.emissiveIntensity = exito ? 0.6 : 0;
    if (exito) emitirPolvo({ pos: [-RS, -LS, 0.2], color: "#6fd6a8", n: 150, radio: 0.4, fuerza: 1.2 });
  }, [exito, mats]);

  // rayas centrales de la carretera (fijas)
  const rayas = useMemo(() => {
    const lista: { x: number; y: number; ang: number }[] = [];
    for (let i = 0; i < N_RAYAS; i++) {
      const p = enRecorrido(((i + 0.5) * largoSeguro) / N_RAYAS, RS);
      lista.push(p);
    }
    return lista;
  }, [largoSeguro]);

  useFrame((state, dtCrudo) => {
    const dt = Math.min(0.05, dtCrudo);
    const S = sim.current;
    if (corrida && corrida.id !== S.id) {
      S.id = corrida.id;
      S.t = 0;
      S.fin = false;
      S.fuera = false;
    }
    if (!corrida) {
      S.id = -1;
      S.t = 0;
      S.fin = false;
      S.fuera = false;
    }
    // la vuelta dura ~3 s reales aunque el tiempo físico sea mayor
    if (corrida && !S.fin) S.t += dt * Math.max(1, tRef / 3.2);
    const s = Math.min(S.t * v * k, excede ? LS + Math.PI * rp : largoSeguro);
    const p = enRecorrido(s, rp);
    auto.current.position.set(p.x, p.y, 0.12);
    auto.current.rotation.z = p.ang;
    // la etiqueta de a꜀ va hacia afuera de la curva, para no tapar el auto
    const dAuto = Math.max(0.001, Math.hypot(p.x, p.y));
    anclaEtq.current?.position.set(p.x + (p.x / dAuto) * 0.8, p.y + (p.y / dAuto) * 0.8, 0.2);

    // flechas: velocidad tangente y aceleración centrípeta hacia el centro del arco que describe
    const fv = flechaV.current;
    const fa = flechaA.current;
    const enMarcha = !!corrida && S.t > 0 && !S.fin;
    fv.visible = enMarcha;
    fv.position.set(p.x, p.y, 0.3);
    fv.rotation.z = p.ang - Math.PI / 2;
    const lv = 0.3 + 0.55 * (v / 40);
    (fv.children[0] as THREE.Mesh).scale.y = lv;
    (fv.children[1] as THREE.Mesh).position.y = lv;
    const aReal = p.curva ? (excede ? aMax : (v * v) / R) : 0;
    fa.visible = enMarcha && aReal > 0;
    if (fa.visible) {
      const cx = RS - rp;
      const dir = Math.atan2(0 - p.y, cx - p.x);
      fa.position.set(p.x, p.y, 0.32);
      fa.rotation.z = dir - Math.PI / 2;
      const la = Math.min(1.3, 0.07 * aReal);
      (fa.children[0] as THREE.Mesh).scale.y = la;
      (fa.children[1] as THREE.Mesh).position.y = la;
    }

    // estela del recorrido
    const m = estela.current;
    let n = 0;
    if (corrida) {
      for (let i = 1; i < N_ESTELA && i * PASO_ESTELA <= s; i++) {
        const q = enRecorrido(i * PASO_ESTELA, rp);
        ayuda.position.set(q.x, q.y, 0.03);
        ayuda.updateMatrix();
        m.setMatrixAt(n++, ayuda.matrix);
      }
    }
    m.count = n;
    m.instanceMatrix.needsUpdate = true;

    // etiquetas que cambian
    const reloj = state.clock.elapsedTime;
    if (!corrida || S.fin || reloj - S.etq >= CADA_ETQ) {
      S.etq = reloj;
      escribir(etqT.current, fmt1(S.t));
      // la que la curva le exige al auto: v²/R en la curva, 0 en las rectas
      const aNec = p.curva || (excede && s > LS) ? (v * v) / R : 0;
      escribir(etqA.current, fmt1(aNec));
      if (etqA.current) etqA.current.style.color = aNec > aMax + 1e-9 ? COLOR_MAL : "";
    }

    // se sale de la carretera
    const dist = Math.hypot(p.x, p.y);
    if (corrida && excede && !S.fuera && s > LS && dist > RS + ANCHO / 2) {
      S.fuera = true;
      emitirPolvo({ pos: [p.x, p.y, 0.15], color: COLOR_MAL, n: 120, radio: 0.35, fuerza: 1.2, vida: 1 });
    }
    const termino = excede ? dist > RS + ANCHO / 2 + 0.45 || s >= LS + Math.PI * rp - 1e-6 : s >= largoSeguro - 1e-6;
    if (corrida && !S.fin && termino) {
      S.fin = true;
      onFin?.({ salio: excede });
    }
  });

  const flecha = (mat: THREE.Material) => (
    <>
      <mesh geometry={geo.tubo} material={mat} />
      <mesh geometry={geo.punta} material={mat} />
    </>
  );

  return (
    <group>
      {/* carretera: recta de entrada, curva en U y recta de salida */}
      <mesh geometry={geo.curva} material={mats.asfalto} />
      <mesh geometry={geo.bordeExt} material={mats.borde} position={[0, 0, 0.01]} />
      <mesh geometry={geo.bordeInt} material={mats.borde} position={[0, 0, 0.01]} />
      {[RS, -RS].map((x) => (
        <group key={x} position={[x, -LS / 2, 0]}>
          <mesh geometry={geo.plano} material={mats.asfalto} scale={[ANCHO, LS, 1]} />
          <mesh geometry={geo.caja} material={mats.borde} position={[ANCHO / 2 - 0.015, 0, 0.01]} scale={[0.03, LS, 0.01]} />
          <mesh geometry={geo.caja} material={mats.borde} position={[-ANCHO / 2 + 0.015, 0, 0.01]} scale={[0.03, LS, 0.01]} />
        </group>
      ))}
      {rayas.map((r, i) => (
        <mesh key={i} geometry={geo.caja} material={mats.raya} position={[r.x, r.y, 0.015]} rotation={[0, 0, r.ang]} scale={[0.14, 0.022, 0.01]} />
      ))}
      {/* meta a cuadros al final de la salida */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`m${i}`} geometry={geo.caja} material={i % 2 ? mats.asfalto : mats.meta} position={[-RS - ANCHO / 2 + ANCHO / 12 + (i * ANCHO) / 6, -LS + 0.06, 0.02]} scale={[ANCHO / 6, 0.12, 0.01]} />
      ))}

      {/* centro de la curva y su radio */}
      <mesh geometry={geo.centro} material={mats.centro} />
      <mesh geometry={geo.caja} material={mats.centro} position={[(RS / 2) * Math.cos(Math.PI / 3), (RS / 2) * Math.sin(Math.PI / 3), 0.01]} rotation={[0, 0, Math.PI / 3]} scale={[RS, 0.02, 0.01]} />
      {etiquetas && (
        <Etiqueta position={[(RS / 2) * Math.cos(Math.PI / 3) - 0.45, (RS / 2) * Math.sin(Math.PI / 3) + 0.1, 0.05]} className="etq-dato etq-acento etq-centro">
          R = {R} m
        </Etiqueta>
      )}

      {/* estela y auto */}
      <instancedMesh ref={estela} args={[geo.punto, mats.estela, N_ESTELA]} frustumCulled={false} />
      <group ref={auto} position={[RS, -LS, 0.12]} rotation={[0, 0, Math.PI / 2]}>
        <mesh geometry={geo.caja} material={mats.carro} scale={[0.46, 0.24, 0.1]} />
        <mesh geometry={geo.caja} material={mats.vidrio} position={[-0.03, 0, 0.07]} scale={[0.22, 0.19, 0.06]} />
        {[
          [0.15, 0.13],
          [0.15, -0.13],
          [-0.15, 0.13],
          [-0.15, -0.13],
        ].map(([x, y], i) => (
          <mesh key={i} geometry={geo.caja} material={mats.rueda} position={[x, y, -0.02]} scale={[0.11, 0.05, 0.06]} />
        ))}
      </group>
      <group ref={anclaEtq} position={[RS + 0.8, -LS, 0.2]}>
        {etiquetas && (
          <Etiqueta className="etq-dato etq-centro">
            a<sub>c</sub> ={" "}
            <span
              className="etq-num"
              ref={(el) => {
                if (el) etqA.current = el;
              }}
            >
              0,0
            </span>{" "}
            m/s²
          </Etiqueta>
        )}
      </group>
      <group ref={flechaV} visible={false}>
        {flecha(mats.v)}
      </group>
      <group ref={flechaA} visible={false}>
        {flecha(mats.a)}
      </group>

      {etiquetas && (
        <Etiqueta position={[0, RS + ANCHO / 2 + 0.45, 0]} className="etq-dato etq-medida etq-centro etq-crono">
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
        <Etiqueta position={[0, -LS - 0.5, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
