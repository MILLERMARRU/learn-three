// ══ Nivel 17 · Electrostática: contenido de la etapa 17.3, potencial eléctrico y trabajo (problemas propios, k = 9 × 10⁹) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, V } from "@/ui/Formula";
import { crearPotencial, crearTrabajoElectrico, type ProblemaPotencial } from "./modelo";

export { crearPotencial, crearTrabajoElectrico, V_MAX, V_MIN } from "./modelo";
export type { ProblemaPotencial } from "./modelo";

export const RONDAS_POTENCIAL: RondaDef<ProblemaPotencial>[] = [
  {
    ronda: "guiado",
    items: [
      crearPotencial("g1", 1, 0.3, ["El potencial de una carga puntual es V = k·Q/d: cae con la distancia (no con su cuadrado).", "V = 9×10⁹ · 1×10⁻⁶ / 0,3 = 30 000 V = 30 kV."]),
      crearPotencial("g2", 2, 0.9, ["V = k·Q/d.", "V = 9×10⁹ · 2×10⁻⁶ / 0,9 = 20 000 V = 20 kV."]),
      crearPotencial("g3", 4, 0.6, ["Con μC y metros, k·Q/d sale en V: divide entre 1000 para tener kV.", "V = 9×10⁹ · 4×10⁻⁶ / 0,6 = 60 kV."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearPotencial("p1", -3, 0.9, ["El potencial es un escalar y lleva el signo de la carga.", "V = 9×10⁹ · (−3×10⁻⁶) / 0,9 = −30 kV."]),
      crearPotencial("p2", 5, 0.9, ["V = k·Q/d.", "V = 9×10⁹ · 5×10⁻⁶ / 0,9 = 50 kV."]),
      crearPotencial("p3", -2, 0.45, ["Carga negativa: potencial negativo.", "V = 9×10⁹ · (−2×10⁻⁶) / 0,45 = −40 kV."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearTrabajoElectrico("s1", 2, 0.3, 0.9, 1, ["El trabajo del campo es W = q·(V(A) − V(B)); con μC y kV sale en mJ.", "V(A) = 60 kV y V(B) = 20 kV: W = 1 · (60 − 20) = 40 mJ."]),
      crearTrabajoElectrico("s2", 3, 0.9, 0.3, 0.5, ["Si la carga va hacia mayor potencial, el campo hace trabajo negativo.", "V(A) = 30 kV y V(B) = 90 kV: W = 0,5 · (30 − 90) = −30 mJ."]),
      crearTrabajoElectrico("s3", -4, 0.6, 1.2, 2, ["Con Q negativa, los potenciales son negativos.", "V(A) = −60 kV y V(B) = −30 kV: W = 2 · (−60 + 30) = −60 mJ."]),
      crearTrabajoElectrico("s4", 1, 0.3, 0.9, -2, ["Ojo con el signo de la carga de prueba.", "V(A) = 30 kV y V(B) = 10 kV: W = −2 · (30 − 10) = −40 mJ."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_POTENCIAL = (
  <>
    <V>V</V>
    <Op>=</Op>
    <Frac
      n={
        <>
          <V>k</V>
          <V>Q</V>
        </>
      }
      d={<V>d</V>}
    />
  </>
);
