// ══ Piezas compartidas por las etapas de cantidad de movimiento ───────
export { fmtNum, simularTecla, ValorTexto } from "../nivel-03/comun";

/** Encuadre de la mesa de aire con la gráfica F–t arriba a la derecha. */
export const ESCENARIO_GOLPE = { encuadre: { w: 9.8, h: 4.4 }, balanceo: 0.04, arrastrable: false, centro: [-0.4, 0.75] as [number, number] };
/** El riel con los dos carritos es bajo y largo. */
export const ESCENARIO_RIEL = { encuadre: { w: 9.8, h: 3.6 }, balanceo: 0.04, arrastrable: false, centro: [-0.4, 0.45] as [number, number] };
export const CARRUSEL_MOMENTO = { paso: 9.4, escala: 0.33, fondo: 0, giro: 0, ancho: 8.8 };
