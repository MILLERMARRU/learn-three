// ══ Pieza: una magnitud fundamental como objeto (regla, pesa, reloj de arena…) en porcelana + color ───────
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { INFO_BASE, type Base } from "@/lib/dim";
import type { Vec3 } from "@/lib/layout-molecula";
import { emitirPolvo } from "@/lib/polvo";
import { Etiqueta } from "./Etiqueta";
import { partesDe } from "./geometrias-piezas";

export type TipoPieza = Base | "U";
export type Variante = "solida" | "fantasma";
export type Marca = "ok" | "mal" | undefined;
export type FaseAnim = "idle" | "exito" | "error";

const PORCELANA = new THREE.Color("#ece4d4");
const FANTASMA = new THREE.Color("#9a9690");
const COLOR_U = "#d9c3a0";
const OK = new THREE.Color("#8fdcaa");
const MAL = new THREE.Color("#ff6f61");
// cuánto brilla el acento de cada objeto en reposo (la bombilla y el reloj de arena tienen luz propia)
const BRILLO: Record<TipoPieza, number> = { M: 0.1, L: 0.12, T: 0.28, θ: 0.2, I: 0.35, J: 0.55, N: 0.14, U: 0.25 };

const NOMBRE_OBJETO: Record<TipoPieza, string> = {
  M: "pesa", L: "regla", T: "reloj de arena", θ: "termómetro", I: "rayo", J: "bombilla", N: "molécula", U: "",
};

export const colorDe = (t: TipoPieza) => (t === "U" ? COLOR_U : INFO_BASE[t].color);

interface Props {
  tipo: TipoPieza;
  activa: boolean;
  destino?: Vec3;
  variante: Variante;
  marca?: Marca;
  fase: FaseAnim;
  faseId: number;
  origen?: Vec3;
  tip?: boolean;
  retraso?: number;
}

const suave = (x: number) => x * x * (3 - 2 * x);

