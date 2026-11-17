// ══ Gráficas del movimiento: interpolación, áreas (integral) y pendientes de polilíneas ───────
export type Punto = [number, number];

/** Valor de la polilínea en t (lineal entre puntos; constante fuera del rango). */
export function interpolar(p: Punto[], t: number): number {
  if (t <= p[0][0]) return p[0][1];
  for (let i = 1; i < p.length; i++) {
    const [t0, y0] = p[i - 1];
    const [t1, y1] = p[i];
    if (t <= t1) return t1 === t0 ? y1 : y0 + ((y1 - y0) * (t - t0)) / (t1 - t0);
  }
  return p[p.length - 1][1];
}

/** Área con signo bajo la polilínea desde su primer punto hasta t (en v–t: el desplazamiento). */
export function integrar(p: Punto[], t: number): number {
  let s = 0;
  for (let i = 1; i < p.length; i++) {
    const [t0, y0] = p[i - 1];
    const [t1] = p[i];
    if (t <= t0) break;
    const tb = Math.min(t, t1);
    if (tb > t0) s += ((y0 + interpolar([p[i - 1], p[i]], tb)) / 2) * (tb - t0);
  }
  return s;
}

/** Puntos equiespaciados (t = 0, dt, 2dt…). */
export const puntosDe = (valores: number[], dt: number): Punto[] => valores.map((v, i) => [i * dt, v]);

/** Barras de valor constante por tramo (v–t de un movimiento con tramos MRU). */
export function escalones(valores: number[], dt: number): Punto[] {
  const p: Punto[] = [];
  valores.forEach((v, i) => p.push([i * dt, v], [(i + 1) * dt, v]));
  return p;
}

/** Pendiente de cada tramo entre puntos equiespaciados. */
export const pendientes = (valores: number[], dt: number) => valores.slice(1).map((x, i) => (x - valores[i]) / dt);
