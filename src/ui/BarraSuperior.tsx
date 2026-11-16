// ══ Barra superior: marca, migas y sonido ───────
import { useSyncExternalStore } from "react";
import { navegar } from "@/lib/ruta";
import { setSonido, sonidoActivo, suscribirSonido } from "@/lib/sonido";

export function Marca() {
  return (
    <button className="marca" onClick={() => navegar("/")} aria-label="Ir al inicio">
      <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden>
        <circle cx="16" cy="16" r="3.2" fill="currentColor" />
        <ellipse cx="16" cy="16" rx="13" ry="5.2" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".8" />
        <ellipse cx="16" cy="16" rx="13" ry="5.2" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".55" transform="rotate(60 16 16)" />
        <ellipse cx="16" cy="16" rx="13" ry="5.2" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".35" transform="rotate(120 16 16)" />
      </svg>
      <span>
        Física <b>3D</b>
      </span>
    </button>
  );
}

export function BotonSonido() {
  const on = useSyncExternalStore(suscribirSonido, sonidoActivo, () => true);
  return (
    <button className="bs-btn" onClick={() => setSonido(!on)} aria-pressed={on}>
      Sonido {on ? "sí" : "no"}
    </button>
  );
}

export function BarraSuperior({ migas, centro }: { migas?: { texto: string; ruta?: string }[]; centro?: React.ReactNode }) {
  return (
    <header className="barra-sup">
      <Marca />
      <nav className="migas">
        {migas?.map((m, i) => (
          <span key={i} className="miga">
            {m.ruta ? (
              <button className="bs-btn" onClick={() => navegar(m.ruta!)}>
                {m.texto}
              </button>
            ) : (
              <span className="miga-actual">{m.texto}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="bs-der">
        {centro}
        <BotonSonido />
      </div>
    </header>
  );
}
