// ══ Escena de la pista (Nivel 10): un carrito baja y sube sin rozamiento; fantasma con la rapidez propuesta o bandera de altura ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "../Etiqueta";

interface Props {
  tipo: "v" | "h";
  /** Altura de partida (m), rapidez inicial (m/s) y altura donde se mide la rapidez (m). */
  h1: number;
  v0: number;
  h2: number;
  /** Valor real (rapidez en h₂ o altura máxima) y propuesto (null = sin fantasma ni bandera). */
  real: number;
  propuesta: number | null;
  verValor?: boolean;
  corrida?: { id: number } | null;
  onFin?: () => void;
  exito?: boolean;
  previa?: string;
}

// tramos de la pista (x): plataforma de salida, bajada, valle, subida y plataforma final
const X0 = -4.3;
const XA = -3.2;
const XB = -0.9;
const XC = 0.7;
const XD = 3.5;
const X1 = 4.4;
const ALTO = 2.3; // alto visual de la subida
const G = 10;
const DUR = 3; // s reales aproximados de la corrida
const fmt = (n: number) => String(n).replace(".", ",");

/** Perfil de la pista: altura visual en x para una plataforma de salida de altura H1. */
function alturaPista(x: number, H1: number): number {
  if (x <= XA) return H1;
  if (x <= XB) return (H1 * (1 + Math.cos((Math.PI * (x - XA)) / (XB - XA)))) / 2;
  if (x <= XC) return 0;
  if (x <= XD) return (ALTO * (1 - Math.cos((Math.PI * (x - XC)) / (XD - XC)))) / 2;
  return ALTO;
}

