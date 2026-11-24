// ══ Nivel 9 · Etapa 9.4: examen tipo admisión de gravitación universal (problemas propios, g₀ = 10 m/s², R = 6400 km) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import { crearAtraccion, crearGravedad, crearOrbita, type ProblemaAtraccion, type ProblemaGravedad, type ProblemaOrbita } from "./modelo";

/** Escena que se reproduce al responder: las dos esferas, el planeta con el tubo de caída o las órbitas. */
export type EscenaGravitacion = { tipo: "atraccion"; p: ProblemaAtraccion } | { tipo: "gravedad"; p: ProblemaGravedad } | { tipo: "orbita"; p: ProblemaOrbita };

export interface PreguntaGravitacion extends PreguntaBase {
  escena?: EscenaGravitacion;
}

const t = (s: string) => ({ texto: s });
const sin: [string, string] = ["", ""];

export const PREGUNTAS_GRAVITACION: PreguntaGravitacion[] = [
  {
    id: "d1",
    enunciado: <>Si la distancia entre dos masas se duplica, la fuerza con que se atraen…</>,
    opciones: [t("se duplica"), t("se reduce a la cuarta parte"), t("se reduce a la mitad"), t("no cambia"), t("se cuadruplica")],
    correcta: 1,
    explicacion: "F ∝ 1/d²: con el doble de distancia, d² se cuadruplica y la fuerza queda dividida entre 4.",
    escena: { tipo: "atraccion", p: crearAtraccion("d1", 40, 1, 1, 2, sin) },
  },
  {
    id: "d2",
    enunciado: (
      <>
        Dos esferas se atraen con <b>20 N</b>. Si una de las masas se triplica y la distancia se duplica, ¿cuál es la nueva fuerza?
      </>
    ),
    opciones: [t("60 N"), t("30 N"), t("15 N"), t("5 N"), t("10 N")],
    correcta: 2,
    explicacion: "F = 20 · 3 / 2² = 60 / 4 = 15 N.",
    escena: { tipo: "atraccion", p: crearAtraccion("d2", 20, 3, 1, 2, sin) },
  },
  {
    id: "d3",
    enunciado: (
      <>
        ¿A qué altura sobre la superficie terrestre la gravedad es la <b>cuarta parte</b> de g₀? (R = 6400 km)
      </>
    ),
    opciones: [t("1600 km"), t("3200 km"), t("12 800 km"), t("6400 km"), t("25 600 km")],
    correcta: 3,
    explicacion: "g = g₀ · (R/(R + h))² = g₀/4 → R/(R + h) = ½ → h = R = 6400 km.",
    escena: { tipo: "gravedad", p: crearGravedad("d3", 1, 1, 1, sin) },
  },
  {
    id: "d4",
    enunciado: (
      <>
        Un planeta tiene <b>la mitad de la masa</b> de la Tierra y <b>la mitad de su radio</b>. ¿Cuánto vale la gravedad en su superficie?
      </>
    ),
    opciones: [t("5 m/s²"), t("10 m/s²"), t("2,5 m/s²"), t("40 m/s²"), t("20 m/s²")],
    correcta: 4,
    explicacion: "g = 10 · ½ / (½)² = 10 · ½ · 4 = 20 m/s²: el radio pesa más porque va al cuadrado.",
    escena: { tipo: "gravedad", p: crearGravedad("d4", 0.5, 0.5, 0, sin) },
  },
  {
    id: "d5",
    enunciado: (
      <>
        ¿Cuánto vale la gravedad a <b>1600 km</b> de altura sobre la superficie terrestre?
      </>
    ),
    opciones: [t("6,4 m/s²"), t("8 m/s²"), t("2,5 m/s²"), t("7,5 m/s²"), t("5 m/s²")],
    correcta: 0,
    explicacion: "h = R/4 → R/(R + h) = 4/5 → g = 10 · 16/25 = 6,4 m/s².",
    escena: { tipo: "gravedad", p: crearGravedad("d5", 1, 1, 0.25, sin) },
  },
  {
    id: "d6",
    enunciado: (
      <>
        Un satélite tarda <b>4 días</b> en dar una vuelta. ¿Cuánto tarda otro cuya órbita tiene un radio <b>4 veces mayor</b>?
      </>
    ),
    opciones: [t("16 días"), t("32 días"), t("64 días"), t("8 días"), t("128 días")],
    correcta: 1,
    explicacion: "Kepler: T ∝ r^(3/2) → T = 4 · 4^(3/2) = 4 · 8 = 32 días.",
    escena: { tipo: "orbita", p: crearOrbita("d6", "T", 4, 4, sin, { unidad: "días" }) },
  },
  {
    id: "d7",
    enunciado: (
      <>
        Un satélite rasante va a <b>8 km/s</b>. ¿Con qué velocidad orbita uno que está a una altura <b>h = 3R</b>?
      </>
    ),
    opciones: [t("2 km/s"), t("8/3 km/s"), t("4 km/s"), t("6 km/s"), t("16 km/s")],
    correcta: 2,
    explicacion: "Su radio orbital es R + 3R = 4R; v ∝ 1/√r → v = 8 / √4 = 4 km/s.",
    escena: { tipo: "orbita", p: crearOrbita("d7", "v", 4, 8, sin, { rasante: true }) },
  },
  {
    id: "d8",
    enunciado: <>Si un satélite pasa a una órbita de mayor radio, su velocidad orbital y su período…</>,
    opciones: [t("aumentan los dos"), t("disminuyen los dos"), t("la velocidad aumenta y el período disminuye"), t("la velocidad disminuye y el período aumenta"), t("no cambian")],
    correcta: 3,
    explicacion: "v = √(GM/r) baja al crecer r, y por Kepler T² ∝ r³ el período sube: más lejos, más lento y con más camino.",
    escena: { tipo: "orbita", p: crearOrbita("d8", "T", 9, 1, sin, { unidad: "días" }) },
  },
  {
    id: "d9",
    enunciado: (
      <>
        Un astronauta de <b>70 kg</b> llega a un planeta donde g = 4 m/s². ¿Cuál es su masa allí?
      </>
    ),
    opciones: [t("28 kg"), t("175 kg"), t("40 kg"), t("0 kg"), t("70 kg")],
    correcta: 4,
    explicacion: "La masa no depende del lugar: sigue siendo 70 kg. Lo que cambia es su peso: 70 · 4 = 280 N.",
    escena: { tipo: "gravedad", p: crearGravedad("d9", 0.1, 0.5, 0, sin) },
  },
  {
    id: "d10",
    enunciado: (
      <>
        Dos esferas se atraen con <b>18 N</b>. Si ambas masas se duplican y la distancia se triplica, la nueva fuerza es…
      </>
    ),
    opciones: [t("8 N"), t("72 N"), t("24 N"), t("4 N"), t("2 N")],
    correcta: 0,
    explicacion: "F = 18 · 2 · 2 / 3² = 72 / 9 = 8 N.",
    escena: { tipo: "atraccion", p: crearAtraccion("d10", 18, 2, 2, 3, sin) },
  },
];

export const RONDAS_EXAMEN_GRAVITACION: RondaDef<PreguntaGravitacion>[] = [{ ronda: "examen", items: PREGUNTAS_GRAVITACION }];