export function Pieza({ tipo, activa, destino, variante, marca, fase, faseId, origen, tip = true, retraso = 0 }: Props) {
  const g = useRef<THREE.Group>(null!);
  const interior = useRef<THREE.Group>(null!);
  const color = colorDe(tipo);
  const base = useMemo(() => new THREE.Color(color), [color]);
  const partes = partesDe(tipo);
  const mats = useMemo(
    () => ({
      cuerpo: new THREE.MeshStandardMaterial({ color: PORCELANA, roughness: 0.42, metalness: 0.02, flatShading: tipo === "U" }),
      acento: new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.08 }),
    }),
    [color, tipo],
  );
  useEffect(
    () => () => {
      mats.cuerpo.dispose();
      mats.acento.dispose();
    },
    [mats],
  );
  const [hover, setHover] = useState(false);
  const [fasePh] = useState(() => Math.random() * 6.28);
  const a = useRef({ s: 0, estaba: false, faseId, fase: "idle" as FaseAnim, t0: -10, polvo: false });
  const w = useMemo(() => new THREE.Vector3(), []);

  useFrame((st, dtCrudo) => {
    const dt = Math.min(0.05, dtCrudo);
    const t = st.clock.elapsedTime;
    const A = a.current;
    const grp = g.current;
    if (faseId !== A.faseId) {
      A.faseId = faseId;
      A.fase = fase;
      A.t0 = t;
      A.polvo = false;
    }
    if (fase === "idle") A.fase = "idle";
    const desde = t - A.t0;

    // aparece: vuela desde su origen
    if (activa && !A.estaba) {
      if (origen) grp.position.set(origen[0], origen[1], origen[2]);
      else if (destino) grp.position.set(destino[0] * 1.4, destino[1] - 2.2, destino[2] + 2);
      A.s = 0;
    }
    A.estaba = activa;

    const fantasma = variante === "fantasma";
    let sObj = activa ? 1 : 0;
    let opac = fantasma ? 0.14 : 1;
    let emis = fantasma ? 0 : BRILLO[tipo];
    let tinte: THREE.Color = base;
    let rojo = 0;
    let temblor = 0;

    if (tipo === "J" && !fantasma) emis += 0.08 * Math.sin(t * 7 + fasePh);
    if (!fantasma && marca === "ok") {
      tinte = OK;
      emis = 0.3 + 0.12 * Math.sin(t * 6);
    } else if (!fantasma && marca === "mal") {
      tinte = MAL;
      emis = 0.45;
      rojo = 0.6;
    }
    if (A.fase === "error" && desde < 0.55 && marca === "mal") temblor = Math.sin(desde * 48) * 0.1 * (1 - desde / 0.55);

    // acierto: brilla, se convierte en polvo y se desvanece
    let brilloCuerpo = 0;
    if (A.fase === "exito" && activa && !fantasma) {
      const d = desde - retraso;
      if (d > 0) {
        if (d < 0.32) {
          emis += (d / 0.32) * 0.6;
          brilloCuerpo = (d / 0.32) * 0.35;
        } else {
          if (!A.polvo) {
            A.polvo = true;
            grp.getWorldPosition(w);
            emitirPolvo({ pos: [w.x, w.y, w.z], color, n: 150, radio: 0.4 });
          }
          const k = Math.min(1, (d - 0.32) / 0.45);
          opac = 1 - k;
          sObj = 1 + k * 0.25;
          emis = (emis + 0.6) * (1 - k);
          brilloCuerpo = 0.35 * (1 - k);
        }
      }
    }
    if (A.fase === "exito" && fantasma) opac = Math.max(0, 0.14 - desde * 0.4);

    if (destino && activa) {
      const flota = Math.sin(t * 1.3 + fasePh) * 0.035;
      grp.position.x = THREE.MathUtils.damp(grp.position.x, destino[0] + temblor, 9, dt);
      grp.position.y = THREE.MathUtils.damp(grp.position.y, destino[1] + flota, 9, dt);
      grp.position.z = THREE.MathUtils.damp(grp.position.z, destino[2], 9, dt);
    }
    A.s = THREE.MathUtils.damp(A.s, sObj, activa ? 9 : 14, dt);
    grp.scale.setScalar(Math.max(0.0001, A.s));
    grp.visible = A.s > 0.01 && opac > 0.01;

    // materiales: porcelana + acento de color
    const transp = opac < 0.999;
    for (const m of [mats.cuerpo, mats.acento]) {
      if (m.transparent !== transp) {
        m.transparent = transp;
        m.needsUpdate = true;
      }
      m.opacity = m === mats.acento && fantasma ? opac * 1.3 : opac;
      m.depthWrite = !fantasma;
    }
    mats.cuerpo.color.copy(fantasma ? FANTASMA : PORCELANA).lerp(MAL, rojo);
    mats.cuerpo.emissive.copy(base).multiplyScalar(brilloCuerpo);
    mats.acento.color.copy(base).lerp(MAL, rojo);
    mats.acento.emissive.copy(tinte).multiplyScalar(emis);

    // vida propia: cada objeto se mueve a su manera
    const r = interior.current.rotation;
    const tt = t + fasePh;
    if (tipo === "T") {
      // el reloj de arena se voltea cada 7 s
      const ciclo = Math.floor(tt / 7);
      const f = tt % 7;
      r.set(0, Math.sin(tt * 0.5) * 0.4, ciclo * Math.PI + (f > 6 ? suave(f - 6) * Math.PI : 0));
    } else if (tipo === "L") r.set(0, Math.sin(tt * 0.5) * 0.3, Math.sin(tt * 0.8) * 0.04);
    else if (tipo === "M" || tipo === "θ" || tipo === "I") r.set(0, Math.sin(tt * 0.55) * 0.45, 0);
    else {
      r.y += dt * 0.45;
      if (tipo === "N" || tipo === "U") r.x = Math.sin(tt * 0.4) * 0.3;
    }
  });

  const sobre = (e: ThreeEvent<PointerEvent>) => {
    if (variante !== "solida" || !tip) return;
    e.stopPropagation();
    setHover(true);
  };

  return (
    <group ref={g}>
      <group ref={interior} onPointerOver={sobre} onPointerOut={() => setHover(false)}>
        {partes.cuerpo && <mesh geometry={partes.cuerpo} material={mats.cuerpo} />}
        {partes.acento && <mesh geometry={partes.acento} material={mats.acento} />}
      </group>
      {hover && activa && (
        <Etiqueta position={[0, 0.66, 0]} className="etq-pieza">
          {tipo === "U" ? (
            <>
              <b>1</b> adimensional
            </>
          ) : (
            <>
              <b style={{ color }}>{tipo}</b> {INFO_BASE[tipo].nombre} · {INFO_BASE[tipo].simboloUnidad} <i>({NOMBRE_OBJETO[tipo]})</i>
            </>
          )}
        </Etiqueta>
      )}
    </group>
  );
}
