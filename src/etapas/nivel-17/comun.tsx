// ══ Piezas compartidas por las etapas de electrostática ───────
import type { DecoTecla } from "@/ui/TecladoVirtual";

export { simularTecla, ValorTexto } from "../nivel-03/comun";

/** Encuadre de las dos esferas con sus flechas encima. */
export const ESCENARIO_COULOMB = { encuadre: { w: 8.4, h: 4.4 }, balanceo: 0.04, arrastrable: false, centro: [0, 0.05] as [number, number] };
export const CARRUSEL_ELECTRO = { paso: 9, escala: 0.33, fondo: 0, giro: 0, ancho: 7.6 };

/** Teclas del ajuste entero de 1 en 1 y de 10 en 10 (la tecla Intro la nombra cada etapa). */
export const teclasElectro = (accion: string): Record<string, DecoTecla> => ({
  "↑": { sub: "+1" },
  "↓": { sub: "−1" },
  "→": { sub: "+10" },
  "←": { sub: "−10" },
  intro: { sub: accion },
  h: { sub: "pista" },
});
