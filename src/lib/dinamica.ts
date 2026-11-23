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

/**
 * Aceleración de un bloque empujado con F en un piso con rozamiento μ.
 * Si F no vence al rozamiento, el bloque no se mueve (a = 0).
 */
export function aceleracionEnPiso(F: number, m: number, mu = 0): number {
  const f = rozamiento(mu, m * G);
  return F > f ? aceleracion(F - f, m) : 0;
}
