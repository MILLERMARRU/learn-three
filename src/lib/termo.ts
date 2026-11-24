// ══ Termodinámica: gases ideales, trabajo de un gas, primera ley y máquinas térmicas ───────

/** Quita el ruido de coma flotante (las respuestas del curso son exactas). */
const limpio = (x: number) => Math.round(x * 1e9) / 1e9 + 0;

/** Temperatura absoluta (K) a partir de °C (el curso usa 273). */
export const kelvin = (t: number) => t + 273;

/** Volumen final de un gas ideal: P₁V₁/T₁ = P₂V₂/T₂ → V₂ = V₁·(P₁/P₂)·(T₂/T₁), con T en kelvin. */
export const volumenFinal = (P1: number, V1: number, T1: number, P2: number, T2: number) => limpio((V1 * P1 * T2) / (T1 * P2));

/** Trabajo de un gas a presión constante: W = P·ΔV (positivo si se expande). */
export const trabajoIsobarico = (P: number, V1: number, V2: number) => limpio(P * (V2 - V1));

/** Primera ley: el calor recibido se reparte entre el cambio de energía interna y el trabajo, ΔU = Q − W. */
export const energiaInterna = (Q: number, W: number) => limpio(Q - W);

/** Eficiencia de una máquina térmica: η = W/Q₁ = 1 − Q₂/Q₁. */
export const eficiencia = (Q1: number, Q2: number) => limpio(1 - Q2 / Q1);

/** Eficiencia de Carnot (la máxima posible) entre focos a T₁ y T₂ (kelvin): η = 1 − T₂/T₁. */
export const carnot = (T1: number, T2: number) => limpio(1 - T2 / T1);
