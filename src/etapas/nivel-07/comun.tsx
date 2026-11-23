// ══ Piezas compartidas por las etapas de estática ───────
import type { DecoTecla } from "@/ui/TecladoVirtual";

export { fmtNum, simularTecla, ValorTexto } from "../nivel-03/comun";

export const TECLAS_FUERZA: Record<string, DecoTecla> = {
  "↑": { sub: "+5 N" },
  "↓": { sub: "−5 N" },
  intro: { sub: "¡suelta!" },
  h: { sub: "pista" },
};

/** Encuadre de las escenas de fuerzas (el contenido se corre a la derecha por el enunciado). */
export const ESCENARIO_FUERZAS = { encuadre: { w: 9.2, h: 6.9 }, balanceo: 0.04, arrastrable: false, centro: [-0.4, 0.35] as [number, number] };
export const CARRUSEL_FUERZAS = { paso: 8.3, escala: 0.33, fondo: 0, giro: 0, ancho: 7.6 };
