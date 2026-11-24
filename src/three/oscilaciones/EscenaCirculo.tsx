// ══ Escena MAS-círculo (Nivel 12): un punto gira en un círculo y su sombra sobre el eje hace un MAS; punto fantasma ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  /** Amplitud (m), frecuencia angular real (rad/s) y la del fantasma (null = sin fantasma). */
  A: number;
  w: number;
  wFantasma: number | null;
  /** Distancia del centro donde se mide la rapidez (0 = sin marca). */
  x: number;
  /** Rótulo del resultado (al acertar, o en el examen); null = oculto. */
  rotulo?: string | null;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const R = 1.3; // radio visual del círculo
const CY = 1.35; // centro del círculo
const Y_EJE = -0.2; // eje donde oscila la sombra
const T_VIS = 2; // s reales por vuelta del punto real
const VUELTAS = 2;
const fmt = (n: number) => String(n).replace(".", ",");

export function EscenaCirculo({ A, w, wFantasma, x, rotulo = null, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const tFin = T_VIS * VUELTAS;
  const xMarca = (x / A) * R;

  const punto = useRef<THREE.Mesh>(null!);
  const radio = useRef<THREE.Mesh>(null!);
  const sombra = useRef<THREE.Group>(null!);
  const guia = useRef<THREE.Mesh>(null!);
  const pFan = useRef<THREE.Mesh>(null);
  const sFan = useRef<THREE.Group>(null);
  const sim = useRef({ id: -1, t: 0, fin: false });

  const geo = useMemo(
    () => ({
      aro: new THREE.TorusGeometry(R, 0.012, 8, 128),
      bola: new THREE.SphereGeometry(0.1, 24, 16),
      barra: new THREE.BoxGeometry(1, 0.016, 0.016),
      caja: new THREE.BoxGeometry(1, 1, 1),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      aro: new THREE.MeshStandardMaterial({ color: "#8a929d", transparent: true, opacity: 0.6 }),
      punto: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.35 }),
      radio: new THREE.MeshStandardMaterial({ color: "#d9c3a0" }),
      guia: new THREE.MeshStandardMaterial({ color: "#5d6673", transparent: true, opacity: 0.6 }),
      eje: new THREE.MeshStandardMaterial({ color: "#39404b" }),
      bloque: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.5, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.45, depthWrite: false, emissive: "#86b2ff", emissiveIntensity: 0.3 }),
      marca: new THREE.MeshStandardMaterial({ color: "#86b2ff", emissive: "#86b2ff", emissiveIntensity: 0.3 }),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((mt) => mt.dispose());
    },
    [geo, mats],
  );
  useEffect(() => {
    mats.bloque.emissiveIntensity = exito ? 0.4 : 0;
    if (exito) emitirPolvo({ pos: [0, CY, 0.4], color: "#6fd6a8", n: 110, radio: 0.5, fuerza: 1 });
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
    if (corrida && !S.fin) S.t = Math.min(tFin, S.t + d);
    // el punto real da una vuelta en T_VIS; parte del extremo derecho (θ = 0) y gira en sentido antihorario
    const th = (2 * Math.PI * S.t) / T_VIS;
    const px = R * Math.cos(th);
    const py = CY + R * Math.sin(th);
    punto.current.position.set(px, py, 0.05);
    radio.current.position.set(px / 2, CY + (py - CY) / 2, 0.02);
    radio.current.rotation.z = th;
    sombra.current.position.x = px;
    // guía vertical del punto a su sombra
    guia.current.position.set(px, (py + Y_EJE + 0.2) / 2, 0);
    guia.current.scale.y = Math.max(0.01, py - Y_EJE - 0.2);
    if (wFantasma !== null) {
      const thf = th * (wFantasma / w);
      pFan.current?.position.set(R * Math.cos(thf), CY + R * Math.sin(thf), 0.12);
      if (sFan.current) {
        sFan.current.visible = !!corrida;
        sFan.current.position.x = R * Math.cos(thf);
      }
      if (pFan.current) pFan.current.visible = !!corrida;
    }
    if (corrida && !S.fin && S.t >= tFin - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  return (
    <group>
      <mesh geometry={geo.aro} material={mats.aro} position={[0, CY, 0]} />
      <mesh ref={radio} geometry={geo.barra} material={mats.radio} position={[R / 2, CY, 0.02]} scale={[R, 1, 1]} />
      <mesh ref={punto} geometry={geo.bola} material={mats.punto} position={[R, CY, 0.05]} />
      <mesh ref={guia} geometry={geo.caja} material={mats.guia} position={[R, (CY + Y_EJE + 0.2) / 2, 0]} scale={[0.008, CY - Y_EJE - 0.2, 0.008]} />
      {/* eje de la oscilación y la sombra (un bloque) */}
      <mesh geometry={geo.caja} material={mats.eje} position={[0, Y_EJE - 0.04, 0]} scale={[2 * R + 0.8, 0.04, 0.4]} />
      <group ref={sombra} position={[R, 0, 0]}>
        <mesh geometry={geo.caja} material={mats.bloque} position={[0, Y_EJE + 0.1, 0]} scale={[0.28, 0.2, 0.3]} />
      </group>
      {wFantasma !== null && (
        <>
          <mesh ref={pFan} geometry={geo.bola} material={mats.fantasma} position={[R, CY, 0.12]} scale={1.2} visible={false} />
          <group ref={sFan} position={[R, 0, 0.25]} visible={false}>
            <mesh geometry={geo.caja} material={mats.fantasma} position={[0, Y_EJE + 0.1, 0]} scale={[0.3, 0.22, 0.3]} />
          </group>
        </>
      )}
      {x > 0 && <mesh geometry={geo.caja} material={mats.marca} position={[xMarca, Y_EJE - 0.04, 0.22]} scale={[0.025, 0.12, 0.02]} />}
      {/* regla de la amplitud: del centro al extremo izquierdo (a la derecha va la marca de x) */}
      <mesh geometry={geo.caja} material={mats.guia} position={[-R / 2, Y_EJE - 0.2, 0]} scale={[R, 0.012, 0.012]} />

      {etiquetas && (
        <>
          <Etiqueta position={[-R / 2, Y_EJE - 0.24, 0.2]} className="etq-dato etq-abajo">
            A = {fmt(A)} m
          </Etiqueta>
          <Etiqueta position={[-R * 0.75 - 0.15, CY + R * 0.75, 0]} className="etq-dato etq-izq">
            ω = {fmt(w)} rad/s
          </Etiqueta>
          {x > 0 && (
            <Etiqueta position={[xMarca, Y_EJE - 0.12, 0.2]} className="etq-dato etq-abajo">
              x = {fmt(x)} m
            </Etiqueta>
          )}
          {rotulo && (
            <Etiqueta position={[0, CY + R + 0.25, 0.3]} className={`etq-dato etq-centro ${exito ? "etq-acento" : ""}`}>
              {rotulo}
            </Etiqueta>
          )}
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -0.9, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
