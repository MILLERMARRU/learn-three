// ══ Escena de gráficas (Nivel 5): paneles t–x / t–v con cuadrícula, curvas, puntos o barras editables, área que se pinta y una pista con el auto que obedece a la gráfica ───────
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { escalones, interpolar, puntosDe, type Punto } from "@/lib/graficas";
import { sfx } from "@/lib/sonido";
import { Etiqueta } from "../Etiqueta";
import { Auto } from "../pista/Auto";
import { pasoBonito } from "../tiro/EscenaTiro";

export interface Serie {
  puntos: Punto[];
  color: string;
  fantasma?: boolean;
}

export interface Editable {
  tipo: "puntos" | "barras";
  valores: number[];
  dt: number;
  color: string;
  seleccion: number;
  paso: number;
  activo: boolean;
  onCambio: (i: number, v: number) => void;
  onSeleccion: (i: number) => void;
}

export interface Panel {
  eje: "x" | "v" | "a";
  yMin: number;
  yMax: number;
  series?: Serie[];
  editable?: Editable | null;
  /** Área bajo la curva hasta t1 (crece con el cursor en la corrida; `siempre` = se ve completa). */
  area?: { puntos: Punto[]; t1: number; siempre?: boolean } | null;
}

interface Props {
  T: number;
  paneles: Panel[];
  /** Pista con el auto: posición en función del tiempo (y la del auto fantasma). */
  pista?: { xMin: number; xMax: number; x: (t: number) => number; fantasma?: ((t: number) => number) | null } | null;
  corrida?: { id: number } | null;
  onFin?: () => void;
  /** Lectura en vivo junto al cursor (p. ej. el área acumulada). */
  lectura?: (t: number) => ReactNode;
  etiquetas?: boolean;
  exito?: boolean;
  previa?: string;
}

const ANCHO = 7.6;
const ALTO_TOTAL = 4.4;
const Y_PISTA = 2.75;
const GROSOR = 0.05;
const MAX_TRI = 96;
const CADA_ETQ = 0.08;
const UNIDAD = { x: "x (m)", v: "v (m/s)", a: "a (m/s²)" };
const GEO_CAJA = new THREE.BoxGeometry(1, 1, 1);
const GEO_NUDO = new THREE.CircleGeometry(1, 16);

const fmt = (n: number) => (Math.abs(n) < 0.05 ? 0 : n).toFixed(1).replace(".", ",").replace("-", "−");
const escribir = (el: HTMLElement | null, txt: string) => {
  if (el && el.textContent !== txt) el.textContent = txt;
};

function distribucion(n: number) {
  const hueco = n > 1 ? 0.6 : 0;
  const h = (ALTO_TOTAL - hueco * (n - 1)) / n;
  const tope = Y_PISTA - 0.7;
  return Array.from({ length: n }, (_, k) => ({ y0: tope - (k + 1) * h - k * hueco, h }));
}

/** Líneas de la cuadrícula de cada panel a partir de T y de los rangos ("yMin:yMax|…"). */
function crearRejillas(T: number, clave: string) {
  const rangos = clave.split("|").map((r) => r.split(":").map(Number));
  const capas = distribucion(rangos.length);
  const pasoT = pasoBonito(T, 8);
  const TX = (t: number) => -ANCHO / 2 + (t / T) * ANCHO;
  return rangos.map(([yMin, yMax], k) => {
    const PY = (v: number) => capas[k].y0 + ((v - yMin) / (yMax - yMin)) * capas[k].h;
    const v: number[] = [];
    const pasoY = pasoBonito(yMax - yMin, 6);
    for (let t = 0; t <= T + 1e-9; t += pasoT) v.push(TX(t), capas[k].y0, 0, TX(t), capas[k].y0 + capas[k].h, 0);
    for (let y = Math.ceil(yMin / pasoY) * pasoY; y <= yMax + 1e-9; y += pasoY) v.push(-ANCHO / 2, PY(y), 0, ANCHO / 2, PY(y), 0);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    return { g, pasoY };
  });
}

/** Polilínea gruesa hecha de tramos (cajas) y nudos redondos. */
function Curva({ pts, mat, grosor = GROSOR, z = 0.02 }: { pts: [number, number][]; mat: THREE.Material; grosor?: number; z?: number }) {
  return (
    <>
      {pts.slice(1).map((b, i) => {
        const a = pts[i];
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const L = Math.hypot(dx, dy);
        if (L < 1e-6) return null;
        const g = Math.abs(dx) < 1e-6 ? grosor * 0.45 : grosor; // saltos verticales más finos
        return <mesh key={i} geometry={GEO_CAJA} material={mat} position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z]} rotation={[0, 0, Math.atan2(dy, dx)]} scale={[L, g, 0.01]} />;
      })}
      {pts.map((p, i) => (
        <mesh key={`n${i}`} geometry={GEO_NUDO} material={mat} position={[p[0], p[1], z]} scale={grosor / 2} />
      ))}
    </>
  );
}