export function EscenaPista({ tipo, h1, v0, h2, real, propuesta, verValor = false, corrida = null, onFin, exito = false, previa }: Props) {
  const etiquetas = previa === undefined;
  // escala: la subida mide 1,3 veces la altura «de energía», hasta donde llegaría el carrito
  const hE = h1 + (v0 * v0) / (2 * G);
  const k = ALTO / (1.3 * hE);
  const H1 = h1 * k;
  const gv = G * k;
  const v0v = v0 * k;

  const y = (x: number) => alturaPista(x, H1);
  const pendiente = (x: number) => (y(x + 1e-3) - y(x - 1e-3)) / 2e-3;
  const xSubida = (yy: number) => XC + ((XD - XC) * Math.acos(Math.max(-1, Math.min(1, 1 - (2 * yy) / ALTO)))) / Math.PI;
  const xBajada = (yy: number) => (H1 > 0 ? XA + ((XB - XA) * Math.acos(Math.max(-1, Math.min(1, (2 * yy) / H1 - 1)))) / Math.PI : XB);
  // punto donde se mide la rapidez y donde aparece el fantasma
  const xP = tipo === "v" ? (h2 > 0 ? xBajada(h2 * k) : XB) : XB;
  const xBandera = propuesta !== null && tipo === "h" ? xSubida(Math.min(ALTO, propuesta * k)) : 0;
  const xTope = xSubida(Math.min(ALTO, hE * k));
  const xInicio = XA + 0.02;
  // compresión del tiempo: con la rapidez máxima, la pista se recorre en unos DUR segundos
  const vMaxV = Math.sqrt(v0v * v0v + 2 * gv * H1);
  const c = (X1 - XA) / (DUR * 0.75 * vMaxV);

  const carro = useRef<THREE.Group>(null!);
  const fantasma = useRef<THREE.Group>(null);
  const barraEc = useRef<THREE.Mesh>(null!);
  const barraEp = useRef<THREE.Mesh>(null!);
  const sim = useRef({ id: -1, t: 0, fin: false, x: xInicio, xf: NaN, vfin: false });

  const geo = useMemo(() => {
    // tubo de la pista: muestrea el perfil (se rehace solo si cambia la altura de salida)
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 160; i++) {
      const x = X0 + ((X1 - X0) * i) / 160;
      pts.push(new THREE.Vector3(x, alturaPista(x, H1) - 0.05, 0));
    }
    return {
      pista: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 220, 0.05, 8, false),
      caja: new THREE.BoxGeometry(1, 1, 1),
      rueda: new THREE.CylinderGeometry(0.07, 0.07, 0.05, 16).rotateX(Math.PI / 2),
      asta: new THREE.BoxGeometry(0.025, 0.5, 0.025),
      tela: new THREE.BoxGeometry(0.26, 0.15, 0.01),
    };
  }, [H1]);
  const mats = useMemo(
    () => ({
      pista: new THREE.MeshStandardMaterial({ color: "#8a929d", roughness: 0.5, metalness: 0.3 }),
      carro: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.5, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      rueda: new THREE.MeshStandardMaterial({ color: "#2a3038" }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#86b2ff", transparent: true, opacity: 0.38, depthWrite: false, emissive: "#86b2ff", emissiveIntensity: 0.3 }),
      bandera: new THREE.MeshStandardMaterial({ color: "#86b2ff", emissive: "#86b2ff", emissiveIntensity: 0.35 }),
      asta: new THREE.MeshStandardMaterial({ color: "#c9b48d" }),
      ec: new THREE.MeshStandardMaterial({ color: "#6fd6a8", emissive: "#6fd6a8", emissiveIntensity: 0.3 }),
      ep: new THREE.MeshStandardMaterial({ color: "#86b2ff", emissive: "#86b2ff", emissiveIntensity: 0.3 }),
      fondoBarra: new THREE.MeshStandardMaterial({ color: "#2a3038" }),
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
    mats.carro.emissiveIntensity = exito ? 0.4 : 0;
    if (exito) emitirPolvo({ pos: [tipo === "h" ? xTope : xP, (tipo === "h" ? hE * k : h2 * k) + 0.3, 0.4], color: "#6fd6a8", n: 120, radio: 0.4, fuerza: 1.1 });
  }, [exito, mats, tipo, xTope, xP, hE, k, h2]);

  /** Coloca un carrito sobre la pista en x, inclinado según la pendiente. */
  const colocar = (g: THREE.Group | null, x: number) => {
    if (!g) return;
    g.position.set(x, y(x), 0);
    g.rotation.z = Math.atan(pendiente(x));
  };

  useFrame((_, dtCrudo) => {
    const dt = Math.min(0.05, dtCrudo);
    const S = sim.current;
    if (corrida && corrida.id !== S.id) {
      S.id = corrida.id;
      S.t = 0;
      S.fin = false;
      S.x = xInicio;
      S.xf = NaN;
      S.vfin = false;
    }
    if (!corrida) {
      S.id = -1;
      S.fin = false;
      S.x = xInicio;
      S.xf = NaN;
    }
    // rapidez (unidades/s) a partir de la energía: v² = v₀² + 2g(h₁ − y)
    const v2Real = (x: number) => v0v * v0v + 2 * gv * (H1 - y(x));
    const eTotal = v0v * v0v + 2 * gv * H1;
    if (corrida && !S.fin) {
      const paso = dt * c;
      S.t += dt;
      // avance real: se integra por subpasos para seguir bien la curva
      for (let i = 0; i < 4; i++) {
        const v2 = v2Real(S.x);
        // cerca del punto más alto la rapidez tiende a 0: se completa el último tramo de una vez
        if (S.x > XC && v2 <= 0.01 * eTotal) {
          S.x = xTope; // se detiene en la altura máxima
          S.vfin = true;
          break;
        }
        S.x += (Math.sqrt(Math.max(v2, 1e-4)) / Math.sqrt(1 + pendiente(S.x) ** 2)) * (paso / 4);
        if (S.x >= X1 - 0.1) {
          S.x = X1 - 0.1;
          S.vfin = true;
          break;
        }
      }
      // el fantasma aparece en el punto de medida con la rapidez propuesta y sigue con su propia energía
      if (tipo === "v" && propuesta !== null) {
        if (Number.isNaN(S.xf) && S.x >= xP) S.xf = xP;
        if (!Number.isNaN(S.xf)) {
          const pv = propuesta * k;
          const yP = y(xP);
          for (let i = 0; i < 4; i++) {
            const v2 = pv * pv + 2 * gv * (yP - y(S.xf));
            if (S.xf > XC && v2 <= 0.01 * eTotal) break;
            S.xf = Math.min(X1 - 0.1, S.xf + (Math.sqrt(Math.max(v2, 1e-4)) / Math.sqrt(1 + pendiente(S.xf) ** 2)) * (paso / 4));
          }
        }
      }
      if (S.vfin || S.t > DUR * 2.5) {
        S.fin = true;
        onFin?.();
      }
    }
    colocar(carro.current, S.x);
    if (fantasma.current) {
      fantasma.current.visible = !Number.isNaN(S.xf);
      if (!Number.isNaN(S.xf)) colocar(fantasma.current, S.xf);
    }
    // barras de energía del carrito real: cinética (verde) y potencial (azul)
    const fEc = Math.max(0, Math.min(1, v2Real(S.x) / eTotal));
    barraEc.current.scale.x = Math.max(0.001, 1.6 * fEc);
    barraEc.current.position.x = -0.8 + 0.8 * fEc;
    barraEp.current.scale.x = Math.max(0.001, 1.6 * (1 - fEc));
    barraEp.current.position.x = -0.8 + 0.8 * (1 - fEc);
  });

  const auto = (mat: THREE.Material) => (
    <>
      <mesh geometry={geo.caja} material={mat} position={[0, 0.17, 0]} scale={[0.42, 0.2, 0.3]} />
      <mesh geometry={geo.rueda} material={mats.rueda} position={[-0.13, 0.05, 0.16]} />
      <mesh geometry={geo.rueda} material={mats.rueda} position={[0.13, 0.05, 0.16]} />
    </>
  );

  return (
    <group>
      <mesh geometry={geo.pista} material={mats.pista} />
      {/* regla de la altura de salida, bajo la plataforma (ahí no pasa nada) */}
      {H1 > 0.05 && <mesh geometry={geo.caja} material={mats.regla} position={[XA - 0.6, (H1 - 0.1) / 2, 0]} scale={[0.02, Math.max(0.01, H1 - 0.1), 0.02]} />}
      <group ref={carro} position={[xInicio, H1, 0]}>
        {auto(mats.carro)}
      </group>
      {tipo === "v" && propuesta !== null && (
        <group ref={fantasma} position={[xP, y(xP), 0]} visible={false}>
          <group position={[0, 0, 0.35]} scale={1.06}>
            {auto(mats.fantasma)}
          </group>
        </group>
      )}
      {/* la bandera marca la altura propuesta en la subida */}
      {tipo === "h" && propuesta !== null && (
        <group position={[xBandera, y(xBandera), -0.2]}>
          <mesh geometry={geo.asta} material={mats.asta} position={[0, 0.25, 0]} />
          <mesh geometry={geo.tela} material={mats.bandera} position={[0.13, 0.43, 0]} />
        </group>
      )}

      {/* barras de energía, arriba del valle (ahí no pasa nada) */}
      <group position={[0, ALTO + 0.15, 0]}>
        <mesh geometry={geo.caja} material={mats.fondoBarra} position={[0, 0, -0.02]} scale={[1.64, 0.12, 0.01]} />
        <mesh ref={barraEc} geometry={geo.caja} material={mats.ec} scale={[0.001, 0.1, 0.02]} />
        <mesh geometry={geo.caja} material={mats.fondoBarra} position={[0, -0.24, -0.02]} scale={[1.64, 0.12, 0.01]} />
        <mesh ref={barraEp} geometry={geo.caja} material={mats.ep} position={[0, -0.24, 0]} scale={[1.6, 0.1, 0.02]} />
        {etiquetas && (
          <>
            <Etiqueta position={[-0.9, 0, 0]} className="etq-eje etq-izq">
              Ec
            </Etiqueta>
            <Etiqueta position={[-0.9, -0.24, 0]} className="etq-eje etq-izq">
              Ep
            </Etiqueta>
          </>
        )}
      </group>

      {etiquetas && (
        <>
          {h1 > 0 && (
            <Etiqueta position={[XA - 0.65, H1 / 2, 0.2]} className="etq-dato etq-izq">
              h₁ = {fmt(h1)} m
            </Etiqueta>
          )}
          {v0 > 0 && !corrida && (
            <Etiqueta position={[xInicio, H1 + 0.4, 0.2]} className="etq-dato etq-centro">
              v₀ = {v0} m/s
            </Etiqueta>
          )}
          {tipo === "v" && (
            // abajo: bajo el valle · a media bajada: a la izquierda del punto, bajo la rampa (ahí no pasa nada)
            <Etiqueta position={h2 > 0 ? [xP - 0.12, y(xP) - 0.2, 0.3] : [xP, y(xP) - 0.12, 0.3]} className={`etq-dato ${h2 > 0 ? "etq-izq" : "etq-abajo"} ${verValor && exito ? "etq-acento" : ""}`}>
              {h2 > 0 ? `h₂ = ${fmt(h2)} m` : "abajo"}
              {verValor ? ` · v = ${real} m/s` : ""}
            </Etiqueta>
          )}
          {tipo === "h" && propuesta !== null && (
            <Etiqueta position={[xBandera + 0.3, y(xBandera) + 0.43, -0.2]} className="etq-dato">
              {propuesta} m
            </Etiqueta>
          )}
          {tipo === "h" && verValor && (
            <Etiqueta position={[xTope, hE * k - 0.12, 0.3]} className={`etq-dato etq-abajo ${exito ? "etq-acento" : ""}`}>
              h = {real} m
            </Etiqueta>
          )}
        </>
      )}
      {previa && (
        <Etiqueta position={[0, -0.7, 0.3]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
