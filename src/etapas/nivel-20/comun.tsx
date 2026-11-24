// ══ Piezas compartidas por las etapas de electromagnetismo ───────
import type { DecoTecla } from "@/ui/TecladoVirtual";

export { simularTecla, ValorTexto } from "../nivel-03/comun";

/** Encuadre del imán con el cable colgante y el dinamómetro a la derecha. */
export const ESCENARIO_CONDUCTOR = { encuadre: { w: 7.2, h: 4.4 }, balanceo: 0.04, arrastrable: false, centro: [0.35, 0.15] as [number, number] };
/** Encuadre de la mesa con los cables, la brújula y el teslámetro a la derecha. */
export const ESCENARIO_CAMPO_RECTO = { encuadre: { w: 7.6, h: 4.2 }, balanceo: 0.04, arrastrable: false, centro: [0.3, 0] as [number, number] };
export const CARRUSEL_MAGNETISMO = { paso: 9, escala: 0.33, fondo: 0, giro: 0, ancho: 7.6 };

/** Teclas del ajuste entero de 1 en 1 y de 10 en 10 (la tecla Intro la nombra cada etapa). */
export const teclasMagnetismo = (accion: string): Record<string, DecoTecla> => ({
  "↑": { sub: "+1" },
  "↓": { sub: "−1" },
  "→": { sub: "+10" },
  "←": { sub: "−10" },
  intro: { sub: accion },
  h: { sub: "pista" },
});
