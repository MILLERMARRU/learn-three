// ══ Escena de poleas (Nivel 7): polea fija y aparejo potencial de poleas móviles; la carga sube o baja si F no la equilibra ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { fuerzaPoleas, type Vec2 } from "@/lib/estatica";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Poleas móviles en cascada (0 = solo la polea fija). */
  moviles: number;
  /** Peso de la carga y de cada polea móvil (N). */
  W: number;
  P: number;
  /** Fuerza con la que tira la mano (N). */
  F: number;
  corrida?: { id: number } | null;
  onFin?: (p: { equilibrio: boolean; sube: boolean }) => void;
  exito?: boolean;
  previa?: string;
}

const R = 0.32; // radio de las poleas
const TECHO = 2.25;
const Y_FIJA = 1.8;
const Y_BASE = 0.05; // altura de la polea móvil de abajo
const SEP_Y = 0.62; // separación vertical entre poleas móviles
const CARGA: Vec2 = [0.8, 0.62];
const DUR = 1.5;

/** Posiciones de todo el aparejo cuando la carga se desplazó d (positivo = sube). */
function geometria(k: number, d: number) {
  if (k === 0) {
    const xc = -R;
    const carga: Vec2 = [xc, -0.25 + d];
    const mano: Vec2 = [R, 0.35 - d];
    return {
      fija: [0, Y_FIJA] as Vec2,
      moviles: [] as Vec2[],
      carga,
      mano,
      cuerdas: [
        [[xc, Y_FIJA], [xc, carga[1] + CARGA[1] / 2]],
        [[R, Y_FIJA], mano],
      ] as [Vec2, Vec2][],
    };
  }
  // la polea j sube 2^j · d (la cuerda de la mano recorre 2^k · d)
  const moviles: Vec2[] = Array.from({ length: k }, (_, j) => [j * R - ((k - 1) * R) / 2, Y_BASE + j * SEP_Y + d * 2 ** j]);
  const ult = moviles[k - 1];
  const fija: Vec2 = [ult[0] + 2 * R, Y_FIJA];
  const mano: Vec2 = [fija[0] + R, Math.max(-1.7, Math.min(1.35, 0.45 - d * 2 ** k))];
  const carga: Vec2 = [moviles[0][0], moviles[0][1] - 0.8];
  const cuerdas: [Vec2, Vec2][] = [];
  moviles.forEach((m, j) => {
    cuerdas.push([[m[0] - R, m[1]], [m[0] - R, TECHO]]); // tramo izquierdo, atado al techo
    if (j < k - 1) {
      const sig = moviles[j + 1];
      cuerdas.push([[m[0] + R, m[1]], [sig[0], sig[1] - R - 0.1]]); // tramo derecho: sube al gancho de la polea siguiente
      cuerdas.push([[sig[0], sig[1] - R - 0.1], [sig[0], sig[1]]]); // gancho
    } else {
      cuerdas.push([[m[0] + R, m[1]], [m[0] + R, Y_FIJA]]); // tramo derecho de la última: sube a la polea fija
    }
  });
  cuerdas.push([[fija[0] + R, Y_FIJA], mano]); // la cuerda que tira la mano
  cuerdas.push([moviles[0], [carga[0], carga[1] + CARGA[1] / 2]]); // la carga cuelga de la polea de abajo
  return { fija, moviles, carga, mano, cuerdas };
}

