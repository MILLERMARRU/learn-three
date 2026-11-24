// ══ Nivel 21 · Etapa 21.4: examen tipo admisión de ondas electromagnéticas (problemas propios, c = 3 × 10⁸ m/s) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import { crearEspectro, crearPolarizacion, crearRadar, type ProblemaEspectro, type ProblemaPolarizacion, type ProblemaRadar } from "./modelo";

/** Escena que se reproduce al responder: la onda sobre el espectro, el banco de polarizadores o el radar. */
export type EscenaOndasEM = { tipo: "espectro"; p: ProblemaEspectro } | { tipo: "polarizacion"; p: ProblemaPolarizacion } | { tipo: "radar"; p: ProblemaRadar };

export interface PreguntaOndasEM extends PreguntaBase {
  escena?: EscenaOndasEM;
}

const t = (s: string) => ({ texto: s });
const sin: [string, string] = ["", ""];

export const PREGUNTAS_ONDAS_EM: PreguntaOndasEM[] = [
  {
    id: "e1",
    enunciado: (
      <>
        Una emisora de radio transmite a <b>150 MHz</b>. ¿Cuál es la longitud de onda de su señal?
      </>
    ),
    opciones: [t("0,5 m"), t("2 m"), t("20 m"), t("200 m"), t("4,5 m")],
    correcta: 1,
    explicacion: "λ = c / f = 3×10⁸ / 1,5×10⁸ = 2 m.",
    escena: { tipo: "espectro", p: crearEspectro("e1", "lambdaM", 150e6, sin) },
  },
  {
    id: "e2",
    enunciado: <>En el vacío, todas las ondas electromagnéticas tienen la misma…</>,
    opciones: [t("frecuencia"), t("longitud de onda"), t("rapidez"), t("amplitud"), t("energía")],
    correcta: 2,
    explicacion: "Todas viajan a c = 3×10⁸ m/s; lo que cambia de una a otra es λ (y con ella f).",
    escena: { tipo: "espectro", p: crearEspectro("e2", "lambdaNm", 6e14, sin) },
  },
  {
    id: "e3",
    enunciado: (
      <>
        Una radiación tiene una frecuencia de <b>4 × 10¹⁴ Hz</b>. ¿Cuál es su longitud de onda?
      </>
    ),
    opciones: [t("75 nm"), t("7,5 nm"), t("1200 nm"), t("750 nm"), t("400 nm")],
    correcta: 3,
    explicacion: "λ = 3×10⁸ / 4×10¹⁴ = 7,5×10⁻⁷ m = 750 nm: justo pasando el rojo, en el infrarrojo.",
    escena: { tipo: "espectro", p: crearEspectro("e3", "lambdaNm", 4e14, sin) },
  },
  {
    id: "e4",
    enunciado: (
      <>
        Una onda electromagnética tiene <b>λ = 1,2 m</b>. ¿Cuál es su frecuencia?
      </>
    ),
    opciones: [t("25 MHz"), t("2,5 MHz"), t("36 MHz"), t("2500 MHz"), t("250 MHz")],
    correcta: 4,
    explicacion: "f = c / λ = 3×10⁸ / 1,2 = 2,5×10⁸ Hz = 250 MHz.",
    escena: { tipo: "espectro", p: crearEspectro("e4", "fMHz", 1.2, sin) },
  },
  {
    id: "e5",
    enunciado: (
      <>
        Luz polarizada de <b>40 W/m²</b> llega a un analizador girado <b>60°</b>. ¿Qué intensidad sale?
      </>
    ),
    opciones: [t("10 W/m²"), t("20 W/m²"), t("30 W/m²"), t("40 W/m²"), t("5 W/m²")],
    correcta: 0,
    explicacion: "I = I₀·cos² 60° = 40 · 1/4 = 10 W/m².",
    escena: { tipo: "polarizacion", p: crearPolarizacion("e5", 40, 60, false, sin) },
  },
  {
    id: "e6",
    enunciado: (
      <>
        Luz <b>sin polarizar</b> de <b>100 W/m²</b> atraviesa un polarizador y luego un analizador a <b>53°</b>. ¿Qué intensidad sale?
      </>
    ),
    opciones: [t("36 W/m²"), t("18 W/m²"), t("32 W/m²"), t("64 W/m²"), t("50 W/m²")],
    correcta: 1,
    explicacion: "El primero deja la mitad (50 W/m²); luego I = 50 · cos² 53° = 50 · 0,36 = 18 W/m².",
    escena: { tipo: "polarizacion", p: crearPolarizacion("e6", 100, 53, true, sin) },
  },
  {
    id: "e7",
    enunciado: <>Si el analizador se gira poco a poco de 0° a 90° respecto de la polarización, la intensidad que sale…</>,
    opciones: [t("aumenta"), t("no cambia"), t("disminuye hasta anularse"), t("se duplica"), t("baja a la mitad y se queda")],
    correcta: 2,
    explicacion: "I = I₀·cos²θ: cos²θ va de 1 a 0, así que con los polarizadores cruzados no pasa luz.",
    escena: { tipo: "polarizacion", p: crearPolarizacion("e7", 80, 45, false, sin) },
  },
  {
    id: "e8",
    enunciado: (
      <>
        El eco de un radar vuelve <b>300 µs</b> después de emitir el pulso. ¿A qué distancia está el objeto?
      </>
    ),
    opciones: [t("90 km"), t("4,5 km"), t("450 km"), t("45 km"), t("15 km")],
    correcta: 3,
    explicacion: "d = c·t / 2 = 3×10⁸ · 3×10⁻⁴ / 2 = 45 000 m = 45 km.",
    escena: { tipo: "radar", p: crearRadar("e8", "dKm", 300e-6, sin) },
  },
  {
    id: "e9",
    enunciado: (
      <>
        Un avión está a <b>15 km</b> de un radar. ¿Cuánto tarda el eco en volver?
      </>
    ),
    opciones: [t("50 µs"), t("10 µs"), t("1000 µs"), t("200 µs"), t("100 µs")],
    correcta: 4,
    explicacion: "t = 2d / c = 2 · 15 000 / 3×10⁸ = 10⁻⁴ s = 100 µs.",
    escena: { tipo: "radar", p: crearRadar("e9", "tUs", 15e3, sin) },
  },
  {
    id: "e10",
    enunciado: <>¿Por qué en la fórmula del radar, d = c·t / 2, se divide entre 2?</>,
    opciones: [t("porque el pulso va y vuelve"), t("porque la onda pierde la mitad de su energía"), t("porque en el aire la luz va a la mitad de c"), t("porque el radar usa dos antenas"), t("porque el eco tiene el doble de frecuencia")],
    correcta: 0,
    explicacion: "En el tiempo t el pulso recorre la distancia dos veces (ida y vuelta): 2d = c·t.",
    escena: { tipo: "radar", p: crearRadar("e10", "dKm", 0.4e-3, sin, "ms") },
  },
];

export const RONDAS_EXAMEN_ONDAS_EM: RondaDef<PreguntaOndasEM>[] = [{ ronda: "examen", items: PREGUNTAS_ONDAS_EM }];
