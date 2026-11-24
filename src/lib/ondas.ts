// ══ Ondas mecánicas: v = λ·f, velocidad en una cuerda y ondas estacionarias ───────

/** Quita el ruido de coma flotante (las respuestas del curso son exactas). */
const limpio = (x: number) => Math.round(x * 1e9) / 1e9 + 0;

/** Velocidad de una onda: v = λ·f. */
export const velocidadOnda = (lambda: number, f: number) => limpio(lambda * f);

/** Longitud de onda: λ = v/f. */
export const longitudOnda = (v: number, f: number) => limpio(v / f);

/** Frecuencia: f = v/λ. */
export const frecuenciaOnda = (v: number, lambda: number) => limpio(v / lambda);

/** Velocidad de una onda en una cuerda tensa: v = √(T/μ), con T en N y μ en kg/m. */
export const velocidadCuerda = (T: number, mu: number) => limpio(Math.sqrt(T / mu));

/** Longitud de onda del armónico n en una cuerda fija en los extremos: λₙ = 2L/n. */
export const longitudArmonico = (n: number, L: number) => limpio((2 * L) / n);

/** Frecuencia del armónico n: fₙ = n·v/(2L). */
export const frecuenciaArmonico = (n: number, v: number, L: number) => limpio((n * v) / (2 * L));
