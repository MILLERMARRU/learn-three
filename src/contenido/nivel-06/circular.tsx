// ══ Nivel 6 · Movimiento circunferencial: contenido de la etapa 6.1 (problemas propios, ω en múltiplos de π/4) ───────
import { fmtPi, NOMBRES_RUEDA } from "@/lib/circular";
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, Sup, V } from "@/ui/Formula";

/** Paso del ajuste de ω: un cuarto de π rad/s. */
export const CUARTO = Math.PI / 4;
/** Rango de ω en cuartos de π: de π/4 a 4π rad/s. */
export const K_MIN = 1;
export const K_MAX = 16;

// ══ 6.1 Velocidad angular ───────
export interface ProblemaAngular {
  id: string;
  /**
   * angulo: «gira θ en t» · vueltas: «da N vueltas en t» · periodo: «una vuelta cada T» · rpm: «gira a N rpm».
   */
  tipo: "angulo" | "vueltas" | "periodo" | "rpm";
  /** θ en cuartos de π (angulo), número de vueltas, T en s o rpm, según el tipo. */
  dato: number;
  /** Duración de la corrida (s). */
  t: number;
  /** Ángulo que debe girar la marca (rad). */
  objetivo: number;
  /** ω correcta en cuartos de π rad/s. */
  respuesta: number;
  pistas: [string, string];
}

function angular(id: string, tipo: ProblemaAngular["tipo"], dato: number, t: number, pistas: [string, string]): ProblemaAngular {
  const objetivo = tipo === "angulo" ? dato * CUARTO : tipo === "vueltas" ? dato * 2 * Math.PI : tipo === "periodo" ? 2 * Math.PI * (t / dato) : (2 * Math.PI * dato * t) / 60;
  const k = objetivo / t / CUARTO;
  // los problemas son exactos: si alguno no da un múltiplo de π/4 dentro del rango, falla al cargar
  if (Math.abs(k - Math.round(k)) > 1e-9 || Math.round(k) < K_MIN || Math.round(k) > K_MAX) throw new Error(`6.1 ${id}: ω = ${k}·π/4 fuera del ajuste`);
  return { id, tipo, dato, t, objetivo, respuesta: Math.round(k), pistas };
}

