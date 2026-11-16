// ══ Molécula dimensional: piezas en numerador / denominador con barra de fracción ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { BASES, canonica, type Base, type Dim } from "@/lib/dim";
import { layoutMolecula, MAX_COPIAS, type Vec3 } from "@/lib/layout-molecula";
import { Pieza, type FaseAnim, type Marca, type Variante } from "./Pieza";

const RANURAS = BASES.flatMap((b) => Array.from({ length: MAX_COPIAS }, (_, k) => ({ b, k })));

export interface MoleculaProps {
  dim: Dim;
  unidad?: boolean;
  variante?: Variante;
  marcas?: Partial<Record<Base, Marca>>;
  fase?: FaseAnim;
  faseId?: number;
  position?: Vec3;
  escala?: number;
  tips?: boolean;
  origen?: Vec3;
}

export function Molecula({ dim, unidad = false, variante = "solida", marcas, fase = "idle", faseId = 0, position = [0, 0, 0], escala = 1, tips = true, origen }: MoleculaProps) {
  const clave = canonica(dim);
  // el layout solo depende del texto canónico de la dimensión
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lay = useMemo(() => layoutMolecula(dim), [clave]);
  return (
    <group position={position} scale={escala}>
      {RANURAS.map(({ b, k }) => {
        const d = lay.pos.get(`${b}${k}`);
        return (
          <Pieza
            key={`${b}${k}`}
            tipo={b}
            activa={!unidad && !!d}
            destino={d}
            variante={variante}
            marca={marcas?.[b]}
            fase={fase}
            faseId={faseId}
            origen={origen}
            tip={tips}
            retraso={d ? (d[0] + 3) * 0.045 : 0}
          />
        );
      })}
      <Pieza tipo="U" activa={unidad} destino={[0, 0, 0]} variante={variante} fase={fase} faseId={faseId} origen={origen} tip={tips} />
      <Barra ancho={unidad ? 0 : lay.barra} y={lay.barraY} variante={variante} fase={fase} faseId={faseId} />
    </group>
  );
}

let GEO_BARRA: THREE.BufferGeometry | null = null;

function Barra({ ancho, y, variante, fase, faseId }: { ancho: number; y: number; variante: Variante; fase: FaseAnim; faseId: number }) {
  const m = useRef<THREE.Mesh>(null!);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#d9c3a0", emissive: "#d9c3a0", emissiveIntensity: 0.35, roughness: 0.3, metalness: 0.4, transparent: true }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  if (!GEO_BARRA) GEO_BARRA = new RoundedBoxGeometry(1, 0.07, 0.07, 2, 0.03);
  const a = useRef({ w: 0, faseId, t0: -10 });
  useFrame((st, dt) => {
    const A = a.current;
    const t = st.clock.elapsedTime;
    if (faseId !== A.faseId) {
      A.faseId = faseId;
      A.t0 = t;
    }
    const derrite = fase === "exito" ? Math.min(1, Math.max(0, (t - A.t0 - 0.35) / 0.45)) : 0;
    A.w = THREE.MathUtils.damp(A.w, ancho, 8, Math.min(0.05, dt));
    m.current.scale.set(Math.max(0.0001, A.w), 1, 1);
    m.current.position.y = THREE.MathUtils.damp(m.current.position.y, y, 8, Math.min(0.05, dt));
    m.current.visible = A.w > 0.02;
    mat.opacity = (variante === "fantasma" ? 0.2 : 1) * (1 - derrite);
  });
  return <mesh ref={m} geometry={GEO_BARRA} material={mat} />;
}
