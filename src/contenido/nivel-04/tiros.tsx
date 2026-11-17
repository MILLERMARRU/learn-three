// ══ Nivel 4 · Cinemática II (MVCL y MPCL): contenido de las etapas 4.1, 4.2 y 4.3 (problemas propios, g = 10 m/s²) ───────
import type { RondaDef } from "@/motor/etapa";
import { G, alcance, alturaMax } from "@/lib/tiro";
import { Frac, Op, Sub, Sup, V } from "@/ui/Formula";

const techo = (n: number) => Math.ceil(n / 10) * 10;

// ══ 4.1 Caída libre (MVCL) ───────
export interface ProblemaCaida {
  id: string;
  tipo: "suelta" | "arriba" | "abajo";
  y0: number;
  v0: number;
  /** Instante por el que se pregunta; null = altura máxima. */
  t: number | null;
  /** Alto del campo (m). */
  H: number;
  respuesta: number; // altura sobre el suelo (m)
  pistas: [string, string];
}

function caida(id: string, tipo: ProblemaCaida["tipo"], y0: number, v0: number, t: number | null, pistas: [string, string]): ProblemaCaida {
  const vy = tipo === "arriba" ? v0 : tipo === "abajo" ? -v0 : 0;
  const tt = t ?? vy / G;
  const y = y0 + vy * tt - (G / 2) * tt * tt;
  const tope = tipo === "arriba" ? y0 + (v0 * v0) / (2 * G) : y0;
  return { id, tipo, y0, v0, t, H: techo(tope + 10), respuesta: Math.max(0, y), pistas };
}

/** Duración de la corrida: el instante pedido o hasta la altura máxima. */
export const duracionCaida = (p: ProblemaCaida) => p.t ?? p.v0 / G;

