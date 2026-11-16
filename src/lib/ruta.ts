// ══ Router mínimo por hash (#/nivel/1/moleculas) ───────
import { useSyncExternalStore } from "react";

function leer(): string {
  const h = window.location.hash.replace(/^#/, "");
  return h || "/";
}

function suscribir(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

export function useRuta(): string[] {
  const ruta = useSyncExternalStore(suscribir, leer, () => "/");
  return ruta.split("/").filter(Boolean);
}

export function navegar(ruta: string) {
  window.location.hash = ruta;
  window.scrollTo(0, 0);
}
