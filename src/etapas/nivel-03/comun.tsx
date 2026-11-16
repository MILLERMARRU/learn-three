// ══ Piezas compartidas por las etapas de cinemática ───────
import type { ReactNode } from "react";
import type { DecoTecla } from "@/ui/TecladoVirtual";

export const fmtNum = (n: number, d = 1) => (Math.round(n * 10 ** d) / 10 ** d).toString().replace(".", ",");

/** Valor grande al centro: "x = 30 m". */
export function ValorTexto({ simbolo, valor, unidad, color = "#f0b44c", ok, mal, extra }: { simbolo: string; valor: string; unidad: string; color?: string; ok?: boolean; mal?: boolean; extra?: ReactNode }) {
  return (
    <div className={`rc-linea rc-vector ${ok ? "rc-ok" : ""} ${mal ? "sacudir" : ""}`}>
      <span className="rc-lado">
        <i className="fx-v" style={{ color }}>
          {simbolo}
        </i>
        <span className="rc-igual">=</span>
      </span>
      {extra}
      <span className="rv-comp">{valor}</span>
      <span className="rv-mod">{unidad}</span>
    </div>
  );
}

export const TECLAS_BANDERA: Record<string, DecoTecla> = {
  "←": { sub: "−5 m" },
  "→": { sub: "+5 m" },
  intro: { sub: "¡corre!" },
  h: { sub: "pista" },
};

export const TECLAS_ACELERACION: Record<string, DecoTecla> = {
  "↑": { sub: "+0,5" },
  "↓": { sub: "−0,5" },
  intro: { sub: "¡corre!" },
  h: { sub: "pista" },
};

/** Una tecla virtual se comporta como una física. */
export const simularTecla = (k: string) => {
  const mapa: Record<string, string> = { "←": "ArrowLeft", "→": "ArrowRight", "↑": "ArrowUp", "↓": "ArrowDown", intro: "Enter" };
  window.dispatchEvent(new KeyboardEvent("keydown", { key: mapa[k] ?? k }));
};

/** Encuadre común de las escenas de pista (el contenido se corre a la derecha por el enunciado). */
export const ESCENARIO_PISTA = { encuadre: { w: 10.5, h: 7.2 }, balanceo: 0.04, arrastrable: false, centro: [-0.8, 0.1] as [number, number] };
