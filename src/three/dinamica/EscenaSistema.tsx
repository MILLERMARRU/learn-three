// ══ Escena de sistemas de bloques (Nivel 8): máquina de Atwood o bloque en la mesa con pesa colgante; fantasmas y dinamómetro ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { posicion } from "@/lib/dinamica";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  tipo: "atwood" | "mesa";
  m1: number;
  m2: number;
  mu: number;
  /** Aceleración real del sistema (m/s²). */
  aReal: number;
  /** Aceleración propuesta (fantasmas); null = sin fantasmas. */
  aFantasma: number | null;
  /** Tensión que marca el dinamómetro; null = oculta. */
  tension: number | null;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const R = 0.32; // radio de la polea
const S_MAX = 1.2; // recorrido máximo (m = unidades 3D)
const DUR = 1.7; // s reales de la corrida
const lado = (m: number) => 0.32 + 0.055 * m;

export function EscenaSistema({ tipo, m1, m2, mu, aReal, aFantasma, tension, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const tFin = aReal > 0 ? Math.min(2.2, Math.sqrt((2 * S_MAX) / aReal)) : 1.4;
  const l1 = lado(m1);
  const l2 = lado(m2);

  // posiciones de reposo y sentido del movimiento de cada bloque
  const geom = useMemo(() => {
    if (tipo === "atwood") {
      const polea: [number, number] = [0, 2.1];
      const baja1 = m1 >= m2; // el más pesado baja
      return {
        polea,
        b1: [-R, 0.4] as [number, number],
        b2: [R, 0.4] as [number, number],
        dir1: [0, baja1 ? -1 : 1] as [number, number],
        dir2: [0, baja1 ? 1 : -1] as [number, number],
      };
    }
    // mesa: borde derecho en x = 1, superficie en y = 0,2; la polea en la esquina, con su parte de arriba a la altura
    // del centro del bloque para que la cuerda salga horizontal
    const polea: [number, number] = [1 + R * 0.9, 0.2 + l1 / 2 - R];
    return { polea, b1: [-1.4, 0.2 + l1 / 2] as [number, number], b2: [polea[0] + R, -0.7] as [number, number], dir1: [1, 0] as [number, number], dir2: [0, -1] as [number, number] };
  }, [tipo, m1, m2, l1]);

  const g1 = useRef<THREE.Group>(null!);
  const g2 = useRef<THREE.Group>(null!);
  const f1 = useRef<THREE.Group>(null!);
  const f2 = useRef<THREE.Group>(null!);
  const cuerdas = useRef<(THREE.Mesh | null)[]>([]);
  const sim = useRef({ id: -1, t: 0, fin: false });

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      disco: new THREE.CylinderGeometry(R, R, 0.12, 40).rotateX(Math.PI / 2),
      aro: new THREE.TorusGeometry(R, 0.03, 10, 48),
      cuerda: new THREE.BoxGeometry(1, 0.022, 0.022),
      dina: new THREE.CylinderGeometry(0.07, 0.07, 0.36, 16),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      mesa: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.9 }),
      techo: new THREE.MeshStandardMaterial({ color: "#39404b", roughness: 0.8 }),
      disco: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.7 }),
      aro: new THREE.MeshStandardMaterial({ color: "#d9c3a0", emissive: "#d9c3a0", emissiveIntensity: 0.12 }),
      cuerda: new THREE.MeshStandardMaterial({ color: "#c9b48d" }),
      b1: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.55, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      b2: new THREE.MeshStandardMaterial({ color: "#8a929d", roughness: 0.45, metalness: 0.2, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.32, depthWrite: false, emissive: "#86b2ff", emissiveIntensity: 0.3 }),
      dina: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.35 }),
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
  const px = geom.polea[0];
  const py = geom.polea[1];
  useEffect(() => {
    mats.b1.emissiveIntensity = exito ? 0.35 : 0;
    mats.b2.emissiveIntensity = exito ? 0.35 : 0;
    if (exito) emitirPolvo({ pos: [px, py, 0.4], color: "#6fd6a8", n: 140, radio: 0.4, fuerza: 1.2 });
  }, [exito, mats, px, py]);

  /** Las cuerdas siguen a los bloques: de cada bloque a la polea. */
  const tramos = (p1: [number, number], p2: [number, number]): [[number, number], [number, number]][] => {
    if (tipo === "atwood")
      return [
        [[p1[0], p1[1] + l1 / 2], [-R, geom.polea[1]]],
        [[p2[0], p2[1] + l2 / 2], [R, geom.polea[1]]],
      ];
    return [
      [[p1[0] + l1 / 2, p1[1]], [geom.polea[0], geom.polea[1] + R - 0.001]],
      [[p2[0], p2[1] + l2 / 2], [geom.polea[0] + R, geom.polea[1]]],
    ];
  };

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
    // la corrida dura ~1,7 s reales sea cual sea el tiempo físico
    if (corrida && !S.fin) S.t = Math.min(tFin, S.t + (dt * tFin) / DUR);
    const sr = corrida ? Math.min(S_MAX, posicion(aReal, S.t)) : 0;
    const sf = corrida && aFantasma !== null ? Math.min(S_MAX, posicion(aFantasma, S.t)) : 0;
    const p1: [number, number] = [geom.b1[0] + geom.dir1[0] * sr, geom.b1[1] + geom.dir1[1] * sr];
    const p2: [number, number] = [geom.b2[0] + geom.dir2[0] * sr, geom.b2[1] + geom.dir2[1] * sr];
    g1.current.position.set(p1[0], p1[1], 0);
    g2.current.position.set(p2[0], p2[1], 0);
    f1.current?.position.set(geom.b1[0] + geom.dir1[0] * sf, geom.b1[1] + geom.dir1[1] * sf, 0.45);
    f2.current?.position.set(geom.b2[0] + geom.dir2[0] * sf, geom.b2[1] + geom.dir2[1] * sf, 0.45);
    tramos(p1, p2).forEach(([a, b], i) => {
      const m = cuerdas.current[i];
      if (!m) return;
      m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.02);
      m.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]);
      m.scale.set(Math.max(0.001, Math.hypot(b[0] - a[0], b[1] - a[1])), 1, 1);
    });
    if (corrida && !S.fin && S.t >= tFin - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  const bloque = (l: number, mat: THREE.Material) => <mesh geometry={geo.caja} material={mat} scale={[l, l, 0.5]} />;
  // dinamómetro en el tramo de cuerda del bloque 2, cerca de la polea
  const dina: [number, number] = tipo === "atwood" ? [R, geom.polea[1] - 0.75] : [geom.polea[0] + R, geom.polea[1] - 0.55];

  return (
    <group position={[0, -0.25, 0]}>
      {tipo === "atwood" ? (
        <>
          <mesh geometry={geo.caja} material={mats.techo} position={[0, geom.polea[1] + 0.55, 0]} scale={[2.2, 0.14, 0.6]} />
          <mesh geometry={geo.caja} material={mats.techo} position={[0, geom.polea[1] + 0.27, -0.05]} scale={[0.07, 0.5, 0.07]} />
        </>
      ) : (
        <>
          <mesh geometry={geo.caja} material={mats.mesa} position={[-1.1, 0.12, 0]} scale={[4.2, 0.16, 1.1]} />
          <mesh geometry={geo.caja} material={mats.mesa} position={[-2.9, -0.7, 0]} scale={[0.14, 1.5, 0.14]} />
          <mesh geometry={geo.caja} material={mats.mesa} position={[0.7, -0.7, 0]} scale={[0.14, 1.5, 0.14]} />
          <mesh geometry={geo.caja} material={mats.techo} position={[geom.polea[0] - 0.12, geom.polea[1] - 0.16, -0.05]} scale={[0.07, 0.32, 0.07]} />
        </>
      )}
      <group position={[geom.polea[0], geom.polea[1], 0]}>
        <mesh geometry={geo.disco} material={mats.disco} />
        <mesh geometry={geo.aro} material={mats.aro} position={[0, 0, 0.06]} />
      </group>

      {[0, 1].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            cuerdas.current[i] = m;
          }}
          geometry={geo.cuerda}
          material={mats.cuerda}
        />
      ))}

      <group ref={g1} position={[geom.b1[0], geom.b1[1], 0]}>
        {bloque(l1, mats.b1)}
        {etiquetas && (
          <Etiqueta position={[0, 0, 0.35]} className="etq-dato etq-centro">
            {m1} kg
          </Etiqueta>
        )}
        {etiquetas && tipo === "mesa" && mu > 0 && (
          <Etiqueta position={[0, -l1 / 2 - 0.25, 0.35]} className="etq-dato etq-centro">
            μ = {String(mu).replace(".", ",")}
          </Etiqueta>
        )}
      </group>
      <group ref={g2} position={[geom.b2[0], geom.b2[1], 0]}>
        {bloque(l2, mats.b2)}
        {etiquetas && (
          <Etiqueta position={[0, 0, 0.35]} className="etq-dato etq-centro">
            {m2} kg
          </Etiqueta>
        )}
      </group>

      {aFantasma !== null && (
        <>
          <group ref={f1} position={[geom.b1[0], geom.b1[1], 0.45]}>
            {bloque(l1 * 1.06, mats.fantasma)}
          </group>
          <group ref={f2} position={[geom.b2[0], geom.b2[1], 0.45]}>
            {bloque(l2 * 1.06, mats.fantasma)}
          </group>
        </>
      )}

      {/* dinamómetro: marca la tensión de la cuerda */}
      {tension !== null && (
        <group position={[dina[0], dina[1], 0.15]}>
          <mesh geometry={geo.dina} material={mats.dina} />
          {etiquetas && (
            <Etiqueta position={[0.6, 0, 0.2]} className="etq-dato etq-acento etq-centro">
              T = {Math.round(tension * 10) / 10} N
            </Etiqueta>
          )}
        </group>
      )}

      {previa && (
        <Etiqueta position={[0, -1.6, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
