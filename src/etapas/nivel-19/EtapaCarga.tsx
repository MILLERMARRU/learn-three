// ══ Etapa 19.1 · Carga de un condensador: las placas se llenan y el medidor debe llegar a la marca propuesta ───────
import { useState } from "react";
import { F_CARGA, fmtC, Q_ESCALA, Q_MIN, RONDAS_CARGA, type ProblemaCarga } from "@/contenido/nivel-19/carga";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaCarga } from "@/three/condensadores/EscenaCarga";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_CONDENSADORES, ESCENARIO_CARGA, simularTecla, teclasCondensador, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "19.1",
  titulo: "Carga de un condensador",
  nivel: "Condensadores",
  nivelNum: 19,
  intro: (
    <>
      Un <b>condensador</b> son dos placas conductoras separadas: al conectarlo a una pila, una se carga con +Q y la otra con −Q. La carga es proporcional al voltaje, <b>Q = C·V</b>, donde C es la <b>capacidad</b> (en faradios; aquí, μF). Un <b>dieléctrico</b> entre las placas multiplica la capacidad por su constante κ. Propón la carga: el medidor debe llegar a tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 μC" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡carga! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Q = C·V, en μC. La tecla que brilla te guía.",
    pista: "Capacidades grandes y pequeñas.",
    solo: "Con dieléctrico: Q = κ·C·V.",
  },
};

const textoCorto = (p: ProblemaCarga) => `${fmtC(p.C)} μF · ${p.V} V`;
const textoC = (p: ProblemaCarga) => `C = ${fmtC(p.C)} μF${p.kappa > 1 ? ` · κ = ${p.kappa}` : ""}`;

/** La cuenta de la respuesta. */
const cuenta = (p: ProblemaCarga) => (p.kappa > 1 ? `Q = ${p.kappa} · ${fmtC(p.C)} · ${p.V} = ${p.respuesta} μC` : `Q = ${fmtC(p.C)} · ${p.V} = ${p.respuesta} μC`);

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaCarga() {
  const motor = useEtapa<ProblemaCarga>({ clave: "n19-carga", rondas: RONDAS_CARGA, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: 0 });
  const v = st.clave === clave ? st.v : 0;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(Q_MIN, Math.min(Q_ESCALA, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const cargar = () => {
    if (!motor.jugando || corriendo) return;
    setCorrida({ clave, id: performance.now(), fin: false });
    setFb(null);
    sfx.seleccion();
  };

  const alTerminar = () => {
    setCorrida((c) => (c ? { ...c, fin: true } : c));
    if (!motor.jugando) return;
    if (v === p.respuesta) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: `¡El medidor llegó a tu marca! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `La aguja ${v > p.respuesta ? "se quedó antes de" : "pasó"} tu marca: la carga es ${v > p.respuesta ? "menor" : "mayor"} que ${v} μC.` });
    }
  };

  const pedirPista = () => {
    if (!motor.pedirPista(2)) return;
    setFb({ clave, tipo: "info", texto: p.pistas[motor.pistas] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    const pasos: Record<string, number> = { ArrowUp: 1, ArrowDown: -1, ArrowRight: 10, ArrowLeft: -10 };
    if (pasos[e.key] !== undefined) {
      e.preventDefault();
      cambiar(pasos[e.key]);
    } else if (e.key === "Enter") cargar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_CONDENSADORES}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaCarga Q={p.respuesta} propuesta={v} escala={Q_ESCALA} dielectrico={p.kappa > 1} textoC={textoC(p)} textoV={`V = ${p.V} V`} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaCarga Q={it.respuesta} propuesta={null} escala={Q_ESCALA} dielectrico={it.kappa > 1} textoC="" textoV="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado = (
    <>
      Un condensador de <b>{fmtC(p.C)} μF</b>
      {p.kappa > 1 ? (
        <>
          {" "}
          con un dieléctrico de <b>κ = {p.kappa}</b> entre sus placas
        </>
      ) : null}{" "}
      se conecta a una pila de <b>{p.V} V</b>. ¿Qué carga almacena?
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>C</V> <b>{fmtC(p.C)} μF</b>
        </span>
        <span className="var-chip">
          <V>V</V> <b>{p.V} V</b>
        </span>
        {p.kappa > 1 && (
          <span className="var-chip">
            <V>κ</V> <b>{p.kappa}</b>
          </span>
        )}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_CARGA}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-10)} disabled={!motor.jugando}>
            −10
          </button>
          <button className="btn" onClick={() => cambiar(-1)} disabled={!motor.jugando}>
            −1
          </button>
          <button className="btn" onClick={() => cambiar(1)} disabled={!motor.jugando}>
            +1
          </button>
          <button className="btn" onClick={() => cambiar(10)} disabled={!motor.jugando}>
            +10
          </button>
          <button className="btn btn-pri" onClick={cargar} disabled={!motor.jugando || corriendo}>
            ¡Carga!
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
          simbolo="Q"
          valor={String(v)}
          unidad="μC"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la carga">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la carga">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasCondensador("¡carga!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_CARGA, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 μC · ← → de 10 · Enter para cargar el condensador</span>}
    />
  );
}
