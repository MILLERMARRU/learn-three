// ══ Etapa 3.2 · Encuentro y alcance: pon la bandera donde se encontrarán los dos autos ───────
import { useState } from "react";
import { COLOR_AUTO, F_ALCANCE, F_ENCUENTRO, RONDAS_ENCUENTRO, type ProblemaEncuentro } from "@/contenido/nivel-03/cinematica";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaPista, type Movil } from "@/three/pista/EscenaPista";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, Sub, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_PISTA, ESCENARIO_PISTA, fmtNum, simularTecla, TECLAS_BANDERA, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "3.2",
  titulo: "Encuentro y alcance",
  nivel: "Cinemática I",
  nivelNum: 3,
  intro: (
    <>
      Si dos móviles van <b>uno hacia el otro</b>, sus rapideces se suman (encuentro). Si van <b>en el mismo sentido</b>, se restan (alcance). Pon la bandera donde se juntarán y míralos correr.
    </>
  ),
  como: [
    { teclas: ["mouse"], texto: "clic o arrastre en la pista para la bandera" },
    { teclas: ["←", "→"], texto: "mueve la bandera de 5 en 5 m" },
    { teclas: ["⏎"], texto: "¡corren! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/3/frenado", titulo: "Etapa 3.3 · Frena a tiempo" },
  descRondas: {
    guiado: "La bandera fantasma marca el punto de encuentro.",
    pista: "Tienes la fórmula del tiempo; el lugar lo calculas tú.",
    solo: "Solo los datos: tiempo primero, lugar después.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };
const PASO = 5;

const movilesDe = (p: ProblemaEncuentro): Movil[] => [
  { color: COLOR_AUTO.A, x0: 0, v: p.vA, carril: 0, etiqueta: "A" },
  { color: COLOR_AUTO.B, x0: p.d, v: p.tipo === "encuentro" ? -p.vB : p.vB, carril: 1, etiqueta: "B" },
];

export default function EtapaEncuentro() {
  const motor = useEtapa<ProblemaEncuentro>({ clave: "n3-encuentro", rondas: RONDAS_ENCUENTRO, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", x: 0 });
  const x = st.clave === clave ? st.x : 0;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;
  const verFantasma = guiado || motor.pistas >= 3;
  const cada = p.L > 100 ? 20 : 10;

  const poner = (nx: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, x: Math.max(0, Math.min(p.L, nx)) });
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const correr = () => {
    if (!motor.jugando || corriendo) return;
    setCorrida({ clave, id: performance.now(), fin: false });
    setFb(null);
    sfx.seleccion();
  };

  const alTerminar = () => {
    setCorrida((c) => (c ? { ...c, fin: true } : c));
    if (!motor.jugando) return;
    if (x === p.respuesta) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: `¡Exacto! Se juntan en ${p.respuesta} m a los ${fmtNum(p.t)} s.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `Se juntaron en ${p.respuesta} m (a los ${fmtNum(p.t)} s); tu bandera estaba en ${x} m.` });
    }
  };

  const pedirPista = () => {
    if (!motor.pedirPista(3)) return;
    const n = motor.pistas + 1;
    setFb({ clave, tipo: "info", texto: n >= 3 ? "La bandera fantasma marca el punto." : p.pistas[n - 1] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); poner(x - PASO); sfx.tecla(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); poner(x + PASO); sfx.tecla(); }
    else if (e.key === "Enter") correr();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (x < p.respuesta ? "→" : x > p.respuesta ? "←" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_PISTA}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaPista
            L={p.L}
            cada={cada}
            moviles={movilesDe(p)}
            bandera={{ x, editable: motor.jugando && !corriendo, onCambio: poner, paso: PASO }}
            fantasma={verFantasma ? p.respuesta : null}
            corrida={enCurso ? { id: enCurso.id, tFin: p.t } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaPista L={it.L} moviles={movilesDe(it)} previa={rol === "siguiente" ? it.tipo : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">
        {p.tipo === "encuentro" ? "Van uno hacia el otro." : "A persigue a B (mismo sentido)."} ¿Dónde se juntan?
      </p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>d</V> <b>{p.d} m</b>
        </span>
        <span className="var-chip">
          <span className="chip-sym"><V>v</V><Sub>A</Sub></span> <b style={{ color: COLOR_AUTO.A }}>{p.vA} m/s</b>
        </span>
        <span className="var-chip">
          <span className="chip-sym"><V>v</V><Sub>B</Sub></span> <b style={{ color: COLOR_AUTO.B }}>{p.vB} m/s</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>
        {verFormula ? <Formula tam="l">{p.tipo === "encuentro" ? F_ENCUENTRO : F_ALCANCE}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}
      </div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/3</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={pedirPista} disabled={!motor.jugando || motor.pistas >= 3}>
            Pista <span className="btn-meta">{motor.pistas}/3</span>
          </button>
          <button className="btn btn-pri" onClick={correr} disabled={!motor.jugando || corriendo}>
            ¡Corren!
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
      respuesta={<ValorTexto simbolo="x" valor={String(x)} unidad="m" ok={exito} mal={retro?.tipo === "mal"} />}
      teclado={<TecladoVirtual activas={TECLAS_BANDERA} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_PISTA, tactil: true, vista: clave }}
      pieEscena={<span>Haz clic en la pista para poner la bandera · Enter para correr</span>}
    />
  );
}
