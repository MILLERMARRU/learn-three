// ══ Hero del inicio: cada nivel define su escena 3D y su leyenda ───────
import type { ReactNode } from "react";

export interface VistaHero {
  /** Contenido 3D (va dentro del Canvas). */
  escena: ReactNode;
  /** Leyenda bajo la escena (tema y ecuación). */
  pie: ReactNode;
  encuadre: { w: number; h: number };
  centro?: [number, number];
  balanceo?: number;
}

/**
 * Función pura: a partir del reloj devuelve qué mostrar.
 * `tick` = pasos de PASO_MS desde que se eligió el nivel; `nivel` = índice (0 = nivel 1).
 */
export type Hero = (tick: number, nivel: number) => VistaHero;

export const PASO_MS = 170;
