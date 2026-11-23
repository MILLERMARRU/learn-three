// ══ Carrusel 3D genérico: las tarjetas entran deslizándose y la del centro queda destacada ───────
// Se usa para elegir niveles y, dentro de un nivel, para elegir etapas.
import { useEffect, useRef, type ReactNode } from "react";
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
  /** Nombre del carrusel para lectores de pantalla (p. ej. «Niveles de Física»). */
  nombre: string;
  /** Nombre accesible de cada tarjeta. */
  etiqueta: (t: T, i: number) => string;
}

export function Carrusel<T>({ items, actual, setActual, clave, render, onElegir, clase, paso = 300, nombre, etiqueta }: Props<T>) {
  const rueda = useRef(0);
  const arrastre = useRef<{ x: number; activo: boolean; movio: boolean }>({ x: 0, activo: false, movio: false });
  const caja = useRef<HTMLDivElement>(null);
  const tarjetas = useRef<(HTMLElement | null)[]>([]);
  const mover = (d: number) => {
    const n = Math.max(0, Math.min(items.length - 1, actual + d));
    if (n !== actual) {
      setActual(n);
      sfx.seleccion();
    }
  };

  // si el foco estaba en el carrusel, acompaña a la tarjeta central al moverse con las flechas
  useEffect(() => {
    if (caja.current?.contains(document.activeElement)) tarjetas.current[actual]?.focus({ preventScroll: true });
  }, [actual]);

  return (
    <div
      ref={caja}
      className="carrusel"
      role="region"
      aria-roledescription="carrusel"
      aria-label={nombre}
      onWheel={(e) => {
        const ahora = performance.now();
        const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(d) < 12 || ahora - rueda.current < 320) return;
        rueda.current = ahora;
        mover(d > 0 ? 1 : -1);
      }}
      onPointerDown={(e) => (arrastre.current = { x: e.clientX, activo: true, movio: false })}
      onPointerUp={(e) => {
        if (!arrastre.current.activo) return;
        arrastre.current.activo = false;
        const dx = e.clientX - arrastre.current.x;
        if (Math.abs(dx) > 40) {
          arrastre.current.movio = true; // que el clic de este gesto no mueva otra vez
          mover(dx < 0 ? 1 : -1);
        }
      }}
    >
      {items.map((it, i) => {
        const off = i - actual;
        const a = Math.abs(off);
        const elegir = () => (off !== 0 ? mover(off) : onElegir(i));
        return (
          <article
            key={clave(it, i)}
            ref={(el) => {
              tarjetas.current[i] = el;
            }}
            className={`nivel-card ${off === 0 ? "nc-activa" : ""} ${clase?.(it, i) ?? ""}`}
            style={{
              transform: `translateX(calc(-50% + ${off * paso}px)) translateZ(${-a * 140}px) rotateY(${Math.max(-3, Math.min(3, off)) * -13}deg) scale(${1 - Math.min(a, 3) * 0.07})`,
              opacity: a > 3 ? 0 : 1 - a * 0.24,
              zIndex: 50 - a,
              pointerEvents: a > 3 ? "none" : "auto",
              animationDelay: `${Math.min(i, 6) * 0.07}s`,
            }}
            role="group"
            aria-roledescription="tarjeta"
            aria-label={etiqueta(it, i)}
            aria-current={off === 0 ? "true" : undefined}
            aria-hidden={a > 3 ? true : undefined}
            // solo la tarjeta central entra en el orden de Tab; las demás se alcanzan con las flechas
            tabIndex={off === 0 ? 0 : -1}
            onClick={() => {
              if (arrastre.current.movio) return void (arrastre.current.movio = false);
              elegir();
            }}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
              e.preventDefault(); // evita que el atajo global de Enter actúe dos veces
              elegir();
            }}
            title={off !== 0 ? "Clic para ver este nivel" : undefined}
          >
            {render(it, i, off === 0)}
          </article>
        );
      })}
    </div>
  );
}
