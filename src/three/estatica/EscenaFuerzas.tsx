// ══ Escena de fuerzas (Nivel 7): cuerpo con sus fuerzas, resultante, polígono de fuerzas y movimiento si no hay equilibrio ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { FuerzaDib, TipoEquilibrio } from "@/contenido/nivel-07/equilibrio";
import { modulo, proyectar, senCos, sumar, type Vec2 } from "@/lib/estatica";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  tipo: TipoEquilibrio;
  /** Plano: inclinación. Cuerdas: ángulos de las cuerdas con la horizontal. */
  angulo: number;
  angulo2?: number;
  fuerzas: FuerzaDib[];
  /** Dirección en la que puede moverse el cuerpo (null = la de la resultante). */
  libre: Vec2 | null;
  /** Escala de las flechas: unidades 3D por newton (fija por problema, para que la incógnita crezca o se achique). */
  escala: number;
  /** Mostrar la resultante (ronda guiada, o al terminar la corrida). */
  verResultante?: boolean;
  corrida?: { id: number } | null;
  onFin?: (p: { equilibrio: boolean; resultante: number }) => void;
  exito?: boolean;
  previa?: string;
}

const TECHO = 2.05;
const PISO = -0.36;
const BLOQUE: Vec2 = [1.1, 0.84];
const DUR_MOV = 1.4; // s reales del movimiento cuando no hay equilibrio
const DUR_QUIETO = 0.9;
const POLIGONO: Vec2 = [3.45, -0.75]; // origen del polígono de fuerzas (a la derecha de la cuña y de las cuerdas)
const COLOR_R = "#ff7a6b";

/** Una flecha desde `desde` con el vector `v` (unidades 3D). */
function Flecha({ desde, v, mat, geo, grosor = 1 }: { desde: Vec2; v: Vec2; mat: THREE.Material; geo: { tubo: THREE.BufferGeometry; punta: THREE.BufferGeometry }; grosor?: number }) {
  const L = Math.hypot(v[0], v[1]);
  if (L < 0.02) return null;
  const ang = Math.atan2(v[1], v[0]) - Math.PI / 2;
  const cuerpo = Math.max(0.01, L - 0.16 * grosor);
  return (
    // por delante del bloque (su cara frontal está en z = 0,35)
    <group position={[desde[0], desde[1], 0.48]} rotation={[0, 0, ang]}>
      <mesh geometry={geo.tubo} material={mat} scale={[grosor, cuerpo, grosor]} />
      <mesh geometry={geo.punta} material={mat} position={[0, cuerpo, 0]} scale={grosor} />
    </group>
  );
}

/** Cuerda de un punto fijo al cuerpo que se mueve (se estira o se afloja con él). */
function Cuerda({ ancla, enganche, desplaz, geo, mat }: { ancla: Vec2; enganche: Vec2; desplaz: RefObject<Vec2>; geo: THREE.BufferGeometry; mat: THREE.Material }) {
  const m = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    const d = desplaz.current ?? [0, 0];
    const x = enganche[0] + d[0];
    const y = enganche[1] + d[1];
    const dx = x - ancla[0];
    const dy = y - ancla[1];
    m.current.position.set((ancla[0] + x) / 2, (ancla[1] + y) / 2, 0);
    m.current.rotation.z = Math.atan2(dy, dx);
    m.current.scale.set(Math.hypot(dx, dy), 1, 1);
  });
  return <mesh ref={m} geometry={geo} material={mat} />;
}

const fmtN = (n: number) => `${Math.round(Math.abs(n) * 10) / 10}`.replace(".", ",");

