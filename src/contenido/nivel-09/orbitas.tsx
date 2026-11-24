// ══ Nivel 9 · Gravitación universal: contenido de la etapa 9.3, satélites y leyes de Kepler (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Raiz, Sub, Sup, V } from "@/ui/Formula";
import { crearOrbita, type ProblemaOrbita } from "./modelo";

export { crearOrbita, fraccionQ, O_MAX, O_MIN } from "./modelo";
export type { ProblemaOrbita } from "./modelo";

export const RONDAS_ORBITAS: RondaDef<ProblemaOrbita>[] = [
  {
    ronda: "guiado",
    items: [
      crearOrbita("g1", "T", 4, 2, ["Tercera ley de Kepler: T² ∝ r³, o sea T ∝ r^(3/2).", "4^(3/2) = (√4)³ = 8 → T = 2 · 8 = 16 h."]),
      crearOrbita("g2", "T", 9, 1, ["Con un radio 9 veces mayor, el período se multiplica por 9^(3/2).", "(√9)³ = 27 → T = 27 días."], { unidad: "días" }),
      crearOrbita("g3", "T", 1 / 9, 27, ["Más cerca del planeta, la vuelta es más corta.", "(1/9)^(3/2) = 1/27 → T = 27 / 27 = 1 h."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearOrbita("p1", "v", 4, 8, ["v = √(GM/r): la velocidad va con 1/√r.", "√4 = 2 → v = 8 / 2 = 4 km/s."], { rasante: true }),
      crearOrbita("p2", "v", 16, 8, ["Divide la velocidad rasante entre √(r/R).", "√16 = 4 → v = 8 / 4 = 2 km/s."], { rasante: true }),
      crearOrbita("p3", "v", 9, 6, ["Más lejos, más lento: v₂ = v₁ · √(r₁/r₂).", "√9 = 3 → v = 6 / 3 = 2 km/s."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearOrbita("s1", "T", 4, 3, ["Pasa las alturas a radios orbitales: r = R + h.", "r₁ = 2R y r₂ = 8R: el radio se cuadruplica → T = 3 · 8 = 24 h."], { r1R: 2 }),
      crearOrbita("s2", "v", 64, 8, ["A una altura de 63R, el radio orbital es 64R.", "√64 = 8 → v = 8 / 8 = 1 km/s."], { rasante: true, r1R: 1 }),
      crearOrbita("s3", "T", 2.25, 8, ["(9/4)^(3/2) = (3/2)³.", "(3/2)³ = 27/8 → T = 8 · 27/8 = 27 días."], { unidad: "días" }),
      crearOrbita("s4", "v", 0.25, 4, ["Más cerca, más rápido.", "√(1/4) = ½ → v = 4 / ½ = 8 km/s."]),
    ],
  },
];

// ══ Fórmulas ───────
const cociente = (k: string) => (
  <Frac
    n={
      <>
        <V>T</V>
        <Sub>{k}</Sub>
        <Sup>2</Sup>
      </>
    }
    d={
      <>
        <V>r</V>
        <Sub>{k}</Sub>
        <Sup>3</Sup>
      </>
    }
  />
);

/** Tercera ley de Kepler: T²/r³ es igual para todos los satélites de un mismo planeta. */
export const F_KEPLER = (
  <>
    {cociente("1")}
    <Op>=</Op>
    {cociente("2")}
  </>
);

/** Velocidad orbital: la gravedad hace de fuerza centrípeta. */
export const F_V_ORBITAL = (
  <>
    <V>v</V>
    <Op>=</Op>
    <Raiz>
      <Frac
        n={
          <>
            <V>G</V>
            <V>M</V>
          </>
        }
        d={<V>r</V>}
      />
    </Raiz>
  </>
);
