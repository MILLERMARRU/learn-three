// ══ Teclado virtual en pantalla: resalta la siguiente tecla, parpadea al pulsar y se puede usar con el mouse ───────
import { useEffect, useState } from "react";
import { INFO_BASE } from "@/lib/dim";

interface Tecla {
  k: string;
  label?: string;
  ancho?: number;
}

const t = (s: string): Tecla[] => [...s].map((k) => ({ k }));

// distribución española (ISO), como la de un teclado físico
const FILAS: Tecla[][] = [
  [{ k: "º" }, ...t("1234567890"), { k: "'" }, { k: "¡" }, { k: "borrar", ancho: 1.9 }],
  [{ k: "tab", ancho: 1.45 }, ...t("qwertyuiop"), { k: "`" }, { k: "+" }, { k: "intro", ancho: 1.45 }],
  [{ k: "mayús", ancho: 1.75 }, ...t("asdfghjklñ"), { k: "´" }, { k: "ç" }],
  [{ k: "shift", ancho: 1.25 }, { k: "<" }, ...t("zxcvbnm,.-"), { k: "shift2", label: "shift", ancho: 2.1 }],
  [{ k: " ", label: "", ancho: 1 }],
];

export interface DecoTecla {
  color?: string;
  sub?: string;
}

interface Props {
  /** Teclas que hacen algo en esta etapa (las demás se atenúan). */
  activas: Record<string, DecoTecla>;
  /** Tecla que toca pulsar ahora (ronda guiada). */
  siguiente?: string | null;
  onTecla: (k: string) => void;
  /** Última tecla rechazada: parpadea en rojo. */
  error?: { k: string; id: number } | null;
  flechas?: boolean;
}

/** Normaliza una tecla física al nombre que usa el teclado virtual. */
export function normalTecla(key: string): string {
  const mapa: Record<string, string> = {
    Backspace: "borrar",
    Enter: "intro",
    Tab: "tab",
    Shift: "shift",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
    "=": "+",
    _: "-",
    "−": "-",
  };
  return mapa[key] ?? key.toLowerCase();
}

/** Carácter de la respuesta → tecla que hay que pulsar. */
export const teclaDeCaracter = (c?: string) => (!c ? null : c === "θ" ? "o" : c.toLowerCase());

/** Teclas activas para escribir dimensiones (etapas 1.1 y 1.2). */
export function teclasDimension(conComprobar: boolean): Record<string, DecoTecla> {
  const r: Record<string, DecoTecla> = {};
  for (const [b, info] of Object.entries(INFO_BASE)) r[info.tecla.toLowerCase()] = { color: info.color, sub: b === "θ" ? "θ" : undefined };
  for (const k of ["1", "2", "3", "4", "-"]) r[k] = {};
  r.borrar = {};
  r.h = { sub: "pista" };
  if (conComprobar) r.intro = { sub: "comprobar" };
  return r;
}

export function TecladoVirtual({ activas, siguiente, onTecla, error, flechas = false }: Props) {
  const [pulso, setPulso] = useState<{ k: string; id: number }>({ k: "", id: 0 });

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = normalTecla(e.key);
      setPulso((p) => ({ k: k === "shift" && e.location === 2 ? "shift2" : k, id: p.id + 1 }));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const pulsar = (k: string) => {
    setPulso((p) => ({ k, id: p.id + 1 }));
    onTecla(k);
  };

  const render = (tec: Tecla) => {
    const deco = activas[tec.k];
    const cls = ["tv-tecla", deco ? "tv-activa" : "tv-inactiva", siguiente === tec.k ? "tv-siguiente" : "", tec.k === " " ? "tv-espacio" : ""].join(" ");
    return (
      <button
        key={tec.k}
        className={cls}
        style={{ flexGrow: tec.ancho ?? 1, ["--c" as string]: deco?.color ?? "transparent" }}
        tabIndex={-1}
        onPointerDown={(e) => {
          e.preventDefault();
          if (deco) pulsar(tec.k);
        }}
      >
        <span className="tv-label">{tec.label ?? tec.k}</span>
        {deco?.sub && <span className="tv-sub">{deco.sub}</span>}
        {deco?.color && <span className="tv-color" />}
        {pulso.k === tec.k && pulso.id > 0 && <span key={pulso.id} className="tv-flash" />}
        {error && error.k === tec.k && <span key={`e${error.id}`} className="tv-flash tv-flash-mal" />}
      </button>
    );
  };

  return (
    <div className="teclado-virtual" aria-hidden>
      <div className="tv-filas">
        {FILAS.map((f, i) => (
          <div key={i} className={`tv-fila ${i === 4 ? "tv-fila-espacio" : ""}`}>
            {f.map(render)}
          </div>
        ))}
      </div>
      {flechas && (
        <div className="tv-flechas">
          <span />
          {render({ k: "↑" })}
          <span />
          {render({ k: "←" })}
          {render({ k: "↓" })}
          {render({ k: "→" })}
        </div>
      )}
    </div>
  );
}
