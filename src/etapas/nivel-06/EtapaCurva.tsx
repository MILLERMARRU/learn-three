// ══ Etapa 6.3 · Aceleración centrípeta: la rapidez máxima para tomar la curva sin salirse (v²/R ≤ a máx) ───────
import { useState } from "react";
import { F_CENTRIPETA, F_ROZAMIENTO, RONDAS_CURVA, V_MAX, V_MIN, V_PASO, type ProblemaCurva } from "@/contenido/nivel-06/circular";
import { aCentripeta } from "@/lib/circular";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaCurva } from "@/three/circular/EscenaCurva";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_CURVA, ESCENARIO_CURVA, fmtNum, simularTecla, TECLAS_CURVA, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "6.3",
  titulo: "Aceleración centrípeta",
  nivel: "Movimiento circunferencial",
  nivelNum: 6,
  intro: (
    <>
      Para girar, el auto necesita una <b>aceleración centrípeta</b> que apunte al centro: <b>a꜀ = v² / R</b>. En una curva plana se la dan los neumáticos, pero solo hasta un máximo (
      <i>a</i>
      <sub>máx</sub> = μg). Si va más rápido, la curva que logra es más abierta y <b>se sale</b>. Encuentra la rapidez máxima.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "sube o baja la rapidez (5 m/s)" },
    { teclas: ["⏎"], texto: "¡arranca! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/6/examen", titulo: "Etapa 6.4 · Examen tipo admisión" },
  descRondas: {
    guiado: "Despeja v de v²/R = a máx. La tecla que brilla te guía.",
    pista: "Tienes la fórmula: la rapidez máxima cumple v² = a máx · R.",
    solo: "El dato es el rozamiento: primero a máx = μg.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaCurva() {
  const motor = useEtapa<ProblemaCurva>({ clave: "n6-curva", rondas: RONDAS_CURVA, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: V_MIN });
  const v = st.clave === clave ? st.v : V_MIN;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(V_MIN, Math.min(V_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const arrancar = () => {
    if (!motor.jugando || corriendo) return;
    setCorrida({ clave, id: performance.now(), fin: false });
    setFb(null);
    sfx.seleccion();
  };

  const alTerminar = ({ salio }: { salio: boolean }) => {
    setCorrida((c) => (c ? { ...c, fin: true } : c));
    if (!motor.jugando) return;
    const a = aCentripeta(v, p.R);
    const cuenta = `a꜀ = v²/R = ${v * v}/${p.R} = ${fmtNum(a)} m/s²`;
    if (v === p.respuesta) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: `¡Justo en el límite! ${cuenta} = a máx.` });
    } else if (salio) {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `¡Se salió! Necesitaba ${cuenta}, pero los neumáticos solo dan ${fmtNum(p.aMax)} m/s². Baja la rapidez.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `Pasó la curva, pero podía ir más rápido: ${cuenta} < ${fmtNum(p.aMax)} m/s². Sube la rapidez.` });
    }
  };

  const pedirPista = () => {
    if (!motor.pedirPista(2)) return;
    setFb({ clave, tipo: "info", texto: p.pistas[motor.pistas] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      cambiar(V_PASO);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      cambiar(-V_PASO);
    } else if (e.key === "Enter") arrancar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (v < p.respuesta ? "↑" : v > p.respuesta ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_CURVA}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaCurva R={p.R} aMax={p.aMax} v={v} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaCurva R={it.R} aMax={it.aMax} v={V_MIN} previa={rol === "siguiente" ? `R = ${it.R} m` : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">
        Un auto toma una curva plana de <b>{p.R} m</b> de radio.{" "}
        {p.mu !== null ? (
          <>
            El coeficiente de rozamiento entre los neumáticos y la pista es <b>μ = {fmtNum(p.mu)}</b>.
          </>
        ) : (
          <>
            Sus neumáticos dan como máximo <b>{fmtNum(p.aMax)} m/s²</b> de aceleración centrípeta.
          </>
        )}{" "}
        ¿Cuál es la rapidez máxima para no salirse?
      </p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>R</V> <b>{p.R} m</b>
        </span>
        {p.mu !== null ? (
          <>
            <span className="var-chip">
              <V>μ</V> <b>{fmtNum(p.mu)}</b>
            </span>
            <span className="var-chip">
              <V>g</V> <b>10 m/s²</b>
            </span>
          </>
        ) : (
          <span className="var-chip">
            <span>
              <V>a</V>
              <sub>máx</sub>
            </span>{" "}
            <b>{fmtNum(p.aMax)} m/s²</b>
          </span>
        )}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{p.mu !== null ? F_ROZAMIENTO : F_CENTRIPETA}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-V_PASO)} disabled={!motor.jugando}>
            − v
          </button>
          <button className="btn" onClick={() => cambiar(V_PASO)} disabled={!motor.jugando}>
            + v
          </button>
          <button className="btn btn-pri" onClick={arrancar} disabled={!motor.jugando || corriendo}>
            ¡Arranca!
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
          simbolo="v"
          valor={String(v)}
          unidad="m/s"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(V_PASO)} aria-label="Subir rapidez">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-V_PASO)} aria-label="Bajar rapidez">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_CURVA} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_CURVA, vista: clave }}
      pieEscena={<span>↑ ↓ ajusta la rapidez · Enter para arrancar</span>}
    />
  );
}
