// ══ Estática: fuerzas como vectores, primera condición de equilibrio (ΣF = 0), cuerdas y planos inclinados ───────
// Los ángulos van en grados desde el eje +x, en sentido antihorario. Los notables (30°, 37°, 45°, 53°, 60°) son exactos.

export type Vec2 = [number, number];

/** Aceleración de la gravedad del curso (m/s²). */
export const G = 10;

const RAIZ3_2 = Math.sqrt(3) / 2;
const RAIZ2_2 = Math.SQRT1_2;
/** [sen, cos] exactos de los ángulos de referencia notables. */
const NOTABLES: Record<number, [number, number]> = { 0: [0, 1], 30: [0.5, RAIZ3_2], 37: [0.6, 0.8], 45: [RAIZ2_2, RAIZ2_2], 53: [0.8, 0.6], 60: [RAIZ3_2, 0.5] };

/** [sen θ, cos θ] para cualquier ángulo en grados: exacto si el ángulo de referencia es notable. */
export function senCos(grados: number): Vec2 {
  const a = ((grados % 360) + 360) % 360;
  const cuadrante = Math.floor(a / 90);
  const r = a % 90;
  const [s, c] = NOTABLES[r] ?? [Math.sin((r * Math.PI) / 180), Math.cos((r * Math.PI) / 180)];
  // sen(90° + r) = cos r · cos(90° + r) = −sen r, y así en cada cuadrante
  if (cuadrante === 0) return [s, c];
  if (cuadrante === 1) return [c, -s];
  if (cuadrante === 2) return [-s, -c];
  return [-c, s];
}

/** Fuerza de módulo F en la dirección del ángulo (grados). */
export function fuerza(F: number, grados: number): Vec2 {
  const [s, c] = senCos(grados);
  return [F * c, F * s];
}

/** Suma de fuerzas (la resultante). */
export const sumar = (fs: Vec2[]): Vec2 => fs.reduce<Vec2>((r, f) => [r[0] + f[0], r[1] + f[1]], [0, 0]);

export const modulo = (v: Vec2) => Math.hypot(v[0], v[1]);

/** Primera condición de equilibrio: la resultante es nula (con tolerancia numérica). */
export const enEquilibrio = (fs: Vec2[], tol = 1e-9) => modulo(sumar(fs)) < tol;

/** Componente de v en la dirección unitaria u. */
export const proyectar = (v: Vec2, u: Vec2) => v[0] * u[0] + v[1] * u[1];

/**
 * Tensiones de dos cuerdas que sostienen un peso W: la izquierda forma α con la horizontal y la derecha β.
 * ΣFx = 0: T₁ cos α = T₂ cos β · ΣFy = 0: T₁ sen α + T₂ sen β = W  →  T₁ = W cos β / sen(α + β), T₂ = W cos α / sen(α + β).
 */
export function dosCuerdas(W: number, alfa: number, beta: number): Vec2 {
  const s = senCos(alfa + beta)[0];
  return [(W * senCos(beta)[1]) / s, (W * senCos(alfa)[1]) / s];
}

/**
 * Fuerza para sostener un peso W con un aparejo potencial de `moviles` poleas móviles (0 = solo una polea fija).
 * Cada polea móvil cuelga de dos tramos de cuerda: T = (T + P) / 2, con P el peso de cada polea móvil.
 */
export function fuerzaPoleas(W: number, moviles: number, P = 0): number {
  let T = W;
  for (let i = 0; i < moviles; i++) T = (T + P) / 2;
  return T;
}

/** Componentes del peso en un plano inclinado θ: paralela al plano (W sen θ) y perpendicular (W cos θ). */
export function enPlano(W: number, theta: number): { paralela: number; normal: number } {
  const [s, c] = senCos(theta);
  return { paralela: W * s, normal: W * c };
}
