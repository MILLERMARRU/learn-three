// ══ Nivel 6 · Movimiento circunferencial: contenido de la etapa 6.1 (problemas propios, ω en múltiplos de π/4) ───────
import { fmtPi } from "@/lib/circular";
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, V } from "@/ui/Formula";

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

// ══ Fórmulas ───────
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