export const RONDAS_CAIDA: RondaDef<ProblemaCaida>[] = [
  {
    ronda: "guiado",
    items: [
      caida("g1", "suelta", 80, 0, 2, ["Desde el reposo cae ½gt²: 5 m en 1 s, 20 m en 2 s, 45 m en 3 s…", "Cae 5 · 2² = 20 m: queda a 80 − 20 = 60 m."]),
      caida("g2", "arriba", 0, 20, null, ["Sube hasta que su velocidad llega a 0.", "H = v₀² / 2g = 400 / 20 = 20 m."]),
      caida("g3", "suelta", 45, 0, 3, ["En 3 s cae 5 · 3² metros.", "5 · 9 = 45 m: ¡llega justo al piso!"]),
    ],
  },
  {
    ronda: "pista",
    items: [
      caida("p1", "arriba", 0, 30, null, ["En la altura máxima v = 0.", "H = 900 / 20."]),
      caida("p2", "suelta", 100, 0, 4, ["Cae ½gt² = 5t².", "5 · 16 = 80 m; queda a 100 − 80."]),
      caida("p3", "arriba", 0, 20, 3, ["A los 2 s llega arriba (20 m) y luego baja.", "y = 20 · 3 − 5 · 3² = 60 − 45."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      caida("s1", "abajo", 100, 10, 2, ["Hacia abajo: y = y₀ − v₀t − 5t².", "100 − 20 − 20."]),
      caida("s2", "arriba", 0, 40, null, ["H = v₀² / 2g.", "1600 / 20."]),
      caida("s3", "arriba", 20, 10, 3, ["Parte desde 20 m de altura.", "y = 20 + 10 · 3 − 5 · 9 = 20 + 30 − 45."]),
      caida("s4", "arriba", 0, 30, 4, ["Ya pasó la altura máxima (a los 3 s).", "y = 30 · 4 − 5 · 16 = 120 − 80."]),
    ],
  },
];

// ══ 4.2 Lanzamiento horizontal (MRU + caída libre) ───────
export interface ProblemaHorizontal {
  id: string;
  altura: number;
  D: number;
  respuesta: number; // rapidez horizontal (m/s)
  W: number;
  H: number;
  pistas: [string, string];
}

function horizontal(id: string, altura: number, D: number, pistas: [string, string]): ProblemaHorizontal {
  const t = Math.sqrt((2 * altura) / G);
  return { id, altura, D, respuesta: D / t, W: techo(D + 15), H: techo(altura + 10), pistas };
}

export const RONDAS_HORIZONTAL: RondaDef<ProblemaHorizontal>[] = [
  {
    ronda: "guiado",
    items: [
      horizontal("g1", 20, 20, ["En vertical cae como en caída libre: 20 = 5t² → t = 2 s.", "En horizontal avanza con MRU: v = D / t = 20 / 2."]),
      horizontal("g2", 45, 60, ["45 = 5t² → t = 3 s.", "v = 60 / 3."]),
      horizontal("g3", 5, 15, ["5 = 5t² → t = 1 s.", "v = 15 / 1."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      horizontal("p1", 80, 100, ["80 = 5t² → t = 4 s.", "v = 100 / 4."]),
      horizontal("p2", 20, 50, ["El tiempo de caída no depende de v.", "t = 2 s; v = 50 / 2."]),
      horizontal("p3", 45, 45, ["t = √(2H / g).", "t = 3 s; v = 45 / 3."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      horizontal("s1", 125, 150, ["125 = 5t².", "t = 5 s; v = 150 / 5."]),
      horizontal("s2", 80, 60, ["Primero el tiempo de caída.", "t = 4 s; v = 60 / 4."]),
      horizontal("s3", 20, 30, ["H = ½gt².", "t = 2 s; v = 30 / 2."]),
    ],
  },
];

// ══ 4.3 Tiro parabólico (MPCL) ───────
export const ANGULOS = [30, 37, 45, 53, 60];

export interface ProblemaParabolico {
  id: string;
  tipo: "rapidez" | "angulo";
  /** Ángulo fijo (tipo rapidez). */
  angulo: number;
  /** Rapidez fija (tipo ángulo). */
  v0: number;
  D: number;
  /** Rapidez correcta (tipo rapidez) o ángulos que dan en el blanco (tipo ángulo). */
  respuesta: number;
  validos: number[];
  W: number;
  H: number;
  pistas: [string, string];
}

function porRapidez(id: string, angulo: number, D: number, pistas: [string, string]): ProblemaParabolico {
  // D = v² · alcance(1, θ)  →  v = √(D / alcance(1, θ))
  const v = Math.round(Math.sqrt(D / alcance(1, angulo)) * 1e6) / 1e6;
  return { id, tipo: "rapidez", angulo, v0: v, D, respuesta: v, validos: [], W: techo(D * 1.3), H: techo(alturaMax(v, angulo) * 1.35 + 5), pistas };
}

function porAngulo(id: string, v0: number, D: number, pistas: [string, string]): ProblemaParabolico {
  const validos = ANGULOS.filter((a) => Math.abs(alcance(v0, a) - D) < 1e-6);
  return { id, tipo: "angulo", angulo: validos[0], v0, D, respuesta: validos[0], validos, W: techo(D * 1.3), H: techo(alturaMax(v0, 60) * 1.15 + 5), pistas };
}

export const RONDAS_PARABOLICO: RondaDef<ProblemaParabolico>[] = [
  {
    ronda: "guiado",
    items: [
      porRapidez("g1", 45, 40, ["Alcance: D = v₀² sen 2θ / g; con 45°, sen 90° = 1.", "40 = v₀² / 10 → v₀² = 400."]),
      porRapidez("g2", 37, 60, ["sen 74° = 2 · sen 37° · cos 37° = 2 · 0,6 · 0,8 = 0,96.", "60 = v₀² · 0,96 / 10 → v₀² = 625."]),
      porAngulo("g3", 50, 250, ["Con la misma rapidez, el mayor alcance se logra con 45°.", "D = 2500 · sen 90° / 10 = 250 m."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      porRapidez("p1", 53, 240, ["sen 106° = 2 · 0,8 · 0,6 = 0,96.", "240 = v₀² · 0,96 / 10 → v₀² = 2500."]),
      porAngulo("p2", 25, 60, ["Prueba con 37° o con 53°: tienen el mismo sen 2θ.", "625 · 0,96 / 10 = 60 m."]),
      porRapidez("p3", 45, 90, ["Con 45°: D = v₀² / g.", "v₀² = 900."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      porRapidez("s1", 37, 240, ["D = v₀² sen 2θ / g.", "v₀² = 240 · 10 / 0,96 = 2500."]),
      porAngulo("s2", 20, 40, ["¿Qué ángulo da el alcance máximo?", "400 · 1 / 10 = 40 m con 45°."]),
      porRapidez("s3", 45, 160, ["Con 45°: D = v₀² / g.", "v₀² = 1600."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_CAIDA = (
  <>
    <V>y</V>
    <Op>=</Op>
    <V>y</V>
    <Sub>0</Sub>
    <Op>+</Op>
    <V>v</V>
    <Sub>0</Sub>
    <V>t</V>
    <Op>−</Op>
    <Frac n="1" d="2" />
    <V>g</V>
    <V>t</V>
    <Sup>2</Sup>
  </>
);
export const F_HMAX = (
  <>
    <V>H</V>
    <Op>=</Op>
    <Frac
      n={
        <>
          <V>v</V>
          <Sub>0</Sub>
          <Sup>2</Sup>
        </>
      }
      d={
        <>
          2<V>g</V>
        </>
      }
    />
  </>
);
export const F_HORIZONTAL = (
  <>
    <V>H</V>
    <Op>=</Op>
    <Frac n="1" d="2" />
    <V>g</V>
    <V>t</V>
    <Sup>2</Sup>
    <Op>·</Op>
    <V>x</V>
    <Op>=</Op>
    <V>v</V>
    <V>t</V>
  </>
);
export const F_ALCANCE = (
  <>
    <V>D</V>
    <Op>=</Op>
    <Frac
      n={
        <>
          <V>v</V>
          <Sub>0</Sub>
          <Sup>2</Sup> sen 2<V>θ</V>
        </>
      }
      d={<V>g</V>}
    />
  </>
);
