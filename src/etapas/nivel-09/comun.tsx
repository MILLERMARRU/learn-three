// ══ Piezas compartidas por las etapas de gravitación ───────
export { fmtNum, simularTecla, ValorTexto } from "../nivel-03/comun";

/** Encuadre de la escena de las dos esferas (filas «antes» y «ahora»; el contenido se corre a la derecha por el enunciado). */
export const ESCENARIO_ATRACCION = { encuadre: { w: 9.4, h: 5.6 }, balanceo: 0.04, arrastrable: false, centro: [-0.5, 0.55] as [number, number] };
export const CARRUSEL_GRAVITACION = { paso: 8.3, escala: 0.33, fondo: 0, giro: 0, ancho: 7.4 };

/** Un factor para las cuentas: 2 → «2», ½ → «½», 3/2 → «3/2». */
export function fraccion(k: number): string {
  if (Number.isInteger(k)) return String(k);
  const especiales: Record<string, string> = { "0.5": "½", "0.25": "¼" };
  if (especiales[String(k)]) return especiales[String(k)];
  if (Number.isInteger(1 / k)) return `1/${1 / k}`;
  return `${k * 2}/2`;
}