export function EscenaAparejo({ moviles: k, W, P, F, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const Freq = fuerzaPoleas(W, k, P);
  const equilibrio = Math.abs(F - Freq) < 1e-9;
  const sube = F > Freq;
  const kF = 1.25 / W; // unidades 3D por newton
  const inicial = useMemo(() => geometria(k, 0), [k]);

  const cuerdas = useRef<(THREE.Mesh | null)[]>([]);
  const poleas = useRef<(THREE.Group | null)[]>([]);
  const carga = useRef<THREE.Group>(null!);
  const mano = useRef<THREE.Group>(null!);
  const sim = useRef({ id: -1, t: 0, fin: false });

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      disco: new THREE.CylinderGeometry(R, R, 0.12, 40).rotateX(Math.PI / 2),
      aro: new THREE.TorusGeometry(R, 0.03, 10, 48),
      medioAro: new THREE.TorusGeometry(R + 0.012, 0.014, 6, 32, Math.PI),
      eje: new THREE.CylinderGeometry(0.06, 0.06, 0.2, 14).rotateX(Math.PI / 2),
      cuerda: new THREE.BoxGeometry(1, 0.024, 0.024),
      mano: new THREE.SphereGeometry(0.14, 20, 14),
      tubo: new THREE.CylinderGeometry(0.032, 0.032, 1, 10).translate(0, 0.5, 0),
      punta: new THREE.ConeGeometry(0.085, 0.18, 16).translate(0, 0.09, 0),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      techo: new THREE.MeshStandardMaterial({ color: "#39404b", roughness: 0.8 }),
      disco: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.7 }),
      aro: new THREE.MeshStandardMaterial({ color: "#d9c3a0", emissive: "#d9c3a0", emissiveIntensity: 0.12 }),
      cuerda: new THREE.MeshStandardMaterial({ color: "#c9b48d", roughness: 0.7 }),
      carga: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.55, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      mano: new THREE.MeshStandardMaterial({ color: "#ff9ecd", emissive: "#ff9ecd", emissiveIntensity: 0.25 }),
      w: new THREE.MeshStandardMaterial({ color: "#ff8a5c", emissive: "#ff8a5c", emissiveIntensity: 0.3 }),
      f: new THREE.MeshStandardMaterial({ color: "#ff9ecd", emissive: "#ff9ecd", emissiveIntensity: 0.3 }),
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
    mats.carga.emissiveIntensity = exito ? 0.35 : 0;
    if (exito) emitirPolvo({ pos: [inicial.carga[0], inicial.carga[1], 0.4], color: "#6fd6a8", n: 140, radio: 0.4, fuerza: 1.2 });
  }, [exito, mats, inicial]);

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
    if (corrida && !S.fin) S.t += dt;
    // sin equilibrio la carga acelera: s = ½·a·t² (a visual, mayor cuanto mayor el desbalance)
    const a = equilibrio ? 0 : Math.min(1.2, 0.3 + Math.abs(F - Freq) / Math.max(10, Freq));
    const t = Math.min(S.t, DUR);
    const d = corrida ? (sube ? 1 : -1) * Math.min(0.7 / 2 ** Math.max(0, k - 1), 0.5 * a * t * t) : 0;
    const g = geometria(k, d);
    g.cuerdas.forEach(([p0, p1], i) => {
      const m = cuerdas.current[i];
      if (!m) return;
      m.position.set((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, 0.02);
      m.rotation.z = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
      m.scale.set(Math.max(0.001, Math.hypot(p1[0] - p0[0], p1[1] - p0[1])), 1, 1);
    });
    g.moviles.forEach((p, j) => poleas.current[j]?.position.set(p[0], p[1], 0));
    carga.current.position.set(g.carga[0], g.carga[1], 0);
    mano.current.position.set(g.mano[0], g.mano[1], 0);
    if (corrida && !S.fin && S.t >= (equilibrio ? 0.9 : DUR)) {
      S.fin = true;
      onFin?.({ equilibrio, sube });
    }
  });

  const flecha = (mat: THREE.Material, largo: number) => (
    <group rotation={[0, 0, Math.PI]}>
      <mesh geometry={geo.tubo} material={mat} scale={[1, Math.max(0.01, largo - 0.18), 1]} />
      <mesh geometry={geo.punta} material={mat} position={[0, Math.max(0.01, largo - 0.18), 0]} />
    </group>
  );
  const polea = (abajo: boolean) => (
    <>
      <mesh geometry={geo.disco} material={mats.disco} />
      <mesh geometry={geo.aro} material={mats.aro} position={[0, 0, 0.06]} />
      {/* la cuerda abraza la polea: por debajo en las móviles, por encima en la fija */}
      <mesh geometry={geo.medioAro} material={mats.cuerda} rotation={[0, 0, abajo ? Math.PI : 0]} position={[0, 0, 0.08]} />
      <mesh geometry={geo.eje} material={mats.aro} />
    </>
  );

  const anchoTecho = Math.max(2.4, inicial.fija[0] - (inicial.moviles[0]?.[0] ?? 0) + 2.4);
  const centroTecho = ((inicial.moviles[0]?.[0] ?? 0) - R + inicial.fija[0]) / 2;

  return (
    <group>
      <mesh geometry={geo.caja} material={mats.techo} position={[centroTecho, TECHO + 0.08, 0]} scale={[anchoTecho, 0.16, 0.7]} />
      {/* soporte de la polea fija */}
      <mesh geometry={geo.caja} material={mats.techo} position={[inicial.fija[0], (TECHO + Y_FIJA) / 2, -0.05]} scale={[0.07, TECHO - Y_FIJA, 0.07]} />
      <group position={[inicial.fija[0], inicial.fija[1], 0]}>{polea(false)}</group>

      {inicial.cuerdas.map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            cuerdas.current[i] = m;
          }}
          geometry={geo.cuerda}
          material={mats.cuerda}
        />
      ))}
      {inicial.moviles.map((p, j) => (
        <group
          key={j}
          ref={(g) => {
            poleas.current[j] = g;
          }}
          position={[p[0], p[1], 0]}
        >
          {polea(true)}
          {etiquetas && P > 0 && j === 0 && (
            <Etiqueta position={[-R - 0.55, 0, 0.3]} className="etq-dato etq-centro">
              P = {P} N
            </Etiqueta>
          )}
        </group>
      ))}

      <group ref={carga} position={[inicial.carga[0], inicial.carga[1], 0]}>
        <mesh geometry={geo.caja} material={mats.carga} scale={[CARGA[0], CARGA[1], 0.6]} />
        <group position={[0, -CARGA[1] / 2, 0.4]}>{flecha(mats.w, W * kF)}</group>
        {etiquetas && (
          <Etiqueta position={[0, -CARGA[1] / 2 - W * kF - 0.25, 0.4]} className="etq-dato etq-centro">
            W = {W} N
          </Etiqueta>
        )}
      </group>
      <group ref={mano} position={[inicial.mano[0], inicial.mano[1], 0]}>
        <mesh geometry={geo.mano} material={mats.mano} />
        <group position={[0, -0.12, 0.3]}>{flecha(mats.f, Math.min(2.2, Math.max(0.25, F * kF)))}</group>
        {etiquetas && (
          <Etiqueta position={[0.55, -0.35, 0.4]} className="etq-dato etq-acento etq-centro">
            F = {F} N
          </Etiqueta>
        )}
      </group>

      {previa && (
        <Etiqueta position={[centroTecho, -1.6, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
