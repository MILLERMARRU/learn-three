// ══ Etapa 2.1 · Arma el vector: coloca la punta en la cuadrícula (mouse o flechas) ───────
import { useState } from "react";
import { COLOR, RONDAS_COMP, type ProblemaComp } from "@/contenido/nivel-02/vectores";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { fmtModulo, fmtVec, igualV, type Vec } from "@/lib/vec";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { PlanoVectorial } from "@/three/vectores/PlanoVectorial";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { simularTecla, TECLAS_VECTOR, teclaHacia, VectorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "2.1",
  titulo: "Arma el vector",
  nivel: "Análisis vectorial",
  nivelNum: 2,
  intro: (
    <>
      Un vector tiene <b>módulo</b> (cuánto mide) y <b>dirección</b>. En el plano se escribe con sus componentes (x, y). Coloca la punta del vector con el mouse o con las flechas del teclado.
    </>
  ),
  como: [
    { teclas: ["mouse"], texto: "clic o arrastre en la cuadrícula" },
    { teclas: ["←", "→", "↑", "↓"], texto: "mueve la punta una casilla" },
    { teclas: ["⏎"], texto: "comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/2/suma", titulo: "Etapa 2.2 · Suma" },
  descRondas: {
    guiado: "El vector fantasma te muestra el destino: lleva la punta hasta él.",
    pista: "Te damos las componentes, sin fantasma. Cuenta casillas desde el origen.",
    solo: "Te damos el módulo y el ángulo: descompón el vector tú mismo.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaComponentes() {
  const motor = useEtapa<ProblemaComp>({ clave: "n2-componentes", rondas: RONDAS_COMP, avanceMs: 1600 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState<{ clave: string; v: Vec }>({ clave: "", v: [0, 0] });
  const v: Vec = st.clave === clave ? st.v : [0, 0];
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFantasma = guiado || motor.pistas >= 3;

  const poner = (nv: Vec) => {
    setSt({ clave, v: nv });
    if (retro && retro.tipo !== "ok") setFb(null);
  };
  const mover = (dx: number, dy: number) => {
    if (!motor.jugando) return;
    poner([Math.max(-7, Math.min(7, v[0] + dx)), Math.max(-5, Math.min(5, v[1] + dy))]);
    sfx.tecla();
  };

  const comprobar = () => {
    if (!motor.jugando) return;
    if (igualV(v, p.objetivo)) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: `¡Exacto! ${p.nombre} = ${fmtVec(v)} y mide ${fmtModulo(v)}.` });
      return;
    }
    motor.error();
    const fx = v[0] !== p.objetivo[0];
    const fy = v[1] !== p.objetivo[1];
    const texto = motor.ronda === "solo" ? "Todavía no. Descompón: ¿cuánto mide cada cateto?" : fx && fy ? "Revisa las dos componentes." : fx ? "La componente x no es correcta." : "La componente y no es correcta.";
    setFb({ clave, tipo: "mal", texto });
  };

  const pedirPista = () => {
    if (!motor.pedirPista(3)) return;
    const n = motor.pistas + 1;
    setFb({ clave, tipo: "info", texto: n >= 3 ? "Mira el vector fantasma: es el destino." : p.pistas[n - 1] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); mover(-1, 0); }
    else if (e.key === "ArrowRight") { e.preventDefault(); mover(1, 0); }
    else if (e.key === "ArrowUp") { e.preventDefault(); mover(0, 1); }
    else if (e.key === "ArrowDown") { e.preventDefault(); mover(0, -1); }
    else if (e.key === "Enter") comprobar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      paso={13.5}
      render={(x, rol) =>
        rol === "actual" ? (
          <PlanoVectorial
            fijos={verFantasma ? [{ v: p.objetivo, color: COLOR.R, variante: "fantasma" }] : []}
            guias={guiado ? [{ desde: [p.objetivo[0], 0], hasta: p.objetivo }, { desde: [0, p.objetivo[1]], hasta: p.objetivo }] : []}
            editable={{ v, color: COLOR.R, etiqueta: <V>{p.nombre}</V>, onCambio: poner, activo: motor.jugando }}
            exito={exito}
            faseId={motor.faseId}
          />
        ) : rol === "siguiente" ? (
          <PlanoVectorial previa={`vector ${x.nombre}`} />
        ) : null
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">Coloca la punta del vector</p>
      <div className="ecuacion-grande" key={clave}>
        <Formula tam="xl">{p.dato}</Formula>
      </div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/3</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={pedirPista} disabled={!motor.jugando || motor.pistas >= 3}>
            Pista <span className="btn-meta">{motor.pistas}/3</span>
          </button>
          <button className="btn btn-pri" onClick={comprobar} disabled={!motor.jugando}>
            Comprobar
          </button>
        </div>
      </div>
    </>
  );

  return (
    <CascaronEtapa
      meta={META}
      motor={motor}
      escena={escena}
      panel={panel}
      retro={retro ? <RetroLinea tipo={retro.tipo}>{retro.texto}</RetroLinea> : null}
      respuesta={<VectorTexto nombre={p.nombre} v={v} color={COLOR.R} ok={exito} mal={retro?.tipo === "mal"} />}
      teclado={<TecladoVirtual activas={TECLAS_VECTOR} siguiente={guiado && motor.jugando ? teclaHacia(v, p.objetivo) : null} onTecla={simularTecla} flechas />}
      escenario={{ encuadre: { w: 16, h: 12.4 }, balanceo: 0.05, arrastrable: false, vista: clave }}
      pieEscena={<span>Haz clic en la cuadrícula o usa las flechas</span>}
    />
  );
}
