// ══ Nivel 12 · Oscilaciones (MAS): contenido de la etapa 12.2, péndulo simple (problemas propios, g = π² ≈ 10) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Raiz, V } from "@/ui/Formula";
import { crearPendulo, type ProblemaPendulo } from "./modelo";

export { crearPendulo } from "./modelo";
export type { ProblemaPendulo } from "./modelo";

export const RONDAS_PENDULO: RondaDef<ProblemaPendulo>[] = [
  {
    ronda: "guiado",
    items: [
      crearPendulo("g1", 1, 10, ["T = 2π√(L/g); con g = π² queda T = 2√L.", "T = 2√1 = 2 s."]),
      crearPendulo("g2", 4, 10, ["Un péndulo más largo oscila más lento.", "T = 2√4 = 4 s."]),
      crearPendulo("g3", 0.25, 10, ["T = 2√L.", "T = 2√0,25 = 2 · 0,5 = 1 s."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearPendulo("p1", 9, 10, ["T va con √L: un hilo 9 veces más largo triplica el período.", "T = 2 · 3 = 6 s."], { L: 1 }),
      crearPendulo("p2", 1, 10, ["Un hilo 4 veces más corto: el período se divide entre √4 = 2.", "T = 4 / 2 = 2 s."], { L: 4 }),
      crearPendulo("p3", 2.25, 10, ["√2,25 = 1,5.", "T = 2 · 1,5 = 3 s."], { L: 1 }),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearPendulo("s1", 1, 2.5, ["En otro planeta: T = 2π√(L/g) = 2√(10·L/g).", "T = 2√(10/2,5) = 2√4 = 4 s."]),
      crearPendulo("s2", 0.16, 1.6, ["En la Luna la gravedad es 1,6 m/s².", "T = 2√(10 · 0,16 / 1,6) = 2√1 = 2 s."]),
      crearPendulo("s3", 0.9, 4, ["10 · 0,9 / 4 = 2,25.", "T = 2√2,25 = 3 s."]),
      crearPendulo("s4", 0.36, 10, ["En la Tierra: T = 2√L.", "T = 2√0,36 = 2 · 0,6 = 1,2 s."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_PENDULO = (
  <>
    <V>T</V>
    <Op>=</Op>2π
    <Raiz>
      <Frac n={<V>L</V>} d={<V>g</V>} />
    </Raiz>
  </>
);
