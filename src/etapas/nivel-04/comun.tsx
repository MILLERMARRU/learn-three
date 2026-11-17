// ══ Piezas compartidas por las etapas de tiros ───────
import type { DecoTecla } from "@/ui/TecladoVirtual";

export { fmtNum, simularTecla, ValorTexto } from "../nivel-03/comun";

export const TECLAS_MARCA: Record<string, DecoTecla> = {
  "↑": { sub: "+5 m" },
  "↓": { sub: "−5 m" },
  intro: { sub: "¡lanza!" },
  h: { sub: "pista" },
};

export const TECLAS_RAPIDEZ: Record<string, DecoTecla> = {
  "↑": { sub: "+5 m/s" },
  "↓": { sub: "−5 m/s" },
  intro: { sub: "¡fuego!" },
  h: { sub: "pista" },
};

export const TECLAS_ANGULO: Record<string, DecoTecla> = {
  "←": { sub: "− ángulo" },
  "→": { sub: "+ ángulo" },
  intro: { sub: "¡fuego!" },
  h: { sub: "pista" },
};

/** Encuadre común de las escenas de tiro (el contenido se corre a la derecha por el enunciado). */
export const ESCENARIO_TIRO = { encuadre: { w: 10.6, h: 7 }, balanceo: 0.05, arrastrable: false, centro: [-0.7, 0.15] as [number, number] };

/** Carrusel: el siguiente tiro espera chico a la derecha, en el mismo plano, ajustado al ancho visible. */
export const CARRUSEL_TIRO = { paso: 8.3, escala: 0.33, fondo: 0, giro: 0, ancho: 9.6 };
