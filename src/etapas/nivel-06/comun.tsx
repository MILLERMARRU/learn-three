// ══ Piezas compartidas por las etapas de movimiento circunferencial ───────
import type { DecoTecla } from "@/ui/TecladoVirtual";

export { fmtNum, simularTecla, ValorTexto } from "../nivel-03/comun";

export const TECLAS_OMEGA: Record<string, DecoTecla> = {
  "↑": { sub: "+π/4" },
  "↓": { sub: "−π/4" },
  intro: { sub: "¡gira!" },
  h: { sub: "pista" },
};

/** Radio de la rueda principal (unidades 3D). */
export const RADIO_RUEDA = 1.9;

/** Encuadre común de las escenas de ruedas (el contenido se corre a la derecha por el enunciado). */
export const ESCENARIO_RUEDA = { encuadre: { w: 8.4, h: 6.9 }, balanceo: 0.05, arrastrable: false, centro: [-0.6, 0] as [number, number] };

/** Carrusel: la siguiente rueda espera chica a la derecha, en el mismo plano, ajustada al ancho visible. */
export const CARRUSEL_RUEDA = { paso: 8.3, escala: 0.33, fondo: 0, giro: 0, ancho: 6.4 };
