// ══ Pista 3D con marcas de distancia, autos que se mueven (MRU/MRUV), bandera arrastrable y muros/metas ───────
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { emitirPolvo } from "@/lib/polvo";
import { sfx } from "@/lib/sonido";
import { Etiqueta } from "../Etiqueta";
import { Auto } from "./Auto";

export interface Movil {
  color: string;
  x0: number;
  v: number;
  a?: number;
  carril?: number;
  etiqueta?: ReactNode;
}

export interface MarcaPista {
  x: number;
  tipo: "muro" | "meta" | "linea";
  etiqueta?: ReactNode;
}

interface Props {
  /** Largo de la pista en metros. */
  L: number;
  cada?: number;
  moviles: Movil[];
  marcas?: MarcaPista[];
  bandera?: { x: number; editable: boolean; onCambio?: (x: number) => void; paso: number } | null;
  fantasma?: number | null;
  /** Simulación en curso: `id` cambia en cada corrida; dura `tFin` segundos físicos. */
  corrida?: { id: number; tFin: number } | null;
  onFin?: (x: number[]) => void;
  etiquetas?: boolean;
  exito?: boolean;
  /** Vista previa del carrusel: sin etiquetas y con este rótulo debajo. */
  previa?: string;
}

const LARGO = 9; // unidades 3D que ocupa la pista
const ANCHO = 1.7;

/** Posición y rapidez en el instante t (con frenado: no retrocede al detenerse). */
export function estado(m: Movil, t: number) {
  const a = m.a ?? 0;
  let tt = t;
  if (a !== 0 && Math.sign(a) !== Math.sign(m.v) && m.v !== 0) tt = Math.min(t, -m.v / a);
  return { x: m.x0 + m.v * tt + 0.5 * a * tt * tt, v: m.v + a * tt };
}

const fmt = (n: number, d = 1) => n.toFixed(d).replace(".", ",").replace(/,0$/, "");

