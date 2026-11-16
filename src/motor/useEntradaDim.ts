// ══ Entrada de dimensiones por teclado (compartida por varias etapas) ───────
// Ronda guiada: se escribe encima de la respuesta, carácter por carácter.
// Rondas libres: se escribe en cualquier orden y se comprueba con Enter.
import { useState } from "react";
import { canonica, diagnostico, iguales, parsear, teclaACaracter, type Dim } from "@/lib/dim";

export type ResultadoTecla = "ok" | "mal" | "completo" | "ignorada";

export function useEntradaDim(clave: string, respuesta: Dim, guiado: boolean) {
  const [st, setSt] = useState({ clave: "", texto: "" });
  const texto = st.clave === clave ? st.texto : "";
  const objetivo = canonica(respuesta);
  const parseo = parsear(texto);
  const poner = (t: string) => setSt({ clave, texto: t });

  return {
    texto,
    parseo,
    objetivo,
    /** Escribe una tecla (ya sea del teclado físico o de la paleta). */
    escribir(key: string): ResultadoTecla {
      const c = teclaACaracter(key);
      if (!c) return "ignorada";
      if (guiado) {
        if (texto.length >= objetivo.length) return "ignorada";
        if (c !== objetivo[texto.length]) return "mal";
        const nuevo = texto + c;
        poner(nuevo);
        return nuevo === objetivo ? "completo" : "ok";
      }
      if (texto.length >= 16) return "ignorada";
      poner(texto + c);
      return "ok";
    },
    borrar() {
      if (texto) poner(texto.slice(0, -1));
    },
    limpiar() {
      poner("");
    },
    comprobar(): { ok: boolean; incompleto: boolean; diag: string[] } {
      if (!parseo.valido) return { ok: false, incompleto: true, diag: [] };
      const ok = iguales(parseo.dim, respuesta);
      return { ok, incompleto: false, diag: ok ? [] : diagnostico(parseo.dim, respuesta) };
    },
  };
}
