// ══ Nivel 11 · Cantidad de movimiento y choques: contenido de la etapa 11.1, impulso (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Op, Sub, V } from "@/ui/Formula";
import { crearImpulso, type ProblemaImpulso } from "./modelo";

export { conSigno, crearImpulso, V_MAX, V_MIN } from "./modelo";
export type { ProblemaImpulso } from "./modelo";

export const RONDAS_IMPULSO: RondaDef<ProblemaImpulso>[] = [
  {
    ronda: "guiado",
    items: [
      crearImpulso("g1", 2, 40, 0.5, 0, "rect", ["El impulso es el área bajo la gráfica F–t: I = F·Δt.", "I = 40 · 0,5 = 20 N·s = 2 · v → v = 10 m/s."]),
      crearImpulso("g2", 0.5, 100, 0.04, 0, "rect", ["Un golpe muy corto, pero muy fuerte.", "I = 100 · 0,04 = 4 N·s = 0,5 · v → v = 8 m/s."]),
      crearImpulso("g3", 4, 60, 0.2, 0, "rect", ["Desde el reposo: v = I / m.", "I = 12 N·s → v = 12 / 4 = 3 m/s."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearImpulso("p1", 2, 20, 0.4, 3, "rect", ["El impulso cambia la cantidad de movimiento: m·v = m·v₀ + I.", "I = 8 N·s → 2v = 2 · 3 + 8 = 14 → v = 7 m/s."]),
      crearImpulso("p2", 1, 50, 0.1, 5, "rect", ["Con 1 kg, el impulso se suma directo a la velocidad.", "I = 5 N·s → v = 5 + 5 = 10 m/s."]),
      crearImpulso("p3", 5, 100, 0.3, 2, "rect", ["v = v₀ + I/m.", "I = 30 N·s → v = 2 + 30 / 5 = 8 m/s."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearImpulso("s1", 2, -40, 0.25, 10, "rect", ["El golpe va en contra: su impulso es negativo.", "I = −10 N·s → v = 10 − 10 / 2 = 5 m/s."]),
      crearImpulso("s2", 1, -90, 0.1, 6, "rect", ["Si el impulso en contra es grande, el disco rebota (velocidad negativa).", "I = −9 N·s → v = 6 − 9 = −3 m/s."]),
      crearImpulso("s3", 0.5, 60, 0.1, -4, "rect", ["El disco venía hacia la izquierda (v₀ negativa).", "I = 6 N·s → v = −4 + 6 / 0,5 = 8 m/s."]),
      crearImpulso("s4", 3, 120, 0.5, 0, "tri", ["La fuerza sube y baja: el área es un triángulo, ½ · F máx · Δt.", "I = ½ · 120 · 0,5 = 30 N·s → v = 30 / 3 = 10 m/s."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_IMPULSO = (
  <>
    <V>F</V>
    <Op>·</Op>Δ<V>t</V>
    <Op>=</Op>
    <V>m</V>
    <V>v</V>
    <Op>−</Op>
    <V>m</V>
    <V>v</V>
    <Sub>0</Sub>
  </>
);
