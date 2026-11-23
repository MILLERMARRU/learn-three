// ══ Etapa 2.2 · Suma de vectores: ubica la punta de la resultante (método del polígono) ───────
import { useState } from "react";
import { COLOR, RONDAS_SUMA, type ProblemaSuma } from "@/contenido/nivel-02/vectores";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { escalar, fmtModulo, fmtVec, igualV, suma, type Vec } from "@/lib/vec";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { PlanoVectorial, type VectorFijo } from "@/three/vectores/PlanoVectorial";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, Op, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { simularTecla, TECLAS_VECTOR, teclaHacia, VectorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "2.2",
  titulo: "Suma de vectores",
  nivel: "Análisis vectorial",
  nivelNum: 2,
  intro: (
    <>
      <b>Método del polígono:</b> pon cada vector a continuación del anterior. La resultante va del origen a la punta del último. Con componentes es aún más fácil: se suman las x y las y por separado.
    </>
  ),
  como: [
    { teclas: ["mouse"], texto: "clic o arrastre para la punta de R" },
    { teclas: ["←", "→", "↑", "↓"], texto: "mueve la punta una casilla" },
    { teclas: ["⏎"], texto: "comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/2/paralelogramo", titulo: "Etapa 2.3 · Paralelogramo" },
  descRondas: {
    guiado: "Los vectores ya están encadenados y R fantasma marca el destino.",
    pista: "Ves el polígono encadenado, pero R la ubicas tú.",
    solo: "Solo ves los vectores desde el origen: súmalos tú.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

/** Vectores encadenados (cola de cada uno en la punta del anterior). */
function cadena(p: ProblemaSuma): VectorFijo[] {
  let pos: Vec = [0, 0];
  return p.vectores.map((x) => {
    const w = escalar(x.v, x.signo);
    const f: VectorFijo = { v: w, desde: pos, color: COLOR[x.n], variante: "fantasma", etiqueta: x.signo < 0 ? <>−<V>{x.n}</V></> : undefined };
    pos = suma(pos, w);
    return f;
  });
}

export default function EtapaSuma() {
  const motor = useEtapa<ProblemaSuma>({ clave: "n2-suma", rondas: RONDAS_SUMA, avanceMs: 1700 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState<{ clave: string; v: Vec }>({ clave: "", v: [0, 0] });
  const v: Vec = st.clave === clave ? st.v : [0, 0];
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verCadena = motor.ronda !== "solo" || motor.pistas >= 2;
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
      const cero = p.objetivo[0] === 0 && p.objetivo[1] === 0;
      setFb({ clave, tipo: "ok", texto: cero ? "¡Exacto! Polígono cerrado: la resultante es cero." : `¡Exacto! R = ${p.operacion} = ${fmtVec(v)}, |R| = ${fmtModulo(v)}.` });
      return;
    }
    motor.error();
    const fx = v[0] !== p.objetivo[0];
    const fy = v[1] !== p.objetivo[1];
    setFb({ clave, tipo: "mal", texto: motor.ronda === "solo" ? "No coincide. Suma las x por un lado y las y por otro." : fx && fy ? "Revisa las dos componentes de R." : fx ? "La suma de las x no es correcta." : "La suma de las y no es correcta." });
  };

  const pedirPista = () => {
    if (!motor.pedirPista(3)) return;
    const n = motor.pistas + 1;
    setFb({ clave, tipo: "info", texto: n >= 3 ? "Mira R fantasma: es el destino." : n === 2 && motor.ronda === "solo" ? `Ahora ves el polígono. ${p.pistas[1]}` : p.pistas[n - 1] });
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
  // los vectores dados desde el origen + (según la ronda) la cadena del polígono y R fantasma
  const fijos: VectorFijo[] = [
    ...p.vectores.map((x) => ({ v: x.v, color: COLOR[x.n], etiqueta: <V>{x.n}</V> })),
    ...(verCadena ? cadena(p).slice(1) : []),
    ...(verFantasma ? [{ v: p.objetivo, color: COLOR.R, variante: "fantasma" as const }] : []),
  ];

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      paso={13.5}
      render={(x, rol) =>
        rol === "actual" ? (
          <PlanoVectorial fijos={fijos} editable={{ v, color: COLOR.R, etiqueta: <V>R</V>, onCambio: poner, activo: motor.jugando }} exito={exito} faseId={motor.faseId} />
        ) : rol === "siguiente" ? (
          <PlanoVectorial previa={`R = ${x.operacion}`} fijos={x.vectores.map((w) => ({ v: w.v, color: COLOR[w.n] }))} />
        ) : null
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">Ubica la punta de la resultante</p>
      <div className="ecuacion-grande" key={clave}>
        <Formula tam="xl">
          <V>R</V>
          <Op>=</Op>
          {p.operacion}
        </Formula>
      </div>
      <div className="variables">
        {p.vectores.map((x) => (
          <span key={x.n} className="var-chip">
            <V>{x.n}</V> <b style={{ color: COLOR[x.n] }}>{fmtVec(x.v)}</b>
          </span>
        ))}
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
      respuesta={<VectorTexto nombre="R" v={v} color={COLOR.R} ok={exito} mal={retro?.tipo === "mal"} />}
      teclado={<TecladoVirtual activas={TECLAS_VECTOR} siguiente={guiado && motor.jugando ? teclaHacia(v, p.objetivo) : null} onTecla={simularTecla} flechas />}
      escenario={{ encuadre: { w: 16, h: 12.4 }, balanceo: 0.05, arrastrable: false, vista: clave }}
      pieEscena={<span>Haz clic en la cuadrícula o usa las flechas</span>}
    />
  );
}
