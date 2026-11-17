// ══ Nivel 4 · Etapa 4.4: examen tipo admisión de caída libre y tiro parabólico (problemas propios, g = 10 m/s²) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import type { Lanzamiento } from "@/lib/tiro";

export interface PreguntaTiro extends PreguntaBase {
  /** Escena que se reproduce en 3D al responder. */
  escena?: { W: number; H: number; lanz: Lanzamiento; torre?: number; canasta?: number; tFin?: number; reglaX?: boolean };
}

const t = (s: string) => ({ texto: s });
const suelta = (y0: number) => ({ x0: 6, y0, v: 0, angulo: -90 });

export const PREGUNTAS_TIRO: PreguntaTiro[] = [
  {
    id: "t1",
    enunciado: <>Se suelta una piedra desde lo alto de un edificio. ¿Qué rapidez tiene a los <b>3 s</b>?</>,
    opciones: [t("10 m/s"), t("15 m/s"), t("30 m/s"), t("45 m/s"), t("90 m/s")],
    correcta: 2,
    explicacion: "v = g · t = 10 · 3 = 30 m/s.",
    escena: { W: 14, H: 60, lanz: suelta(50), torre: 50, tFin: 3, reglaX: false },
  },
  {
    id: "t2",
    enunciado: <>La misma piedra: ¿cuántos metros cae en esos 3 s?</>,
    opciones: [t("15 m"), t("30 m"), t("45 m"), t("90 m"), t("9 m")],
    correcta: 2,
    explicacion: "h = ½ g t² = 5 · 9 = 45 m.",
    escena: { W: 14, H: 60, lanz: suelta(50), torre: 50, tFin: 3, reglaX: false },
  },
  {
    id: "t3",
    enunciado: <>Se lanza una pelota verticalmente hacia arriba con <b>40 m/s</b>. ¿Qué altura máxima alcanza?</>,
    opciones: [t("40 m"), t("80 m"), t("160 m"), t("20 m"), t("120 m")],
    correcta: 1,
    explicacion: "H = v₀² / 2g = 1600 / 20 = 80 m.",
    escena: { W: 20, H: 90, lanz: { x0: 10, y0: 0, v: 40, angulo: 90 }, tFin: 4, reglaX: false },
  },
  {
    id: "t4",
    enunciado: <>La misma pelota (40 m/s hacia arriba): ¿cuánto tarda en volver al punto de lanzamiento?</>,
    opciones: [t("4 s"), t("8 s"), t("2 s"), t("16 s"), t("6 s")],
    correcta: 1,
    explicacion: "Sube en v₀ / g = 4 s y baja en otros 4 s (tiempos simétricos): 8 s.",
    escena: { W: 20, H: 90, lanz: { x0: 10, y0: 0, v: 40, angulo: 90 }, reglaX: false },
  },
  {
    id: "t5",
    enunciado: <>Un cuerpo cae desde el reposo. ¿Cuántos metros recorre <b>durante el 3.er segundo</b>?</>,
    opciones: [t("45 m"), t("25 m"), t("15 m"), t("30 m"), t("20 m")],
    correcta: 1,
    explicacion: "En segundos consecutivos recorre 5, 15, 25, 35… m (números de Galileo): el 3.er segundo, 25 m.",
    escena: { W: 14, H: 60, lanz: suelta(50), torre: 50, tFin: 3, reglaX: false },
  },
  {
    id: "t6",
    enunciado: <>Desde una altura de <b>80 m</b> se lanza horizontalmente una piedra con <b>15 m/s</b>. ¿A qué distancia del pie cae?</>,
    opciones: [t("15 m"), t("45 m"), t("60 m"), t("80 m"), t("120 m")],
    correcta: 2,
    explicacion: "Cae en t = √(2H/g) = 4 s y avanza x = v · t = 15 · 4 = 60 m.",
    escena: { W: 80, H: 90, lanz: { x0: 0, y0: 80, v: 15, angulo: 0 }, torre: 80, canasta: 60 },
  },
  {
    id: "t7",
    enunciado: <>Un proyectil sale con <b>50 m/s</b> a <b>37°</b> sobre la horizontal. ¿Qué altura máxima alcanza?</>,
    opciones: [t("45 m"), t("80 m"), t("125 m"), t("30 m"), t("60 m")],
    correcta: 0,
    explicacion: "v_y = 50 · sen 37° = 30 m/s; H = 30² / 20 = 45 m.",
    escena: { W: 300, H: 70, lanz: { x0: 0, y0: 0, v: 50, angulo: 37 }, canasta: 240 },
  },
  {
    id: "t8",
    enunciado: <>El mismo proyectil (50 m/s a 37°): ¿cuál es su alcance horizontal?</>,
    opciones: [t("120 m"), t("240 m"), t("150 m"), t("300 m"), t("200 m")],
    correcta: 1,
    explicacion: "Vuela t = 2 · 30 / 10 = 6 s con vₓ = 50 · cos 37° = 40 m/s: D = 40 · 6 = 240 m.",
    escena: { W: 300, H: 70, lanz: { x0: 0, y0: 0, v: 50, angulo: 37 }, canasta: 240 },
  },
  {
    id: "t9",
    enunciado: <>Con la misma rapidez de salida y sin aire, ¿qué ángulo de tiro da el <b>mayor alcance</b>?</>,
    opciones: [t("30°"), t("37°"), t("45°"), t("53°"), t("60°")],
    correcta: 2,
    explicacion: "D = v₀² sen 2θ / g es máximo cuando sen 2θ = 1, es decir, θ = 45°.",
    escena: { W: 330, H: 100, lanz: { x0: 0, y0: 0, v: 50, angulo: 45 }, canasta: 250 },
  },
  {
    id: "t10",
    enunciado: <>Dos proyectiles salen con la misma rapidez, uno a 37° y otro a 53°. ¿Cómo son sus alcances?</>,
    opciones: [t("El de 53° llega más lejos"), t("El de 37° llega más lejos"), t("Son iguales"), t("El de 53° llega el doble"), t("Depende de la masa")],
    correcta: 2,
    explicacion: "sen 74° = sen 106° (= 0,96): los ángulos complementarios dan el mismo alcance, aunque el de 53° sube más.",
    escena: { W: 300, H: 100, lanz: { x0: 0, y0: 0, v: 50, angulo: 53 }, canasta: 240 },
  },
];

export const RONDAS_EXAMEN_TIRO: RondaDef<PreguntaTiro>[] = [{ ronda: "examen", items: PREGUNTAS_TIRO }];
