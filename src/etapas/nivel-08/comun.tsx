// ══ Piezas compartidas por las etapas de dinámica ───────
import type { DecoTecla } from "@/ui/TecladoVirtual";

export { fmtNum, simularTecla, ValorTexto } from "../nivel-03/comun";

export const TECLAS_FUERZA: Record<string, DecoTecla> = {
  "↑": { sub: "+5 N" },
  "↓": { sub: "−5 N" },
  intro: { sub: "¡empuja!" },
  h: { sub: "pista" },
};

/** Encuadre de las escenas de dinámica (el contenido se corre a la derecha por el enunciado). */
export const ESCENARIO_DINAMICA = { encuadre: { w: 9.4, h: 5.4 }, balanceo: 0.04, arrastrable: false, centro: [-0.5, 0.25] as [number, number] };
export const CARRUSEL_DINAMICA = { paso: 8.3, escala: 0.33, fondo: 0, giro: 0, ancho: 8.4 };

/** El plano inclinado es más alto que ancho cuando el ángulo es grande. */
export const ESCENARIO_PLANO = { encuadre: { w: 8.6, h: 6.6 }, balanceo: 0.04, arrastrable: false, centro: [-0.5, 0.2] as [number, number] };
