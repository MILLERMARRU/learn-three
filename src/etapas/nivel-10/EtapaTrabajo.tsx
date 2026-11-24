// ══ Etapa 10.1 · Trabajo y energía cinética: predice la rapidez de salida y un bloque fantasma corre junto al real ───────
import { useState } from "react";
import { F_TRABAJO, RONDAS_TRABAJO, V_MAX, V_MIN, type ProblemaTrabajo } from "@/contenido/nivel-10/trabajo";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaEmpujon } from "@/three/energia/EscenaEmpujon";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual, type DecoTecla } from "@/ui/TecladoVirtual";
import { CARRUSEL_ENERGIA, ESCENARIO_EMPUJON, fmtNum, simularTecla, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "10.1",
  titulo: "Trabajo y energía cinética",
  nivel: "Trabajo, energía y potencia",
  nivelNum: 10,
  intro: (
    <>
      Una fuerza que empuja a lo largo de un camino hace <b>trabajo: W = F·d·cos θ</b> (solo cuenta la parte de la fuerza a lo largo del movimiento). Ese trabajo se convierte en <b>energía cinética</b>: W neto = ½mv² − ½mv₀². Predice la rapidez con que el bloque sale de la zona: un <b>bloque fantasma</b> correrá con ella junto al real.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "sube o baja la rapidez (1 m/s)" },
    { teclas: ["⏎"], texto: "¡empuja! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/10/energia", titulo: "Etapa 10.2 · Conservación de la energía mecánica" },
  descRondas: {
    guiado: "Fuerza horizontal, desde el reposo. La tecla que brilla te guía.",
    pista: "Fuerza inclinada: solo trabaja F cos θ.",
    solo: "Rozamiento, rapidez inicial y frenado; la fórmula se oculta.",
  },
};

const TECLAS_V: Record<string, DecoTecla> = {
  "↑": { sub: "+1 m/s" },
  "↓": { sub: "−1 m/s" },
  intro: { sub: "¡empuja!" },
  h: { sub: "pista" },
};

/** La cuenta: «W = 100 J → v = 10 m/s» o, con rapidez inicial, «½mv² = ½mv₀² + W → v = 6 m/s». */
function cuenta(p: ProblemaTrabajo): string {
  const W = `W = ${fmtNum(p.W, 1).replace("-", "−")} J`;
  return p.v0 > 0 ? `${W}; ½·${p.m}·v² = ½·${p.m}·${p.v0}² ${p.W < 0 ? "−" : "+"} ${fmtNum(Math.abs(p.W), 1)} → v = ${p.respuesta} m/s` : `${W} = ½·${p.m}·v² → v = ${p.respuesta} m/s`;
}

const textoCorto = (p: ProblemaTrabajo) => (p.F > 0 ? `F = ${p.F} N${p.theta > 0 ? ` · ${p.theta}°` : ""}` : `frena · μ = ${fmtNum(p.mu, 2)}`);

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaTrabajo() {
  const motor = useEtapa<ProblemaTrabajo>({ clave: "n10-trabajo", rondas: RONDAS_TRABAJO, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  // se parte de la rapidez con que entra a la zona
  const [st, setSt] = useState({ clave: "", v: 0 });
  const v = st.clave === clave ? st.v : p.v0;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (dv: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(V_MIN, Math.min(V_MAX, v + dv)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const soltar = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡Van juntos! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `El fantasma ${v > p.respuesta ? "se adelantó" : "se quedó atrás"}: la rapidez real es ${v > p.respuesta ? "menor" : "mayor"} que ${v} m/s.` });
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
      cambiar(1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      cambiar(-1);
    } else if (e.key === "Enter") soltar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (v < p.respuesta ? "↑" : v > p.respuesta ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_ENERGIA}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaEmpujon m={p.m} F={p.F} theta={p.theta} d={p.d} mu={p.mu} v0={p.v0} vReal={p.respuesta} vFantasma={v} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaEmpujon m={it.m} F={it.F} theta={it.theta} d={it.d} mu={it.mu} v0={it.v0} vReal={it.respuesta} vFantasma={null} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const fuerza = p.F > 0 ? (
    <>
      una fuerza de <b>{p.F} N</b>
      {p.theta > 0 ? (
        <>
          {" "}
          inclinada <b>{p.theta}°</b> sobre la horizontal
        </>
      ) : (
        " horizontal"
      )}
    </>
  ) : null;
  const enunciado =
    p.F > 0 ? (
      <>
        Un bloque de <b>{p.m} kg</b> {p.v0 > 0 ? <>entra con <b>{p.v0} m/s</b> a</> : "parte del reposo en"} una zona de <b>{fmtNum(p.d, 1)} m</b> donde lo empuja {fuerza}
        {p.mu > 0 ? <>, con rozamiento (μ = {fmtNum(p.mu, 2)})</> : ""}. ¿Con qué rapidez sale de la zona?
      </>
    ) : (
      <>
        Un bloque de <b>{p.m} kg</b> entra con <b>{p.v0} m/s</b> a una zona rugosa de <b>{fmtNum(p.d, 1)} m</b> (μ = {fmtNum(p.mu, 2)}). ¿Con qué rapidez sale de ella?
      </>
    );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>m</V> <b>{p.m} kg</b>
        </span>
        {p.F > 0 && (
          <span className="var-chip">
            <V>F</V> <b>{p.theta > 0 ? `${p.F} N · ${p.theta}°` : `${p.F} N`}</b>
          </span>
        )}
        <span className="var-chip">
          <V>d</V> <b>{fmtNum(p.d, 1)} m</b>
        </span>
        {p.mu > 0 && (
          <span className="var-chip">
            <V>μ</V> <b>{fmtNum(p.mu, 2)}</b>
          </span>
        )}
        {p.v0 > 0 && (
          <span className="var-chip">
            <V>v</V>₀ <b>{p.v0} m/s</b>
          </span>
        )}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_TRABAJO}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-1)} disabled={!motor.jugando}>
            − v
          </button>
          <button className="btn" onClick={() => cambiar(1)} disabled={!motor.jugando}>
            + v
          </button>
          <button className="btn btn-pri" onClick={soltar} disabled={!motor.jugando || corriendo}>
            ¡Empuja!
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
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la rapidez">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la rapidez">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_V} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_EMPUJON, vista: clave }}
      pieEscena={<span>↑ ↓ ajusta la rapidez · Enter para empujar</span>}
    />
  );
}
