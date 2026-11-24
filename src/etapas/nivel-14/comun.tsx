// ══ Piezas compartidas por las etapas de hidrostática ───────
import type { DecoTecla } from "@/ui/TecladoVirtual";

export { fmtNum, simularTecla, ValorTexto } from "../nivel-03/comun";

/** Encuadre del tanque con el manómetro a la derecha. */
export const ESCENARIO_PRESION = { encuadre: { w: 7.4, h: 4.6 }, balanceo: 0.04, arrastrable: false, centro: [-0.4, -0.2] as [number, number] };
/** Encuadre de la prensa: el émbolo chico a la izquierda y el auto a la derecha. */
export const ESCENARIO_PRENSA = { encuadre: { w: 6.8, h: 4.6 }, balanceo: 0.04, arrastrable: false, centro: [-0.8, -0.1] as [number, number] };
/** Encuadre del recipiente con el bloque real y el fantasma. */
export const ESCENARIO_FLOTACION = { encuadre: { w: 6.8, h: 5.3 }, balanceo: 0.04, arrastrable: false, centro: [-0.2, 0.2] as [number, number] };
export const CARRUSEL_FLUIDOS = { paso: 8.6, escala: 0.33, fondo: 0, giro: 0, ancho: 7.2 };

/** Teclas del ajuste entero de 1 en 1 y de 10 en 10. */
export const TECLAS_FLUIDO: Record<string, DecoTecla> = {
  "↑": { sub: "+1" },
  "↓": { sub: "−1" },
  "→": { sub: "+10" },
  "←": { sub: "−10" },
  intro: { sub: "¡suelta!" },
  h: { sub: "pista" },
};
