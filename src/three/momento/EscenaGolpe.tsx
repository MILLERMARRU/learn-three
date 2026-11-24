// ══ Escena del golpe (Nivel 11): un mazo golpea un disco en una mesa de aire; gráfica F–t con el área (impulso) y disco fantasma ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  m: number;
  /** Fuerza del golpe (N, con signo), velocidad antes (m/s, con signo) y forma de la gráfica F–t (cualitativa). */
  F: number;
  v0: number;
  forma: "rect" | "tri";
  /** Velocidad real después del golpe y la propuesta (fantasma; null = sin fantasma). */
  vReal: number;
  vFantasma: number | null;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

const R = 0.3; // radio del disco
const RM = 0.22; // radio del mazo
const X_GOLPE = 0;
const T_LLEGA = 0.9; // s reales que tarda en llegar al golpe si ya se movía
const T_GOLPE = 0.35; // s reales del contacto
const T_DESPUES = 2; // s reales después del golpe
const ANCHO_G = 1.2; // gráfica F–t
const ALTO_G = 0.6;
const fmt = (n: number) => String(n).replace("-", "−").replace(".", ",");

export function EscenaGolpe({ m, F, v0, forma, vReal, vFantasma, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  const lado = Math.sign(F) || 1; // el mazo empuja hacia este lado
  // escala de velocidad: el más rápido recorre ~3,8 u en el tramo final
  const s = 3.8 / (T_DESPUES * Math.max(Math.abs(vReal), Math.abs(vFantasma ?? 0), Math.abs(v0), 1));
  // si ya se movía, llega al golpe en T_LLEGA con su velocidad (misma escala que después del golpe)
  const tLlega = v0 !== 0 ? T_LLEGA : 0;
  const xInicio = X_GOLPE - v0 * s * tLlega;
  const tFin = tLlega + T_GOLPE + T_DESPUES;
  const xMazo = X_GOLPE - lado * (R + RM + 0.01);

  const disco = useRef<THREE.Group>(null!);
  const fantasma = useRef<THREE.Group>(null);
  const mazo = useRef<THREE.Group>(null!);
  const area = useRef<THREE.Mesh>(null!);
  const sim = useRef({ id: -1, t: 0, fin: false });

  const geo = useMemo(() => {
    // área bajo F–t: rectángulo o triángulo (se revela de izquierda a derecha durante el golpe)
    const forma2 = new THREE.Shape();
    forma2.moveTo(0, 0);
    if (forma === "tri") {
      forma2.lineTo(ANCHO_G / 2, ALTO_G);
      forma2.lineTo(ANCHO_G, 0);
    } else {
      forma2.lineTo(0, ALTO_G);
      forma2.lineTo(ANCHO_G, ALTO_G);
      forma2.lineTo(ANCHO_G, 0);
    }
    forma2.lineTo(0, 0);
    return {
      mesa: new THREE.BoxGeometry(1, 1, 1),
      disco: new THREE.CylinderGeometry(R, R, 0.12, 40),
      mazo: new THREE.CylinderGeometry(RM, RM, 0.16, 32),
      mango: new THREE.CylinderGeometry(0.06, 0.06, 0.32, 16),
      eje: new THREE.BoxGeometry(1, 0.015, 0.015),
      area: new THREE.ShapeGeometry(forma2),
    };
  }, [forma]);
  const mats = useMemo(
    () => ({
      mesa: new THREE.MeshStandardMaterial({ color: "#2f3a48", roughness: 0.35, metalness: 0.1 }),
      borde: new THREE.MeshStandardMaterial({ color: "#39404b", roughness: 0.6 }),
      disco: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.4, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.4, depthWrite: false, emissive: "#86b2ff", emissiveIntensity: 0.3 }),
      mazo: new THREE.MeshStandardMaterial({ color: "#ff9ecd", roughness: 0.5, emissive: "#ff9ecd", emissiveIntensity: 0.15 }),
      eje: new THREE.MeshStandardMaterial({ color: "#8a929d" }),
      area: new THREE.MeshStandardMaterial({ color: "#ff9ecd", transparent: true, opacity: 0.55, side: THREE.DoubleSide, emissive: "#ff9ecd", emissiveIntensity: 0.3 }),
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
    mats.disco.emissiveIntensity = exito ? 0.4 : 0;
    if (exito) emitirPolvo({ pos: [X_GOLPE, 0.3, 0.4], color: "#6fd6a8", n: 120, radio: 0.4, fuerza: 1.1 });
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
    const t = S.t;
    // posición del disco por tramos: llega, recibe el golpe y sale con su nueva velocidad
    let x = xInicio;
    let golpe = 0; // 0 → 1 durante el contacto
    if (corrida) {
      if (t < tLlega) x = xInicio + v0 * s * t;
      else if (t < tLlega + T_GOLPE) {
        x = X_GOLPE;
        golpe = (t - tLlega) / T_GOLPE;
      } else {
        x = X_GOLPE + vReal * s * (t - tLlega - T_GOLPE);
        golpe = 1;
      }
    }
    disco.current.position.x = x;
    if (fantasma.current && vFantasma !== null) {
      const despues = corrida && t >= tLlega + T_GOLPE;
      fantasma.current.visible = !!despues;
      fantasma.current.position.x = X_GOLPE + vFantasma * s * Math.max(0, t - tLlega - T_GOLPE);
    }
    // el mazo espera junto al punto de golpe, empuja un poco durante el contacto y se retira
    const empuje = golpe > 0 && golpe < 1 ? Math.sin(golpe * Math.PI) * 0.08 : 0;
    mazo.current.position.x = xMazo + lado * empuje - (golpe >= 1 ? lado * Math.min(0.5, (t - tLlega - T_GOLPE) * 2) : 0);
    // la gráfica se llena durante el golpe (antes de soltar se ve completa, como dato)
    area.current.scale.x = corrida ? Math.max(0.001, golpe) : 1;
    if (corrida && !S.fin && t >= tFin - 1e-9) {
      S.fin = true;
      onFin?.();
    }
  });

  const signoF = Math.sign(F) || 1;
  return (
    <group>
      {/* mesa de aire con bordes */}
      <mesh geometry={geo.mesa} material={mats.mesa} position={[0, -0.06, 0]} scale={[8.8, 0.12, 1.3]} />
      <mesh geometry={geo.mesa} material={mats.borde} position={[0, 0.03, -0.66]} scale={[8.8, 0.1, 0.06]} />

      <group ref={disco} position={[xInicio, 0, 0]}>
        <mesh geometry={geo.disco} material={mats.disco} position={[0, 0.06, 0]} />
        {etiquetas && !corrida && (
          <>
            <Etiqueta position={[0, 0.2, 0]} className="etq-dato etq-centro">
              {fmt(m)} kg
            </Etiqueta>
            {v0 !== 0 && (
              <Etiqueta position={[0, 0.2, 0.5]} className="etq-dato etq-abajo">
                v₀ = {fmt(v0)} m/s
              </Etiqueta>
            )}
          </>
        )}
      </group>
      {vFantasma !== null && (
        <group ref={fantasma} position={[X_GOLPE, 0, 0.35]} visible={false}>
          <mesh geometry={geo.disco} material={mats.fantasma} position={[0, 0.07, 0]} scale={[1.06, 1.1, 1.06]} />
        </group>
      )}
      <group ref={mazo} position={[xMazo, 0, 0]}>
        <mesh geometry={geo.mazo} material={mats.mazo} position={[0, 0.08, 0]} />
        <mesh geometry={geo.mango} material={mats.mazo} position={[0, 0.32, 0]} />
      </group>

      {/* gráfica F–t, arriba a la derecha (a la izquierda chocaba con el panel): el área es el impulso; si F es negativa, va bajo el eje */}
      <group position={[2, 1.5, 0]}>
        <mesh geometry={geo.eje} material={mats.eje} position={[0.8, 0, 0]} scale={[1.6, 1, 1]} />
        <mesh geometry={geo.eje} material={mats.eje} position={[0, signoF > 0 ? 0.4 : -0.4, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.85, 1, 1]} />
        <mesh ref={area} geometry={geo.area} material={mats.area} position={[0.15, 0, 0]} scale={[1, signoF, 1]} />
        {etiquetas && (
          <>
            <Etiqueta position={[0, signoF > 0 ? 0.85 : -0.85, 0]} className="etq-eje etq-centro">
              F
            </Etiqueta>
            {/* encima del extremo del eje: debajo chocaba con «área = impulso» en móvil */}
            <Etiqueta position={[1.72, signoF > 0 ? 0.3 : -0.06, 0]} className="etq-eje">
              t
            </Etiqueta>
            {/* del lado del eje donde no está el área */}
            <Etiqueta position={[0.75, signoF > 0 ? -0.06 : 0.28, 0]} className="etq-eje">
              área = impulso
            </Etiqueta>
          </>
        )}
      </group>

      {etiquetas && verValor && (
        <Etiqueta position={[X_GOLPE, 0.95, 0.3]} className={`etq-dato etq-centro ${exito ? "etq-acento" : ""}`}>
          v = {fmt(vReal)} m/s
        </Etiqueta>
      )}
      {previa && (
        <Etiqueta position={[0, -0.8, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
