// ══ Escena de tiros (Nivel 4): suelo con regla, torre o acantilado, cañón, pelota con estela estroboscópica, flechas de velocidad, canasta y marca de altura ───────
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { emitirPolvo } from "@/lib/polvo";
import { sfx } from "@/lib/sonido";
import { componentes, posicion, tSuelo, type Lanzamiento } from "@/lib/tiro";
import { Etiqueta } from "../Etiqueta";

export interface MarcaAltura {
  y: number;
  editable: boolean;
  onCambio?: (y: number) => void;
  paso: number;
}

interface Props {
  /** Campo visible en metros: ancho W y alto H. */
  W: number;
  H: number;
  lanz: Lanzamiento;
  /** Altura de la torre o acantilado bajo el punto de lanzamiento (0 = sin torre). */
  torre?: number;
  /** x de la canasta en el suelo. */
  canasta?: number | null;
  /** Marca de altura editable (caída libre). */
  marca?: MarcaAltura | null;
  fantasma?: number | null;
  /** Trayectoria guía, punteada y tenue. */
  guia?: Lanzamiento | null;
  /** Simulación en curso: `id` cambia en cada corrida y dura `tFin` segundos físicos (o hasta tocar el suelo). */
  corrida?: { id: number; tFin: number } | null;
  onFin?: (p: { x: number; y: number; t: number }) => void;
  etiquetas?: boolean;
  /** Regla horizontal con distancias (en caída libre no hace falta). */
  reglaX?: boolean;
  exito?: boolean;
  /** Vista previa del carrusel: sin etiquetas; si el texto no está vacío, va como rótulo debajo. */
  previa?: string;
}

const ANCHO = 8.4; // unidades 3D máximas del campo
const ALTO = 4.8;
const R = 0.13; // radio de la pelota
const N_ESTELA = 90;
const N_GUIA = 36;
const ANCHO_TORRE = 0.9;
const PROF = 1.3; // profundidad del suelo
const COLOR_VX = "#86b2ff";
const COLOR_VY = "#ff8a5c";

/** Separación "redonda" para las marcas de una regla. */
export function pasoBonito(rango: number, divisiones = 6) {
  const crudo = rango / divisiones;
  for (const p of [1, 2, 5, 10, 20, 25, 50, 100, 200]) if (p >= crudo) return p;
  return 500;
}

const fmt = (n: number, d = 1) => (Math.round(n * 10 ** d) / 10 ** d).toString().replace(".", ",").replace("-", "−");

