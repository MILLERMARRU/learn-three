// ══ Hero del Nivel 1: una molécula que se "escribe" sola, magnitud tras magnitud ───────
import { MAGNITUDES } from "@/contenido/nivel-01/magnitudes";
import { canonica, parsear } from "@/lib/dim";
import { Molecula } from "@/three/Molecula";
import { DimTexto } from "@/ui/DimTexto";
import { Dc } from "@/ui/Formula";
import type { Hero } from "./tipos";

const CICLO = ["fuerza", "densidad", "potencia", "aceleracion", "presion", "trabajo"].map((k) => MAGNITUDES[k]);
const ESPERA = 15; // pasos con la molécula completa antes de la siguiente
const DUR = CICLO.map((m) => canonica(m.dim).length + ESPERA);
const TOTAL = DUR.reduce((s, d) => s + d, 0);

export const heroDimensional: Hero = (tick) => {
  // en qué magnitud y en qué letra vamos
  let k = tick % TOTAL;
  let i = 0;
  while (k >= DUR[i]) k -= DUR[i++];
  const mag = CICLO[i];
  const texto = canonica(mag.dim);
  const escrito = texto.slice(0, Math.min(k, texto.length));
  const completa = k - texto.length > 6;

  return {
    escena: <Molecula key={i} dim={parsear(escrito).dim} fase={completa ? "exito" : "idle"} faseId={completa ? 1 : 0} />,
    pie: (
      <>
        <span className="hero-mag">{mag.nombre}</span>
        <span className="hero-eq">
          <Dc>{mag.simbolo}</Dc> = <DimTexto texto={escrito} cursor />
        </span>
      </>
    ),
    encuadre: { w: 5.2, h: 4.8 },
    centro: [0, -0.45],
    balanceo: 0.22,
  };
};
