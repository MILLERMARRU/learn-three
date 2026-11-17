// ══ Etapa 3.1 · Predice la posición (MRU): pon la bandera donde estará el auto y míralo correr ───────
import { useState } from "react";
import { COLOR_AUTO, F_MRU, RONDAS_MRU, type ProblemaMRU } from "@/contenido/nivel-03/cinematica";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaPista } from "@/three/pista/EscenaPista";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, Sub, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_PISTA, ESCENARIO_PISTA, fmtNum, simularTecla, TECLAS_BANDERA, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "3.1",
  titulo: "Predice la posición",
  nivel: "Cinemática I",
  nivelNum: 3,
  intro: (
    <>
      En el <b>movimiento rectilíneo uniforme</b> la rapidez no cambia: el auto avanza la misma distancia cada segundo. Pon la bandera donde crees que estará y pulsa Enter para verlo correr.
    </>
  ),
  como: [
    { teclas: ["mouse"], texto: "clic o arrastre en la pista para la bandera" },
    { teclas: ["←", "→"], texto: "mueve la bandera de 5 en 5 m" },
    { teclas: ["⏎"], texto: "¡corre! y comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/3/encuentro", titulo: "Etapa 3.2 · Encuentro" },
  descRondas: {
    guiado: "La bandera fantasma marca el lugar: lleva la tuya hasta allí y corre.",
    pista: "Tienes la fórmula a la vista; la bandera la pones tú.",
    solo: "Solo los datos. Calcula, pon la bandera y corre.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };
const PASO = 5;

export default function EtapaPrediccion() {
  const motor = useEtapa<ProblemaMRU>({ clave: "n3-prediccion", rondas: RONDAS_MRU, avanceMs: 1900 });
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

  const poner = (nx: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null); // el auto vuelve a la salida
    setSt({ clave, x: Math.max(0, Math.min(p.L, nx)) });
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const correr = () => {
    if (!motor.jugando || corriendo) return;
    setCorrida({ clave, id: performance.now(), fin: false });
    setFb(null);
    sfx.seleccion();
  };

  const alTerminar = (xs: number[]) => {
    setCorrida((c) => (c ? { ...c, fin: true } : c));
    if (!motor.jugando) return;
    if (x === p.respuesta) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: `¡Exacto! A los ${p.t} s el auto está en ${p.respuesta} m.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `El auto llegó a ${fmtNum(xs[0], 0)} m; tu bandera estaba en ${x} m.` });
    }
  };

  const pedirPista = () => {
    if (!motor.pedirPista(3)) return;
    const n = motor.pistas + 1;
    setFb({ clave, tipo: "info", texto: n >= 3 ? "La bandera fantasma marca el lugar." : p.pistas[n - 1] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    if (e.key === "ArrowLeft") (e.preventDefault(), poner(x - PASO), sfx.tecla());
    else if (e.key === "ArrowRight") (e.preventDefault(), poner(x + PASO), sfx.tecla());
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
            moviles={[{ color: COLOR_AUTO.A, x0: p.x0, v: p.v }]}
            bandera={{ x, editable: motor.jugando && !corriendo, onCambio: poner, paso: PASO }}
            fantasma={verFantasma ? p.respuesta : null}
            corrida={enCurso ? { id: enCurso.id, tFin: p.t } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaPista L={it.L} moviles={[{ color: COLOR_AUTO.A, x0: it.x0, v: it.v }]} previa={rol === "siguiente" ? `${it.dato ?? `${Math.abs(it.v)} m/s`} · ${it.t} s` : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">¿Dónde estará el auto a los {p.t} s?</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>v</V> <b style={{ color: COLOR_AUTO.A }}>{p.dato ?? `${p.v} m/s`}</b>
        </span>
        <span className="var-chip">
          <span className="chip-sym"><V>x</V><Sub>0</Sub></span> <b>{p.x0} m</b>
        </span>
        <span className="var-chip">
          <V>t</V> <b>{p.t} s</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_MRU}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/3</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={pedirPista} disabled={!motor.jugando || motor.pistas >= 3}>
            Pista <span className="btn-meta">{motor.pistas}/3</span>
          </button>
          <button className="btn btn-pri" onClick={correr} disabled={!motor.jugando || corriendo}>
            ¡Corre!
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
      escenario={{ ...ESCENARIO_PISTA, vista: clave }}
      pieEscena={<span>Haz clic en la pista para poner la bandera · Enter para correr</span>}
    />
  );
}
