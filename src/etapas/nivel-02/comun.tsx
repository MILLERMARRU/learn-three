// ══ Piezas compartidas por las etapas de vectores ───────
import { fmtModulo, type Vec } from "@/lib/vec";
import type { DecoTecla } from "@/ui/TecladoVirtual";

/** Respuesta grande en el centro: "R = (−3, 4)  |R| = 5". */
export function VectorTexto({ nombre, v, color, ok, mal }: { nombre: string; v: Vec; color: string; ok?: boolean; mal?: boolean }) {
  const n = (x: number) => (x < 0 ? `−${Math.abs(x)}` : x);
  return (
    <div className={`rc-linea rc-vector ${ok ? "rc-ok" : ""} ${mal ? "sacudir" : ""}`}>
      <span className="rc-lado">
        <i className="fx-v" style={{ color }}>
          {nombre}
        </i>
        <span className="rc-igual">=</span>
      </span>
      <span className="rv-comp">
        (<b>{n(v[0])}</b>, <b>{n(v[1])}</b>)
      </span>
      <span className="rv-mod">
        |{nombre}| = {fmtModulo(v)}
      </span>
    </div>
  );
}

/** Teclas para mover la punta de un vector. */
export const TECLAS_VECTOR: Record<string, DecoTecla> = {
  "←": {},
  "→": {},
  "↑": {},
  "↓": {},
  intro: { sub: "comprobar" },
  h: { sub: "pista" },
};

/** En la ronda guiada: la flecha que acerca la punta al objetivo (primero x, luego y). */
export function teclaHacia(v: Vec, objetivo: Vec): string {
  if (v[0] !== objetivo[0]) return v[0] < objetivo[0] ? "→" : "←";
  if (v[1] !== objetivo[1]) return v[1] < objetivo[1] ? "↑" : "↓";
  return "intro";
}

/** Una tecla virtual se comporta como una física. */
export const simularTecla = (k: string) => {
  const mapa: Record<string, string> = { "←": "ArrowLeft", "→": "ArrowRight", "↑": "ArrowUp", "↓": "ArrowDown", intro: "Enter", borrar: "Backspace" };
  window.dispatchEvent(new KeyboardEvent("keydown", { key: mapa[k] ?? k }));
};
