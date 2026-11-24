// ══ Piezas compartidas por las etapas de calor ───────
import type { DecoTecla } from "@/ui/TecladoVirtual";

export { simularTecla, ValorTexto } from "../nivel-03/comun";

/** Encuadre de la barra con la pared a la izquierda y la regla a la derecha. */
export const ESCENARIO_DILATACION = { encuadre: { w: 8, h: 3.8 }, balanceo: 0.04, arrastrable: false, centro: [0.2, -0.1] as [number, number] };
/** Encuadre de la placa con el vaso y el termómetro a la derecha. */
export const ESCENARIO_CALENTADOR = { encuadre: { w: 6.8, h: 4.9 }, balanceo: 0.04, arrastrable: false, centro: [0.1, -0.15] as [number, number] };
/** Encuadre del calorímetro con el vaso caliente a la izquierda y el termómetro a la derecha. */
export const ESCENARIO_MEZCLA = { encuadre: { w: 6.8, h: 4.9 }, balanceo: 0.04, arrastrable: false, centro: [0, -0.05] as [number, number] };
export const CARRUSEL_CALOR = { paso: 9, escala: 0.33, fondo: 0, giro: 0, ancho: 7.6 };

/** Teclas del ajuste entero de 1 en 1 y de 10 en 10 (la tecla Intro la nombra cada etapa). */
export const teclasCalor = (accion: string): Record<string, DecoTecla> => ({
  "↑": { sub: "+1" },
  "↓": { sub: "−1" },
  "→": { sub: "+10" },
  "←": { sub: "−10" },
  intro: { sub: accion },
  h: { sub: "pista" },
});
