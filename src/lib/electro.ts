// ══ Electrostática: ley de Coulomb, campo y potencial de cargas puntuales (k = 9 × 10⁹ N·m²/C²) ───────

export const K = 9e9;
/** Un microcoulomb en coulomb. */
export const MICRO = 1e-6;

/** Quita el ruido de coma flotante (las respuestas del curso son exactas). */
const limpio = (x: number) => Math.round(x * 1e9) / 1e9 + 0;

/** Fuerza entre dos cargas (N, C, m): F = k·|q₁·q₂|/d² (siempre positiva; el signo dice si atraen o repelen). */
export const coulomb = (q1: number, q2: number, d: number) => limpio((K * Math.abs(q1 * q2)) / (d * d));

/** Si dos cargas se atraen (signos opuestos). */
export const seAtraen = (q1: number, q2: number) => q1 * q2 < 0;

/** Campo de una carga puntual (N/C) a la distancia d: E = k·|Q|/d². */
export const campo = (Q: number, d: number) => limpio((K * Math.abs(Q)) / (d * d));

/** Potencial de una carga puntual (V) a la distancia d, con signo: V = k·Q/d. */
export const potencial = (Q: number, d: number) => limpio((K * Q) / d);

/** Trabajo del campo al llevar la carga q de A a B: W = q·(V_A − V_B). */
export const trabajoElectrico = (q: number, VA: number, VB: number) => limpio(q * (VA - VB));
