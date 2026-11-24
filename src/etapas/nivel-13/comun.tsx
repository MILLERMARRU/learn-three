// ══ Piezas compartidas por las etapas de ondas ───────
import type { DecoTecla } from "@/ui/TecladoVirtual";

export { fmtNum, simularTecla, ValorTexto } from "../nivel-03/comun";

/** Encuadre de la cuerda horizontal con el generador a la izquierda. */
export const ESCENARIO_ONDA = { encuadre: { w: 8.6, h: 3.8 }, balanceo: 0.04, arrastrable: false, centro: [-0.5, 0.1] as [number, number] };
/** La cuerda con la polea y la pesa colgando a la derecha. */
export const ESCENARIO_PULSO = { encuadre: { w: 8.6, h: 3.8 }, balanceo: 0.04, arrastrable: false, centro: [-0.4, 0.15] as [number, number] };
export const CARRUSEL_ONDAS = { paso: 9, escala: 0.33, fondo: 0, giro: 0, ancho: 7.6 };

/** Teclas del ajuste entero de 1 en 1 y de 10 en 10. */
export const TECLAS_ONDA: Record<string, DecoTecla> = {
  "↑": { sub: "+1" },
  "↓": { sub: "−1" },
  "→": { sub: "+10" },
  "←": { sub: "−10" },
  intro: { sub: "¡suelta!" },
  h: { sub: "pista" },
};