export function EscenaTiro({ W, H, lanz, torre = 0, canasta = null, marca = null, fantasma = null, guia = null, corrida = null, onFin, etiquetas: conEtiquetas = true, reglaX = true, exito = false, previa }: Props) {
  const etiquetas = conEtiquetas && previa === undefined;
  const K = Math.min(ANCHO / W, ALTO / H);
  const X = (m: number) => (m - W / 2) * K;
  const Y = (m: number) => (m - H / 2) * K;
  const cadaX = pasoBonito(W);
  const cadaY = pasoBonito(H, 5);
  const vertical = Math.abs(componentes(lanz)[0]) < 1e-9;
  const xTorreDer = X(lanz.x0) - R - 0.02;
  const xRegla = (torre > 0 ? xTorreDer - ANCHO_TORRE : Math.min(X(lanz.x0), X(0))) - 0.45;
  const xSueloIzq = xRegla - 0.35;
  const xSueloDer = X(W) + 0.45;
  const xMarcaDer = X(lanz.x0) + 0.75;
  const fin = tSuelo(lanz);
  // escala de las flechas: la rapidez máxima (al tocar el suelo) mide ~1,1 u
  const vMax = Math.max(10, Math.hypot(componentes(lanz)[0], Math.abs(posicion(lanz, fin).vy)));
  const kv = 1.1 / vMax;

  const raiz = useRef<THREE.Group>(null!);
  const bola = useRef<THREE.Group>(null!);
  const flechaX = useRef<THREE.Group>(null!);
  const flechaY = useRef<THREE.Group>(null!);
  const estela = useRef<THREE.InstancedMesh>(null!);
  const puntosGuia = useRef<THREE.InstancedMesh>(null!);
  const etqT = useRef<HTMLSpanElement | null>(null);
  const etqV = useRef<HTMLSpanElement | null>(null);
  const etqVx = useRef<HTMLSpanElement | null>(null);
  const etqVy = useRef<HTMLSpanElement | null>(null);
  const sim = useRef({ id: -1, t: 0, fin: false, toco: false });
  const arrastrando = useRef(false);
  const ayuda = useMemo(() => ({ o: new THREE.Object3D(), p: new THREE.Vector3() }), []);

  const geo = useMemo(
    () => ({
      caja: new THREE.BoxGeometry(1, 1, 1),
      bola: new THREE.SphereGeometry(R, 24, 16),
      punto: new THREE.SphereGeometry(0.045, 10, 8),
      tubo: new THREE.CylinderGeometry(0.022, 0.022, 1, 8).translate(0, 0.5, 0),
      punta: new THREE.ConeGeometry(0.065, 0.16, 14).translate(0, 0.08, 0),
      canon: new THREE.CylinderGeometry(0.08, 0.1, 0.62, 18).translate(0, 0.2, 0),
      vaso: new THREE.CylinderGeometry(0.3, 0.22, 0.34, 26, 1, true),
      aro: new THREE.TorusGeometry(0.3, 0.026, 8, 36).rotateX(Math.PI / 2),
      flecha: new THREE.ConeGeometry(0.07, 0.16, 3).rotateZ(-Math.PI / 2),
      sup: new THREE.PlaneGeometry(1, 1),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      suelo: new THREE.MeshStandardMaterial({ color: "#20252c", roughness: 0.85 }),
      torre: new THREE.MeshStandardMaterial({ color: "#39404b", roughness: 0.75 }),
      regla: new THREE.MeshStandardMaterial({ color: "#8a929d", roughness: 0.5 }),
      acento: new THREE.MeshStandardMaterial({ color: "#d9c3a0", emissive: "#d9c3a0", emissiveIntensity: 0.15 }),
      bola: new THREE.MeshStandardMaterial({ color: "#f4efe6", roughness: 0.35, emissive: "#f0b44c", emissiveIntensity: 0.05 }),
      estela: new THREE.MeshStandardMaterial({ color: "#f0b44c", transparent: true, opacity: 0.5, depthWrite: false }),
      guia: new THREE.MeshBasicMaterial({ color: "#d9c3a0", transparent: true, opacity: 0.28, depthWrite: false }),
      vx: new THREE.MeshStandardMaterial({ color: COLOR_VX, emissive: COLOR_VX, emissiveIntensity: 0.25 }),
      vy: new THREE.MeshStandardMaterial({ color: COLOR_VY, emissive: COLOR_VY, emissiveIntensity: 0.25 }),
      canasta: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.4, side: THREE.DoubleSide, emissive: "#6fd6a8", emissiveIntensity: 0 }),
      marca: new THREE.MeshStandardMaterial({ color: "#f0b44c", emissive: "#f0b44c", emissiveIntensity: 0.4 }),
      fantasma: new THREE.MeshStandardMaterial({ color: "#f0b44c", transparent: true, opacity: 0.25, depthWrite: false }),
      sup: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
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

  // brillo de éxito en pelota y canasta
  useEffect(() => {
    mats.bola.emissiveIntensity = exito ? 0.45 : 0.05;
    mats.canasta.emissiveIntensity = exito ? 0.5 : 0;
  }, [exito, mats]);

  // trayectoria guía (fija)
  useLayoutEffect(() => {
    const m = puntosGuia.current;
    if (!m) return;
    if (!guia) {
      m.count = 0;
      return;
    }
    const tf = tSuelo(guia);
    for (let i = 0; i < N_GUIA; i++) {
      const p = posicion(guia, (tf * (i + 1)) / N_GUIA);
      ayuda.o.position.set(X(p.x), Y(Math.max(0, p.y)) + R, 0);
      ayuda.o.scale.setScalar(1);
      ayuda.o.updateMatrix();
      m.setMatrixAt(i, ayuda.o.matrix);
    }
    m.count = N_GUIA;
    m.instanceMatrix.needsUpdate = true;
  });

  useFrame((_, dtCrudo) => {
    const dt = Math.min(0.05, dtCrudo);
    const S = sim.current;
    if (corrida && corrida.id !== S.id) {
      S.id = corrida.id;
      S.t = 0;
      S.fin = false;
      S.toco = false;
    }
    if (!corrida) {
      S.id = -1;
      S.t = 0;
      S.fin = false;
      S.toco = false;
    }
    const tMax = corrida ? Math.min(corrida.tFin, fin) : 0;
    if (corrida && !S.fin) {
      // la corrida dura entre ~1,5 y 3 s reales aunque el tiempo físico sea mayor
      S.t = Math.min(tMax, S.t + dt * Math.max(1, tMax / 3));
    }
    const p = posicion(lanz, S.t);
    const y = Math.max(0, p.y);
    bola.current.position.set(X(p.x), Y(y) + R, 0);

    // flechas de velocidad (componentes)
    const fx = flechaX.current;
    const fy = flechaY.current;
    const lx = p.vx * kv;
    const ly = p.vy * kv;
    const enMarcha = !!corrida && S.t > 0 && !S.toco;
    fx.visible = enMarcha && Math.abs(lx) > 0.04;
    fy.visible = enMarcha && Math.abs(ly) > 0.04;
    fx.position.copy(bola.current.position).setZ(0.2);
    fy.position.copy(bola.current.position).setZ(0.2);
    fx.rotation.z = lx >= 0 ? -Math.PI / 2 : Math.PI / 2;
    fy.rotation.z = ly >= 0 ? 0 : Math.PI;
    (fx.children[0] as THREE.Mesh).scale.y = Math.abs(lx);
    (fx.children[1] as THREE.Mesh).position.y = Math.abs(lx);
    (fy.children[0] as THREE.Mesh).scale.y = Math.abs(ly);
    (fy.children[1] as THREE.Mesh).position.y = Math.abs(ly);

    // estela estroboscópica: un punto cada Δt hasta el instante actual
    const m = estela.current;
    const paso = Math.max(0.15, tMax / 22);
    let n = 0;
    if (corrida) {
      for (let k = 1; k < N_ESTELA && k * paso <= S.t + 1e-6; k++) {
        const q = posicion(lanz, k * paso);
        ayuda.o.position.set(X(q.x), Y(Math.max(0, q.y)) + R, -0.02);
        ayuda.o.scale.setScalar(1);
        ayuda.o.updateMatrix();
        m.setMatrixAt(n++, ayuda.o.matrix);
      }
    }
    m.count = n;
    m.instanceMatrix.needsUpdate = true;

    // etiquetas que cambian
    if (etqT.current) etqT.current.textContent = `t = ${fmt(S.t)} s`;
    if (etqV.current) etqV.current.textContent = `${fmt(Math.abs(p.vy))} m/s ${p.vy > 0.05 ? "↑" : p.vy < -0.05 ? "↓" : ""}`;
    if (etqVx.current) etqVx.current.textContent = fmt(p.vx);
    if (etqVy.current) etqVy.current.textContent = fmt(p.vy);

    // toca el suelo
    if (corrida && !S.toco && S.t >= fin - 1e-6 && fin <= corrida.tFin + 1e-6) {
      S.toco = true;
      emitirPolvo({ pos: [X(p.x), Y(0) + 0.1, 0], color: "#d9c3a0", n: 110, radio: 0.35, fuerza: 1.1, vida: 1 });
    }
    if (corrida && !S.fin && S.t >= tMax - 1e-9) {
      S.fin = true;
      onFin?.({ x: p.x, y, t: S.t });
    }
  });

  // marca de altura con el mouse
  const actualizar = (e: ThreeEvent<PointerEvent>) => {
    if (!marca?.editable || !marca.onCambio) return;
    ayuda.p.copy(e.point);
    raiz.current.worldToLocal(ayuda.p);
    const m = Math.max(0, Math.min(H, Math.round((ayuda.p.y / K + H / 2) / marca.paso) * marca.paso));
    if (m !== marca.y) {
      marca.onCambio(m);
      sfx.tecla();
    }
  };

  const ticksX = reglaX ? Array.from({ length: Math.floor(W / cadaX) + 1 }, (_, i) => i * cadaX) : [];
  const ticksY = Array.from({ length: Math.floor(H / cadaY) + 1 }, (_, i) => i * cadaY);
  const largoMarca = xMarcaDer - xRegla;
  const verCanon = lanz.v > 0 && lanz.angulo !== -90;

  const barra = (yM: number, mat: THREE.Material) => (
    <group position={[0, Y(yM), 0.05]}>
      <mesh geometry={geo.caja} material={mat} position={[xRegla + largoMarca / 2, 0, 0]} scale={[largoMarca, 0.028, 0.028]} />
      <mesh geometry={geo.flecha} material={mat} position={[xRegla - 0.06, 0, 0]} />
    </group>
  );

  return (
    <group ref={raiz}>
      {/* suelo, regla vertical y torre */}
      <mesh geometry={geo.caja} material={mats.suelo} position={[(xSueloIzq + xSueloDer) / 2, Y(0) - 0.06, 0]} scale={[xSueloDer - xSueloIzq, 0.12, PROF]} />
      <mesh geometry={geo.caja} material={mats.regla} position={[xRegla, Y(H / 2), 0]} scale={[0.03, H * K, 0.03]} />
      {torre > 0 && <mesh geometry={geo.caja} material={mats.torre} position={[xTorreDer - ANCHO_TORRE / 2, Y(0) + (torre * K) / 2, 0]} scale={[ANCHO_TORRE, torre * K, 1]} />}

      {ticksX.map((m) => (
        <group key={`x${m}`} position={[X(m), Y(0) + 0.002, PROF / 2 - 0.12]}>
          <mesh geometry={geo.caja} material={mats.acento} scale={[0.025, 0.012, 0.16]} />
          {etiquetas && (
            <Etiqueta position={[0, -0.02, 0.35]} className="etq-eje">
              {m === 0 ? "0 m" : m}
            </Etiqueta>
          )}
        </group>
      ))}
      {ticksY.map((m) => (
        <group key={`y${m}`} position={[xRegla, Y(m), 0]}>
          <mesh geometry={geo.caja} material={mats.acento} scale={[0.16, 0.022, 0.03]} />
          {etiquetas && (
            <Etiqueta position={[-0.14, 0, 0]} className="etq-eje etq-eje-y">
              {m === 0 ? "0 m" : m}
            </Etiqueta>
          )}
        </group>
      ))}

      {/* cañón */}
      {verCanon && (
        <group position={[X(lanz.x0), Y(lanz.y0) + R, -0.05]}>
          <mesh geometry={geo.canon} material={mats.regla} rotation={[0, 0, ((lanz.angulo - 90) * Math.PI) / 180]} />
          <mesh geometry={geo.caja} material={mats.torre} position={[-0.02, -0.1, 0]} scale={[0.42, 0.12, 0.38]} />
        </group>
      )}

      {/* canasta */}
      {canasta !== null && (
        <group position={[X(canasta), Y(0), 0]}>
          <mesh geometry={geo.vaso} material={mats.canasta} position={[0, 0.17, 0]} />
          <mesh geometry={geo.aro} material={mats.canasta} position={[0, 0.34, 0]} />
          {etiquetas && (
            <Etiqueta position={[0, 0.85, 0]} className="etq-dato etq-acento etq-centro">
              {canasta} m
            </Etiqueta>
          )}
        </group>
      )}

      {/* marcas de altura */}
      {fantasma !== null && barra(fantasma, mats.fantasma)}
      {marca && (
        <>
          {barra(marca.y, mats.marca)}
          {etiquetas && (
            <Etiqueta position={[xMarcaDer + 0.08, Y(marca.y), 0.05]} className="etq-dato etq-medida">
              {marca.y} m
            </Etiqueta>
          )}
        </>
      )}

      {/* trayectoria guía, estela y pelota */}
      <instancedMesh ref={puntosGuia} args={[geo.punto, mats.guia, N_GUIA]} frustumCulled={false} />
      <instancedMesh ref={estela} args={[geo.punto, mats.estela, N_ESTELA]} frustumCulled={false} />
      <group ref={bola} position={[X(lanz.x0), Y(lanz.y0) + R, 0]}>
        <mesh geometry={geo.bola} material={mats.bola} />
        {etiquetas && (
          <Etiqueta position={vertical ? [-0.25, 0.05, 0] : [0, 0.42, 0]} className={`etq-dato ${vertical ? "etq-izq" : "etq-centro"}`}>
            {/* se ignora el null en las refs: una raíz vieja de la etiqueta puede desmontarse después de la nueva */}
            {vertical ? (
              <>
                v ={" "}
                <span
                  ref={(el) => {
                    if (el) etqV.current = el;
                  }}
                >
                  {lanz.v} m/s
                </span>
              </>
            ) : (
              <>
                v<sub>x</sub> ={" "}
                <span
                  ref={(el) => {
                    if (el) etqVx.current = el;
                  }}
                >
                  {fmt(componentes(lanz)[0])}
                </span>{" "}
                · v<sub>y</sub> ={" "}
                <span
                  ref={(el) => {
                    if (el) etqVy.current = el;
                  }}
                >
                  {fmt(componentes(lanz)[1])}
                </span>{" "}
                m/s
              </>
            )}
          </Etiqueta>
        )}
      </group>
      <group ref={flechaX} visible={false}>
        <mesh geometry={geo.tubo} material={mats.vx} />
        <mesh geometry={geo.punta} material={mats.vx} />
      </group>
      <group ref={flechaY} visible={false}>
        <mesh geometry={geo.tubo} material={mats.vy} />
        <mesh geometry={geo.punta} material={mats.vy} />
      </group>

      {etiquetas && (
        <Etiqueta position={[0, Y(H) + 0.4, 0]} className="etq-dato etq-medida etq-centro etq-crono">
          <span
            ref={(el) => {
              if (el) etqT.current = el;
            }}
          >
            t = 0 s
          </span>
        </Etiqueta>
      )}
      {previa && (
        <Etiqueta position={[0, Y(0) - 0.55, PROF / 2]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}

      {/* superficie invisible para mover la marca con el mouse */}
      {marca?.editable && (
        <mesh
          geometry={geo.sup}
          material={mats.sup}
          position={[(xSueloIzq + xSueloDer) / 2, Y(H / 2), 0.4]}
          scale={[xSueloDer - xSueloIzq, H * K + 1, 1]}
          onPointerDown={(e) => {
            e.stopPropagation();
            arrastrando.current = true;
            (e.target as unknown as Element).setPointerCapture?.(e.pointerId);
            actualizar(e);
          }}
          onPointerMove={(e) => arrastrando.current && actualizar(e)}
          onPointerUp={(e) => {
            arrastrando.current = false;
            (e.target as unknown as Element).releasePointerCapture?.(e.pointerId);
          }}
          onPointerOver={() => (document.body.style.cursor = "ns-resize")}
          onPointerOut={() => (document.body.style.cursor = "")}
        />
      )}
    </group>
  );
}

