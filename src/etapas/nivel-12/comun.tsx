// ══ Piezas compartidas por las etapas de oscilaciones ───────
export { fmtNum, simularTecla, ValorTexto } from "../nivel-03/comun";
import type { DecoTecla } from "@/ui/TecladoVirtual";

/** Encuadre del resorte horizontal (pared a la izquierda; el contenido se corre a la derecha por el enunciado). */
export const ESCENARIO_RESORTE = { encuadre: { w: 8.2, h: 3.6 }, balanceo: 0.04, arrastrable: false, centro: [-0.6, 0.45] as [number, number] };
/** El péndulo cuelga de un soporte a 2,4 u de altura. */
export const ESCENARIO_PENDULO = { encuadre: { w: 6.4, h: 3.6 }, balanceo: 0.04, arrastrable: false, centro: [-0.9, 1.35] as [number, number] };
/** El círculo de referencia arriba y el eje de la sombra abajo. */
export const ESCENARIO_CIRCULO = { encuadre: { w: 6.8, h: 4.6 }, balanceo: 0.04, arrastrable: false, centro: [-0.9, 1.05] as [number, number] };
export const CARRUSEL_OSCILACIONES = { paso: 8.6, escala: 0.33, fondo: 0, giro: 0, ancho: 7.4 };

/** Teclas del ajuste de período en décimas de segundo. */
export const TECLAS_T: Record<string, DecoTecla> = {
  "↑": { sub: "+0,1 s" },
  "↓": { sub: "−0,1 s" },
  "→": { sub: "+1 s" },
  "←": { sub: "−1 s" },
  intro: { sub: "¡suelta!" },
  h: { sub: "pista" },
};
