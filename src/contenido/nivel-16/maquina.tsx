// ══ Nivel 16 · Termodinámica: contenido de la etapa 16.3, máquinas térmicas y ciclo de Carnot (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, V } from "@/ui/Formula";
import { crearMaquina, type ProblemaMaquina } from "./modelo";

export { crearMaquina, E_MAX, E_MIN } from "./modelo";
export type { DatoMaquina, ProblemaMaquina } from "./modelo";

export const RONDAS_MAQUINA: RondaDef<ProblemaMaquina>[] = [
  {
    ronda: "guiado",
    items: [
      crearMaquina("g1", "trabajo", 1000, 400, ["La eficiencia es la fracción del calor recibido que se convierte en trabajo: η = W / Q₁.", "η = 400 / 1000 = 0,40 = 40 %."]),
      crearMaquina("g2", "trabajo", 2000, 500, ["η = W / Q₁, en porcentaje.", "η = 500 / 2000 = 0,25 = 25 %."]),
      crearMaquina("g3", "trabajo", 800, 480, ["η = W / Q₁.", "η = 480 / 800 = 0,6 = 60 %."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearMaquina("p1", "calores", 1000, 700, ["La energía se conserva: W = Q₁ − Q₂, así que η = 1 − Q₂/Q₁.", "W = 300 J → η = 300 / 1000 = 30 %."]),
      crearMaquina("p2", "calores", 5000, 4000, ["η = 1 − Q₂/Q₁.", "η = 1 − 4000/5000 = 0,2 = 20 %."]),
      crearMaquina("p3", "calores", 1200, 900, ["W = 1200 − 900 = 300 J.", "η = 300 / 1200 = 25 %."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearMaquina("s1", "carnot", 327, 27, ["La máquina ideal de Carnot tiene η = 1 − T₂/T₁, con T en kelvin.", "600 K y 300 K → η = 1 − 300/600 = 50 %."]),
      crearMaquina("s2", "carnot", 227, 27, ["227 °C = 500 K y 27 °C = 300 K.", "η = 1 − 300/500 = 40 %."]),
      crearMaquina("s3", "carnot", 527, -73, ["527 °C = 800 K y −73 °C = 200 K.", "η = 1 − 200/800 = 75 %."]),
      crearMaquina("s4", "carnot", 727, 27, ["727 °C = 1000 K.", "η = 1 − 300/1000 = 70 %."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_MAQUINA = (
  <>
    <V>η</V>
    <Op>=</Op>
    <Frac
      n={<V>W</V>}
      d={
        <>
          <V>Q</V>
          <Sub>1</Sub>
        </>
      }
    />
    <Op>=</Op>1<Op>−</Op>
    <Frac
      n={
        <>
          <V>Q</V>
          <Sub>2</Sub>
        </>
      }
      d={
        <>
          <V>Q</V>
          <Sub>1</Sub>
        </>
      }
    />
  </>
);
