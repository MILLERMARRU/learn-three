// ══ Fórmulas con HTML + CSS (reemplazo ligero de KaTeX) ───────
import type { ReactNode } from "react";

type P = { children?: ReactNode };

/** Variable en cursiva serif. */
export const V = ({ children }: P) => <i className="fx-v">{children}</i>;
/** Operador con aire a los lados: =, +, ·, ÷ */
export const Op = ({ children }: P) => <span className="fx-op">{children}</span>;
export const Sup = ({ children }: P) => <sup className="fx-sup">{children}</sup>;
export const Sub = ({ children }: P) => <sub className="fx-sub">{children}</sub>;
export const Frac = ({ n, d }: { n: ReactNode; d: ReactNode }) => (
  <span className="fx-frac">
    <span className="fx-n">{n}</span>
    <span className="fx-d">{d}</span>
  </span>
);
export const Raiz = ({ children }: P) => (
  <span className="fx-raiz">
    <span className="fx-raiz-s">√</span>
    <span className="fx-raiz-c">{children}</span>
  </span>
);
/** Corchetes de ecuación dimensional: [x] */
export const Dc = ({ children }: P) => <span className="fx-dc">[{children}]</span>;
export const Txt = ({ children }: P) => <span className="fx-txt">{children}</span>;

export function Formula({ children, tam = "m" }: P & { tam?: "s" | "m" | "l" | "xl" }) {
  return <span className={`fx fx-${tam}`}>{children}</span>;
}
