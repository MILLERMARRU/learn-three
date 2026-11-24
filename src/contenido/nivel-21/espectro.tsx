// ══ Nivel 21 · Ondas electromagnéticas: contenido de la etapa 21.1, espectro y c = λ·f (problemas propios, c = 3 × 10⁸ m/s) ───────
import type { RondaDef } from "@/motor/etapa";
import { Op, V } from "@/ui/Formula";
import { crearEspectro, type ProblemaEspectro } from "./modelo";

export { crearEspectro, fmtO, MAGNITUDES } from "./modelo";
export type { PideEspectro, ProblemaEspectro, Region } from "./modelo";

export const RONDAS_ESPECTRO: RondaDef<ProblemaEspectro>[] = [
  {
    ronda: "guiado",
    items: [
      crearEspectro("g1", "lambdaM", 100e6, ["Todas las ondas electromagnéticas viajan a c = 3 × 10⁸ m/s en el vacío: c = λ·f.", "λ = 3×10⁸ / 100×10⁶ = 3 m (una radio FM)."]),
      crearEspectro("g2", "lambdaM", 30e6, ["λ = c / f, con f en Hz (1 MHz = 10⁶ Hz).", "λ = 3×10⁸ / 30×10⁶ = 10 m."]),
      crearEspectro("g3", "lambdaM", 6e6, ["Menos frecuencia, más longitud de onda.", "λ = 3×10⁸ / 6×10⁶ = 50 m."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearEspectro("p1", "lambdaNm", 6e14, ["La luz visible tiene λ entre 400 y 700 nm (1 nm = 10⁻⁹ m).", "λ = 3×10⁸ / 6×10¹⁴ = 5×10⁻⁷ m = 500 nm (verde)."]),
      crearEspectro("p2", "lambdaNm", 7.5e14, ["Más frecuencia, menor λ: hacia el violeta.", "λ = 3×10⁸ / 7,5×10¹⁴ = 4×10⁻⁷ m = 400 nm (violeta)."]),
      crearEspectro("p3", "lambdaNm", 5e14, ["λ = c / f.", "λ = 3×10⁸ / 5×10¹⁴ = 6×10⁻⁷ m = 600 nm (naranja)."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearEspectro("s1", "fMHz", 2, ["Ahora despeja la frecuencia: f = c / λ.", "f = 3×10⁸ / 2 = 1,5×10⁸ Hz = 150 MHz."]),
      crearEspectro("s2", "fMHz", 3, ["f = c / λ, y 1 MHz = 10⁶ Hz.", "f = 3×10⁸ / 3 = 10⁸ Hz = 100 MHz."]),
      crearEspectro("s3", "fMHz", 1.5, ["f = c / λ.", "f = 3×10⁸ / 1,5 = 2×10⁸ Hz = 200 MHz."]),
      crearEspectro("s4", "fMHz", 1, ["Un metro de longitud de onda.", "f = 3×10⁸ / 1 = 3×10⁸ Hz = 300 MHz."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_ESPECTRO = (
  <>
    <V>c</V>
    <Op>=</Op>
    <V>λ</V>
    <Op>·</Op>
    <V>f</V>
  </>
);
