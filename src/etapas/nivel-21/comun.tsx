// ══ Piezas compartidas por las etapas de ondas electromagnéticas ───────
import type { DecoTecla } from "@/ui/TecladoVirtual";

export { simularTecla, ValorTexto } from "../nivel-03/comun";

/** Encuadre de la onda sobre la franja del espectro con el medidor a la derecha. */
export const ESCENARIO_ESPECTRO = { encuadre: { w: 7.4, h: 4 }, balanceo: 0.04, arrastrable: false, centro: [0.1, -0.1] as [number, number] };
/** Encuadre del banco óptico (girado) con el luxómetro a la derecha. */
export const ESCENARIO_POLARIZACION = { encuadre: { w: 7, h: 3.8 }, balanceo: 0.04, arrastrable: false, centro: [0.3, -0.05] as [number, number] };
/** Encuadre de la antena, el avión y el medidor. */
export const ESCENARIO_RADAR = { encuadre: { w: 7.3, h: 3.9 }, balanceo: 0.04, arrastrable: false, centro: [0.1, -0.15] as [number, number] };
export const CARRUSEL_ONDAS_EM = { paso: 9, escala: 0.33, fondo: 0, giro: 0, ancho: 7.6 };

/** Teclas del ajuste con sus pasos (cada etapa indica el paso chico, el grande y la acción de Intro). */
export const teclasOndasEM = (paso: number, salto: number, accion: string): Record<string, DecoTecla> => ({
  "↑": { sub: `+${paso}` },
  "↓": { sub: `−${paso}` },
  "→": { sub: `+${salto}` },
  "←": { sub: `−${salto}` },
  intro: { sub: accion },
  h: { sub: "pista" },
});
