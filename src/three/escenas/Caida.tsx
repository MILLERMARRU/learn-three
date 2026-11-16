// ══ Caída libre con foto estroboscópica: cambia la altura con − + ───────
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { useTeclas } from "@/lib/teclado";
import { emitirPolvo } from "@/lib/polvo";
import { sfx } from "@/lib/sonido";
import { Etiqueta } from "../Etiqueta";
import { COLORES, fmt, G, useMat } from "./comun";

const ESC = 0.72;
const SUELO = -2.05;
const R = 0.17;
const LENTO = 0.55;
const N_ESTELA = 9;

export function Caida({ exito, activo = true }: { exito: boolean; activo?: boolean }) {
  const [h, setH] = useState(3);
  useTeclas((e) => {
    if (!activo) return;
    if ((e.key === "-" || e.key === "_")) setH((x) => Math.max(1, x - 1));
    else if ((e.key === "+" || e.key === "=")) setH((x) => Math.min(5, x + 1));
    else return;
    sfx.seleccion();
  });
  const v = Math.sqrt(2 * G * h);
  const tope = SUELO + h * ESC + R;

  const bola = useRef<THREE.Mesh>(null!);
  const columna = useRef<THREE.Mesh>(null!);
  const plataforma = useRef<THREE.Mesh>(null!);
  const estela = useRef<THREE.InstancedMesh>(null!);
  const [impacto, setImpacto] = useState(false);
  const s = useRef({ t: 0, pausa: 0, sig: 0, n: 0, top: tope });
  const metal = useMat(COLORES.metal);
  const oscuro = useMat(COLORES.oscuro);
  const acento = useMat(COLORES.acento);
  const bolaMat = useMat({ color: "#86b2ff", roughness: 0.28, metalness: 0.1 });
  const estelaMat = useMat({ color: "#86b2ff", transparent: true, opacity: 0.13, depthWrite: false });
  const geo = useMemo(
    () => ({
      bola: new THREE.SphereGeometry(R, 40, 28),
      suelo: new THREE.CylinderGeometry(1.7, 1.85, 0.1, 64),
      columna: new THREE.BoxGeometry(0.16, 1, 0.16),
      plataforma: new RoundedBoxGeometry(0.8, 0.07, 0.5, 2, 0.03),
      tick: new THREE.BoxGeometry(0.22, 0.018, 0.02),
    }),
    [],
  );
  const tmp = useMemo(() => new THREE.Object3D(), []);

  // las copias de la estela empiezan fuera de la vista (por defecto estarían en el origen)
  useLayoutEffect(() => {
    tmp.position.set(0, -50, 0);
    tmp.updateMatrix();
    for (let i = 0; i < N_ESTELA; i++) estela.current.setMatrixAt(i, tmp.matrix);
    estela.current.instanceMatrix.needsUpdate = true;
  }, [tmp]);

  useFrame((_, dtCrudo) => {
    const dt = Math.min(0.05, dtCrudo);
    const S = s.current;
    S.top = THREE.MathUtils.damp(S.top, tope, 6, dt);
    columna.current.scale.y = S.top - SUELO - R;
    columna.current.position.y = (S.top - R + SUELO) / 2;
    plataforma.current.position.y = S.top - R - 0.035;

    if (S.pausa > 0) {
      S.pausa -= dt;
      if (S.pausa <= 0) {
        S.t = 0;
        S.n = 0;
        S.sig = 0;
        setImpacto(false);
        for (let i = 0; i < N_ESTELA; i++) {
          tmp.position.set(0, -50, 0);
          tmp.updateMatrix();
          estela.current.setMatrixAt(i, tmp.matrix);
        }
        estela.current.instanceMatrix.needsUpdate = true;
      }
      return;
    }
    S.t += dt * LENTO;
    const caida = 0.5 * G * S.t * S.t * ESC;
    let y = S.top - caida;
    // foto estroboscópica: una copia cada 0,12 s (en tiempo físico)
    if (S.t >= S.sig && S.n < N_ESTELA) {
      tmp.position.set(0.9, y, 0);
      tmp.updateMatrix();
      estela.current.setMatrixAt(S.n, tmp.matrix);
      estela.current.instanceMatrix.needsUpdate = true;
      S.n++;
      S.sig += 0.12;
    }
    if (y <= SUELO + R + 0.05) {
      y = SUELO + R + 0.05;
      S.pausa = 1.1;
      setImpacto(true);
      emitirPolvo({ pos: [0.9, SUELO + 0.1, 0], color: "#86b2ff", n: 60, radio: 0.15, fuerza: 0.7, vida: 1 });
    }
    bola.current.position.set(0.9, y, 0);
    bolaMat.emissive.set("#86b2ff").multiplyScalar(exito ? 0.4 : 0.06);
  });

  return (
    <group>
      <mesh geometry={geo.suelo} material={oscuro} position={[0.4, SUELO, 0]} />
      <mesh ref={columna} geometry={geo.columna} material={metal} position={[-0.3, 0, 0]} />
      <mesh ref={plataforma} geometry={geo.plataforma} material={acento} position={[0.45, 0, 0]} />
      {Array.from({ length: h + 1 }, (_, i) => (
        <mesh key={i} geometry={geo.tick} material={acento} position={[-0.3, SUELO + i * ESC + 0.05, 0.1]} />
      ))}
      <instancedMesh ref={estela} args={[geo.bola, estelaMat, N_ESTELA]} />
      <mesh ref={bola} geometry={geo.bola} material={bolaMat} position={[0.9, tope, 0]} />
      <Etiqueta visible={activo} position={[-0.55, SUELO + (h * ESC) / 2, 0]} className="etq-dato etq-izq">
        h = {h} m
      </Etiqueta>
      <Etiqueta visible={activo} position={[1.25, SUELO + 0.25, 0]} className={`etq-dato etq-medida ${impacto ? "" : "etq-tenue"}`}>
        v = {fmt(v, 1)} m/s
      </Etiqueta>
    </group>
  );
}
