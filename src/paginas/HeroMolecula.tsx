// ══ Hero: una molécula que se "escribe" sola, magnitud tras magnitud ───────
import { useEffect, useState } from "react";
import { MAGNITUDES } from "@/contenido/nivel-01/magnitudes";
import { canonica, parsear } from "@/lib/dim";
import { Escenario } from "@/three/Escenario";
import { Molecula } from "@/three/Molecula";
import { DimTexto } from "@/ui/DimTexto";
import { Dc } from "@/ui/Formula";

const CICLO = ["fuerza", "densidad", "potencia", "aceleracion", "presion", "trabajo"].map((k) => MAGNITUDES[k]);

export function HeroMolecula() {
  const [paso, setPaso] = useState({ i: 0, n: 0, espera: 0 });
  const mag = CICLO[paso.i];
  const texto = canonica(mag.dim);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPaso((p) => {
        const largo = canonica(CICLO[p.i].dim).length;
        if (p.n < largo) return { ...p, n: p.n + 1 };
        if (p.espera < 14) return { ...p, espera: p.espera + 1 };
        return { i: (p.i + 1) % CICLO.length, n: 0, espera: 0 };
      });
    }, 170);
    return () => window.clearInterval(id);
  }, []);

  const escrito = texto.slice(0, paso.n);
  const fase = paso.espera > 6 ? "exito" : "idle";

  return (
    <div className="hero-3d">
      <Escenario encuadre={{ w: 5.2, h: 4.8 }} balanceo={0.22} centro={[0, -0.45]}>
        <Molecula key={paso.i} dim={parsear(escrito).dim} fase={fase} faseId={paso.espera > 6 ? 1 : 0} />
      </Escenario>
      <div className="hero-tecleo">
        <span className="hero-mag">{mag.nombre}</span>
        <span className="hero-eq">
          <Dc>{mag.simbolo}</Dc> = <DimTexto texto={escrito} cursor />
        </span>
      </div>
    </div>
  );
}
