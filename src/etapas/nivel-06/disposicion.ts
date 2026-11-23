// ══ Disposición de poleas y engranajes en la escena: ruedas en fila, escaladas para caber (6.2, examen y hero) ───────
import type { ProblemaPoleas } from "@/contenido/nivel-06/circular";
import { NOMBRES_RUEDA } from "@/lib/circular";
import type { Rueda } from "@/three/circular/EscenaRuedas";

/** Separación entre poleas unidas por faja y ancho máximo de la fila (unidades 3D). */
const HUECO = 0.8;
const ANCHO_MAX = 7.6;
const RADIO_MAX = 1.45;
/** Dientes por centímetro de radio: con radios múltiplos de 5 cm el número de dientes guarda la proporción exacta. */
const DIENTES_POR_CM = 0.8;

/** Ruedas en fila, escaladas para caber: la faja deja un hueco, los engranajes casi se tocan y las del mismo eje van encima. */
export function ruedasDe(p: ProblemaPoleas, k: number, estado: "ok" | "mal" | null): Rueda[] {
  const n = p.radios.length;
  const anchoCm = p.radios.reduce((s, r, i) => s + (i === 0 || p.uniones[i - 1] !== "eje" ? 2 * r : 0), 0);
  const huecos = p.uniones.filter((u) => u === "faja").length;
  const s = Math.min(RADIO_MAX / Math.max(...p.radios), (ANCHO_MAX - huecos * HUECO) / anchoCm);
  const r = p.radios.map((x) => x * s);
  const xs = [0];
  const fases = [0];
  // radio de la rueda más grande de cada eje: la siguiente polea debe quedar fuera de ella
  const alcance = [r[0]];
  for (let i = 1; i < n; i++) {
    const u = p.uniones[i - 1];
    if (u === "eje") {
      xs.push(xs[i - 1]);
      fases.push(fases[i - 1]);
      alcance.push(Math.max(alcance[i - 1], r[i]));
      alcance[i - 1] = alcance[i];
    } else if (u === "engranaje") {
      alcance.push(r[i]);
      xs.push(xs[i - 1] + r[i - 1] + r[i] + 0.11);
      // un diente de la anterior apunta a esta: esta deja un hueco enfrente (medio paso corrido)
      fases.push(Math.PI + Math.PI / Math.round(p.radios[i] * DIENTES_POR_CM));
    } else {
      xs.push(xs[i - 1] + alcance[i - 1] + HUECO + r[i]);
      fases.push(0);
      alcance.push(r[i]);
    }
  }
  const centro = (Math.min(...xs.map((x, i) => x - r[i])) + Math.max(...xs.map((x, i) => x + r[i]))) / 2;
  const rMax = Math.max(...r);
  const conDientes = (i: number) => p.uniones[i - 1] === "engranaje" || p.uniones[i] === "engranaje";
  return p.radios.map((R, i) => {
    const ultima = i === n - 1;
    const enEje = i > 0 && p.uniones[i - 1] === "eje";
    const kEscena = ultima ? Math.sign(p.ks[i]) * k : p.ks[i];
    return {
      x: xs[i] - centro,
      y: 0,
      r: r[i],
      k: kEscena,
      dientes: conDientes(i) ? Math.round(R * DIENTES_POR_CM) : 0,
      fase: fases[i],
      z: enEje ? 0.2 : 0,
      rotuloArriba: enEje,
      // rótulos alineados bajo la rueda más grande (los de un mismo eje, encima): así no caen sobre otra rueda
      rotuloDist: enEje ? Math.max(r[i], r[i - 1]) : rMax,
      estado: ultima ? estado : null,
      rotulo: `${NOMBRES_RUEDA[i]} · ${R} cm`,
    };
  });
}

/** Fajas entre cada rueda y la siguiente cuando las une una faja. */
export const fajasDe = (p: ProblemaPoleas): [number, number][] => p.uniones.flatMap((u, i) => (u === "faja" ? [[i, i + 1] as [number, number]] : []));
