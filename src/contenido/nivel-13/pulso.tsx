// ══ Nivel 13 · Ondas mecánicas: contenido de la etapa 13.2, velocidad de una onda en una cuerda (problemas propios, g = 10) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Raiz, V } from "@/ui/Formula";
import { crearPulso, type ProblemaPulso } from "./modelo";

export { crearPulso } from "./modelo";
export type { ProblemaPulso } from "./modelo";

export const RONDAS_PULSO: RondaDef<ProblemaPulso>[] = [
  {
    ronda: "guiado",
    items: [
      crearPulso("g1", 90, 0.1, ["En una cuerda, la velocidad depende de qué tan tensa y qué tan pesada es: v = √(T/μ).", "v = √(90 / 0,1) = √900 = 30 m/s."]),
      crearPulso("g2", 40, 0.1, ["v = √(T/μ).", "v = √(40 / 0,1) = √400 = 20 m/s."]),
      crearPulso("g3", 16, 0.01, ["Una cuerda liviana transmite el pulso más rápido.", "v = √(16 / 0,01) = √1600 = 40 m/s."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearPulso("p1", 40, 0.1, ["La tensión la da la pesa: T = m·g.", "T = 4 · 10 = 40 N → v = √(40 / 0,1) = 20 m/s."], 4),
      crearPulso("p2", 90, 0.1, ["T = m·g.", "T = 90 N → v = √900 = 30 m/s."], 9),
      crearPulso("p3", 25, 0.01, ["Pesa de 2,5 kg sobre una cuerda muy liviana.", "T = 25 N → v = √(25 / 0,01) = √2500 = 50 m/s."], 2.5),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearPulso("s1", 160, 0.1, ["Cuatro veces más tensión duplica la velocidad.", "v = √(160 / 0,1) = √1600 = 40 m/s."]),
      crearPulso("s2", 10, 0.004, ["4 g/m = 0,004 kg/m.", "v = √(10 / 0,004) = √2500 = 50 m/s."]),
      crearPulso("s3", 36, 0.04, ["36 / 0,04 = 900.", "v = √900 = 30 m/s."]),
      crearPulso("s4", 100, 0.25, ["Una cuerda pesada es lenta.", "v = √(100 / 0,25) = √400 = 20 m/s."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_PULSO = (
  <>
    <V>v</V>
    <Op>=</Op>
    <Raiz>
      <Frac n={<V>T</V>} d={<V>μ</V>} />
    </Raiz>
  </>
);
