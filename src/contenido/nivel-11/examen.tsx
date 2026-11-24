// ══ Nivel 11 · Etapa 11.4: examen tipo admisión de cantidad de movimiento y choques (problemas propios) ───────
import type { PreguntaBase } from "@/etapas/Examen";
import type { RondaDef } from "@/motor/etapa";
import { crearChoque, crearConservacion, crearImpulso, type ProblemaChoque, type ProblemaConservacion, type ProblemaImpulso } from "./modelo";

/** Escena que se reproduce al responder: el golpe, un choque plástico o explosión, o un choque con restitución. */
export type EscenaMomento = { tipo: "golpe"; p: ProblemaImpulso } | { tipo: "conservacion"; p: ProblemaConservacion } | { tipo: "choque"; p: ProblemaChoque };

export interface PreguntaMomento extends PreguntaBase {
  escena?: EscenaMomento;
}

const t = (s: string) => ({ texto: s });
const sin: [string, string] = ["", ""];

export const PREGUNTAS_MOMENTO: PreguntaMomento[] = [
  {
    id: "d1",
    enunciado: <>La unidad del impulso en el Sistema Internacional es…</>,
    opciones: [t("J"), t("N·s"), t("N/s"), t("W"), t("kg/m")],
    correcta: 1,
    explicacion: "I = F·Δt: newton por segundo. Es lo mismo que kg·m/s, la unidad de la cantidad de movimiento.",
    escena: { tipo: "golpe", p: crearImpulso("d1", 2, 40, 0.5, 0, "rect", sin) },
  },
  {
    id: "d2",
    enunciado: (
      <>
        Un golpe de <b>50 N</b> durante <b>0,2 s</b> actúa sobre un disco de <b>0,5 kg</b> en reposo. ¿Con qué rapidez sale?
      </>
    ),
    opciones: [t("10 m/s"), t("5 m/s"), t("20 m/s"), t("25 m/s"), t("100 m/s")],
    correcta: 2,
    explicacion: "I = 50 · 0,2 = 10 N·s = 0,5 · v → v = 20 m/s.",
    escena: { tipo: "golpe", p: crearImpulso("d2", 0.5, 50, 0.2, 0, "rect", sin) },
  },
  {
    id: "d3",
    enunciado: (
      <>
        Una pelota de <b>0,2 kg</b> llega a <b>10 m/s</b> a una pared y rebota a <b>10 m/s</b>. ¿Cuánto vale el impulso que recibe (en valor)?
      </>
    ),
    opciones: [t("0"), t("2 N·s"), t("20 N·s"), t("4 N·s"), t("40 N·s")],
    correcta: 3,
    explicacion: "I = m·v − m·v₀ = 0,2 · (−10) − 0,2 · 10 = −4 N·s: cambiar de sentido cuenta doble.",
    escena: { tipo: "golpe", p: crearImpulso("d3", 0.2, -40, 0.1, 10, "rect", sin) },
  },
  {
    id: "d4",
    enunciado: <>Si sobre dos cuerpos que chocan no actúan fuerzas externas, siempre se conserva…</>,
    opciones: [t("la energía cinética"), t("la velocidad de cada cuerpo"), t("la suma de las rapideces"), t("la fuerza"), t("la cantidad de movimiento total")],
    correcta: 4,
    explicacion: "La cantidad de movimiento total se conserva en todo choque; la energía cinética, solo en los elásticos.",
    escena: { tipo: "conservacion", p: crearConservacion("d4", "plastico", 2, 1, 6, 0, 0, sin) },
  },
  {
    id: "d5",
    enunciado: (
      <>
        Un carrito de <b>3 kg</b> a <b>4 m/s</b> choca con otro de <b>1 kg</b> en reposo y quedan pegados. ¿Con qué velocidad se mueven juntos?
      </>
    ),
    opciones: [t("3 m/s"), t("4 m/s"), t("12 m/s"), t("1 m/s"), t("2 m/s")],
    correcta: 0,
    explicacion: "3 · 4 = (3 + 1) · v → v = 12 / 4 = 3 m/s.",
    escena: { tipo: "conservacion", p: crearConservacion("d5", "plastico", 3, 1, 4, 0, 0, sin) },
  },
  {
    id: "d6",
    enunciado: (
      <>
        Un cañón de <b>500 kg</b> dispara un proyectil de <b>5 kg</b> a <b>200 m/s</b>. ¿Con qué rapidez retrocede el cañón?
      </>
    ),
    opciones: [t("200 m/s"), t("2 m/s"), t("20 m/s"), t("0,2 m/s"), t("1000 m/s")],
    correcta: 1,
    explicacion: "Parten del reposo: 500 · v = 5 · 200 → v = 2 m/s hacia atrás (la escena muestra lo mismo con carritos).",
    escena: { tipo: "conservacion", p: crearConservacion("d6", "explosion", 2, 1, 0, 0, -3, sin) },
  },
  {
    id: "d7",
    enunciado: <>En un choque elástico entre dos bolas de igual masa, con una de ellas en reposo…</>,
    opciones: [t("quedan pegadas"), t("se detienen las dos"), t("intercambian velocidades"), t("rebotan con el doble de rapidez"), t("la que estaba en reposo no se mueve")],
    correcta: 2,
    explicacion: "Con masas iguales y e = 1, la que llega se detiene y la otra sale con su velocidad.",
    escena: { tipo: "choque", p: crearChoque("d7", 1, 1, 5, 0, 1, 2, sin) },
  },
  {
    id: "d8",
    enunciado: <>El coeficiente de restitución de un choque plástico (quedan pegados) es…</>,
    opciones: [t("1"), t("0,5"), t("infinito"), t("0"), t("−1")],
    correcta: 3,
    explicacion: "Si quedan pegados, no se separan: la velocidad relativa después es 0, así que e = 0.",
    escena: { tipo: "conservacion", p: crearConservacion("d8", "plastico", 1, 2, 9, 0, 0, sin) },
  },
  {
    id: "d9",
    enunciado: (
      <>
        Un carrito de <b>2 kg</b> a <b>6 m/s</b> choca con uno de <b>1 kg</b> en reposo, con e = 0,5. ¿Con qué velocidad sale el de 1 kg?
      </>
    ),
    opciones: [t("4 m/s"), t("3 m/s"), t("8 m/s"), t("2 m/s"), t("6 m/s")],
    correcta: 4,
    explicacion: "12 = 2v₁′ + v₂′ y v₂′ − v₁′ = 0,5 · 6 = 3 → 3v₂′ = 18 → v₂′ = 6 m/s.",
    escena: { tipo: "choque", p: crearChoque("d9", 2, 1, 6, 0, 0.5, 2, sin) },
  },
  {
    id: "d10",
    enunciado: (
      <>
        Un carrito de <b>1 kg</b> a <b>6 m/s</b> choca elásticamente con otro de <b>2 kg</b> en reposo. ¿Qué le pasa al de 1 kg?
      </>
    ),
    opciones: [t("rebota a 2 m/s"), t("se detiene"), t("sigue a 2 m/s"), t("sigue a 4 m/s"), t("rebota a 6 m/s")],
    correcta: 0,
    explicacion: "6 = v₁′ + 2v₂′ y v₂′ − v₁′ = 6 → v₁′ = −2 m/s: rebota. El de 2 kg sale a 4 m/s.",
    escena: { tipo: "choque", p: crearChoque("d10", 1, 2, 6, 0, 1, 1, sin) },
  },
];

export const RONDAS_EXAMEN_MOMENTO: RondaDef<PreguntaMomento>[] = [{ ronda: "examen", items: PREGUNTAS_MOMENTO }];