export function EscenaPista({ L, cada = 10, moviles, marcas = [], bandera, fantasma, corrida, onFin, etiquetas: conEtiquetas = true, exito = false, previa }: Props) {
  const etiquetas = conEtiquetas && !previa;
  const K = LARGO / L;
  const X = (m: number) => (m - L / 2) * K;
  const autos = useRef<(THREE.Group | null)[]>([]);
  const superficie = useRef<THREE.Mesh>(null!);
  const arrastrando = useRef(false);
  const sim = useRef({ id: -1, t: 0, fin: false, choque: [] as boolean[] });
  const etqTiempo = useRef<HTMLSpanElement | null>(null);
  const etqVel = useRef<(HTMLSpanElement | null)[]>([]);
  const punto = useMemo(() => new THREE.Vector3(), []);
  const carriles = moviles.length > 1;
  const zDe = (m: Movil, i: number) => (carriles ? ((m.carril ?? i) === 0 ? 0.42 : -0.42) : 0);
  const muro = marcas.find((m) => m.tipo === "muro");
  const mitadAuto = 0.48 / K; // medio auto en metros

  const geo = useMemo(
    () => ({
      pista: new RoundedBoxGeometry(LARGO + 1, 0.08, ANCHO, 2, 0.03),
      borde: new THREE.BoxGeometry(LARGO + 1, 0.012, 0.03),
      raya: new THREE.BoxGeometry(0.28, 0.01, 0.04),
      tick: new THREE.BoxGeometry(0.025, 0.012, 0.16),
      salida: new THREE.BoxGeometry(0.05, 0.012, ANCHO),
      muro: new RoundedBoxGeometry(0.16, 0.7, ANCHO, 2, 0.04),
      meta: new THREE.BoxGeometry(0.08, 0.014, ANCHO),
      poste: new THREE.CylinderGeometry(0.018, 0.018, 1, 8),
      tela: (() => {
        const s = new THREE.Shape();
        s.moveTo(0, 0);
        s.lineTo(0.42, -0.13);
        s.lineTo(0, -0.26);
        return new THREE.ShapeGeometry(s);
      })(),
      sup: new THREE.PlaneGeometry(LARGO + 1, ANCHO + 1),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      pista: new THREE.MeshStandardMaterial({ color: "#20252c", roughness: 0.85 }),
      borde: new THREE.MeshStandardMaterial({ color: "#8a929d", roughness: 0.5 }),
      raya: new THREE.MeshStandardMaterial({ color: "#c9ced6", roughness: 0.6, transparent: true, opacity: 0.6 }),
      acento: new THREE.MeshStandardMaterial({ color: "#d9c3a0", emissive: "#d9c3a0", emissiveIntensity: 0.15 }),
      muro: new THREE.MeshStandardMaterial({ color: "#c45c52", roughness: 0.5 }),
      meta: new THREE.MeshStandardMaterial({ color: "#f4efe6", emissive: "#f4efe6", emissiveIntensity: 0.2 }),
      bandera: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.35, side: THREE.DoubleSide }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#f0b44c", transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }),
      sup: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
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

  useFrame((_, dtCrudo) => {
    const dt = Math.min(0.05, dtCrudo);
    const S = sim.current;
    if (corrida && corrida.id !== S.id) {
      S.id = corrida.id;
      S.t = 0;
      S.fin = false;
      S.choque = moviles.map(() => false);
    }
    if (!corrida) {
      S.id = -1;
      S.t = 0;
      S.fin = false;
    } else if (!S.fin) {
      // la corrida dura entre ~1,5 y 3 s reales aunque el tiempo físico sea mayor
      const factor = Math.max(1, corrida.tFin / 3);
      S.t = Math.min(corrida.tFin, S.t + dt * factor);
    }
    const xs: number[] = [];
    moviles.forEach((m, i) => {
      let { x, v } = estado(m, S.t);
      if (muro && x > muro.x - mitadAuto && m.v > 0) {
        x = muro.x - mitadAuto;
        v = 0;
        if (!S.choque[i] && corrida) {
          S.choque[i] = true;
          emitirPolvo({ pos: [X(muro.x), 0.4, 0], color: "#ff6f61", n: 140, radio: 0.4, fuerza: 1.3, vida: 1.2 });
          sfx.error();
        }
      }
      xs.push(x);
      const g = autos.current[i];
      if (g) {
        g.position.x = X(x);
        g.rotation.y = m.v < 0 ? Math.PI : 0;
      }
      const ev = etqVel.current[i];
      if (ev) ev.textContent = `v = ${fmt(Math.abs(v))} m/s`;
    });
    if (etqTiempo.current) etqTiempo.current.textContent = `t = ${fmt(S.t)} s`;
    if (corrida && !S.fin && S.t >= corrida.tFin) {
      S.fin = true;
      onFin?.(xs);
    }
  });

  const actualizar = (e: ThreeEvent<PointerEvent>) => {
    if (!bandera?.editable || !bandera.onCambio) return;
    punto.copy(e.point);
    superficie.current.worldToLocal(punto);
    const m = Math.max(0, Math.min(L, Math.round((punto.x / K + L / 2) / bandera.paso) * bandera.paso));
    if (m !== bandera.x) {
      bandera.onCambio(m);
      sfx.tecla();
    }
  };

  // rayas centrales (solo con dos carriles) y marcas de distancia
  const rayas = carriles ? Array.from({ length: Math.floor(LARGO / 0.6) }, (_, i) => -LARGO / 2 + 0.3 + i * 0.6) : [];
  const ticks = Array.from({ length: Math.floor(L / cada) + 1 }, (_, i) => i * cada);

  // función (no componente) para no remontar la bandera en cada render
  const bandera3D = (x: number, mat: THREE.Material) => (
    <group position={[X(x), 0.05, ANCHO / 2 + 0.12]}>
      <mesh geometry={geo.poste} material={mats.borde} position={[0, 0.5, 0]} />
      <mesh geometry={geo.tela} material={mat} position={[0.01, 0.98, 0]} />
    </group>
  );

  return (
    <group rotation={[0.5, 0, 0]} position={[0, -0.35, 0]}>
      <mesh geometry={geo.pista} material={mats.pista} />
      <mesh geometry={geo.borde} material={mats.borde} position={[0, 0.045, ANCHO / 2 - 0.05]} />
      <mesh geometry={geo.borde} material={mats.borde} position={[0, 0.045, -ANCHO / 2 + 0.05]} />
      {rayas.map((x, i) => (
        <mesh key={i} geometry={geo.raya} material={mats.raya} position={[x, 0.045, 0]} />
      ))}
      <mesh geometry={geo.salida} material={mats.meta} position={[X(0), 0.046, 0]} />
      {ticks.map((m) => (
        <group key={m} position={[X(m), 0.046, ANCHO / 2 - 0.12]}>
          <mesh geometry={geo.tick} material={mats.acento} />
          {etiquetas && (
            <Etiqueta position={[0, 0, 0.35]} className="etq-eje">
              {m === 0 ? "0 m" : m}
            </Etiqueta>
          )}
        </group>
      ))}
      {marcas.map((mk, i) => (
        <group key={i} position={[X(mk.x), 0.04, 0]}>
          {mk.tipo === "muro" && <mesh geometry={geo.muro} material={mats.muro} position={[0.08, 0.35, 0]} />}
          {mk.tipo !== "muro" && <mesh geometry={geo.meta} material={mk.tipo === "meta" ? mats.meta : mats.acento} position={[0, 0.008, 0]} />}
          {etiquetas && mk.etiqueta && (
            <Etiqueta position={[0, mk.tipo === "muro" ? 0.95 : 0.5, -ANCHO / 2]} className="etq-dato etq-acento etq-centro">
              {mk.etiqueta}
            </Etiqueta>
          )}
        </group>
      ))}
      {fantasma !== null && fantasma !== undefined && bandera3D(fantasma, mats.fantasma)}
      {bandera && (
        <>
          {bandera3D(bandera.x, mats.bandera)}
          {etiquetas && (
            <Etiqueta position={[X(bandera.x), 0.05, ANCHO / 2 + 1.05]} className="etq-dato etq-medida etq-bandera">
              {bandera.x} m
            </Etiqueta>
          )}
        </>
      )}
      {moviles.map((m, i) => (
        <group
          key={i}
          ref={(el) => {
            autos.current[i] = el;
          }}
          position={[X(m.x0), 0.04, zDe(m, i)]}
        >
          <Auto color={m.color} brillo={exito ? 0.4 : 0} />
          {etiquetas && (
            <Etiqueta position={[0, 0.85, 0]} className="etq-dato etq-centro">
              {m.etiqueta && <b className="etq-auto">{m.etiqueta}</b>}
              <span
                ref={(el) => {
                  etqVel.current[i] = el;
                }}
              >
                v = {Math.abs(m.v)} m/s
              </span>
            </Etiqueta>
          )}
        </group>
      ))}
      {etiquetas && (
        <Etiqueta position={[0, 1.15, -ANCHO / 2 - 0.3]} className="etq-dato etq-medida etq-centro etq-crono">
          <span ref={etqTiempo}>t = 0 s</span>
        </Etiqueta>
      )}
      {previa && (
        <Etiqueta position={[0, -0.1, ANCHO / 2 + 2.6]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
      {/* superficie invisible para mover la bandera con el mouse */}
      <mesh
        ref={superficie}
        geometry={geo.sup}
        material={mats.sup}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.06, 0]}
        onPointerDown={(e) => {
          if (!bandera?.editable) return;
          e.stopPropagation();
          arrastrando.current = true;
          (e.target as unknown as Element).setPointerCapture?.(e.pointerId);
          actualizar(e);
        }}
        onPointerMove={(e) => arrastrando.current && actualizar(e)}
        onPointerUp={(e) => {
          arrastrando.current = false;
          (e.target as unknown as Element).releasePointerCapture?.(e.pointerId);
        }}
        onPointerOver={() => bandera?.editable && (document.body.style.cursor = "crosshair")}
        onPointerOut={() => (document.body.style.cursor = "")}
      />
    </group>
  );
}
