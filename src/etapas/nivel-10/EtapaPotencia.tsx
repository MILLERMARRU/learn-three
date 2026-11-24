// ══ Etapa 10.3 · Potencia: ajusta la potencia del motor para que la grúa suba la carga justo a tiempo ───────
import { useState } from "react";
import { F_POTENCIA, P_MAX, P_MIN, P_PASO, RONDAS_POTENCIA, type ProblemaPotencia } from "@/contenido/nivel-10/potencia";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaGrua } from "@/three/energia/EscenaGrua";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual, type DecoTecla } from "@/ui/TecladoVirtual";
import { CARRUSEL_ENERGIA, ESCENARIO_GRUA, fmtNum, simularTecla, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "10.3",
  titulo: "Potencia",
  nivel: "Trabajo, energía y potencia",
  nivelNum: 10,
  intro: (
    <>
      La <b>potencia</b> es qué tan rápido se hace un trabajo: <b>P = W/t</b>. Para subir una carga a velocidad constante, el trabajo es mgh, así que P = mgh/t (o P = mg·v). Los motores reales pierden energía: solo una parte η de lo que reciben es útil. Ajusta la potencia para que la grúa suba la carga <b>justo a tiempo</b>.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta la potencia (50 W)" },
    { teclas: ["←", "→"], texto: "de 500 en 500 W" },
    { teclas: ["⏎"], texto: "¡sube! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "P = mgh / t. La tecla que brilla te guía.",
    pista: "Te dan la velocidad: P = mg · v.",
    solo: "Motores con rendimiento: P = P útil / η.",
  },
};

const TECLAS_P: Record<string, DecoTecla> = {
  "↑": { sub: "+50 W" },
  "↓": { sub: "−50 W" },
  "→": { sub: "+500" },
  "←": { sub: "−500" },
  intro: { sub: "¡sube!" },
  h: { sub: "pista" },
};

/** La cuenta: «P = 50·10·8 / 4 = 1000 W» o, con rendimiento, «P útil = … → P = … / 0,8 = 1250 W». */
function cuenta(p: ProblemaPotencia): string {
  const util = (p.m * 10 * p.h) / p.t;
  const base = p.conV ? `P = ${p.m * 10} · ${fmtNum(p.h / p.t, 2)}` : `P = ${p.m}·10·${fmtNum(p.h, 1)} / ${fmtNum(p.t, 1)}`;
  return p.eta < 1 ? `P útil = ${fmtNum(util, 1)} W → P = ${fmtNum(util, 1)} / ${fmtNum(p.eta, 2)} = ${p.respuesta} W` : `${base} = ${p.respuesta} W`;
}

const textoCorto = (p: ProblemaPotencia) => `${p.m} kg · ${fmtNum(p.h, 1)} m`;

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaPotencia() {
  const motor = useEtapa<ProblemaPotencia>({ clave: "n10-potencia", rondas: RONDAS_POTENCIA, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: 500 });
  const v = st.clave === clave ? st.v : 500;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(P_MIN, Math.min(P_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const subir = () => {
    if (!motor.jugando || corriendo) return;
    setCorrida({ clave, id: performance.now(), fin: false });
    setFb(null);
    sfx.seleccion();
  };

  const alTerminar = ({ tLlegada }: { tLlegada: number | null }) => {
    setCorrida((c) => (c ? { ...c, fin: true } : c));
    if (!motor.jugando) return;
    if (v === p.respuesta) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: `¡Justo a tiempo, en ${fmtNum(p.t, 1)} s! ${cuenta(p)}.` });
    } else {
      motor.error();
      const texto =
        v > p.respuesta && tLlegada !== null
          ? `Llegó antes de tiempo (en ${fmtNum(tLlegada, 1)} s): la potencia necesaria es menor que ${v} W.`
          : `A los ${fmtNum(p.t, 1)} s aún no llegaba: la potencia necesaria es mayor que ${v} W.`;
      setFb({ clave, tipo: "mal", texto });
    }
  };

  const pedirPista = () => {
    if (!motor.pedirPista(2)) return;
    setFb({ clave, tipo: "info", texto: p.pistas[motor.pistas] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    const pasos: Record<string, number> = { ArrowUp: P_PASO, ArrowDown: -P_PASO, ArrowRight: 500, ArrowLeft: -500 };
    if (pasos[e.key] !== undefined) {
      e.preventDefault();
      cambiar(pasos[e.key]);
    } else if (e.key === "Enter") subir();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 500 ? "→" : falta <= -500 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_ENERGIA}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaGrua m={p.m} h={p.h} t={p.t} eta={p.eta} P={v} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaGrua m={it.m} h={it.h} t={it.t} eta={it.eta} P={it.respuesta} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado = p.conV ? (
    <>
      Una grúa sube una carga de <b>{p.m} kg</b> a velocidad constante de <b>{fmtNum(p.h / p.t, 2)} m/s</b> hasta una altura de {fmtNum(p.h, 1)} m. ¿Qué potencia necesita?
    </>
  ) : (
    <>
      Una grúa debe subir una carga de <b>{p.m} kg</b> hasta <b>{fmtNum(p.h, 1)} m</b> de altura en <b>{fmtNum(p.t, 1)} s</b>, a velocidad constante
      {p.eta < 1 ? (
        <>
          , con un motor de rendimiento <b>{Math.round(p.eta * 100)} %</b>
        </>
      ) : (
        ""
      )}
      . ¿Qué potencia debe {p.eta < 1 ? "recibir el motor" : "desarrollar"}?
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>m</V> <b>{p.m} kg</b>
        </span>
        <span className="var-chip">
          <V>h</V> <b>{fmtNum(p.h, 1)} m</b>
        </span>
        <span className="var-chip">{p.conV ? <><V>v</V> <b>{fmtNum(p.h / p.t, 2)} m/s</b></> : <><V>t</V> <b>{fmtNum(p.t, 1)} s</b></>}</span>
        {p.eta < 1 && (
          <span className="var-chip">
            <V>η</V> <b>{Math.round(p.eta * 100)} %</b>
          </span>
        )}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_POTENCIA}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-500)} disabled={!motor.jugando}>
            −500
          </button>
          <button className="btn" onClick={() => cambiar(-P_PASO)} disabled={!motor.jugando}>
            −50
          </button>
          <button className="btn" onClick={() => cambiar(P_PASO)} disabled={!motor.jugando}>
            +50
          </button>
          <button className="btn" onClick={() => cambiar(500)} disabled={!motor.jugando}>
            +500
          </button>
          <button className="btn btn-pri" onClick={subir} disabled={!motor.jugando || corriendo}>
            ¡Sube!
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
      respuesta={
        <ValorTexto
          simbolo="P"
          valor={String(v)}
          unidad="W"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(P_PASO)} aria-label="Subir la potencia">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-P_PASO)} aria-label="Bajar la potencia">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_P} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_GRUA, vista: clave }}
      pieEscena={<span>↑ ↓ de 50 W · ← → de 500 W · Enter para subir</span>}
    />
  );
}
