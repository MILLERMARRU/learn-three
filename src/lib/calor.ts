// ══ Calor: dilatación térmica, calor sensible y equilibrio térmico (calorías, c del agua = 1 cal/g·°C) ───────

/** Quita el ruido de coma flotante (las respuestas del curso son exactas). */
const limpio = (x: number) => Math.round(x * 1e9) / 1e9 + 0;

/** Cambio de longitud (en las unidades de L₀): ΔL = L₀·α·ΔT (negativo si se enfría). */
export const dilatacion = (L0: number, alfa: number, dT: number) => limpio(L0 * alfa * dT);

/** Calor sensible (cal) para cambiar en ΔT la temperatura de m gramos de calor específico c: Q = m·c·ΔT. */
export const calorSensible = (m: number, c: number, dT: number) => limpio(m * c * dT);

/** Temperatura final (°C) tras recibir Q calorías: T = T₀ + Q/(m·c). */
export const temperaturaFinal = (T0: number, Q: number, m: number, c: number) => limpio(T0 + Q / (m * c));

export interface Cuerpo {
  /** Masa (g), calor específico (cal/g·°C) y temperatura inicial (°C). */
  m: number;
  c: number;
  T: number;
}

/** Temperatura de equilibrio de una mezcla sin pérdidas: Tₑ = Σ m·c·T / Σ m·c. */
export const equilibrio = (cuerpos: Cuerpo[]) => limpio(cuerpos.reduce((s, k) => s + k.m * k.c * k.T, 0) / cuerpos.reduce((s, k) => s + k.m * k.c, 0));
