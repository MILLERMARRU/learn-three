// ══ Piezas compartidas por las etapas de condensadores ───────
import type { DecoTecla } from "@/ui/TecladoVirtual";

export { simularTecla, ValorTexto } from "../nivel-03/comun";

/** Encuadre del condensador con la pila debajo y el medidor a la derecha. */
export const ESCENARIO_CARGA = { encuadre: { w: 6.6, h: 4.4 }, balanceo: 0.04, arrastrable: false, centro: [0.45, -0.2] as [number, number] };
/** Encuadre de la red de condensadores entre A y B con el medidor a la derecha. */
export const ESCENARIO_ASOCIACION = { encuadre: { w: 7.4, h: 3.9 }, balanceo: 0.04, arrastrable: false, centro: [-0.05, -0.2] as [number, number] };
export const CARRUSEL_CONDENSADORES = { paso: 9, escala: 0.33, fondo: 0, giro: 0, ancho: 7.6 };

/** Teclas del ajuste entero de 1 en 1 y de 10 en 10 (la tecla Intro la nombra cada etapa). */
export const teclasCondensador = (accion: string): Record<string, DecoTecla> => ({
  "↑": { sub: "+1" },
  "↓": { sub: "−1" },
  "→": { sub: "+10" },
  "←": { sub: "−10" },
  intro: { sub: accion },
  h: { sub: "pista" },
});
