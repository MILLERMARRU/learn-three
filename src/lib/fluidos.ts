// ══ Hidrostática: presión en un líquido, principio de Pascal y principio de Arquímedes ───────

/** Gravedad del curso (m/s²), densidad del agua (kg/m³) y presión atmosférica (Pa). */
export const G = 10;
export const RHO_AGUA = 1000;
export const P_ATM = 100_000;

/** Quita el ruido de coma flotante (las respuestas del curso son exactas). */
const limpio = (x: number) => Math.round(x * 1e9) / 1e9 + 0;

/** Presión manométrica a una profundidad h (Pa): P = ρ·g·h. */
export const presionManometrica = (rho: number, h: number) => limpio(rho * G * h);

/** Presión absoluta (Pa): la atmosférica más la del líquido. */
export const presionAbsoluta = (rho: number, h: number) => limpio(P_ATM + rho * G * h);

/** Prensa hidráulica: la misma presión en los dos émbolos, F₁/A₁ = F₂/A₂ → F₁ = F₂·A₁/A₂. */
export const fuerzaPrensa = (F2: number, A1: number, A2: number) => limpio((F2 * A1) / A2);

/** Empuje de Arquímedes (N): el peso del líquido desalojado, E = ρ·g·V. */
export const empuje = (rhoLiquido: number, V: number) => limpio(rhoLiquido * G * V);

/** Profundidad a la que se hunde un bloque de altura H que flota: h = H·ρ_c/ρ_l (si ρ_c ≥ ρ_l, se hunde entero). */
export const profundidadFlotacion = (H: number, rhoCuerpo: number, rhoLiquido: number) => limpio(Math.min(H, (H * rhoCuerpo) / rhoLiquido));

/** Peso aparente (N) de un cuerpo de masa m y volumen V sumergido por completo. */
export const pesoAparente = (m: number, V: number, rhoLiquido: number) => limpio(m * G - rhoLiquido * G * V);
