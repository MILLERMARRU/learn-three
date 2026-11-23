// ══ Nivel 7 · Estática: contenido de la etapa 7.1, primera condición de equilibrio (problemas propios, g = 10 m/s²) ───────
import type { RondaDef } from "@/motor/etapa";
import { crearEquilibrio, type ProblemaEquilibrio } from "./modelo";

export { COLORES_FUERZA, crearEquilibrio, direccionLibre, escalaFuerzas, F_MAX, F_MIN, F_PASO, fuerzasDe, nombreFuerza } from "./modelo";
export type { FuerzaDib, Incognita, ProblemaEquilibrio, TipoEquilibrio } from "./modelo";
import { Op, Sub, V } from "@/ui/Formula";

export const RONDAS_EQUILIBRIO: RondaDef<ProblemaEquilibrio>[] = [
  {
    ronda: "guiado",
    items: [
      crearEquilibrio("g1", "colgado", { m: 5 }, "T", ["En reposo, la tensión equilibra al peso: ΣFy = 0.", "T = W = m·g = 5 · 10 = 50 N."]),
      crearEquilibrio("g2", "piso", { W: 100, F: 50, angulo: 37 }, "f", ["Solo la componente horizontal de F intenta moverlo: F cos 37°.", "f = 50 · 0,8 = 40 N."]),
      crearEquilibrio("g3", "plano", { W: 100, angulo: 37 }, "T", ["En el plano, el peso tiene una componente paralela W sen θ que lo hace bajar.", "T = W sen 37° = 100 · 0,6 = 60 N."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearEquilibrio("p1", "cuerdas", { W: 50, angulo: 37, angulo2: 53 }, "T1", ["En x: T₁ cos 37° = T₂ cos 53°. En y: T₁ sen 37° + T₂ sen 53° = W.", "Como 37° + 53° = 90°: T₁ = W cos 53° = 50 · 0,6 = 30 N."]),
      crearEquilibrio("p2", "piso", { W: 80, F: 50, angulo: 37 }, "N", ["La componente vertical de F (F sen 37°) ayuda a levantar el bloque.", "N = W − F sen 37° = 80 − 30 = 50 N."]),
      crearEquilibrio("p3", "plano", { W: 50, angulo: 53 }, "T", ["T = W sen θ.", "T = 50 · 0,8 = 40 N."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearEquilibrio("s1", "colgado", { m: 12 }, "T", ["Primero el peso: W = m·g.", "T = 12 · 10 = 120 N."]),
      crearEquilibrio("s2", "cuerdas", { W: 100, angulo: 37, angulo2: 53 }, "T2", ["Descompón en x y en y.", "T₂ = W cos 37° / sen 90° = 100 · 0,8 = 80 N."]),
      crearEquilibrio("s3", "piso", { W: 100, F: 50, angulo: 53 }, "f", ["f equilibra a la componente horizontal de F.", "f = 50 · cos 53° = 50 · 0,6 = 30 N."]),
      crearEquilibrio("s4", "plano", { W: 90, angulo: 30 }, "T", ["sen 30° = 1/2.", "T = 90 · 0,5 = 45 N."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_EQUILIBRIO = (
  <>
    Σ<V>F</V>
    <Sub>x</Sub>
    <Op>=</Op>0<Op>·</Op>Σ<V>F</V>
    <Sub>y</Sub>
    <Op>=</Op>0
  </>
);