export function EscenaGrafica({ T, paneles, pista = null, corrida = null, onFin, lectura, etiquetas: conEtiquetas = true, exito = false, previa }: Props) {
  const etiquetas = conEtiquetas && previa === undefined;
  const capas = distribucion(paneles.length);
  const TX = (t: number) => -ANCHO / 2 + (t / T) * ANCHO;
  const PY = (k: number, v: number) => capas[k].y0 + ((v - paneles[k].yMin) / (paneles[k].yMax - paneles[k].yMin)) * capas[k].h;
  const PX = (x: number) => (pista ? -ANCHO / 2 + ((x - pista.xMin) / (pista.xMax - pista.xMin)) * ANCHO : 0);
  const yArriba = capas[0].y0 + capas[0].h;
  const yAbajo = capas[capas.length - 1].y0;
  const pasoT = pasoBonito(T, 8);

  const raiz = useRef<THREE.Group>(null!);
  const cursor = useRef<THREE.Group>(null!);
  const auto = useRef<THREE.Group>(null!);
  const fantasma = useRef<THREE.Mesh>(null!);
  const puntosCursor = useRef<(THREE.Mesh | null)[]>([]);
  const etqT = useRef<HTMLSpanElement | null>(null);
  const etqX = useRef<HTMLSpanElement | null>(null);
  const etqL = useRef<HTMLSpanElement | null>(null);
  const sim = useRef({ id: -1, t: 0, fin: false, etq: -1 });
  const arrastre = useRef<{ k: number; i: number } | null>(null);
  const ayuda = useMemo(() => new THREE.Vector3(), []);

  const mats = useMemo(
    () => ({
      fondo: new THREE.MeshStandardMaterial({ color: "#151a21", roughness: 0.9, transparent: true, opacity: 0.85 }),
      rejilla: new THREE.LineBasicMaterial({ color: "#2b333e" }),
      eje: new THREE.MeshStandardMaterial({ color: "#8a929d", roughness: 0.5 }),
      pista: new THREE.MeshStandardMaterial({ color: "#20252c", roughness: 0.85 }),
      acento: new THREE.MeshStandardMaterial({ color: "#d9c3a0", emissive: "#d9c3a0", emissiveIntensity: 0.15 }),
      cursor: new THREE.MeshBasicMaterial({ color: "#f0b44c", transparent: true, opacity: 0.75 }),
      areaPos: new THREE.MeshBasicMaterial({ color: "#6fd6a8", transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }),
      areaNeg: new THREE.MeshBasicMaterial({ color: "#ff7a6b", transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }),
      fantasmaAuto: new THREE.MeshStandardMaterial({ color: "#f0b44c", transparent: true, opacity: 0.35, depthWrite: false }),
      sup: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    }),
    [],
  );
  // materiales de curvas por color (se crean al vuelo y se reutilizan)
  const matsCurva = useMemo(() => new Map<string, THREE.Material>(), []);
  const matCurva = (color: string, tenue = false) => {
    const k = `${color}${tenue ? "~" : ""}`;
    let m = matsCurva.get(k);
    if (!m) {
      m = tenue
        ? new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, depthWrite: false })
        : new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35 });
      matsCurva.set(k, m);
    }
    return m;
  };

  // rejillas de cada panel (se rehacen solo si cambian T o los rangos)
  const claveRejilla = paneles.map((p) => `${p.yMin}:${p.yMax}`).join("|");
  const rejillas = useMemo(() => crearRejillas(T, claveRejilla), [T, claveRejilla]);
  useEffect(() => () => rejillas.forEach((r) => r.g.dispose()), [rejillas]);

  const geoArea = useMemo(() => {
    const crear = () => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MAX_TRI * 9), 3));
      g.setDrawRange(0, 0);
      return g;
    };
    return { pos: crear(), neg: crear() };
  }, []);
  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
      matsCurva.forEach((m) => m.dispose());
      geoArea.pos.dispose();
      geoArea.neg.dispose();
    },
    [mats, matsCurva, geoArea],
  );

  /** Curva principal de cada panel (la editable si la hay; si no, la primera serie). */
  const principal = (p: Panel): Punto[] | null => {
    if (p.editable) return p.editable.tipo === "puntos" ? puntosDe(p.editable.valores, p.editable.dt) : escalones(p.editable.valores, p.editable.dt);
    return p.series?.find((s) => !s.fantasma)?.puntos ?? null;
  };

  const kArea = paneles.findIndex((p) => p.area);

  // rellena el área con signo hasta tFin (triángulos verdes arriba del eje, rojos abajo)
  const pintarArea = (tFin: number) => {
    if (kArea < 0) return;
    const p = paneles[kArea].area!.puntos;
    const bufP = geoArea.pos.getAttribute("position") as THREE.BufferAttribute;
    const bufN = geoArea.neg.getAttribute("position") as THREE.BufferAttribute;
    let nP = 0;
    let nN = 0;
    const tri = (pos: boolean, ...v: [number, number][]) => {
      const buf = pos ? bufP : bufN;
      const n = pos ? nP : nN;
      if (n >= MAX_TRI) return;
      v.forEach(([t, y], j) => buf.setXYZ(n * 3 + j, TX(t), PY(kArea, y), 0.005));
      if (pos) nP++;
      else nN++;
    };
    for (let i = 1; i < p.length; i++) {
      const ta = p[i - 1][0];
      const tb = Math.min(p[i][0], tFin);
      if (tb <= ta) continue;
      const va = p[i - 1][1];
      const vb = interpolar([p[i - 1], p[i]], tb);
      if (va * vb >= 0) {
        const pos = va + vb >= 0;
        tri(pos, [ta, 0], [ta, va], [tb, vb]);
        tri(pos, [ta, 0], [tb, vb], [tb, 0]);
      } else {
        const tr = ta + (va / (va - vb)) * (tb - ta);
        tri(va > 0, [ta, 0], [ta, va], [tr, 0]);
        tri(vb > 0, [tr, 0], [tb, vb], [tb, 0]);
      }
    }
    geoArea.pos.setDrawRange(0, nP * 3);
    geoArea.neg.setDrawRange(0, nN * 3);
    bufP.needsUpdate = true;
    bufN.needsUpdate = true;
    geoArea.pos.computeBoundingSphere();
    geoArea.neg.computeBoundingSphere();
  };

  useFrame((state, dtCrudo) => {
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
    } else if (!S.fin) S.t = Math.min(T, S.t + dt * Math.max(1, T / 3));
    const t = S.t;

    // cursor y puntos sobre cada curva
    cursor.current.visible = !!corrida;
    cursor.current.position.x = TX(t);
    paneles.forEach((p, k) => {
      const m = puntosCursor.current[k];
      const c = principal(p);
      if (m && c) {
        m.visible = !!corrida;
        m.position.set(TX(t), PY(k, interpolar(c, t)), 0.06);
      }
    });

    // área
    if (kArea >= 0) {
      const a = paneles[kArea].area!;
      pintarArea(corrida ? Math.min(t, a.t1) : a.siempre ? a.t1 : 0);
    }

    // auto y fantasma en la pista
    if (pista) {
      const x = pista.x(t);
      auto.current.position.x = PX(x);
      const d = pista.x(Math.min(T, t + 0.05)) - pista.x(Math.max(0, t - 0.05));
      if (Math.abs(d) > 1e-6) auto.current.rotation.y = d < 0 ? Math.PI : 0;
      if (fantasma.current) {
        fantasma.current.visible = !!pista.fantasma;
        if (pista.fantasma) fantasma.current.position.x = PX(pista.fantasma(t));
      }
    }

    // etiquetas (~12 por segundo, valor final exacto)
    const reloj = state.clock.elapsedTime;
    if (!corrida || S.fin || t >= T || reloj - S.etq >= CADA_ETQ) {
      S.etq = reloj;
      escribir(etqT.current, fmt(t));
      if (pista) escribir(etqX.current, fmt(pista.x(t)));
      if (lectura && etqL.current) {
        const l = lectura(t);
        if (typeof l === "string") escribir(etqL.current, l);
      }
    }
    if (corrida && !S.fin && t >= T) {
      S.fin = true;
      onFin?.();
    }
  });

  // edición con el mouse
  const leer = (e: ThreeEvent<PointerEvent>, k: number) => {
    ayuda.copy(e.point);
    raiz.current.worldToLocal(ayuda);
    const p = paneles[k];
    const t = ((ayuda.x + ANCHO / 2) / ANCHO) * T;
    const v = p.yMin + ((ayuda.y - capas[k].y0) / capas[k].h) * (p.yMax - p.yMin);
    return { t, v };
  };
  const ajustar = (k: number, i: number, v: number) => {
    const ed = paneles[k].editable!;
    const nv = Math.max(paneles[k].yMin, Math.min(paneles[k].yMax, Math.round(v / ed.paso) * ed.paso));
    if (nv !== ed.valores[i]) {
      ed.onCambio(i, nv);
      sfx.tecla();
    }
  };

  return (
    <group ref={raiz}>
      {/* pista con el auto */}
      {pista && (
        <group position={[0, Y_PISTA, 0]}>
          <mesh geometry={GEO_CAJA} material={mats.pista} position={[0, -0.05, 0]} scale={[ANCHO + 0.5, 0.08, 0.7]} />
          {Array.from({ length: Math.floor((pista.xMax - pista.xMin) / pasoBonito(pista.xMax - pista.xMin, 7)) + 1 }, (_, i) => pista.xMin + i * pasoBonito(pista.xMax - pista.xMin, 7)).map((x) => (
            <group key={x} position={[PX(x), -0.005, 0.3]}>
              <mesh geometry={GEO_CAJA} material={mats.acento} scale={[0.022, 0.012, 0.12]} />
              {etiquetas && (
                <Etiqueta position={[0, -0.05, 0.12]} className="etq-eje">
                  {x}
                </Etiqueta>
              )}
            </group>
          ))}
          <group ref={auto} position={[PX(pista.x(0)), 0, 0]} scale={0.55}>
            <Auto color="#86b2ff" brillo={exito ? 0.4 : 0} />
            {etiquetas && (
              <Etiqueta position={[0, 0.95, 0]} className="etq-dato etq-centro">
                x ={" "}
                <span
                  className="etq-num"
                  ref={(el) => {
                    if (el) etqX.current = el;
                  }}
                >
                  {fmt(pista.x(0))}
                </span>{" "}
                m
              </Etiqueta>
            )}
          </group>
          <mesh ref={fantasma} geometry={GEO_CAJA} material={mats.fantasmaAuto} position={[PX(pista.fantasma?.(0) ?? 0), 0.12, -0.12]} scale={[0.5, 0.2, 0.26]} visible={!!pista.fantasma} />
          {etiquetas && (
            <Etiqueta position={[ANCHO / 2 + 0.35, 0.05, 0]} className="etq-dato etq-medida">
              t ={" "}
              <span
                className="etq-num etq-num-t"
                ref={(el) => {
                  if (el) etqT.current = el;
                }}
              >
                0,0
              </span>{" "}
              s
            </Etiqueta>
          )}
        </group>
      )}

      {/* paneles */}
      {paneles.map((p, k) => {
        const { y0, h } = capas[k];
        const y0Eje = p.yMin < 0 && p.yMax > 0 ? PY(k, 0) : y0;
        const c = principal(p);
        const ed = p.editable;
        return (
          <group key={k}>
            <mesh geometry={GEO_CAJA} material={mats.fondo} position={[0, y0 + h / 2, -0.03]} scale={[ANCHO + 0.2, h + 0.2, 0.02]} />
            <lineSegments geometry={rejillas[k].g} material={mats.rejilla} />
            <mesh geometry={GEO_CAJA} material={mats.eje} position={[0, y0Eje, 0.01]} scale={[ANCHO + 0.25, 0.022, 0.01]} />
            <mesh geometry={GEO_CAJA} material={mats.eje} position={[-ANCHO / 2, y0 + h / 2, 0.01]} scale={[0.022, h + 0.1, 0.01]} />
            {etiquetas && (
              <>
                <Etiqueta position={[-ANCHO / 2 + 0.05, y0 + h + 0.22, 0]} className="etq-eje etq-eje-nombre">
                  {UNIDAD[p.eje]}
                </Etiqueta>
                <Etiqueta position={[ANCHO / 2 + 0.2, y0Eje, 0]} className="etq-eje etq-eje-nombre etq-eje-t">
                  t (s)
                </Etiqueta>
                {Array.from({ length: Math.floor((p.yMax - Math.ceil(p.yMin / rejillas[k].pasoY) * rejillas[k].pasoY) / rejillas[k].pasoY + 1e-9) + 1 }, (_, i) => Math.ceil(p.yMin / rejillas[k].pasoY) * rejillas[k].pasoY + i * rejillas[k].pasoY).map((y) => (
                  <Etiqueta key={y} position={[-ANCHO / 2 - 0.12, PY(k, y), 0]} className="etq-eje etq-eje-y">
                    {y}
                  </Etiqueta>
                ))}
                {k === paneles.length - 1 &&
                  Array.from({ length: Math.floor(T / pasoT + 1e-9) + 1 }, (_, i) => i * pasoT).map((t) => (
                    <Etiqueta key={`t${t}`} position={[TX(t), y0 - 0.12, 0]} className="etq-eje">
                      {t}
                    </Etiqueta>
                  ))}
              </>
            )}

            {/* series fijas y fantasmas */}
            {p.series?.map((s, j) => (
              <Curva key={j} pts={s.puntos.map(([t, v]) => [TX(t), PY(k, v)])} mat={matCurva(s.color, s.fantasma)} z={s.fantasma ? 0.015 : 0.025} />
            ))}

            {/* curva editable con sus asas */}
            {ed && c && (
              <>
                <Curva pts={c.map(([t, v]) => [TX(t), PY(k, v)])} mat={matCurva(ed.color)} grosor={ed.tipo === "barras" ? GROSOR * 1.5 : GROSOR} z={0.03} />
                {ed.valores.map((v, i) => {
                  const sel = i === ed.seleccion && ed.activo;
                  const x = ed.tipo === "puntos" ? TX(i * ed.dt) : TX((i + 0.5) * ed.dt);
                  return (
                    <group key={i} position={[x, PY(k, v), 0.05]}>
                      <mesh geometry={GEO_NUDO} material={matCurva(sel ? "#f0b44c" : ed.color)} scale={sel ? 0.14 : 0.095} />
                      {sel && <mesh geometry={GEO_NUDO} material={matCurva("#f0b44c", true)} scale={0.24} position={[0, 0, -0.01]} />}
                    </group>
                  );
                })}
                <mesh
                  geometry={GEO_CAJA}
                  material={mats.sup}
                  position={[0, y0 + h / 2, 0.2]}
                  scale={[ANCHO + 0.4, h + 0.4, 0.01]}
                  onPointerDown={(e) => {
                    if (!ed.activo) return;
                    e.stopPropagation();
                    const { t, v } = leer(e, k);
                    const n = ed.valores.length;
                    const i = Math.max(0, Math.min(n - 1, ed.tipo === "puntos" ? Math.round(t / ed.dt) : Math.floor(t / ed.dt)));
                    arrastre.current = { k, i };
                    (e.target as unknown as Element).setPointerCapture?.(e.pointerId);
                    ed.onSeleccion(i);
                    ajustar(k, i, v);
                  }}
                  onPointerMove={(e) => {
                    const a = arrastre.current;
                    if (!a || a.k !== k) return;
                    ajustar(k, a.i, leer(e, k).v);
                  }}
                  onPointerUp={(e) => {
                    arrastre.current = null;
                    (e.target as unknown as Element).releasePointerCapture?.(e.pointerId);
                  }}
                  onPointerOver={() => ed.activo && (document.body.style.cursor = "ns-resize")}
                  onPointerOut={() => (document.body.style.cursor = "")}
                />
              </>
            )}

            {/* punto del cursor sobre la curva principal */}
            {c && (
              <mesh
                ref={(el) => {
                  puntosCursor.current[k] = el;
                }}
                geometry={GEO_NUDO}
                material={mats.cursor}
                scale={0.08}
                position={[0, PY(k, c[0][1]), 0.06]}
              />
            )}
          </group>
        );
      })}

      {/* área que se pinta */}
      {kArea >= 0 && (
        <>
          <mesh geometry={geoArea.pos} material={mats.areaPos} frustumCulled={false} />
          <mesh geometry={geoArea.neg} material={mats.areaNeg} frustumCulled={false} />
        </>
      )}

      {/* cursor de tiempo que cruza todos los paneles */}
      <group ref={cursor} visible={false}>
        <mesh geometry={GEO_CAJA} material={mats.cursor} position={[0, (yArriba + yAbajo) / 2, 0.04]} scale={[0.018, yArriba - yAbajo + 0.1, 0.01]} />
        {lectura && etiquetas && (
          <Etiqueta position={[0.08, yArriba - 0.1, 0.05]} className="etq-dato etq-medida">
            <span
              ref={(el) => {
                if (el) etqL.current = el;
              }}
            />
          </Etiqueta>
        )}
      </group>

      {previa && (
        <Etiqueta position={[0, yAbajo - 0.45, 0]} className="etq-siguiente">
          <span>siguiente</span> {previa}
        </Etiqueta>
      )}
    </group>
  );
}
