// ══ Oscilaciones (MAS): masa-resorte, péndulo simple, relación con el movimiento circular y energía ───────
// Como en los exámenes de admisión, se usa π² ≈ 10 cuando el enunciado lo indica: así 2π√(m/k) = 2√(10·m/k).

/** Aproximación del curso para π². */
export const PI2 = 10;

/** Quita el ruido de coma flotante (las respuestas del curso son exactas). */
const limpio = (x: number) => Math.round(x * 1e9) / 1e9 + 0;

/** Período del sistema masa-resorte: T = 2π√(m/k) (con π² = PI2). */
export const periodoResorte = (m: number, k: number) => limpio(2 * Math.sqrt((PI2 * m) / k));

/** Período del péndulo simple: T = 2π√(L/g) (con π² = PI2). */
export const periodoPendulo = (L: number, g = PI2) => limpio(2 * Math.sqrt((PI2 * L) / g));

/** Velocidad máxima del MAS: v = A·ω (pasa por el centro). */
export const velocidadMaxima = (A: number, w: number) => limpio(A * w);

/** Aceleración máxima del MAS: a = A·ω² (en los extremos). */
export const aceleracionMaxima = (A: number, w: number) => limpio(A * w * w);

/** Rapidez a una distancia x del centro: v = ω·√(A² − x²). */
export const velocidadEnX = (A: number, w: number, x: number) => limpio(w * Math.sqrt(Math.max(0, A * A - x * x)));

/** Energía mecánica del oscilador: E = ½·k·A². */
export const energiaMAS = (k: number, A: number) => limpio(0.5 * k * A * A);
