// ══ Nivel 11 · Cantidad de movimiento y choques: contenido de la etapa 11.3, choques elásticos e inelásticos (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, V } from "@/ui/Formula";
import { crearChoque, type ProblemaChoque } from "./modelo";

export { crearChoque } from "./modelo";
export type { ProblemaChoque } from "./modelo";

export const RONDAS_CHOQUES: RondaDef<ProblemaChoque>[] = [
  {
    ronda: "guiado",
    items: [
      crearChoque("g1", 1, 1, 5, 0, 1, 2, ["En un choque elástico entre masas iguales, intercambian velocidades.", "El 1 se queda quieto y el 2 sale con 5 m/s."]),
      crearChoque("g2", 1, 2, 6, 0, 1, 2, ["Usa las dos ecuaciones: p se conserva y v₂′ − v₁′ = e·(v₁ − v₂).", "6 = v₁′ + 2v₂′ y v₂′ − v₁′ = 6 → 3v₂′ = 12 → v₂′ = 4 m/s."]),
      crearChoque("g3", 3, 1, 4, 0, 1, 2, ["El pesado empuja al liviano: el liviano sale más rápido.", "12 = 3v₁′ + v₂′ y v₂′ − v₁′ = 4 → 4v₂′ = 24 → v₂′ = 6 m/s."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearChoque("p1", 1, 2, 6, 0, 1, 1, ["Si choca con uno más pesado, el liviano rebota (velocidad negativa).", "6 = v₁′ + 2v₂′ y v₂′ = v₁′ + 6 → 3v₁′ = −6 → v₁′ = −2 m/s."]),
      crearChoque("p2", 1, 2, 9, 0, 1, 1, ["Despeja v₂′ de la restitución y reemplázala en la conservación.", "9 = v₁′ + 2(v₁′ + 9) → 3v₁′ = −9 → v₁′ = −3 m/s."]),
      crearChoque("p3", 2, 2, 6, -4, 1, 1, ["Masas iguales y choque elástico: intercambian velocidades.", "El 1 sale con la que traía el 2: v₁′ = −4 m/s."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearChoque("s1", 2, 1, 6, 0, 0.5, 2, ["Ahora e = 0,5: se separan a la mitad de la rapidez con que se acercaban.", "12 = 2v₁′ + v₂′ y v₂′ − v₁′ = 3 → 3v₂′ = 18 → v₂′ = 6 m/s."]),
      crearChoque("s2", 1, 1, 8, 0, 0.5, 1, ["Masas iguales, pero el choque no es elástico: ya no intercambian.", "8 = v₁′ + v₂′ y v₂′ − v₁′ = 4 → v₁′ = 2 m/s."]),
      crearChoque("s3", 1, 4, 10, 0, 0.5, 2, ["p = 10 y v₂′ − v₁′ = 5.", "10 = v₁′ + 4v₂′ = (v₂′ − 5) + 4v₂′ → 5v₂′ = 15 → v₂′ = 3 m/s."]),
      crearChoque("s4", 2, 1, 4, -5, 1, 2, ["De frente: se acercan a 4 − (−5) = 9 m/s.", "p = 8 − 5 = 3 = 2v₁′ + v₂′ y v₂′ − v₁′ = 9 → 3v₂′ = 21 → v₂′ = 7 m/s."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_CHOQUE = (
  <>
    <V>e</V>
    <Op>=</Op>
    <Frac
      n={
        <>
          <V>v</V>
          <Sub>2</Sub>′ − <V>v</V>
          <Sub>1</Sub>′
        </>
      }
      d={
        <>
          <V>v</V>
          <Sub>1</Sub> − <V>v</V>
          <Sub>2</Sub>
        </>
      }
    />
  </>
);