export const RONDAS_ANGULAR: RondaDef<ProblemaAngular>[] = [
  {
    ronda: "guiado",
    items: [
      angular("g1", "angulo", 4, 2, ["ω = θ / t: el ángulo girado entre el tiempo.", "ω = π / 2 rad/s."]),
      angular("g2", "periodo", 2, 2, ["En un periodo gira una vuelta: 2π rad.", "ω = 2π / T = 2π / 2 = π rad/s."]),
      angular("g3", "angulo", 6, 1, ["Tres cuartos de vuelta son 3π/2 rad.", "En 1 s: ω = 3π/2 rad/s."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      angular("p1", "rpm", 60, 2, ["60 rpm = 60 vueltas por minuto = 1 vuelta por segundo.", "ω = 2πf = 2π · 1 = 2π rad/s."]),
      angular("p2", "vueltas", 3, 6, ["Cada vuelta son 2π rad: 3 vueltas = 6π rad.", "ω = 6π / 6 = π rad/s."]),
      angular("p3", "periodo", 8, 8, ["T = 8 s: tarda 8 s en dar una vuelta.", "ω = 2π / 8 = π/4 rad/s."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      angular("s1", "rpm", 15, 4, ["15 rpm = 15 vueltas en 60 s: f = 1/4 de vuelta por segundo.", "ω = 2π · 1/4 = π/2 rad/s."]),
      angular("s2", "angulo", 10, 2, ["5π/2 rad es una vuelta y un cuarto.", "ω = (5π/2) / 2 = 5π/4 rad/s."]),
      angular("s3", "periodo", 0.5, 1, ["Medio segundo por vuelta: en 1 s da 2 vueltas.", "ω = 2π / 0,5 = 4π rad/s."]),
      angular("s4", "vueltas", 5, 4, ["5 vueltas = 10π rad.", "ω = 10π / 4 = 5π/2 rad/s."]),
    ],
  },
];

/** Cómo se lee el objetivo: «π rad», «3 vueltas»… */
export function textoObjetivo(p: ProblemaAngular): string {
  const vueltas = p.objetivo / (2 * Math.PI);
  if (p.tipo === "angulo") return `${fmtPi(p.dato, 4)} rad`;
  return Number.isInteger(Math.round(vueltas * 1e9) / 1e9) ? `${Math.round(vueltas)} ${Math.round(vueltas) === 1 ? "vuelta" : "vueltas"}` : `${fmtPi(p.objetivo / CUARTO, 4)} rad`;
}

// ══ 6.2 Poleas y engranajes ───────
export type TipoUnion = "faja" | "engranaje" | "eje";

export interface ProblemaPoleas {
  id: string;
  /** Radios (cm) en orden de transmisión; la primera rueda es la motriz y la última es la incógnita. */
  radios: number[];
  /** Cómo se une cada rueda con la siguiente (radios.length − 1 uniones). */
  uniones: TipoUnion[];
  /** ω de cada rueda en cuartos de π rad/s, con signo (positivo = antihorario). */
  ks: number[];
  /** |ω| de la última rueda en cuartos de π rad/s. */
  respuesta: number;
  pistas: [string, string];
}

export { NOMBRES_RUEDA };

function poleas(id: string, radios: number[], uniones: TipoUnion[], k0: number, pistas: [string, string]): ProblemaPoleas {
  const ks = [k0];
  uniones.forEach((u, i) => {
    const k = ks[i];
    // faja y engranaje conservan la rapidez del borde (ω₁R₁ = ω₂R₂); el engranaje invierte el sentido; el eje comparte ω
    ks.push(u === "eje" ? k : ((u === "engranaje" ? -1 : 1) * k * radios[i]) / radios[i + 1]);
  });
  const r = Math.abs(ks[ks.length - 1]);
  if (Math.abs(r - Math.round(r)) > 1e-9 || Math.round(r) < K_MIN || Math.round(r) > K_MAX) throw new Error(`6.2 ${id}: ω = ${r}·π/4 fuera del ajuste`);
  return { id, radios, uniones, ks, respuesta: Math.round(r), pistas };
}

export const RONDAS_POLEAS: RondaDef<ProblemaPoleas>[] = [
  {
    ronda: "guiado",
    items: [
      poleas("g1", [30, 15], ["faja"], 4, ["Con faja, los bordes avanzan a la misma rapidez: ωA·RA = ωB·RB.", "π · 30 = ωB · 15 → ωB = 2π rad/s."]),
      poleas("g2", [30, 12], ["eje"], 2, ["Las ruedas fijas al mismo eje giran juntas.", "Tienen la misma ω: π/2 rad/s."]),
      poleas("g3", [20, 40], ["engranaje"], 8, ["Los dientes en contacto avanzan igual: ωA·RA = ωB·RB.", "2π · 20 = ωB · 40 → ωB = π rad/s (y gira al revés)."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      poleas("p1", [10, 40], ["faja"], 8, ["La rueda grande gira más lento.", "2π · 10 = ωB · 40 → ωB = π/2 rad/s."]),
      poleas("p2", [45, 15], ["engranaje"], 2, ["El engranaje chico gira más rápido.", "(π/2) · 45 = ωB · 15 → ωB = 3π/2 rad/s."]),
      poleas("p3", [24, 32], ["faja"], 4, ["ωB = ωA · R_A / R_B.", "π · 24 / 32 = 3π/4 rad/s."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      poleas("s1", [20, 40, 10, 20], ["faja", "eje", "faja"], 8, ["Paso a paso: A → B por faja; B y C comparten eje; C → D por faja.", "ωB = 2π · 20/40 = π; ωC = π; ωD = π · 10/20 = π/2 rad/s."]),
      poleas("s2", [30, 10], ["engranaje"], 1, ["ωA·RA = ωB·RB.", "(π/4) · 30 / 10 = 3π/4 rad/s."]),
      poleas("s3", [40, 20, 10, 15], ["engranaje", "eje", "faja"], 3, ["A → B engranados; B y C en el mismo eje; C → D por faja.", "ωB = (3π/4) · 40/20 = 3π/2; ωC = 3π/2; ωD = (3π/2) · 10/15 = π rad/s."]),
    ],
  },
];

/** Explicación de la última transmisión, para la retroalimentación. */
export function explicarPoleas(p: ProblemaPoleas, k: number): string {
  const n = p.radios.length - 1;
  const u = p.uniones[n - 1];
  const a = NOMBRES_RUEDA[n - 1];
  const b = NOMBRES_RUEDA[n];
  const kPrev = Math.abs(p.ks[n - 1]);
  if (u === "eje") return `${a} y ${b} comparten eje: giran con la misma ω = ${fmtPi(kPrev, 4)} rad/s.`;
  const vPrev = fmtPi(kPrev * p.radios[n - 1], 4);
  const vEste = fmtPi(k * p.radios[n], 4);
  return `El borde de ${a} va a ${vPrev} cm/s y el de ${b} a ${vEste} cm/s${k === p.respuesta ? "" : `: ${u === "faja" ? "la faja patina" : "los dientes chocan"}`}.`;
}

// ══ 6.3 Aceleración centrípeta ───────
/** Paso y rango del ajuste de rapidez (m/s). */
export const V_PASO = 5;
export const V_MIN = 5;
export const V_MAX = 40;

export interface ProblemaCurva {
  id: string;
  /** Radio de la curva (m). */
  R: number;
  /** Aceleración centrípeta máxima que dan los neumáticos (m/s²). */
  aMax: number;
  /** Coeficiente de rozamiento, si el dato viene así (aMax = μg, g = 10 m/s²). */
  mu: number | null;
  /** Rapidez máxima para no salirse (m/s). */
  respuesta: number;
  pistas: [string, string];
}

function curva(id: string, R: number, dato: { a: number } | { mu: number }, pistas: [string, string]): ProblemaCurva {
  const mu = "mu" in dato ? dato.mu : null;
  const aMax = mu !== null ? Math.round(mu * 10 * 1e9) / 1e9 : (dato as { a: number }).a;
  const v = Math.sqrt(aMax * R);
  // la rapidez máxima es exacta y cae en el ajuste (múltiplo de 5 m/s): si no, falla al cargar
  if (Math.abs(v - Math.round(v)) > 1e-9 || Math.round(v) % V_PASO !== 0 || v < V_MIN || v > V_MAX - V_PASO) throw new Error(`6.3 ${id}: v = ${v} fuera del ajuste`);
  return { id, R, aMax, mu, respuesta: Math.round(v), pistas };
}

export const RONDAS_CURVA: RondaDef<ProblemaCurva>[] = [
  {
    ronda: "guiado",
    items: [
      curva("g1", 40, { a: 10 }, ["La aceleración centrípeta a꜀ = v²/R no puede superar a máx.", "v² = a máx · R = 10 · 40 = 400 → v = 20 m/s."]),
      curva("g2", 90, { a: 10 }, ["v² = a máx · R.", "10 · 90 = 900 → v = 30 m/s."]),
      curva("g3", 25, { a: 4 }, ["v² = 4 · 25.", "v² = 100 → v = 10 m/s."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      curva("p1", 50, { a: 8 }, ["v² = a máx · R = 8 · 50.", "v² = 400 → v = 20 m/s."]),
      curva("p2", 45, { a: 5 }, ["v² = 5 · 45.", "v² = 225 → v = 15 m/s."]),
      curva("p3", 125, { a: 5 }, ["v² = 5 · 125.", "v² = 625 → v = 25 m/s."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      curva("s1", 100, { mu: 0.4 }, ["Sin peralte, el rozamiento da la fuerza centrípeta: a máx = μg.", "a máx = 0,4 · 10 = 4 m/s²; v² = 4 · 100 = 400 → v = 20 m/s."]),
      curva("s2", 25, { mu: 0.9 }, ["a máx = μg.", "a máx = 9 m/s²; v² = 9 · 25 = 225 → v = 15 m/s."]),
      curva("s3", 90, { mu: 1 }, ["a máx = μg = 1 · 10.", "v² = 10 · 90 = 900 → v = 30 m/s."]),
      curva("s4", 125, { mu: 0.5 }, ["a máx = 0,5 · 10 = 5 m/s².", "v² = 5 · 125 = 625 → v = 25 m/s."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_CENTRIPETA = (
  <>
    <V>a</V>
    <Sub>c</Sub>
    <Op>=</Op>
    <Frac
      n={
        <>
          <V>v</V>
          <Sup>2</Sup>
        </>
      }
      d={<V>R</V>}
    />
    <Op>≤</Op>
    <V>a</V>
    <Sub>máx</Sub>
  </>
);

export const F_ROZAMIENTO = (
  <>
    <V>a</V>
    <Sub>máx</Sub>
    <Op>=</Op>
    <V>μ</V>
    <V>g</V>
    <Op>·</Op>
    <V>v</V>
    <Sup>2</Sup>
    <Op>=</Op>
    <V>a</V>
    <Sub>máx</Sub>
    <V>R</V>
  </>
);

export const F_TRANSMISION = (
  <>
    <V>ω</V>
    <Sub>A</Sub>
    <V>R</V>
    <Sub>A</Sub>
    <Op>=</Op>
    <V>ω</V>
    <Sub>B</Sub>
    <V>R</V>
    <Sub>B</Sub>
  </>
);

export const F_OMEGA = (
  <>
    <V>ω</V>
    <Op>=</Op>
    <Frac n={<V>θ</V>} d={<V>t</V>} />
    <Op>=</Op>
    <Frac n={<>2π</>} d={<V>T</V>} />
    <Op>=</Op>
    2π<V>f</V>
  </>
);

export const F_RPM = (
  <>
    <V>f</V>
    <Op>=</Op>
    <Frac n={<>rpm</>} d={<>60</>} />
    <Op>·</Op>
    <V>ω</V>
    <Op>=</Op>
    2π<V>f</V>
  </>
);
