// ══ Escena de la ley de gravitación (Nivel 9): dos esferas antes y después del cambio; flechas de la fuerza propuesta y la real ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { conFactor } from "@/contenido/nivel-09/modelo";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Fuerza de la situación inicial (N) y factores de m₁, m₂ y la distancia. */
  F0: number;
  k1: number;
  k2: number;
  kd: number;
  /** Fuerza propuesta (flechas fantasma); null = sin fantasma. */
  F: number | null;
  /** Fuerza real (N): sus flechas crecen al soltar. */
  Freal: number;
  /** Mostrar la fila «antes» (en la miniatura del carrusel se ve igual, sin etiquetas). */
  conAntes?: boolean;
  /** Rotular el valor real (al acertar, o en el examen): tras un error no se revela. */
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const Y_ANTES = 1.7;
const Y_AHORA = -0.2;
const L_MAX = 0.72; // al comparar, la mayor de las dos fuerzas ocupa este largo
const L_F0 = 0.5; // largo de la flecha de F₀ (referencia)
const PUNTA = 0.16;
const DUR = 1.2; // s que tardan en crecer las flechas reales
/** El radio crece con la raíz cúbica de la masa (misma densidad). */
const radio = (k: number) => 0.3 * Math.cbrt(k);
/** Separación entre centros: la distancia se exagera menos que en la realidad para que todo quepa. */
const separacion = (kd: number) => 2 + 0.8 * kd;

