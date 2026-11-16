// ══ Onda en una cuerda tensa: − + cambia la tensión, M o clic cambia el grosor (μ) ───────
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useTeclas } from "@/lib/teclado";
import { sfx } from "@/lib/sonido";
import { Etiqueta } from "../Etiqueta";
import { COLORES, fmt, useMat } from "./comun";

const N = 84;
const X0 = -2.6;
const X1 = 2.3;
const K = 2.4;
const CUERDAS = [
  { mu: 0.01, r: 0.03, nombre: "fina" },
  { mu: 0.04, r: 0.045, nombre: "media" },
  { mu: 0.09, r: 0.064, nombre: "gruesa" },
];

export function Onda({ exito, activo = true }: { exito: boolean; activo?: boolean }) {
  const [Fi, setF] = useState(40);
  const [ci, setCi] = useState(1);
  const c = CUERDAS[ci];
  useTeclas((e) => {
    if (!activo) return;
    if ((e.key === "-" || e.key === "_")) setF((x) => Math.max(10, x - 10));
    else if ((e.key === "+" || e.key === "=")) setF((x) => Math.min(90, x + 10));
    else if (e.key.toLowerCase() === "m") setCi((i) => (i + 1) % CUERDAS.length);
    else return;
    sfx.seleccion();
  });
  const v = Math.sqrt(Fi / c.mu);

  const cuentas = useRef<THREE.InstancedMesh>(null!);
  const bloque = useRef<THREE.Mesh>(null!);
  const soga = useRef<THREE.Mesh>(null!);
  const s = useRef({ fase: 0, r: c.r, lado: 0.3 });
  const metal = useMat(COLORES.metal);
  const acento = useMat(COLORES.acento);
  const hiloMat = useMat(COLORES.hilo);
  const cuentaMat = useMat({ color: "#b49cff", roughness: 0.3, metalness: 0.1 });
  const bloqueMat = useMat({ color: "#f0b44c", roughness: 0.35, metalness: 0.2 });
  const geo = useMemo(
    () => ({
      poste: new THREE.CylinderGeometry(0.07, 0.09, 2.2, 24),
      polea: new THREE.TorusGeometry(0.16, 0.04, 12, 40),
      cuenta: new THREE.SphereGeometry(1, 16, 12),
      soga: new THREE.CylinderGeometry(0.008, 0.008, 1, 6),
      bloque: new THREE.BoxGeometry(1, 1, 1),
    }),
    [],
  );
  const tmp = useMemo(() => new THREE.Object3D(), []);

  useFrame((st, dtCrudo) => {
    const dt = Math.min(0.05, dtCrudo);
    const S = s.current;
    S.fase += K * v * 0.035 * dt;
    S.r = THREE.MathUtils.damp(S.r, c.r, 8, dt);
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      const x = X0 + u * (X1 - X0);
      // extremos fijos: envolvente seno
      const y = 0.38 * Math.sin(Math.PI * u) * Math.sin(K * x - S.fase);
      tmp.position.set(x, y + 0.6, 0);
      tmp.scale.setScalar(S.r);
      tmp.updateMatrix();
      cuentas.current.setMatrixAt(i, tmp.matrix);
    }
    cuentas.current.instanceMatrix.needsUpdate = true;
    // el bloque colgante representa la tensión
    S.lado = THREE.MathUtils.damp(S.lado, 0.22 + Math.cbrt(Fi) * 0.07, 6, dt);
    bloque.current.scale.setScalar(S.lado);
    const largoSoga = 1.4;
    soga.current.scale.y = largoSoga;
    bloque.current.position.y = 0.6 - 0.16 - largoSoga - S.lado / 2;
    cuentaMat.emissive.set("#b49cff").multiplyScalar(exito ? 0.45 + 0.2 * Math.sin(st.clock.elapsedTime * 6) : 0.06);
  });

  return (
    <group position={[0, -0.1, 0]}>
      <mesh geometry={geo.poste} material={metal} position={[X0 - 0.08, -0.45, 0]} />
      <mesh geometry={geo.poste} material={metal} position={[X1 + 0.22, -0.45, 0]} />
      <mesh geometry={geo.polea} material={acento} position={[X1 + 0.22, 0.6 - 0.16, 0.1]} />
      <instancedMesh
        ref={cuentas}
        args={[geo.cuenta, cuentaMat, N]}
        onClick={(e) => {
          e.stopPropagation();
              if (!activo) return;
          setCi((i) => (i + 1) % CUERDAS.length);
          sfx.seleccion();
        }}
      />
      <mesh ref={soga} geometry={geo.soga} material={hiloMat} position={[X1 + 0.38, 0.6 - 0.16 - 0.7, 0.1]} />
      <mesh ref={bloque} geometry={geo.bloque} material={bloqueMat} position={[X1 + 0.38, -1.2, 0.1]} />
      <Etiqueta visible={activo} position={[X1 + 0.62, -1.15, 0]} className="etq-dato">
        F = {Fi} N
      </Etiqueta>
      <Etiqueta visible={activo} position={[-1.2, 1.25, 0]} className="etq-dato">
        μ = {fmt(c.mu)} kg/m · {c.nombre}
      </Etiqueta>
      <Etiqueta visible={activo} position={[0, -0.75, 0]} className="etq-dato etq-medida">
        v = {fmt(v, 1)} m/s
      </Etiqueta>
    </group>
  );
}
