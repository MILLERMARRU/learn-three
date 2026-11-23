// ══ Dinámica: segunda ley de Newton (ΣF = m·a), rozamiento y movimiento con aceleración constante ───────
import { senCos } from "./estatica.ts";

/** Aceleración de la gravedad del curso (m/s²). */
export const G = 10;

/** Segunda ley de Newton: a = ΣF / m. */
export const aceleracion = (fuerzaNeta: number, m: number) => fuerzaNeta / m;

/** Rozamiento cinético: f = μ·N (en un piso horizontal, N = m·g). */
export const rozamiento = (mu: number, N: number) => mu * N;

/** Posición con aceleración constante: x = v₀·t + ½·a·t². */
export const posicion = (a: number, t: number, v0 = 0) => v0 * t + 0.5 * a * t * t;

/** Aceleración para recorrer d metros en t segundos desde el reposo: a = 2d / t². */
export const aceleracionPara = (d: number, t: number) => (2 * d) / (t * t);

/** Fuerza horizontal para recorrer d en t desde el reposo en un piso con rozamiento μ: F = m·(2d/t² + μ·g). */
export const fuerzaPara = (m: number, d: number, t: number, mu = 0) => m * (aceleracionPara(d, t) + mu * G);

/**
 * Aceleración de un bloque que baja libremente por un plano inclinado θ con rozamiento μ: a = g·(sen θ − μ·cos θ).
 * No depende de la masa. Si el rozamiento alcanza para frenarlo, no baja (a = 0).
 */
export function aceleracionPlano(theta: number, mu = 0): number {
  const [s, c] = senCos(theta);
  const a = G * (s - mu * c);
  return a > 1e-9 ? Math.round(a * 1e9) / 1e9 : 0;
}

/** Un sistema de dos bloques unidos por una cuerda ideal: su aceleración (m/s²) y la tensión de la cuerda (N). */
export interface Sistema {
  a: number;
  T: number;
}

/** Máquina de Atwood: m₁ y m₂ cuelgan de una polea; m₁ baja si es más pesada. a = (m₁ − m₂)g/(m₁ + m₂), T = 2m₁m₂g/(m₁ + m₂). */
export function atwood(m1: number, m2: number): Sistema {
  return { a: (Math.abs(m1 - m2) * G) / (m1 + m2), T: (2 * m1 * m2 * G) / (m1 + m2) };
}

/**
 * Bloque m₁ sobre una mesa (rozamiento μ) unido a m₂ que cuelga por el borde: a = (m₂g − μm₁g)/(m₁ + m₂), T = m₂(g − a).
 * Si el rozamiento alcanza a sostenerlo, no se mueve (a = 0, T = m₂g).
 */
export function mesaColgante(m1: number, m2: number, mu = 0): Sistema {
  const a = Math.max(0, (m2 * G - mu * m1 * G) / (m1 + m2));
  return { a, T: m2 * (G - a) };
}

/**
 * Aceleración de un bloque empujado con F en un piso con rozamiento μ.
 * Si F no vence al rozamiento, el bloque no se mueve (a = 0).
 */
export function aceleracionEnPiso(F: number, m: number, mu = 0): number {
  const f = rozamiento(mu, m * G);
  return F > f ? aceleracion(F - f, m) : 0;
}
