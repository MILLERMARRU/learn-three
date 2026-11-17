// ══ Nivel 5 · Gráficas del movimiento: contenido de las etapas 5.1, 5.2 y 5.3 (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { integrar, pendientes, type Punto } from "@/lib/graficas";
import { Frac, Op, V } from "@/ui/Formula";

const abajo = (n: number) => Math.floor(n / 10) * 10;
const arriba = (n: number) => Math.ceil(n / 10) * 10;

// ══ 5.1 Dibuja la x–t ───────
export interface ProblemaXT {
  id: string;
  descripcion: string;
  dt: number;
  /** Posición correcta en t = 0, dt, 2dt… */
  xs: number[];
  yMin: number;
  yMax: number;
  pistas: [string, string];
}

function xt(id: string, descripcion: string, xs: number[], pistas: [string, string]): ProblemaXT {
  return { id, descripcion, dt: 2, xs, yMin: Math.min(-10, abajo(Math.min(...xs) - 5)), yMax: arriba(Math.max(...xs) + 10), pistas };
}

export const RONDAS_XT: RondaDef<ProblemaXT>[] = [
  {
    ronda: "guiado",
    items: [
      xt("g1", "Parte de x = 0 y avanza a 5 m/s durante los 8 s.", [0, 10, 20, 30, 40], ["La pendiente de x–t es la velocidad: a 5 m/s sube 10 m cada 2 s.", "x = 0, 10, 20, 30, 40."]),
      xt("g2", "Parte de x = 20 m, se queda quieto 4 s y luego avanza a 5 m/s.", [20, 20, 20, 30, 40], ["Quieto = tramo horizontal (pendiente 0).", "x = 20, 20, 20 y luego 30, 40."]),
      xt("g3", "Parte de x = 40 m y regresa a 5 m/s.", [40, 30, 20, 10, 0], ["Si regresa, x baja: pendiente negativa.", "Baja 10 m cada 2 s."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      xt("p1", "Parte de x = 10 m, avanza a 10 m/s durante 2 s, se detiene 4 s y luego regresa a 5 m/s.", [10, 30, 30, 30, 20], ["En 2 s a 10 m/s avanza 20 m.", "10 → 30, quieto hasta t = 6 s y baja 10 m."]),
      xt("p2", "Parte de x = −10 m y avanza a 5 m/s.", [-10, 0, 10, 20, 30], ["Empieza por debajo del origen.", "Sube 10 m cada 2 s desde −10."]),
      xt("p3", "Avanza a 5 m/s desde x = 0 durante 4 s y luego regresa a 10 m/s.", [0, 10, 20, 0, -20], ["Los primeros 4 s sube; luego baja 20 m cada 2 s.", "0, 10, 20 y luego 0, −20."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      xt("s1", "Parte de x = 30 m, regresa a 5 m/s durante 4 s y luego avanza a 10 m/s.", [30, 20, 10, 30, 50], ["Baja 10 m cada 2 s y luego sube 20 m cada 2 s.", "30, 20, 10, 30, 50."]),
      xt("s2", "Quieto en x = 10 m durante 2 s; luego avanza a 2,5 m/s.", [10, 10, 15, 20, 25], ["A 2,5 m/s avanza 5 m cada 2 s.", "10, 10, 15, 20, 25."]),
      xt("s3", "Desde x = 0 avanza a 10 m/s 2 s, regresa a 10 m/s 4 s y avanza a 5 m/s.", [0, 20, 0, -20, -10], ["Sube 20, baja 20 dos veces y sube 10.", "0, 20, 0, −20, −10."]),
    ],
  },
];

// ══ 5.2 De x–t a v–t ───────
export interface ProblemaVT {
  id: string;
  dt: number;
  /** x–t dada (puntos equiespaciados). */
  xs: number[];
  /** Velocidad correcta de cada tramo. */
  vs: number[];
  xMin: number;
  xMax: number;
  vMax: number;
  pistas: [string, string];
}

function vt(id: string, xs: number[], pistas: [string, string]): ProblemaVT {
  const vs = pendientes(xs, 2);
  return { id, dt: 2, xs, vs, xMin: Math.min(-10, abajo(Math.min(...xs) - 5)), xMax: arriba(Math.max(...xs) + 10), vMax: Math.max(15, ...vs.map((v) => Math.abs(v) + 5)), pistas };
}

export const RONDAS_VT: RondaDef<ProblemaVT>[] = [
  {
    ronda: "guiado",
    items: [
      vt("g1", [0, 10, 20, 20, 10], ["En cada tramo v = Δx / Δt: (10 − 0) / 2 = 5 m/s.", "Tramo horizontal → v = 0; si baja → v negativa."]),
      vt("g2", [0, 20, 20, 40], ["(20 − 0) / 2 = 10 m/s.", "10, 0 y 10 m/s."]),
      vt("g3", [30, 20, 10, 10], ["Baja 10 m en 2 s: v = −5 m/s.", "−5, −5 y 0 m/s."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      vt("p1", [0, 20, 10, 10, 30], ["v = Δx / Δt en cada tramo.", "10, −5, 0 y 10 m/s."]),
      vt("p2", [-10, 0, 20, 20], ["La posición negativa no importa: cuenta cuánto cambia.", "5, 10 y 0 m/s."]),
      vt("p3", [40, 20, 20, 30, 30], ["Baja 20 m en 2 s: −10 m/s.", "−10, 0, 5 y 0 m/s."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      vt("s1", [0, 30, 30, 10, 0], ["Pendiente de cada tramo.", "15, 0, −10 y −5 m/s."]),
      vt("s2", [20, 10, 30, 30], ["Δx / Δt.", "−5, 10 y 0 m/s."]),
      vt("s3", [-20, 0, 10, 40], ["Δx / Δt.", "10, 5 y 15 m/s."]),
    ],
  },
];

// ══ 5.3 Área bajo v–t = desplazamiento ───────
export interface ProblemaArea {
  id: string;
  puntos: Punto[];
  T: number;
  respuesta: number; // Δx (m)
  vMin: number;
  vMax: number;
  xMin: number;
  xMax: number;
  pistas: [string, string];
}

function area(id: string, puntos: Punto[], pistas: [string, string]): ProblemaArea {
  const T = puntos[puntos.length - 1][0];
  const vs = puntos.map((p) => p[1]);
  const xs = Array.from({ length: 41 }, (_, i) => integrar(puntos, (T * i) / 40));
  return {
    id,
    puntos,
    T,
    respuesta: Math.round(integrar(puntos, T) * 1e6) / 1e6,
    vMin: Math.min(0, Math.floor((Math.min(...vs) - 5) / 5) * 5),
    vMax: Math.ceil((Math.max(...vs) + 5) / 5) * 5,
    xMin: Math.min(-10, abajo(Math.min(...xs) - 5)),
    xMax: arriba(Math.max(...xs) + 10),
    pistas,
  };
}

export const RONDAS_AREA: RondaDef<ProblemaArea>[] = [
  {
    ronda: "guiado",
    items: [
      area("g1", [[0, 10], [4, 10]], ["El área bajo v–t es el desplazamiento.", "Rectángulo: 10 · 4."]),
      area("g2", [[0, 0], [4, 20]], ["Es un triángulo.", "½ · 4 · 20."]),
      area("g3", [[0, 10], [4, 20]], ["Es un trapecio: (base mayor + base menor) / 2 · altura.", "(10 + 20) / 2 · 4."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      area("p1", [[0, 20], [4, 0]], ["Frena hasta detenerse: triángulo.", "½ · 4 · 20."]),
      area("p2", [[0, 0], [2, 10], [6, 10], [8, 0]], ["Divide en triángulo + rectángulo + triángulo.", "10 + 40 + 10."]),
      area("p3", [[0, 5], [2, 5], [4, 15]], ["Rectángulo y luego trapecio.", "5 · 2 + (5 + 15) / 2 · 2."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      area("s1", [[0, 20], [4, 0], [6, -10]], ["El área bajo el eje cuenta negativa (regresa).", "40 − 10."]),
      area("s2", [[0, 0], [6, 30]], ["Triángulo.", "½ · 6 · 30."]),
      area("s3", [[0, 10], [4, -10]], ["Lo que avanza arriba del eje lo regresa abajo.", "10 − 10 = 0."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_PENDIENTE = (
  <>
    <V>v</V>
    <Op>=</Op>
    <Frac n={<>Δ<V>x</V></>} d={<>Δ<V>t</V></>} />
    <Op>=</Op>
    pendiente de <V>x</V>–<V>t</V>
  </>
);
export const F_AREA = (
  <>
    Δ<V>x</V>
    <Op>=</Op>
    área bajo <V>v</V>–<V>t</V>
  </>
);
