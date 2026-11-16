// ══ Muestra una dimensión tecleada con superíndices, cursor y "fantasma" guía ───────
import { INFO_BASE, type Base } from "@/lib/dim";

interface Props {
  /** Lo que el alumno escribió (caracteres crudos: "MLT-2"). */
  texto: string;
  /** En ronda guiada: la respuesta completa que se escribe encima. */
  guia?: string;
  error?: boolean;
  cursor?: boolean;
  colorear?: boolean;
  /** Respuesta numérica: los dígitos van a tamaño normal (no como exponentes). */
  numero?: boolean;
}

const esBase = (c: string) => c in INFO_BASE;

function Car({ c, estado, colorear, numero = false }: { c: string; estado: "hecho" | "fantasma"; colorear: boolean; numero?: boolean }) {
  const exp = !numero && (c === "-" || /[0-9]/.test(c));
  const color = colorear && esBase(c) && estado === "hecho" ? INFO_BASE[c as Base].color : undefined;
  return (
    <span className={`dt-c ${exp ? "dt-exp" : "dt-base"} dt-${estado}`} style={color ? { color } : undefined}>
      {c === "-" ? "−" : c}
    </span>
  );
}

export function DimTexto({ texto, guia, error = false, cursor = true, colorear = true, numero = false }: Props) {
  // "1" solo (adimensional) no es exponente
  const caracteres = (s: string) => [...s];
  const resto = guia ? caracteres(guia).slice(texto.length) : [];
  const unoSolo = texto === "1";
  return (
    <span className={`dt ${error ? "dt-error" : ""}`}>
      {unoSolo && !numero ? (
        <span className="dt-c dt-base dt-hecho">1</span>
      ) : (
        caracteres(texto).map((c, i) => <Car key={i} c={c} estado="hecho" colorear={colorear} numero={numero} />)
      )}
      {cursor && <span className="dt-cursor" />}
      {!numero && guia === "1" && texto === "" ? (
        <span className="dt-c dt-base dt-fantasma">1</span>
      ) : (
        resto.map((c, i) => <Car key={`g${i}`} c={c} estado="fantasma" colorear={false} numero={numero} />)
      )}
      {!texto && !guia && <span className="dt-vacio">escribe…</span>}
    </span>
  );
}
