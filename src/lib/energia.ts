// ══ Trabajo, energía y potencia: trabajo de una fuerza, teorema trabajo-energía, energía mecánica y potencia ───────
import { senCos } from "./estatica.ts";

/** Aceleración de la gravedad del curso (m/s²). */
export const G = 10;

/** Quita el ruido de coma flotante (las respuestas del curso son exactas). */
const limpio = (x: number) => Math.round(x * 1e9) / 1e9 + 0; // + 0 convierte −0 en 0

/** Trabajo de una fuerza constante F que forma θ grados con el desplazamiento d: W = F·d·cos θ. */
export function trabajo(F: number, d: number, theta = 0): number {
  return limpio(F * d * senCos(theta)[1]);
}

/** Energía cinética: Ec = ½·m·v². */
export const energiaCinetica = (m: number, v: number) => limpio(0.5 * m * v * v);

/** Energía potencial gravitatoria: Ep = m·g·h. */
export const energiaPotencial = (m: number, h: number) => limpio(m * G * h);

/** Energía potencial elástica: Epe = ½·k·x². */
export const energiaElastica = (k: number, x: number) => limpio(0.5 * k * x * x);

/** Teorema del trabajo y la energía: W_neto = ½m(v² − v₀²) → v = √(v₀² + 2W/m); 0 si se detiene antes. */
export function rapidezTrasTrabajo(W: number, m: number, v0 = 0): number {
  const v2 = v0 * v0 + (2 * W) / m;
  return v2 > 0 ? limpio(Math.sqrt(v2)) : 0;
}

/**
 * Trabajo neto sobre un bloque empujado en una zona de d metros por F (θ grados sobre la horizontal),
 * con rozamiento cinético μ. La fuerza inclinada hacia arriba alivia la normal: N = mg − F sen θ.
 */
export function trabajoNeto(F: number, theta: number, d: number, m: number, mu: number): number {
  const [s, c] = senCos(theta);
  const N = Math.max(0, m * G - F * s);
  return limpio((F * c - mu * N) * d);
}

/** Conservación de la energía mecánica: rapidez tras bajar h metros (h < 0 si sube). */
export function rapidezEnergia(v0: number, h: number): number {
  const v2 = v0 * v0 + 2 * G * h;
  return v2 > 0 ? limpio(Math.sqrt(v2)) : 0;
}

/** Altura que sube hasta detenerse con rapidez inicial v: h = v²/2g. */
export const alturaMaxima = (v: number) => limpio((v * v) / (2 * G));

/** Potencia útil para subir m kilos h metros en t segundos a velocidad constante: P = mgh/t. */
export const potenciaElevar = (m: number, h: number, t: number) => limpio((m * G * h) / t);

/** Potencia que debe entregar un motor de rendimiento η (0–1) para dar la potencia útil P. */
export const potenciaEntregada = (P: number, eta: number) => limpio(P / eta);
