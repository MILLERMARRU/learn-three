// ══ Escucha de teclado global ───────
import { useEffect, useLayoutEffect, useRef } from "react";

export function useTeclas(manejador: (e: KeyboardEvent) => void, activo = true) {
  const ref = useRef(manejador);
  useLayoutEffect(() => {
    ref.current = manejador;
  });
  useEffect(() => {
    if (!activo) return;
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // una tecla ya usada (p. ej. Enter para cerrar la intro) no debe llegar también a la etapa
      if (e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      // con foco de teclado en un botón o enlace, Enter y Espacio lo activan a él (nativo) y no al atajo global
      if ((e.key === "Enter" || e.key === " ") && t?.closest("button, a[href], select, summary")?.matches(":focus-visible")) return;
      ref.current(e);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [activo]);
}

export const movimientoReducido = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
