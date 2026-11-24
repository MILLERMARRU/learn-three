// ══ Nivel 12 · Oscilaciones (MAS): contenido de la etapa 12.1, sistema masa-resorte (problemas propios, π² ≈ 10) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Raiz, V } from "@/ui/Formula";
import { crearResorte, type ProblemaResorte } from "./modelo";

export { crearResorte, fmtT, T10_MAX, T10_MIN } from "./modelo";
export type { ProblemaResorte } from "./modelo";

export const RONDAS_RESORTE: RondaDef<ProblemaResorte>[] = [
  {
    ronda: "guiado",
    items: [
      crearResorte("g1", 1, 10, ["T = 2π√(m/k); con π² ≈ 10 queda T = 2√(10·m/k).", "T = 2√(10 · 1/10) = 2√1 = 2 s."]),
      crearResorte("g2", 1, 40, ["Un resorte más duro oscila más rápido.", "T = 2√(10/40) = 2√0,25 = 2 · 0,5 = 1 s."]),
      crearResorte("g3", 4, 10, ["Más masa, oscila más lento.", "T = 2√(40/10) = 2√4 = 4 s."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearResorte("p1", 4, 10, ["T va con √m: si la masa se multiplica por 4, el período por √4 = 2.", "T = 2 · 2 = 4 s."], { m: 1, k: 10 }),
      crearResorte("p2", 1, 10, ["T va con 1/√k: un resorte 4 veces más blando duplica el período.", "T = 1 · 2 = 2 s."], { m: 1, k: 40 }),
      crearResorte("p3", 18, 20, ["La masa se multiplica por 9: el período por √9 = 3.", "T = 2 · 3 = 6 s."], { m: 2, k: 20 }),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearResorte("s1", 0.25, 10, ["T = 2√(10m/k).", "T = 2√0,25 = 1 s."]),
      crearResorte("s2", 9, 40, ["10 · 9 / 40 = 2,25.", "T = 2√2,25 = 2 · 1,5 = 3 s."]),
      crearResorte("s3", 0.25, 40, ["10 · 0,25 / 40 = 1/16.", "T = 2 · ¼ = 0,5 s."]),
      crearResorte("s4", 0.36, 10, ["√0,36 = 0,6.", "T = 2 · 0,6 = 1,2 s."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_RESORTE = (
  <>
    <V>T</V>
    <Op>=</Op>2π
    <Raiz>
      <Frac n={<V>m</V>} d={<V>k</V>} />
    </Raiz>
  </>
);