export function EscenaAtraccion({ F0, k1, k2, kd, F, Freal, conAntes = true, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const r1 = radio(k1);
  const r2 = radio(k2);
  const sep = separacion(kd);
  const x1 = -sep / 2;
  const x2 = sep / 2;
  // las flechas parten de la superficie y no deben cruzarse en el medio
  const tope = (sep - r1 - r2) / 2 - 0.04;
  /** Antes de soltar, las flechas se miden contra la de F₀ (sin revelar la respuesta). */
  const relativo = (f: number) => Math.max(0.1, Math.min(tope, (L_F0 * f) / F0));
  // al soltar, la fila «ahora» hace zoom: la mayor entre la propuesta y la real ocupa L_MAX
  const escalaZoom = Math.min(L_MAX, tope) / Math.max(F ?? 0, Freal);
  const pre = { fantasma: F === null ? 0 : relativo(F), real: 0 };
  const cmp = F === null ? { fantasma: 0, real: relativo(Freal) } : { fantasma: F * escalaZoom, real: Freal * escalaZoom };
  const sep0 = separacion(1);
  const r0 = radio(1);

  const fantasmas = useRef<(THREE.Group | null)[]>([]);
  const reales = useRef<(THREE.Group | null)[]>([]);
  const sim = useRef({ id: -1, t: 0, fin: false });

  const geo = useMemo(
    () => ({
      esfera: new THREE.SphereGeometry(1, 40, 28),
      tubo: new THREE.CylinderGeometry(0.035, 0.035, 1, 10).translate(0, 0.5, 0),
      punta: new THREE.ConeGeometry(0.09, PUNTA, 16).translate(0, PUNTA / 2, 0),
      regla: new THREE.BoxGeometry(1, 0.018, 0.018),
      tope: new THREE.BoxGeometry(0.018, 0.12, 0.018),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      m1: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.45, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      m2: new THREE.MeshStandardMaterial({ color: "#8a929d", roughness: 0.35, metalness: 0.3, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      antes: new THREE.MeshStandardMaterial({ color: "#d9c3a0", transparent: true, opacity: 0.28, depthWrite: false }),
      fAntes: new THREE.MeshStandardMaterial({ color: "#d9c3a0", transparent: true, opacity: 0.5, depthWrite: false }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.45, depthWrite: false, emissive: "#86b2ff", emissiveIntensity: 0.3 }),
      real: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.35 }),
      regla: new THREE.MeshStandardMaterial({ color: "#5d6673" }),
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
    mats.m1.emissiveIntensity = exito ? 0.3 : 0;
    mats.m2.emissiveIntensity = exito ? 0.3 : 0;
    if (exito) emitirPolvo({ pos: [0, Y_AHORA, 0.4], color: "#6fd6a8", n: 140, radio: 0.5, fuerza: 1.2 });
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
    if (corrida && !S.fin) S.t = Math.min(DUR, S.t + dt);
    const u = corrida ? S.t / DUR : 0;
    const e = 1 - (1 - u) ** 2;
    const fijar = (g: THREE.Group | null, L: number) => {
      if (!g) return;
      g.visible = L > 0.02;
      const [tubo, punta] = g.children as THREE.Mesh[];
      tubo.scale.y = Math.max(0.001, L - PUNTA);
      punta.position.y = Math.max(0.001, L - PUNTA);
    };
    fantasmas.current.forEach((g) => fijar(g, pre.fantasma + (cmp.fantasma - pre.fantasma) * e));
    reales.current.forEach((g) => fijar(g, cmp.real * e));
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  /** Flecha horizontal desde x hacia la otra esfera (dir = +1 a la derecha). */
  const flecha = (x: number, y: number, dir: 1 | -1, L: number, mat: THREE.Material, z = 0.42) => (
    <group position={[x, y, z]} rotation={[0, 0, -dir * (Math.PI / 2)]}>
      <mesh geometry={geo.tubo} material={mat} scale={[1, Math.max(0.001, L - PUNTA), 1]} />
      <mesh geometry={geo.punta} material={mat} position={[0, Math.max(0.001, L - PUNTA), 0]} />
    </group>
  );
  /** Regla bajo una fila: de centro a centro, con su rótulo debajo. */
  const regla = (xa: number, xb: number, y: number, texto: string) => (
    <group>
      <mesh geometry={geo.regla} material={mats.regla} position={[(xa + xb) / 2, y, 0]} scale={[xb - xa, 1, 1]} />
      <mesh geometry={geo.tope} material={mats.regla} position={[xa, y, 0]} />
      <mesh geometry={geo.tope} material={mats.regla} position={[xb, y, 0]} />
      {etiquetas && (
        <Etiqueta position={[(xa + xb) / 2, y - 0.3, 0.2]} className="etq-medida etq-centro">
          {texto}
        </Etiqueta>
      )}
    </group>
  );

  const rMax = Math.max(r1, r2);
  return (
    <group>
      {conAntes && (
        <group>
          <mesh geometry={geo.esfera} material={mats.antes} position={[-sep0 / 2, Y_ANTES, 0]} scale={r0} />
          <mesh geometry={geo.esfera} material={mats.antes} position={[sep0 / 2, Y_ANTES, 0]} scale={r0} />
          {flecha(-sep0 / 2 + r0, Y_ANTES, 1, L_F0, mats.fAntes)}
          {flecha(sep0 / 2 - r0, Y_ANTES, -1, L_F0, mats.fAntes)}
          {regla(-sep0 / 2, sep0 / 2, Y_ANTES - r0 - 0.22, "d")}
          {etiquetas && (
            <>
              <Etiqueta position={[-3.15, Y_ANTES, 0.2]} className="etq-eje etq-centro">
                antes
              </Etiqueta>
              {/* sin rótulos de masa: en pantallas chicas chocaban con F₀ (las masas ya se leen en la fila «ahora») */}
              <Etiqueta position={[0, Y_ANTES + r0 + 0.3, 0.2]} className="etq-dato etq-centro">
                F₀ = {F0} N
              </Etiqueta>
            </>
          )}
        </group>
      )}

      {/* fila «ahora»: las masas y la distancia cambiadas */}
      <mesh geometry={geo.esfera} material={mats.m1} position={[x1, Y_AHORA, 0]} scale={r1} />
      <mesh geometry={geo.esfera} material={mats.m2} position={[x2, Y_AHORA, 0]} scale={r2} />
      {/* flechas animadas: fantasma (propuesta) arriba y real abajo, desde la superficie hacia la otra esfera */}
      {(["fantasma", "real"] as const).flatMap((tipo) =>
        [0, 1].map((i) => (
          <group
            key={`${tipo}${i}`}
            ref={(g) => {
              (tipo === "fantasma" ? fantasmas : reales).current[i] = g;
            }}
            position={[i === 0 ? x1 + r1 : x2 - r2, Y_AHORA + (tipo === "fantasma" ? 0.07 : -0.07), tipo === "fantasma" ? 0.42 : 0.44]}
            rotation={[0, 0, i === 0 ? -Math.PI / 2 : Math.PI / 2]}
            visible={false}
          >
            <mesh geometry={geo.tubo} material={tipo === "fantasma" ? mats.fantasma : mats.real} />
            <mesh geometry={geo.punta} material={tipo === "fantasma" ? mats.fantasma : mats.real} />
          </group>
        )),
      )}
      {regla(x1, x2, Y_AHORA - rMax - 0.22, conFactor(kd, "d"))}
      {etiquetas && (
        <>
          <Etiqueta position={[-3.15, Y_AHORA, 0.2]} className="etq-eje etq-centro">
            ahora
          </Etiqueta>
          <Etiqueta position={[x1, Y_AHORA + r1 + 0.3, 0.2]} className="etq-dato etq-centro">
            {conFactor(k1, "m₁")}
          </Etiqueta>
          <Etiqueta position={[x2, Y_AHORA + r2 + 0.3, 0.2]} className="etq-dato etq-centro">
            {conFactor(k2, "m₂")}
          </Etiqueta>
          {verValor && (
            <Etiqueta position={[0, Y_AHORA + rMax + 0.3, 0.2]} className={`etq-dato etq-centro ${exito ? "etq-acento" : ""}`}>
              F = {Freal} N
            </Etiqueta>
          )}
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -1.6, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
