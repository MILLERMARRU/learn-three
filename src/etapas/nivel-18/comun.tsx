// ══ Piezas compartidas por las etapas de electrodinámica ───────
import type { DecoTecla } from "@/ui/TecladoVirtual";

export { simularTecla, ValorTexto } from "../nivel-03/comun";

/** Encuadre del circuito con el multímetro a la derecha. */
export const ESCENARIO_OHM = { encuadre: { w: 7.4, h: 4.4 }, balanceo: 0.04, arrastrable: false, centro: [-0.3, 0.1] as [number, number] };
/** Encuadre de la red entre A y B con el óhmetro a la derecha. */
export const ESCENARIO_RED = { encuadre: { w: 7.4, h: 3.9 }, balanceo: 0.04, arrastrable: false, centro: [-0.05, -0.2] as [number, number] };
/** Encuadre de la fuente, el foco y el vatímetro. */
export const ESCENARIO_POTENCIA = { encuadre: { w: 7.4, h: 4.2 }, balanceo: 0.04, arrastrable: false, centro: [0, 0.05] as [number, number] };
export const CARRUSEL_CIRCUITOS = { paso: 9, escala: 0.33, fondo: 0, giro: 0, ancho: 7.6 };

/** Teclas del ajuste entero de 1 en 1 y de 10 en 10 (la tecla Intro la nombra cada etapa). */
export const teclasCircuito = (accion: string): Record<string, DecoTecla> => ({
  "↑": { sub: "+1" },
  "↓": { sub: "−1" },
  "→": { sub: "+10" },
  "←": { sub: "−10" },
  intro: { sub: accion },
  h: { sub: "pista" },
});
