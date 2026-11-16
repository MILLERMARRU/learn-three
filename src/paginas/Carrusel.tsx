// ══ Carrusel 3D genérico: las tarjetas entran deslizándose y la del centro queda destacada ───────
// Se usa para elegir niveles y, dentro de un nivel, para elegir etapas.
import { useRef, type ReactNode } from "react";
import { sfx } from "@/lib/sonido";

interface Props<T> {
  items: T[];
  actual: number;
  setActual: (i: number) => void;
  clave: (t: T, i: number) => string;
  render: (t: T, i: number, activa: boolean) => ReactNode;
  /** Clic o Enter sobre la tarjeta central. */
  onElegir: (i: number) => void;
  clase?: (t: T, i: number) => string;
  paso?: number;
}

export function Carrusel<T>({ items, actual, setActual, clave, render, onElegir, clase, paso = 300 }: Props<T>) {
  const rueda = useRef(0);
  const arrastre = useRef<{ x: number; activo: boolean }>({ x: 0, activo: false });
  const mover = (d: number) => {
    const n = Math.max(0, Math.min(items.length - 1, actual + d));
    if (n !== actual) {
      setActual(n);
      sfx.seleccion();
    }
  };

  return (
    <div
      className="carrusel"
      onWheel={(e) => {
        const ahora = performance.now();
        const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(d) < 12 || ahora - rueda.current < 320) return;
        rueda.current = ahora;
        mover(d > 0 ? 1 : -1);
      }}
      onPointerDown={(e) => (arrastre.current = { x: e.clientX, activo: true })}
      onPointerUp={(e) => {
        if (!arrastre.current.activo) return;
        arrastre.current.activo = false;
        const dx = e.clientX - arrastre.current.x;
        if (Math.abs(dx) > 40) mover(dx < 0 ? 1 : -1);
      }}
    >
      {items.map((it, i) => {
        const off = i - actual;
        const a = Math.abs(off);
        return (
          <article
            key={clave(it, i)}
            className={`nivel-card ${off === 0 ? "nc-activa" : ""} ${clase?.(it, i) ?? ""}`}
            style={{
              transform: `translateX(calc(-50% + ${off * paso}px)) translateZ(${-a * 140}px) rotateY(${Math.max(-3, Math.min(3, off)) * -13}deg) scale(${1 - Math.min(a, 3) * 0.07})`,
              opacity: a > 3 ? 0 : 1 - a * 0.24,
              zIndex: 50 - a,
              pointerEvents: a > 3 ? "none" : "auto",
              animationDelay: `${Math.min(i, 6) * 0.07}s`,
            }}
            onClick={() => (off !== 0 ? mover(off) : onElegir(i))}
          >
            {render(it, i, off === 0)}
          </article>
        );
      })}
    </div>
  );
}
