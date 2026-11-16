// ══ Entrada numérica por teclado (respuestas como "7", "17.3") ───────
// Ronda guiada: se escribe encima de la respuesta. Rondas libres: se comprueba con tolerancia.
import { useState } from "react";

export type ResultadoNum = "ok" | "mal" | "completo" | "ignorada";

const caracter = (key: string): string | null => {
  if (/^[0-9]$/.test(key)) return key;
  if (key === "." || key === ",") return ".";
  if (key === "-" || key === "−") return "-";
  return null;
};

export function useEntradaNumero(clave: string, respuesta: number, guiado: boolean, tolerancia = 0.01) {
  const [st, setSt] = useState({ clave: "", texto: "" });
  const texto = st.clave === clave ? st.texto : "";
  const objetivo = String(Math.round(respuesta * 100) / 100);
  const poner = (t: string) => setSt({ clave, texto: t });
  const valor = texto === "" || texto === "-" || texto === "." ? null : Number(texto);

  return {
    texto,
    objetivo,
    valor,
    escribir(key: string): ResultadoNum {
      const c = caracter(key);
      if (!c) return "ignorada";
      if (guiado) {
        if (texto.length >= objetivo.length) return "ignorada";
        if (c !== objetivo[texto.length]) return "mal";
        const nuevo = texto + c;
        poner(nuevo);
        return nuevo === objetivo ? "completo" : "ok";
      }
      if (texto.length >= 8) return "ignorada";
      if (c === "." && texto.includes(".")) return "ignorada";
      if (c === "-" && texto.length > 0) return "ignorada";
      poner(texto + c);
      return "ok";
    },
    borrar() {
      if (texto) poner(texto.slice(0, -1));
    },
    limpiar() {
      poner("");
    },
    comprobar(): { ok: boolean; incompleto: boolean } {
      if (valor === null || Number.isNaN(valor)) return { ok: false, incompleto: true };
      const tol = Math.max(0.05, Math.abs(respuesta) * tolerancia);
      return { ok: Math.abs(valor - respuesta) <= tol, incompleto: false };
    },
  };
}
