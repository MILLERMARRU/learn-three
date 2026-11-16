// ══ Paleta para escribir con el mouse (y guía visual de teclas) ───────
import { BASES, INFO_BASE } from "@/lib/dim";

interface Props {
  onTecla: (k: string) => void;
  onBorrar: () => void;
  bases?: readonly string[];
}

export function Paleta({ onTecla, onBorrar, bases = BASES }: Props) {
  return (
    <div className="paleta" role="group" aria-label="Teclado de dimensiones">
      {bases.map((b) => {
        const info = INFO_BASE[b as keyof typeof INFO_BASE];
        return (
          <button key={b} className="tecla tecla-base" style={{ ["--c" as string]: info.color }} onClick={() => onTecla(b)} title={`${info.nombre} (${info.unidad})${info.tecla !== b ? ` · tecla ${info.tecla}` : ""}`}>
            <span className="tecla-punto" />
            {b}
            {info.tecla !== b && <kbd>{info.tecla}</kbd>}
          </button>
        );
      })}
      <span className="paleta-sep" />
      {["-", "2", "3", "1"].map((k) => (
        <button key={k} className="tecla" onClick={() => onTecla(k)} title={k === "1" ? "Adimensional" : k === "-" ? "Exponente negativo" : `Exponente ${k}`}>
          {k === "-" ? "−" : k}
        </button>
      ))}
      <button className="tecla tecla-ancha" onClick={onBorrar} title="Borrar (Retroceso)">
        ⌫
      </button>
    </div>
  );
}
