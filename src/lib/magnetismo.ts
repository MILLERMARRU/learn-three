// ══ Electromagnetismo: fuerzas magnéticas, campo de un conductor recto e inducción ───────

/** Quita el ruido de coma flotante (las respuestas del curso son exactas). */
const limpio = (x: number) => Math.round(x * 1e9) / 1e9 + 0;

/** Senos exactos de los ángulos del curso (los notables 37° y 53° incluidos). */
export const SENO: Record<number, number> = { 0: 0, 30: 0.5, 37: 0.6, 53: 0.8, 90: 1 };

/** Fuerza sobre un conductor recto: F = B·I·L·sen θ (θ entre el cable y el campo). */
export const fuerzaConductor = (B: number, I: number, L: number, theta = 90) => limpio(B * I * L * SENO[theta]);

/** Fuerza sobre una carga en movimiento: F = q·v·B·sen θ. */
export const fuerzaCarga = (q: number, v: number, B: number, theta = 90) => limpio(q * v * B * SENO[theta]);

/** Radio de la órbita de una carga perpendicular al campo: r = m·v/(q·B). */
export const radioOrbita = (m: number, v: number, q: number, B: number) => limpio((m * v) / (q * B));

/** Campo de un conductor recto largo: B = μ₀·I/(2π·d) = 2 × 10⁻⁷·I/d. */
export const campoRecto = (I: number, d: number) => limpio((2e-7 * I) / d);

/** Fem de una barra que se mueve perpendicular al campo: ε = B·L·v. */
export const femMovimiento = (B: number, L: number, v: number) => limpio(B * L * v);

/** Ley de Faraday para una bobina de N espiras: ε = N·ΔΦ/Δt, con Φ = B·A. */
export const femFaraday = (N: number, dPhi: number, dt: number) => limpio((N * dPhi) / dt);
