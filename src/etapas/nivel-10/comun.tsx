// ══ Piezas compartidas por las etapas de trabajo, energía y potencia ───────
export { fmtNum, simularTecla, ValorTexto } from "../nivel-03/comun";

/** Encuadre de la escena del empujón (piso largo y bajo; el contenido se corre a la derecha por el enunciado). */
export const ESCENARIO_EMPUJON = { encuadre: { w: 9.8, h: 4.6 }, balanceo: 0.04, arrastrable: false, centro: [-0.4, 0.3] as [number, number] };
/** La pista con bajada y subida es más alta: las barras de energía van arriba del valle. */
export const ESCENARIO_PISTA_E = { encuadre: { w: 9.8, h: 4.8 }, balanceo: 0.04, arrastrable: false, centro: [-0.4, 1.05] as [number, number] };
/** La grúa es alta: la bandera a 2,2 u y la pluma a 3 u. */
export const ESCENARIO_GRUA = { encuadre: { w: 8.6, h: 5.2 }, balanceo: 0.04, arrastrable: false, centro: [-0.5, 1.55] as [number, number] };
export const CARRUSEL_ENERGIA = { paso: 8.3, escala: 0.33, fondo: 0, giro: 0, ancho: 8.8 };
