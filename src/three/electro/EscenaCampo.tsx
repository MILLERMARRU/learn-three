// ══ Escena del campo eléctrico (Nivel 17): una o dos cargas, el punto P y la flecha del campo total en P ───────
// Las flechas van un poco por encima del eje para no tapar las cargas; la fantasma azul es la propuesta.
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Cargas (μC, con signo) y sus distancias a P (cm): la primera a la izquierda, la segunda a la derecha. */
  cargas: { q: number; d: number }[];
  /** Campo total (×10⁵ N/C), su sentido y el propuesto (null = sin fantasma). */
  E: number;
  sentido: 1 | -1;
  Epropuesto: number | null;
  textos: string[];
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const R = 0.26;
const Y_FL = 0.5; // altura de las flechas
const Y_REGLA = -1.3; // regla de las distancias, bajo los rótulos de las cargas
const Y_ROT = -0.92; // rótulos de las cargas, bajo sus líneas de campo
const DUR = 2.6;
const POS = new THREE.Color("#ff6a5a");
const NEG = new THREE.Color("#5aa9ff");
const suave = (x: number) => x * x * (3 - 2 * x);
/** Distancia dibujada (crece con la real) y largo de la flecha (base + proporcional). */
const dVis = (d: number) => 0.5 + 0.045 * d;
const largoDe = (E: number) => Math.min(3, 0.3 + 0.07 * E);

export function EscenaCampo({ cargas, E, sentido, Epropuesto, textos, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const sim = useRef({ id: -1, t: 0, fin: false });
  const flecha = useRef<THREE.Group>(null!);
  const aura = useRef<THREE.Group>(null!);
  // una carga: a la izquierda de P (P más a la derecha para dejar sitio a la flecha); dos: P en el centro
  const xP = cargas.length === 1 ? -0.4 + dVis(cargas[0].d) / 2 : 0;
  const xs = cargas.map((c, i) => (i === 0 ? xP - dVis(c.d) : xP + dVis(c.d)));

  const geo = useMemo(
    () => ({
      esfera: new THREE.SphereGeometry(R, 32, 24),
      punto: new THREE.SphereGeometry(0.07, 16, 12),
      caja: new THREE.BoxGeometry(1, 1, 1),
      punta: new THREE.ConeGeometry(0.11, 0.24, 16).rotateZ(-Math.PI / 2).translate(0.12, 0, 0),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      pos: new THREE.MeshStandardMaterial({ color: POS, emissive: POS, emissiveIntensity: 0.4, roughness: 0.35 }),
      neg: new THREE.MeshStandardMaterial({ color: NEG, emissive: NEG, emissiveIntensity: 0.4, roughness: 0.35 }),
      lineaPos: new THREE.MeshStandardMaterial({ color: POS, transparent: true, opacity: 0.45, depthWrite: false }),
      lineaNeg: new THREE.MeshStandardMaterial({ color: NEG, transparent: true, opacity: 0.45, depthWrite: false }),
      punto: new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 0.5 }),
      guia: new THREE.MeshStandardMaterial({ color: "#5d6673" }),
      campo: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.4 }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", emissive: "#86b2ff", emissiveIntensity: 0.4, transparent: true, opacity: 0.45, depthWrite: false }),
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
    if (exito) emitirPolvo({ pos: [xP + (sentido * largoDe(E)) / 2, Y_FL, 0.4], color: "#6fd6a8", n: 110, radio: 0.45, fuerza: 1 });
  }, [exito, xP, sentido, E]);

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
    const t = corrida ? S.t : 0;
    // primero aparecen las líneas de campo alrededor de las cargas; luego crece la flecha en P
    const a = suave(Math.min(1, t / 0.6));
    aura.current.scale.setScalar(Math.max(0.001, a));
    aura.current.visible = a > 0.001;
    const u = suave(Math.max(0, Math.min(1, (t - 0.6) / (DUR - 0.6))));
    flecha.current.scale.x = Math.max(0.001, u);
    flecha.current.visible = u > 0.001;
    if (corrida && !S.fin && S.t >= DUR - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  /** Flecha horizontal de largo l que apunta a +x desde su origen. */
  const dibujarFlecha = (l: number, mat: THREE.Material) => (
    <>
      <mesh geometry={geo.caja} material={mat} position={[Math.max(0, l - 0.24) / 2, 0, 0]} scale={[Math.max(0.001, l - 0.24), 0.07, 0.07]} />
      <mesh geometry={geo.punta} material={mat} position={[Math.max(0, l - 0.24), 0, 0]} />
    </>
  );
  return (
    <group>
      {/* cargas */}
      {cargas.map((c, i) => (
        <mesh key={i} geometry={geo.esfera} material={c.q > 0 ? mats.pos : mats.neg} position={[xs[i], 0, 0]} />
      ))}
      {/* líneas de campo cortas alrededor de cada carga (aparecen al empezar) */}
      <group ref={aura} visible={false}>
        {cargas.map((c, i) =>
          Array.from({ length: 10 }, (_, k) => {
            const ang = (k / 10) * Math.PI * 2;
            return (
              <mesh key={`${i}-${k}`} geometry={geo.caja} material={c.q > 0 ? mats.lineaPos : mats.lineaNeg} position={[xs[i] + Math.cos(ang) * 0.62, Math.sin(ang) * 0.62, -0.1]} rotation={[0, 0, ang]} scale={[0.5, 0.02, 0.02]} />
            );
          }),
        )}
      </group>
      {/* punto P y su guía hasta la altura de las flechas */}
      <mesh geometry={geo.punto} material={mats.punto} position={[xP, 0, 0]} />
      <mesh geometry={geo.caja} material={mats.guia} position={[xP, Y_FL / 2, 0]} scale={[0.012, Y_FL, 0.012]} />
      {/* reglas de las distancias a P */}
      {cargas.map((_, i) => (
        <mesh key={i} geometry={geo.caja} material={mats.guia} position={[(xs[i] + xP) / 2, Y_REGLA, 0.2]} scale={[Math.abs(xP - xs[i]), 0.012, 0.012]} />
      ))}
      {/* campo total en P y la fantasma */}
      <group position={[xP, Y_FL, 0.1]} scale={[sentido, 1, 1]}>
        <group ref={flecha} visible={false}>
          {dibujarFlecha(largoDe(E), mats.campo)}
        </group>
        {Epropuesto !== null && <group position={[0, 0, 0.05]}>{dibujarFlecha(largoDe(Epropuesto), mats.fantasma)}</group>}
      </group>
      {etiquetas && (
        <>
          {cargas.map((_, i) => (
            <Etiqueta key={`q${i}`} position={[xs[i], Y_ROT, 0.3]} className="etq-dato etq-abajo">
              {textos[i]}
            </Etiqueta>
          ))}
          {cargas.map((c, i) => (
            <Etiqueta key={`d${i}`} position={[(xs[i] + xP) / 2, Y_REGLA - 0.05, 0.3]} className="etq-dato etq-abajo">
              {c.d} cm
            </Etiqueta>
          ))}
          <Etiqueta position={[xP, -0.12, 0.3]} className="etq-dato etq-abajo">
            P
          </Etiqueta>
          {verValor && (
            <Etiqueta position={[xP + (sentido * largoDe(E)) / 2, Y_FL + 0.4, 0.3]} className={`etq-dato etq-centro ${exito ? "etq-acento" : ""}`}>
              E = {E} × 10⁵ N/C
            </Etiqueta>
          )}
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -1.7, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
