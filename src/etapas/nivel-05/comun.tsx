// ══ Piezas compartidas por las etapas de gráficas ───────
import type { DecoTecla } from "@/ui/TecladoVirtual";

export { fmtNum, simularTecla, ValorTexto } from "../nivel-03/comun";

export const TECLAS_EDITAR: Record<string, DecoTecla> = {
  "←": { sub: "anterior" },
  "→": { sub: "siguiente" },
  "↑": { sub: "+5" },
  "↓": { sub: "−5" },
  intro: { sub: "¡corre!" },
  h: { sub: "pista" },
};

export const TECLAS_VALOR: Record<string, DecoTecla> = {
  "↑": { sub: "+5 m" },
  "↓": { sub: "−5 m" },
  intro: { sub: "¡corre!" },
  h: { sub: "pista" },
};

/** Encuadre común: la gráfica con la pista arriba (el contenido se corre a la derecha por el enunciado). */
export const ESCENARIO_GRAFICA = { encuadre: { w: 10.4, h: 7.6 }, balanceo: 0.03, arrastrable: false, centro: [-0.55, 0.3] as [number, number] };

/** Carrusel: la siguiente gráfica espera chica a la derecha, en el mismo plano y ajustada al ancho visible. */
export const CARRUSEL_GRAFICA = { paso: 8.3, escala: 0.33, fondo: 0, giro: 0, ancho: 9 };

export const AZUL = "#86b2ff";
export const VERDE = "#6fd6a8";
