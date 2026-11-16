// ══ Nivel 1 · Etapa 1.1: magnitudes derivadas y su ecuación dimensional ───────
import type { ReactNode } from "react";
import type { Dim } from "@/lib/dim";
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, Sup, Txt, V } from "@/ui/Formula";

export interface Magnitud {
  id: string;
  nombre: string;
  articulo: "el" | "la";
  simbolo: ReactNode;
  formula: ReactNode;
  unidad: string;
  dim: Dim;
  pistas: [string, string];
}

const M: Record<string, Magnitud> = {
  area: {
    id: "area", nombre: "área", articulo: "el", simbolo: <V>A</V>, unidad: "m²", dim: { L: 2 },
    formula: <><V>A</V><Op>=</Op><Txt>largo</Txt><Op>·</Op><Txt>ancho</Txt></>,
    pistas: ["El área es una longitud por otra longitud.", "largo → L   ·   ancho → L"],
  },
  velocidad: {
    id: "velocidad", nombre: "velocidad", articulo: "la", simbolo: <V>v</V>, unidad: "m/s", dim: { L: 1, T: -1 },
    formula: <><V>v</V><Op>=</Op><Frac n={<V>d</V>} d={<V>t</V>} /></>,
    pistas: ["Distancia dividida entre tiempo.", "[d] = L arriba   ·   [t] = T abajo (exponente −1)"],
  },
  aceleracion: {
    id: "aceleracion", nombre: "aceleración", articulo: "la", simbolo: <V>a</V>, unidad: "m/s²", dim: { L: 1, T: -2 },
    formula: <><V>a</V><Op>=</Op><Frac n={<>Δ<V>v</V></>} d={<V>t</V>} /></>,
    pistas: ["Cambio de velocidad entre tiempo.", "[v] = LT⁻¹, y al dividir entre T queda T⁻²"],
  },
  fuerza: {
    id: "fuerza", nombre: "fuerza", articulo: "la", simbolo: <V>F</V>, unidad: "newton (N)", dim: { M: 1, L: 1, T: -2 },
    formula: <><V>F</V><Op>=</Op><V>m</V><Op>·</Op><V>a</V></>,
    pistas: ["Masa por aceleración.", "[m] = M   ·   [a] = LT⁻²"],
  },
  densidad: {
    id: "densidad", nombre: "densidad", articulo: "la", simbolo: <V>ρ</V>, unidad: "kg/m³", dim: { M: 1, L: -3 },
    formula: <><V>ρ</V><Op>=</Op><Frac n={<V>m</V>} d={<V>V</V>} /></>,
    pistas: ["Masa entre volumen.", "[m] = M   ·   [V] = L³ va abajo → L⁻³"],
  },
  trabajo: {
    id: "trabajo", nombre: "trabajo", articulo: "el", simbolo: <V>W</V>, unidad: "joule (J)", dim: { M: 1, L: 2, T: -2 },
    formula: <><V>W</V><Op>=</Op><V>F</V><Op>·</Op><V>d</V></>,
    pistas: ["Fuerza por distancia.", "[F] = MLT⁻²   ·   [d] = L"],
  },
  potencia: {
    id: "potencia", nombre: "potencia", articulo: "la", simbolo: <V>P</V>, unidad: "watt (W)", dim: { M: 1, L: 2, T: -3 },
    formula: <><V>P</V><Op>=</Op><Frac n={<V>W</V>} d={<V>t</V>} /></>,
    pistas: ["Trabajo entre tiempo.", "[W] = ML²T⁻² y al dividir entre T queda T⁻³"],
  },
  presion: {
    id: "presion", nombre: "presión", articulo: "la", simbolo: <V>p</V>, unidad: "pascal (Pa)", dim: { M: 1, L: -1, T: -2 },
    formula: <><V>p</V><Op>=</Op><Frac n={<V>F</V>} d={<V>A</V>} /></>,
    pistas: ["Fuerza entre área.", "[F] = MLT⁻²   ÷   [A] = L²  →  L¹⁻² = L⁻¹"],
  },
  frecuencia: {
    id: "frecuencia", nombre: "frecuencia", articulo: "la", simbolo: <V>f</V>, unidad: "hertz (Hz)", dim: { T: -1 },
    formula: <><V>f</V><Op>=</Op><Frac n="1" d={<V>T</V>} /></>,
    pistas: ["Cuántas vueltas por segundo: un número entre un tiempo.", "Los números no tienen dimensión: queda 1 ÷ T"],
  },
  momento: {
    id: "momento", nombre: "cantidad de movimiento", articulo: "la", simbolo: <V>p</V>, unidad: "kg·m/s", dim: { M: 1, L: 1, T: -1 },
    formula: <><V>p</V><Op>=</Op><V>m</V><Op>·</Op><V>v</V></>,
    pistas: ["Masa por velocidad.", "[m] = M   ·   [v] = LT⁻¹"],
  },
  angulo: {
    id: "angulo", nombre: "ángulo", articulo: "el", simbolo: <V>θ</V>, unidad: "radián (rad)", dim: {},
    formula: <><V>θ</V><Op>=</Op><Frac n={<Txt>arco</Txt>} d={<Txt>radio</Txt>} /></>,
    pistas: ["Longitud dividida entre longitud…", "L ÷ L = 1: es adimensional. Escribe 1"],
  },
  caudal: {
    id: "caudal", nombre: "caudal", articulo: "el", simbolo: <V>Q</V>, unidad: "m³/s", dim: { L: 3, T: -1 },
    formula: <><V>Q</V><Op>=</Op><Frac n={<V>V</V>} d={<V>t</V>} /></>,
    pistas: ["Volumen que pasa por segundo.", "[V] = L³   ÷   T"],
  },
  cinetica: {
    id: "cinetica", nombre: "energía cinética", articulo: "la", simbolo: <><V>E</V><Sub>c</Sub></>, unidad: "joule (J)", dim: { M: 1, L: 2, T: -2 },
    formula: <><V>E</V><Sub>c</Sub><Op>=</Op><Frac n="1" d="2" /><V>m</V><V>v</V><Sup>2</Sup></>,
    pistas: ["½ es un número: no tiene dimensión.", "[m] = M   ·   [v]² = L²T⁻²"],
  },
  pesoEsp: {
    id: "pesoEsp", nombre: "peso específico", articulo: "el", simbolo: <V>γ</V>, unidad: "N/m³", dim: { M: 1, L: -2, T: -2 },
    formula: <><V>γ</V><Op>=</Op><Frac n={<Txt>peso</Txt>} d={<V>V</V>} /></>,
    pistas: ["El peso es una fuerza; se divide entre un volumen.", "MLT⁻²  ÷  L³  →  L¹⁻³ = L⁻²"],
  },
  carga: {
    id: "carga", nombre: "carga eléctrica", articulo: "la", simbolo: <V>q</V>, unidad: "coulomb (C)", dim: { I: 1, T: 1 },
    formula: <><V>q</V><Op>=</Op><V>I</V><Op>·</Op><V>t</V></>,
    pistas: ["Corriente por tiempo. La corriente es fundamental: I.", "[I] = I   ·   [t] = T"],
  },
  angular: {
    id: "angular", nombre: "velocidad angular", articulo: "la", simbolo: <V>ω</V>, unidad: "rad/s", dim: { T: -1 },
    formula: <><V>ω</V><Op>=</Op><Frac n={<V>θ</V>} d={<V>t</V>} /></>,
    pistas: ["El ángulo es adimensional.", "1 ÷ T"],
  },
  calorEsp: {
    id: "calorEsp", nombre: "calor específico", articulo: "el", simbolo: <V>c</V>, unidad: "J/(kg·K)", dim: { L: 2, T: -2, θ: -1 },
    formula: <><V>c</V><Op>=</Op><Frac n={<V>Q</V>} d={<><V>m</V><Op>·</Op>Δ<V>T</V></>} /></>,
    pistas: ["Calor (energía) entre masa y temperatura. θ se escribe con la tecla O.", "ML²T⁻²  ÷  (M · θ)  → la M se cancela"],
  },
};

export const MAGNITUDES = M;

export const RONDAS_MOLECULAS: RondaDef<Magnitud>[] = [
  { ronda: "guiado", items: [M.area, M.velocidad, M.aceleracion, M.fuerza, M.densidad] },
  { ronda: "pista", items: [M.trabajo, M.potencia, M.presion, M.frecuencia, M.momento, M.angulo] },
  { ronda: "solo", items: [M.caudal, M.cinetica, M.pesoEsp, M.carga, M.angular, M.calorEsp] },
];
