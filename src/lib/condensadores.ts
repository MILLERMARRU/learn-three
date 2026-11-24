// ══ Condensadores: carga, asociación y energía almacenada ───────

/** Quita el ruido de coma flotante (las respuestas del curso son exactas). */
const limpio = (x: number) => Math.round(x * 1e9) / 1e9 + 0;

/** Carga de un condensador: Q = C·V (con un dieléctrico de constante κ, la capacidad se multiplica por κ). */
export const carga = (C: number, V: number, kappa = 1) => limpio(kappa * C * V);

/** Capacidad equivalente en paralelo: C = C₁ + C₂ + … */
export const capParalelo = (cs: number[]) => limpio(cs.reduce((a, b) => a + b, 0));

/** Capacidad equivalente en serie: 1/C = 1/C₁ + 1/C₂ + … */
export const capSerie = (cs: number[]) => limpio(1 / cs.reduce((a, c) => a + 1 / c, 0));

/** Energía almacenada: U = ½·C·V² = Q²/(2C) = ½·Q·V. */
export const energiaCV = (C: number, V: number) => limpio((C * V * V) / 2);
export const energiaQC = (Q: number, C: number) => limpio((Q * Q) / (2 * C));
export const energiaQV = (Q: number, V: number) => limpio((Q * V) / 2);