export function EscenaFuerzas({ tipo, angulo, angulo2 = 0, fuerzas, libre, escala, verResultante = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const cuerpo = useRef<THREE.Group>(null!);
  const desplaz = useRef<Vec2>([0, 0]);
  const sim = useRef({ id: -1, t: 0, fin: false });

  const R = sumar(fuerzas.map((f) => f.vec));
  const equilibrio = modulo(R) < 1e-6;
  // a lo largo de la dirección libre, cuánto sobra o falta (N)
  const rLibre = libre ? proyectar(R, libre) : modulo(R);
  const dirMov: Vec2 = equilibrio ? [0, 0] : libre ? [libre[0] * Math.sign(rLibre), libre[1] * Math.sign(rLibre)] : [R[0] / modulo(R), R[1] / modulo(R)];

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      tubo: new THREE.CylinderGeometry(0.032, 0.032, 1, 10).translate(0, 0.5, 0),
      punta: new THREE.ConeGeometry(0.085, 0.18, 16).translate(0, 0.09, 0),
      cuerda: new THREE.BoxGeometry(1, 0.026, 0.026),
      lampara: new THREE.ConeGeometry(0.3, 0.34, 28, 1, true),
      foco: new THREE.SphereGeometry(0.11, 20, 14),
      nudo: new THREE.SphereGeometry(0.06, 14, 10),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      bloque: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.55, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      suelo: new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.9 }),
      techo: new THREE.MeshStandardMaterial({ color: "#39404b", roughness: 0.8 }),
      cuerda: new THREE.MeshStandardMaterial({ color: "#c9b48d", roughness: 0.7 }),
      lampara: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.4, side: THREE.DoubleSide, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      foco: new THREE.MeshStandardMaterial({ color: "#fff4d6", emissive: "#f0b44c", emissiveIntensity: 0.6 }),
      r: new THREE.MeshStandardMaterial({ color: COLOR_R, emissive: COLOR_R, emissiveIntensity: 0.35 }),
    }),
    [],
  );
  // un material por color de fuerza
  const matsFuerza = useMemo(() => new Map<string, THREE.MeshStandardMaterial>(), []);
  const matDe = (color: string) => {
    let m = matsFuerza.get(color);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
      matsFuerza.set(color, m);
    }
    return m;
  };
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
      matsFuerza.forEach((m) => m.dispose());
    },
    [geo, mats, matsFuerza],
  );

  useEffect(() => {
    mats.bloque.emissiveIntensity = exito ? 0.35 : 0;
    mats.lampara.emissiveIntensity = exito ? 0.35 : 0;
    if (exito) emitirPolvo({ pos: [0, 0, 0.4], color: "#6fd6a8", n: 140, radio: 0.4, fuerza: 1.2 });
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
    if (corrida && !S.fin) S.t += dt;
    // sin equilibrio el cuerpo acelera en la dirección libre: s = ½·a·t² (a visual, mayor cuanto mayor la resultante)
    const a = equilibrio ? 0 : Math.min(1.6, 0.45 + Math.abs(rLibre) / 60);
    const t = Math.min(S.t, DUR_MOV);
    const s = corrida ? Math.min(1.35, 0.5 * a * t * t) : 0;
    desplaz.current = [dirMov[0] * s, dirMov[1] * s];
    cuerpo.current.position.set(desplaz.current[0], desplaz.current[1], 0);
    if (corrida && !S.fin && S.t >= (equilibrio ? DUR_QUIETO : DUR_MOV)) {
      S.fin = true;
      if (!equilibrio) emitirPolvo({ pos: [desplaz.current[0], desplaz.current[1], 0.4], color: COLOR_R, n: 90, radio: 0.3, fuerza: 1, vida: 0.9 });
      onFin?.({ equilibrio, resultante: rLibre });
    }
  });

  // ══ Montaje de cada tipo: dónde está el cuerpo, de dónde salen las flechas y las cuerdas ───────
  const [s1, c1] = senCos(angulo);
  const u: Vec2 = [c1, s1]; // dirección del plano (sube hacia la derecha)
  const origenFlechas: Vec2 = [0, 0];
  const cuerdas: { ancla: Vec2; enganche: Vec2 }[] = [];
  if (tipo === "colgado") cuerdas.push({ ancla: [0, TECHO], enganche: [0, BLOQUE[1] / 2] });
  // plano: la cuerda sale del centro de la cara de arriba del bloque, paralela al plano, hasta el poste
  const ANCLA_PLANO = 2.25;
  if (tipo === "plano") cuerdas.push({ ancla: [u[0] * ANCLA_PLANO, u[1] * ANCLA_PLANO], enganche: [u[0] * (BLOQUE[0] / 2), u[1] * (BLOQUE[0] / 2)] });
  if (tipo === "cuerdas") {
    const [sa, ca] = senCos(angulo);
    const [sb, cb] = senCos(angulo2);
    cuerdas.push({ ancla: [(-ca * TECHO) / sa, TECHO], enganche: [0, 0] });
    cuerdas.push({ ancla: [(cb * TECHO) / sb, TECHO], enganche: [0, 0] });
  }

  // cuña del plano inclinado: su superficie pasa bajo el bloque; el bloque se apoya en el punto medio
  const cuna = useMemo(() => {
    if (tipo !== "plano") return null;
    const [sa, ca] = senCos(angulo);
    const largo = 5.4;
    const cx = sa * (BLOQUE[1] / 2);
    const cy = -ca * (BLOQUE[1] / 2);
    const p0: Vec2 = [cx - (ca * largo) / 2, cy - (sa * largo) / 2];
    const p1: Vec2 = [cx + (ca * largo) / 2, cy + (sa * largo) / 2];
    const forma = new THREE.Shape();
    forma.moveTo(p0[0], p0[1]);
    forma.lineTo(p1[0], p0[1]);
    forma.lineTo(p1[0], p1[1]);
    forma.closePath();
    return new THREE.ExtrudeGeometry(forma, { depth: 1.1, bevelEnabled: false }).translate(0, 0, -0.55);
  }, [tipo, angulo]);
  useEffect(() => () => cuna?.dispose(), [cuna]);

  // polígono de fuerzas: punta con cola, la resultante va del inicio al final
  const kp = escala * 0.55;
  let px = POLIGONO[0];
  let py = POLIGONO[1];
  const lados = fuerzas.map((f) => {
    const desde: Vec2 = [px, py];
    const v: Vec2 = [f.vec[0] * kp, f.vec[1] * kp];
    px += v[0];
    py += v[1];
    return { desde, v, color: f.color };
  });

  return (
    <group>
      {/* techo, piso o plano */}
      {(tipo === "colgado" || tipo === "cuerdas") && <mesh geometry={geo.caja} material={mats.techo} position={[0, TECHO + 0.08, 0]} scale={[tipo === "cuerdas" ? 5.6 : 2.4, 0.16, 0.7]} />}
      {tipo === "piso" && <mesh geometry={geo.caja} material={mats.suelo} position={[0, PISO - 0.08, 0]} scale={[6, 0.16, 1.2]} />}
      {tipo === "plano" && cuna && (
        <>
          <mesh geometry={cuna} material={mats.suelo} />
          {/* poste donde se ata la cuerda, en lo alto de la cuña */}
          <mesh geometry={geo.caja} material={mats.techo} position={[u[0] * ANCLA_PLANO + 0.06, u[1] * ANCLA_PLANO - 0.3, 0]} scale={[0.12, 0.8, 0.12]} />
        </>
      )}

      {cuerdas.map((c, i) => (
        <Cuerda key={i} ancla={c.ancla} enganche={c.enganche} desplaz={desplaz} geo={geo.cuerda} mat={mats.cuerda} />
      ))}

      {/* el cuerpo con sus fuerzas: se mueve todo junto */}
      <group ref={cuerpo}>
        {tipo === "cuerdas" ? (
          <>
            <mesh geometry={geo.nudo} material={mats.cuerda} />
            <mesh geometry={geo.cuerda} material={mats.cuerda} position={[0, -0.2, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.4, 1, 1]} />
            <mesh geometry={geo.lampara} material={mats.lampara} position={[0, -0.52, 0]} />
            <mesh geometry={geo.foco} material={mats.foco} position={[0, -0.66, 0]} />
          </>
        ) : (
          <mesh geometry={geo.caja} material={mats.bloque} rotation={[0, 0, tipo === "plano" ? (angulo * Math.PI) / 180 : 0]} scale={[BLOQUE[0], BLOQUE[1], 0.7]} />
        )}
        {fuerzas.map((f) => {
          const v: Vec2 = [f.vec[0] * escala, f.vec[1] * escala];
          const L = Math.hypot(v[0], v[1]);
          const k = L > 2.6 ? 2.6 / L : 1; // una incógnita exagerada no se sale de la escena
          const vv: Vec2 = [v[0] * k, v[1] * k];
          const punta: Vec2 = [origenFlechas[0] + vv[0], origenFlechas[1] + vv[1]];
          const dir: Vec2 = L > 0 ? [vv[0] / (L * k), vv[1] / (L * k)] : [0, 1];
          return (
            <group key={f.nombre}>
              <Flecha desde={origenFlechas} v={vv} mat={matDe(f.color)} geo={geo} grosor={f.incognita ? 1.25 : 1} />
              {etiquetas && L > 0.02 && (
                <Etiqueta
                  // una flecha corta queda dentro del bloque: su rótulo se aleja más para no taparlo
                  position={[punta[0] + dir[0] * (L < 0.7 ? 0.75 : 0.32), punta[1] + dir[1] * (L < 0.7 ? 0.75 : 0.32), 0.35]}
                  className={`etq-dato etq-centro ${f.incognita ? "etq-acento" : ""}`}
                >
                  {f.nombre.replace("1", "₁").replace("2", "₂")} = {fmtN(modulo(f.vec))} N
                </Etiqueta>
              )}
            </group>
          );
        })}
        {/* la resultante va al costado del cuerpo, para que no la tape una fuerza en la misma dirección */}
        {verResultante && !equilibrio && <Flecha desde={[BLOQUE[0] / 2 + 0.4, 0]} v={[R[0] * escala, R[1] * escala]} mat={mats.r} geo={geo} grosor={0.9} />}
        {verResultante && !equilibrio && etiquetas && (
          <Etiqueta position={[BLOQUE[0] / 2 + 0.4 + R[0] * escala * 0.5 + 0.55, R[1] * escala * 0.5, 0.35]} className="etq-dato etq-centro etq-mal">
            ΣF
          </Etiqueta>
        )}
      </group>

      {/* polígono de fuerzas */}
      {etiquetas && (
        <group>
          {lados.map((l, i) => (
            <Flecha key={i} desde={l.desde} v={l.v} mat={matDe(l.color)} geo={geo} grosor={0.65} />
          ))}
          {!equilibrio && <Flecha desde={POLIGONO} v={[px - POLIGONO[0], py - POLIGONO[1]]} mat={mats.r} geo={geo} grosor={0.55} />}
          <Etiqueta position={[POLIGONO[0], POLIGONO[1] - 0.42, 0.3]} className={`etq-dato etq-centro ${equilibrio ? "etq-acento" : ""}`}>
            {equilibrio ? "ΣF = 0: el polígono cierra" : `ΣF = ${fmtN(modulo(R))} N`}
          </Etiqueta>
        </group>
      )}

      {previa && (
        <Etiqueta position={[0, -1.7, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
