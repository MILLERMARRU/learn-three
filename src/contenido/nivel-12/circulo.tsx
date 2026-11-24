// ══ Nivel 12 · Oscilaciones (MAS): contenido de la etapa 12.3, MAS y movimiento circular (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Op, Sub, Sup, V } from "@/ui/Formula";
import { crearCirculo, type ProblemaCirculo } from "./modelo";

export { C_MAX, C_MIN, crearCirculo, omegaPropuesta } from "./modelo";
export type { ProblemaCirculo } from "./modelo";

export const RONDAS_CIRCULO: RondaDef<ProblemaCirculo>[] = [
  {
    ronda: "guiado",
    items: [
      crearCirculo("g1", "v", 0.5, 4, ["La sombra va más rápido al pasar por el centro, igual que el punto: v máx = A·ω.", "v = 0,5 · 4 = 2 m/s."]),
      crearCirculo("g2", "v", 2, 3, ["v máx = A·ω.", "v = 2 · 3 = 6 m/s."]),
      crearCirculo("g3", "v", 0.4, 10, ["Radio pequeño pero giro rápido.", "v = 0,4 · 10 = 4 m/s."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearCirculo("p1", "a", 0.5, 4, ["La aceleración es máxima en los extremos: a máx = A·ω² (la centrípeta del punto).", "a = 0,5 · 4² = 8 m/s²."]),
      crearCirculo("p2", "a", 2, 3, ["Eleva ω al cuadrado antes de multiplicar.", "a = 2 · 9 = 18 m/s²."]),
      crearCirculo("p3", "a", 0.1, 10, ["a máx = A·ω².", "a = 0,1 · 100 = 10 m/s²."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearCirculo("s1", "vx", 5, 2, ["A una distancia x del centro: v = ω·√(A² − x²).", "v = 2 · √(25 − 9) = 2 · 4 = 8 m/s."], 3),
      crearCirculo("s2", "vx", 0.5, 10, ["√(0,25 − 0,09) = √0,16.", "v = 10 · 0,4 = 4 m/s."], 0.3),
      crearCirculo("s3", "vx", 1, 10, ["√(1 − 0,64) = 0,6.", "v = 10 · 0,6 = 6 m/s."], 0.8),
      crearCirculo("s4", "vx", 1.5, 6, ["En el centro (x = 0) la rapidez es la máxima.", "v = 6 · 1,5 = 9 m/s."], 0),
    ],
  },
];

// ══ Fórmulas ───────
export const F_CIRCULO = (
  <>
    <V>v</V>
    <Sub>máx</Sub>
    <Op>=</Op>
    <V>A</V>
    <V>ω</V>
    <Op>·</Op>
    <V>a</V>
    <Sub>máx</Sub>
    <Op>=</Op>
    <V>A</V>
    <V>ω</V>
    <Sup>2</Sup>
  </>
);
