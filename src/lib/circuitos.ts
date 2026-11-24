// ══ Electrodinámica: ley de Ohm, resistencias equivalentes y potencia eléctrica ───────

/** Quita el ruido de coma flotante (las respuestas del curso son exactas). */
const limpio = (x: number) => Math.round(x * 1e9) / 1e9 + 0;

/** Ley de Ohm: V = I·R. */
export const voltaje = (I: number, R: number) => limpio(I * R);
export const corriente = (V: number, R: number) => limpio(V / R);
export const resistencia = (V: number, I: number) => limpio(V / I);

/** Resistencias en serie: R = R₁ + R₂ + … */
export const serie = (rs: number[]) => limpio(rs.reduce((a, b) => a + b, 0));

/** Resistencias en paralelo: 1/R = 1/R₁ + 1/R₂ + … */
export const paralelo = (rs: number[]) => limpio(1 / rs.reduce((a, r) => a + 1 / r, 0));

/** Potencia eléctrica: P = V·I = I²·R = V²/R. */
export const potenciaVI = (V: number, I: number) => limpio(V * I);
export const potenciaIR = (I: number, R: number) => limpio(I * I * R);
export const potenciaVR = (V: number, R: number) => limpio((V * V) / R);

/** Energía (kW·h) de un aparato de P vatios durante h horas. */
export const energiaKWh = (P: number, h: number) => limpio((P * h) / 1000);
