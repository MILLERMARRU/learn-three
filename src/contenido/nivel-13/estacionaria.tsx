// ══ Nivel 13 · Ondas mecánicas: contenido de la etapa 13.3, ondas estacionarias (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, V } from "@/ui/Formula";
import { crearEstacionaria, type ProblemaEstacionaria } from "./modelo";

export { crearEstacionaria, vientresPropuestos } from "./modelo";
export type { ProblemaEstacionaria } from "./modelo";

export const RONDAS_ESTACIONARIA: RondaDef<ProblemaEstacionaria>[] = [
  {
    ronda: "guiado",
    items: [
      crearEstacionaria("g1", "f", 1, 2, 40, ["En el modo fundamental cabe media longitud de onda: λ = 2L, así que f₁ = v/2L.", "f₁ = 40 / (2 · 2) = 10 Hz."]),
      crearEstacionaria("g2", "f", 1, 1, 30, ["f₁ = v / 2L.", "f₁ = 30 / 2 = 15 Hz."]),
      crearEstacionaria("g3", "f", 1, 0.5, 20, ["Una cuerda corta vibra más agudo.", "f₁ = 20 / 1 = 20 Hz."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearEstacionaria("p1", "f", 3, 2, 40, ["El armónico n tiene n vientres: fₙ = n · v / 2L.", "f₃ = 3 · 40 / 4 = 30 Hz."]),
      crearEstacionaria("p2", "f", 2, 0.5, 12, ["fₙ = n · f₁.", "f₁ = 12 / 1 = 12 Hz → f₂ = 24 Hz."]),
      crearEstacionaria("p3", "f", 4, 2, 10, ["Cuatro vientres: cuatro veces la fundamental.", "f₁ = 10 / 4 = 2,5 Hz → f₄ = 10 Hz."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearEstacionaria("s1", "lambda", 2, 3, 30, ["Cada vientre mide media longitud de onda: λₙ = 2L / n.", "λ₂ = 2 · 3 / 2 = 3 m."]),
      crearEstacionaria("s2", "lambda", 5, 10, 30, ["λₙ = 2L / n.", "λ₅ = 20 / 5 = 4 m."]),
      crearEstacionaria("s3", "f", 3, 1, 24, ["Los armónicos son múltiplos de la fundamental.", "f₃ = 3 · 12 = 36 Hz."], true),
      crearEstacionaria("s4", "f", 5, 1, 16, ["fₙ = n · f₁.", "f₅ = 5 · 8 = 40 Hz."], true),
    ],
  },
];

// ══ Fórmulas ───────
export const F_ESTACIONARIA = (
  <>
    <V>f</V>
    <Sub>n</Sub>
    <Op>=</Op>
    <V>n</V>
    <Frac
      n={<V>v</V>}
      d={
        <>
          2<V>L</V>
        </>
      }
    />
  </>
);
