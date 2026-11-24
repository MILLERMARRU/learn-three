// ══ Escena de la onda estacionaria (Nivel 13): cuerda fija en los dos extremos; la fantasma vibra con el valor propuesto ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";
import { crearCinta, escribirCinta } from "./cinta";

interface Props {
  /** Vientres reales y los que tendría la fantasma (null = sin fantasma; no entero = no encaja en la cuerda). */
  n: number;
  nFantasma: number | null;
  L: number;
  v: number;
  /** Rótulos de los datos (ya formateados) y del resultado (al acertar); null = oculto. */
  datoIzq: string;
  datoDer: string;
  rotulo?: string | null;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const XA = -3;
const XB = 3;
const N = 240;
const AMP = 0.5;
const F_VIS = 1; // vibraciones por segundo real
const DUR = 3;
const GROSOR = 0.03;
const fmt = (n: number) => String(n).replace(".", ",");

export function EscenaEstacionaria({ n, nFantasma, L, datoIzq, datoDer, rotulo = null, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const geo = useMemo(() => ({ real: crearCinta(N), fan: crearCinta(N), caja: new THREE.BoxGeometry(1, 1, 1), nodo: new THREE.SphereGeometry(0.05, 12, 8) }), []);
  const mats = useMemo(
    () => ({
      cuerda: new THREE.MeshStandardMaterial({ color: "#d9c3a0", side: THREE.DoubleSide, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false, emissive: "#86b2ff", emissiveIntensity: 0.35 }),
      soporte: new THREE.MeshStandardMaterial({ color: "#39404b", roughness: 0.7 }),
      nodo: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.4 }),
      regla: new THREE.MeshStandardMaterial({ color: "#5d6673" }),
    }),
    [],
  );
  const fan = useRef<THREE.Mesh>(null);
  const nodos = useRef<THREE.Group>(null!);
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    mats.cuerda.emissiveIntensity = exito ? 0.45 : 0;
    if (exito) emitirPolvo({ pos: [0, AMP + 0.2, 0.4], color: "#6fd6a8", n: 110, radio: 0.5, fuerza: 1 });
  }, [exito, mats]);

  useFrame((_, dtCrudo) => {
    const d = Math.min(0.05, dtCrudo);
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
    if (corrida && !S.fin) S.t = Math.min(DUR, S.t + d);
    // la cuerda real vibra solo al soltar (antes está quieta, recta); los nodos aparecen con ella
    const amp = corrida ? AMP * Math.cos(2 * Math.PI * F_VIS * S.t) : 0;
    const modo = (k: number) => (x: number) => amp * Math.sin((k * Math.PI * (x - XA)) / (XB - XA));
    escribirCinta(geo.real, XA, XB, modo(n), 0, GROSOR);
    if (nFantasma !== null) escribirCinta(geo.fan, XA, XB, modo(nFantasma), 0.06, GROSOR);
    if (fan.current) fan.current.visible = !!corrida && nFantasma !== null;
    nodos.current.visible = !!corrida;
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  return (
    <group>
      <mesh geometry={geo.real} material={mats.cuerda} />
      <mesh ref={fan} geometry={geo.fan} material={mats.fantasma} visible={false} />
      <mesh geometry={geo.caja} material={mats.soporte} position={[XA - 0.08, -0.2, 0]} scale={[0.16, 1.4, 0.4]} />
      <mesh geometry={geo.caja} material={mats.soporte} position={[XB + 0.08, -0.2, 0]} scale={[0.16, 1.4, 0.4]} />
      {/* nodos de la cuerda real (puntos que no se mueven) */}
      <group ref={nodos} visible={false}>
        {Array.from({ length: n + 1 }, (_, i) => (
          <mesh key={i} geometry={geo.nodo} material={mats.nodo} position={[XA + ((XB - XA) * i) / n, 0, 0.1]} />
        ))}
      </group>
      {/* regla del largo, bajo la cuerda */}
      <mesh geometry={geo.caja} material={mats.regla} position={[0, -AMP - 0.3, 0]} scale={[XB - XA, 0.012, 0.012]} />
      {etiquetas && (
        <>
          <Etiqueta position={[0, -AMP - 0.34, 0.2]} className="etq-dato etq-abajo">
            L = {fmt(L)} m
          </Etiqueta>
          <Etiqueta position={[XA + 0.6, AMP + 0.4, 0]} className="etq-dato etq-centro">
            {datoIzq}
          </Etiqueta>
          <Etiqueta position={[XB - 0.6, AMP + 0.4, 0]} className="etq-dato etq-centro">
            {datoDer}
          </Etiqueta>
          {rotulo && (
            <Etiqueta position={[0, AMP + 0.4, 0.3]} className={`etq-dato etq-centro ${exito ? "etq-acento" : ""}`}>
              {rotulo}
            </Etiqueta>
          )}
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -1.4, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
