// ══ Piezas compartidas por las etapas de termodinámica ───────
import type { DecoTecla } from "@/ui/TecladoVirtual";

export { simularTecla, ValorTexto } from "../nivel-03/comun";

/** Encuadre del cilindro con el pistón (rótulos a ambos lados). */
export const ESCENARIO_GAS = { encuadre: { w: 6.4, h: 4.9 }, balanceo: 0.04, arrastrable: false, centro: [0.2, -0.3] as [number, number] };
export const CARRUSEL_TERMO = { paso: 9, escala: 0.33, fondo: 0, giro: 0, ancho: 7.6 };

/** Teclas del ajuste entero de 1 en 1 y de 10 en 10 (la tecla Intro la nombra cada etapa). */
export const teclasTermo = (accion: string): Record<string, DecoTecla> => ({
  "↑": { sub: "+1" },
  "↓": { sub: "−1" },
  "→": { sub: "+10" },
  "←": { sub: "−10" },
  intro: { sub: accion },
  h: { sub: "pista" },
});
