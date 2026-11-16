// ══ Nivel 1 · Etapa 1.3: fórmulas empíricas (hallar exponentes) ───────
import type { ReactNode } from "react";
import type { Dim } from "@/lib/dim";
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Raiz, V } from "@/ui/Formula";

export type EscenaLab = "pendulo" | "caida" | "circular" | "onda";

export interface Laboratorio {
  id: string;
  titulo: string;
  descripcion: string;
  experimento: string;
  escena: EscenaLab;
  resultado: { s: string; nombre: string; dim: Dim };
  variables: { s: string; nombre: string; dim: Dim; exp: string }[];
  respuesta: number[];
  final: ReactNode;
  controles: { teclas: string[]; texto: string }[];
  pistas: [string, string];
}

const L: Record<string, Laboratorio> = {
  pendulo: {
    id: "pendulo",
    titulo: "El péndulo",
    descripcion: "¿De qué depende el periodo de un péndulo? Suponemos que depende de su largo, de la gravedad y de su masa.",
    experimento: "Cambia la masa (tecla M o clic en la bola): ¿cambia el periodo? Eso ya te dice un exponente.",
    escena: "pendulo",
    resultado: { s: "T", nombre: "periodo", dim: { T: 1 } },
    variables: [
      { s: "L", nombre: "largo", dim: { L: 1 }, exp: "x" },
      { s: "g", nombre: "gravedad", dim: { L: 1, T: -2 }, exp: "y" },
      { s: "m", nombre: "masa", dim: { M: 1 }, exp: "z" },
    ],
    respuesta: [0.5, -0.5, 0],
    final: <><V>T</V><Op>=</Op><V>k</V><Raiz><Frac n={<V>L</V>} d={<V>g</V>} /></Raiz></>,
    controles: [
      { teclas: ["−", "+"], texto: "largo" },
      { teclas: ["M"], texto: "masa" },
    ],
    pistas: ["La masa no cambia el periodo: su exponente es 0. Solo M aparece en m.", "La fila T dice −2y = 1, así que y = −½. Luego x + y = 0."],
  },
  caida: {
    id: "caida",
    titulo: "Caída libre",
    descripcion: "Una bola cae desde una altura h. ¿Con qué rapidez llega al suelo? Depende de la gravedad y de la altura.",
    experimento: "Cambia la altura con − y +. Mira la foto estroboscópica: cada vez recorre más.",
    escena: "caida",
    resultado: { s: "v", nombre: "rapidez final", dim: { L: 1, T: -1 } },
    variables: [
      { s: "g", nombre: "gravedad", dim: { L: 1, T: -2 }, exp: "x" },
      { s: "h", nombre: "altura", dim: { L: 1 }, exp: "y" },
    ],
    respuesta: [0.5, 0.5],
    final: <><V>v</V><Op>=</Op><V>k</V><Raiz><V>g</V><V>h</V></Raiz></>,
    controles: [{ teclas: ["−", "+"], texto: "altura" }],
    pistas: ["Solo g tiene tiempo: la fila T es −2x = −1.", "x = ½, y la fila L pide x + y = 1."],
  },
  circular: {
    id: "circular",
    titulo: "Fuerza centrípeta",
    descripcion: "Una bola gira atada a un hilo. La fuerza que la mantiene en círculo depende de su masa, su rapidez y el radio.",
    experimento: "Duplica la rapidez con +: la flecha crece cuatro veces. Cambia el radio con R.",
    escena: "circular",
    resultado: { s: "F", nombre: "fuerza", dim: { M: 1, L: 1, T: -2 } },
    variables: [
      { s: "m", nombre: "masa", dim: { M: 1 }, exp: "x" },
      { s: "v", nombre: "rapidez", dim: { L: 1, T: -1 }, exp: "y" },
      { s: "R", nombre: "radio", dim: { L: 1 }, exp: "z" },
    ],
    respuesta: [1, 2, -1],
    final: <><V>F</V><Op>=</Op><V>k</V><Frac n={<><V>m</V><V>v</V><sup className="fx-sup">2</sup></>} d={<V>R</V>} /></>,
    controles: [
      { teclas: ["−", "+"], texto: "rapidez" },
      { teclas: ["R"], texto: "radio" },
      { teclas: ["M"], texto: "masa" },
    ],
    pistas: ["Solo m tiene masa: x = 1. Solo v tiene tiempo: −y = −2.", "y = 2. La fila L pide y + z = 1."],
  },
  onda: {
    id: "onda",
    titulo: "Onda en una cuerda",
    descripcion: "La rapidez de una onda en una cuerda tensa depende de la tensión F y de la densidad lineal μ (kg/m).",
    experimento: "Sube la tensión con + y cambia el grosor con M: ¿cuál la acelera y cuál la frena?",
    escena: "onda",
    resultado: { s: "v", nombre: "rapidez de la onda", dim: { L: 1, T: -1 } },
    variables: [
      { s: "F", nombre: "tensión", dim: { M: 1, L: 1, T: -2 }, exp: "x" },
      { s: "μ", nombre: "densidad lineal", dim: { M: 1, L: -1 }, exp: "y" },
    ],
    respuesta: [0.5, -0.5],
    final: <><V>v</V><Op>=</Op><V>k</V><Raiz><Frac n={<V>F</V>} d={<V>μ</V>} /></Raiz></>,
    controles: [
      { teclas: ["−", "+"], texto: "tensión" },
      { teclas: ["M"], texto: "grosor" },
    ],
    pistas: ["Solo F tiene tiempo: −2x = −1.", "x = ½. La fila M pide x + y = 0."],
  },
};

export const RONDAS_LAB: RondaDef<Laboratorio>[] = [
  { ronda: "guiado", items: [L.pendulo] },
  { ronda: "pista", items: [L.caida] },
  { ronda: "solo", items: [L.circular, L.onda] },
];
